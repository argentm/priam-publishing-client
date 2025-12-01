'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Loader2, Search, User, AlertCircle } from 'lucide-react';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { WRITER_ROLES } from '@/components/shared/work-wizard/constants';
import { AddComposerDialog } from '@/components/shared/add-composer-dialog';
import type { Composer } from '@/components/shared/work-wizard/types';
import type { AdminWriter } from '../types';

interface AdminWritersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workId: string;
  accountId: string;
  writers: AdminWriter[];
  onWritersChange: (writers: AdminWriter[]) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
}

interface ComposerSearchResult {
  id: string;
  name: string;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
}

export function AdminWritersSheet({
  open,
  onOpenChange,
  workId,
  accountId,
  writers,
  onWritersChange,
  onSave,
  saving = false,
}: AdminWritersSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ComposerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [showNewComposerDialog, setShowNewComposerDialog] = useState(false);
  const [creatingComposer, setCreatingComposer] = useState(false);
  const [existingComposers, setExistingComposers] = useState<Composer[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const initClient = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, [supabase]);

  // Fetch existing composers for duplicate detection
  useEffect(() => {
    const fetchComposers = async () => {
      if (!apiClient || !open) return;
      try {
        const response = await apiClient.get<{ composers: Composer[]; total: number }>(
          `${API_ENDPOINTS.ADMIN_ACCOUNT_COMPOSERS(accountId)}?limit=1000`
        );
        setExistingComposers(response.composers);
      } catch (error) {
        console.error('Error fetching composers:', error);
      }
    };
    fetchComposers();
  }, [apiClient, accountId, open]);

  // Calculate total share
  const totalShare = useMemo(() => {
    return writers.reduce((sum, w) => sum + (w.share || 0), 0);
  }, [writers]);

  const shareValid = totalShare === 100 || writers.length === 0;

  // Search for composers when query changes
  useEffect(() => {
    const searchComposers = async () => {
      if (!apiClient || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await apiClient.get<{ composers: ComposerSearchResult[]; total: number }>(
          `${API_ENDPOINTS.ADMIN_ACCOUNT_COMPOSERS(accountId)}?search=${encodeURIComponent(searchQuery)}&limit=10`
        );
        // Filter out already added composers
        const addedIds = new Set(writers.filter(w => w.composerId).map(w => w.composerId));
        setSearchResults(response.composers.filter((c) => !addedIds.has(c.id)));
      } catch (error) {
        console.error('Error searching composers:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchComposers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, apiClient, accountId, writers]);

  const handleAddComposer = (composer: ComposerSearchResult) => {
    const newWriter: AdminWriter = {
      tempId: `writer-${Date.now()}`,
      composerId: composer.id,
      name: composer.name,
      cae: composer.cae || undefined,
      mainPro: composer.main_pro || undefined,
      role: 'CA',
      share: 0,
      isControlled: composer.controlled || false,
      isNew: false,
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
    };
    onWritersChange([...writers, newWriter]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Create new composer via shared dialog
  const handleCreateNewComposer = async (data: Omit<Composer, 'id'>) => {
    if (!apiClient) return;

    setCreatingComposer(true);
    try {
      const response = await apiClient.post<{ composer: Composer }>(
        API_ENDPOINTS.ADMIN_ACCOUNT_COMPOSERS(accountId),
        {
          name: data.name,
          first_name: data.first_name || null,
          surname: data.surname || null,
          cae: data.cae || null,
          main_pro: data.main_pro || null,
          controlled: data.controlled,
        }
      );

      const createdComposer = response.composer;
      setExistingComposers((prev) => [...prev, createdComposer]);

      const newWriter: AdminWriter = {
        tempId: `writer-${Date.now()}`,
        composerId: createdComposer.id,
        name: data.name,
        cae: data.cae || undefined,
        mainPro: data.main_pro || undefined,
        role: 'CA',
        share: 0,
        isControlled: data.controlled || false,
        isNew: false,
        mechanicalOwnership: 0,
        performanceOwnership: 0,
        mechanicalCollection: 0,
        performanceCollection: 0,
      };
      onWritersChange([...writers, newWriter]);
    } catch (err) {
      console.error('Failed to create composer:', err);
    } finally {
      setCreatingComposer(false);
    }
  };

  // Add existing composer from dialog duplicate detection
  const handleAddExistingComposer = (composer: Composer) => {
    handleAddComposer({
      id: composer.id,
      name: composer.name,
      cae: composer.cae,
      main_pro: composer.main_pro,
      controlled: composer.controlled,
    });
  };

  const handleRemoveWriter = (tempId: string) => {
    onWritersChange(writers.filter((w) => w.tempId !== tempId));
  };

  const handleUpdateWriter = (tempId: string, field: keyof AdminWriter, value: string | number | boolean) => {
    onWritersChange(
      writers.map((w) =>
        w.tempId === tempId ? { ...w, [field]: value } : w
      )
    );
  };

  const handleSplitEqually = () => {
    if (writers.length === 0) return;
    const equalShare = Math.floor(100 / writers.length);
    const remainder = 100 - (equalShare * writers.length);

    onWritersChange(
      writers.map((w, idx) => ({
        ...w,
        share: equalShare + (idx === 0 ? remainder : 0),
      }))
    );
  };

  const handleSaveAndClose = async () => {
    await onSave();
    onOpenChange(false);
  };

  // Get progress ring color based on total
  const getProgressColor = () => {
    if (totalShare === 100) return 'stroke-green-500';
    if (totalShare > 100) return 'stroke-destructive';
    return 'stroke-primary';
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Writers / Composers</SheetTitle>
          <SheetDescription>
            Manage composers and their ownership shares for this work.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Share indicator */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className={getProgressColor()}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(totalShare, 100)} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{totalShare}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Total Ownership</p>
                <p className="text-xs text-muted-foreground">
                  {shareValid ? 'Shares are balanced' : `${100 - totalShare}% remaining`}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSplitEqually}
              disabled={writers.length === 0}
            >
              Split Equally
            </Button>
          </div>

          {/* Share warning */}
          {!shareValid && writers.length > 0 && (
            <div className="flex items-center gap-2 p-3 text-sm border rounded-lg border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4" />
              Total ownership must equal 100%
            </div>
          )}

          {/* Search for composers */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <Label className="text-sm font-medium">Add Writers</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or CAE/IPI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search composers"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewComposerDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Writer
              </Button>
            </div>

            {/* Search results */}
            {searching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {searchResults.map((composer) => (
                  <div
                    key={composer.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer"
                    onClick={() => handleAddComposer(composer)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{composer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {composer.cae && `CAE: ${composer.cae}`}
                          {composer.cae && composer.main_pro && ' • '}
                          {composer.main_pro && `PRO: ${composer.main_pro}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {composer.controlled && (
                        <Badge variant="secondary" className="text-xs">Controlled</Badge>
                      )}
                      <Button type="button" size="sm" variant="ghost">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No composers found. Try a different search term.
              </p>
            )}
          </div>

          {/* Writers list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Current Writers ({writers.length})
            </Label>

            {writers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No writers added yet. Search above to add composers.
              </p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {writers.map((writer) => (
                  <div
                    key={writer.tempId}
                    className="p-4 border rounded-lg bg-background space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{writer.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {writer.cae && <span>CAE: {writer.cae}</span>}
                            {writer.mainPro && <span>PRO: {writer.mainPro}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {writer.isControlled && (
                          <Badge variant="secondary" className="text-xs">Controlled</Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveWriter(writer.tempId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Role</Label>
                        <Select
                          value={writer.role}
                          onValueChange={(value) => handleUpdateWriter(writer.tempId, 'role', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WRITER_ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Share %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={writer.share}
                          onChange={(e) => handleUpdateWriter(writer.tempId, 'share', Number(e.target.value) || 0)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveAndClose}
            disabled={saving || (!shareValid && writers.length > 0)}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>

    {/* Add New Composer Dialog - using shared component */}
    <AddComposerDialog
      open={showNewComposerDialog}
      onOpenChange={setShowNewComposerDialog}
      onAddComposer={handleCreateNewComposer}
      existingComposers={existingComposers}
      onAddExistingComposer={handleAddExistingComposer}
      addedComposerIds={writers.map((w) => w.composerId).filter(Boolean) as string[]}
      creating={creatingComposer}
    />
    </>
  );
}
