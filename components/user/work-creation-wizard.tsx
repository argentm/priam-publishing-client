'use client';

import { useRouter } from 'next/navigation';
import { ROUTES, API_ENDPOINTS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import {
  WizardProgress,
  WorkInfoStep,
  WritersStep,
  RecordingsStep,
  DetailsStep,
  ReviewStep,
  useWorkWizard,
  WizardStepConfig,
} from '@/components/shared/work-wizard';

interface WorkCreationWizardProps {
  accountId: string;
  accountName: string;
}

const STEPS: WizardStepConfig[] = [
  { id: 'basic', label: 'Work Info', icon: 'music' },
  { id: 'writers', label: 'Writers', icon: 'users' },
  { id: 'recordings', label: 'Recordings', icon: 'radio' },
  { id: 'details', label: 'Details', icon: 'settings' },
  { id: 'review', label: 'Review', icon: 'check' },
];

export function WorkCreationWizard({ accountId, accountName }: WorkCreationWizardProps) {
  const router = useRouter();

  // API configuration for user context
  const apiConfig = {
    getComposers: (id: string) => API_ENDPOINTS.DASHBOARD_COMPOSERS(id),
    createComposer: (id: string) => API_ENDPOINTS.DASHBOARD_COMPOSERS(id),
    getTracks: (id: string) => API_ENDPOINTS.DASHBOARD_TRACKS(id),
    createTrack: API_ENDPOINTS.TRACKS,
    createWork: API_ENDPOINTS.WORKS,
  };

  const wizard = useWorkWizard({
    accountId,
    apiConfig,
    onSuccess: () => {
      router.push(ROUTES.WORKSPACE_WORKS(accountId));
    },
  });

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.WORKSPACE_WORKS(accountId)}>
          <ArrowLeft className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Register New Work</h1>
          <p className="text-muted-foreground">{accountName} • Basic information</p>
        </div>
        <div className="ml-auto">
          <span className="text-sm text-muted-foreground">
            Step {STEPS.findIndex((s) => s.id === wizard.step) + 1} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <WizardProgress
        steps={STEPS}
        currentStep={wizard.step}
        completedSteps={wizard.completedSteps}
      />

      {/* Step content */}
      {wizard.step === 'basic' && (
        <WorkInfoStep
          workData={wizard.workData}
          onWorkDataChange={wizard.setWorkData}
          detailsData={wizard.detailsData}
          onDetailsDataChange={wizard.setDetailsData}
          accountName={accountName}
          onNext={wizard.goToWriters}
        />
      )}

      {wizard.step === 'writers' && (
        <WritersStep
          accountId={accountId}
          writers={wizard.writers}
          onWritersChange={wizard.setWriters}
          editorMode={wizard.editorMode}
          onEditorModeChange={wizard.setEditorMode}
          existingComposers={wizard.existingComposers}
          loadingComposers={wizard.loadingComposers}
          onCreateComposer={wizard.createComposer}
          onBack={wizard.goToBasic}
          onNext={wizard.goToRecordings}
        />
      )}

      {wizard.step === 'recordings' && (
        <RecordingsStep
          accountId={accountId}
          linkedTracks={wizard.linkedTracks}
          onLinkedTracksChange={wizard.setLinkedTracks}
          existingTracks={wizard.existingTracks}
          loadingTracks={wizard.loadingTracks}
          onCreateTrack={wizard.createTrack}
          onBack={wizard.goToWriters}
          onNext={wizard.goToDetails}
        />
      )}

      {wizard.step === 'details' && (
        <DetailsStep
          detailsData={wizard.detailsData}
          onDetailsDataChange={wizard.setDetailsData}
          linkedTracks={wizard.linkedTracks}
          accountName={accountName}
          onBack={wizard.goToRecordings}
          onNext={wizard.goToReview}
        />
      )}

      {wizard.step === 'review' && (
        <ReviewStep
          workData={wizard.workData}
          detailsData={wizard.detailsData}
          writers={wizard.writers}
          linkedTracks={wizard.linkedTracks}
          saving={wizard.saving}
          error={wizard.error}
          onBack={wizard.goToDetails}
          onSubmit={wizard.submitWork}
        />
      )}
    </div>
  );
}
