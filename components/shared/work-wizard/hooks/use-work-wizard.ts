'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import type {
  WizardStep,
  WorkFormData,
  WorkDetailsData,
  Writer,
  Track,
  Composer,
  EditorMode,
  WizardApiConfig,
} from '../types';
import { DEFAULT_WORK_FORM_DATA, DEFAULT_WORK_DETAILS_DATA, SYSTEM_PRIAM_PUBLISHER_ID } from '../constants';
import { WRITER_ROLES } from '../constants';

interface UseWorkWizardOptions {
  accountId: string;
  apiConfig: WizardApiConfig;
  onSuccess?: (workId: string) => void;
}

export function useWorkWizard({ accountId, apiConfig, onSuccess }: UseWorkWizardOptions) {
  // Step management
  const [step, setStep] = useState<WizardStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);

  // Form data
  const [workData, setWorkData] = useState<WorkFormData>(DEFAULT_WORK_FORM_DATA);
  const [detailsData, setDetailsData] = useState<WorkDetailsData>(DEFAULT_WORK_DETAILS_DATA);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [linkedTracks, setLinkedTracks] = useState<Track[]>([]);
  const [editorMode, setEditorMode] = useState<EditorMode>('simple');

  // Data fetching state
  const [existingComposers, setExistingComposers] = useState<Composer[]>([]);
  const [existingTracks, setExistingTracks] = useState<Track[]>([]);
  const [loadingComposers, setLoadingComposers] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Submission state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API client
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Refs to prevent duplicate fetches
  const fetchedComposersRef = useRef(false);
  const fetchedTracksRef = useRef(false);
  const apiConfigRef = useRef(apiConfig);
  apiConfigRef.current = apiConfig;

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // Fetch existing composers (only once per accountId)
  useEffect(() => {
    const fetchComposers = async () => {
      if (!apiClient || !accountId || fetchedComposersRef.current) return;
      fetchedComposersRef.current = true;
      setLoadingComposers(true);
      try {
        const response = await apiClient.get<{ composers: Composer[]; total: number }>(
          `${apiConfigRef.current.getComposers(accountId)}?limit=100`
        );
        setExistingComposers(response.composers || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : JSON.stringify(err);
        console.error('Failed to fetch composers:', errorMessage, err);
        fetchedComposersRef.current = false; // Allow retry on error
      } finally {
        setLoadingComposers(false);
      }
    };
    fetchComposers();
  }, [apiClient, accountId]);

  // Fetch existing tracks (only once per accountId)
  useEffect(() => {
    const fetchTracks = async () => {
      if (!apiClient || !accountId || fetchedTracksRef.current) return;
      fetchedTracksRef.current = true;
      setLoadingTracks(true);
      try {
        const baseUrl = apiConfigRef.current.getTracks(accountId);
        // Handle URLs that already have query params
        const separator = baseUrl.includes('?') ? '&' : '?';
        const response = await apiClient.get<{ tracks: Track[]; total: number }>(
          `${baseUrl}${separator}limit=100`
        );
        setExistingTracks(response.tracks || []);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : JSON.stringify(err);
        console.error('Failed to fetch tracks:', errorMessage, err);
        fetchedTracksRef.current = false; // Allow retry on error
      } finally {
        setLoadingTracks(false);
      }
    };
    fetchTracks();
  }, [apiClient, accountId]);

  // Navigation
  const goToStep = useCallback((newStep: WizardStep) => {
    setStep(newStep);
  }, []);

  const markStepCompleted = useCallback((stepId: WizardStep) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
  }, []);

  const goToBasic = useCallback(() => goToStep('basic'), [goToStep]);

  const goToWriters = useCallback(() => {
    markStepCompleted('basic');
    goToStep('writers');
  }, [goToStep, markStepCompleted]);

  const goToRecordings = useCallback(() => {
    markStepCompleted('writers');
    goToStep('recordings');
  }, [goToStep, markStepCompleted]);

  const goToDetails = useCallback(() => {
    markStepCompleted('recordings');
    goToStep('details');
  }, [goToStep, markStepCompleted]);

  const goToReview = useCallback(() => {
    markStepCompleted('details');
    goToStep('review');
  }, [goToStep, markStepCompleted]);

  // Create composer
  const createComposer = useCallback(
    async (composerData: Omit<Composer, 'id'>): Promise<Composer> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.post<{ composer: Composer }>(
        apiConfig.createComposer(accountId),
        composerData
      );

      // Add to existing composers list
      setExistingComposers((prev) => [...prev, response.composer]);

      return response.composer;
    },
    [apiClient, accountId, apiConfig]
  );

  // Create track
  const createTrack = useCallback(
    async (trackData: { title: string; isrc: string; artist?: string }): Promise<Track> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.post<{ track: Track }>(
        apiConfigRef.current.createTrack,
        {
          account_id: accountId,
          ...trackData,
        }
      );

      // Add to existing tracks list
      setExistingTracks((prev) => [...prev, response.track]);

      return response.track;
    },
    [apiClient, accountId]
  );

  // Generate IP chain from writers
  const generateIpChain = useCallback(() => {
    const ipChainChildren = writers
      .map((writer) => {
        if (!writer.composerId) return null;

        const roleObj = WRITER_ROLES.find((r) => r.value === writer.role);
        const roleLabel = roleObj?.label || 'Composer/Author';

        const ownership = editorMode === 'simple' ? writer.share : writer.mechanicalOwnership;

        if (writer.isControlled) {
          return {
            publisherId: SYSTEM_PRIAM_PUBLISHER_ID,
            category: 'Original Publisher',
            controlled: true,
            mechanicalOwnership: 0,
            performanceOwnership: 0,
            mechanicalCollection: ownership,
            performanceCollection: ownership * 0.5,
            children: [
              {
                composerId: writer.composerId,
                category: roleLabel,
                controlled: true,
                mechanicalOwnership: ownership,
                performanceOwnership: ownership,
                mechanicalCollection: 0,
                performanceCollection: ownership * 0.5,
              },
            ],
          };
        } else {
          return {
            composerId: writer.composerId,
            category: roleLabel,
            controlled: false,
            mechanicalOwnership: ownership,
            performanceOwnership: ownership,
            mechanicalCollection: ownership,
            performanceCollection: ownership,
          };
        }
      })
      .filter(Boolean);

    return [
      {
        territory: 'World',
        children: ipChainChildren,
      },
    ];
  }, [writers, editorMode]);

  // Submit work
  const submitWork = useCallback(async () => {
    if (!apiClient) {
      setError('API client not initialized');
      return;
    }

    // Validation
    const totalShare = writers.reduce((sum, w) => sum + (w.share || 0), 0);
    if (!workData.title.trim()) {
      setError('Please provide a work title');
      return;
    }
    if (writers.length === 0) {
      setError('Please add at least one writer');
      return;
    }
    if (Math.abs(totalShare - 100) > 0.01) {
      setError(`Total ownership must be 100% (Currently: ${totalShare}%)`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const rightsChain = generateIpChain();

      const payload = {
        account_id: accountId,
        title: workData.title,
        iswc: workData.iswc || null,
        tunecode: workData.tunecode || null,
        notes: workData.notes || null,
        priority: workData.priority,
        production_library: workData.productionLibrary,
        grand_rights: workData.grandRights,
        rights_chain: rightsChain,
        tracks: linkedTracks.map((t) => t.id),
        // Extended details
        foreign_id: detailsData.foreignId || null,
        project_id: detailsData.projectId || null,
        work_language: detailsData.workLanguage || null,
        work_description_category: detailsData.workDescriptionCategory || null,
        duration: detailsData.duration || null,
        composite_type: detailsData.compositeType || null,
        composite_count: detailsData.compositeCount || 0,
        version_type: detailsData.versionType || null,
        arrangement_type: detailsData.arrangementType || null,
        copyright_date: detailsData.copyrightDate || null,
        label_copy: detailsData.labelCopy || null,
        // Performers
        performers: detailsData.performers || [],
      };

      const response = await apiClient.post<{ work: { id: string } }>(
        apiConfig.createWork,
        payload
      );

      // Try to flush rights (non-critical)
      try {
        await apiClient.post(`/api/works/${response.work.id}/rights/flush-from-ip-chain`, {});
      } catch {
        console.warn('Failed to auto-flush rights');
      }

      onSuccess?.(response.work.id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create work';
      setError(errorMessage);
      setSaving(false);
    }
  }, [
    apiClient,
    accountId,
    workData,
    detailsData,
    writers,
    linkedTracks,
    generateIpChain,
    apiConfig,
    onSuccess,
  ]);

  return {
    // Step management
    step,
    completedSteps,
    goToBasic,
    goToWriters,
    goToRecordings,
    goToDetails,
    goToReview,

    // Form data
    workData,
    setWorkData,
    detailsData,
    setDetailsData,
    writers,
    setWriters,
    linkedTracks,
    setLinkedTracks,
    editorMode,
    setEditorMode,

    // Existing data
    existingComposers,
    existingTracks,
    loadingComposers,
    loadingTracks,

    // Actions
    createComposer,
    createTrack,
    submitWork,

    // Submission state
    saving,
    error,
  };
}
