'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Plus,
  Trash2,
  UserCircle,
  AlertCircle,
  Search,
  Divide,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Writer, Composer, EditorMode } from '@/components/shared/work-wizard/types';
import { WRITER_ROLES } from '@/components/shared/work-wizard/constants';
import { AddComposerDialog } from '@/components/shared/add-composer-dialog';

interface WritersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  writers: Writer[];
  onWritersChange: (writers: Writer[]) => void;
  onSave: () => void;
  saving?: boolean;
}

export function WritersSheet({
  open,
  onOpenChange,
  accountId,
  writers,
  onWritersChange,
  onSave,
  saving = false,
}: WritersSheetProps) {
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);
  const [existingComposers, setExistingComposers] = useState<Composer[]>([]);
  const [loadingComposers, setLoadingComposers] = useState(false);
  const [composerSearch, setComposerSearch] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('simple');
  const [showNewComposerDialog, setShowNewComposerDialog] = useState(false);
  const [creatingComposer, setCreatingComposer] = useState(false);

  // Initialize API client and fetch composers
  useEffect(() => {
    if (!open) return;

    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const client = new ApiClient(async () => session?.access_token || null);
      setApiClient(client);

      setLoadingComposers(true);
      try {
        const response = await client.get<{ composers: Composer[] }>(
          API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId)
        );
        setExistingComposers(response.composers || []);
      } catch {
        // Silent fail - composers list will remain empty
      } finally {
        setLoadingComposers(false);
      }
    };
    init();
  }, [open, accountId]);

  // Filter composers based on search
  const filteredComposers = useMemo(() => {
    if (!composerSearch.trim()) return [];
    const query = composerSearch.toLowerCase();
    return existingComposers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.cae?.includes(composerSearch) ||
        c.first_name?.toLowerCase().includes(query) ||
        c.surname?.toLowerCase().includes(query)
    );
  }, [existingComposers, composerSearch]);

  // Calculate totals
  const totalShare = writers.reduce((sum, w) => sum + (w.share || 0), 0);
  const hasControlledWriter = writers.some((w) => w.isControlled);
  const isValidOwnership = Math.abs(totalShare - 100) < 0.01;

  // Check if composer is already added
  const isComposerAlreadyAdded = (composerId: string) => {
    return writers.some((w) => w.composerId === composerId);
  };

  // Add existing composer as writer
  const addExistingComposer = (composer: Composer) => {
    if (isComposerAlreadyAdded(composer.id)) return;

    const newWriter: Writer = {
      tempId: `writer-${Date.now()}`,
      isNew: false,
      isControlled: composer.controlled || false,
      composerId: composer.id,
      name: composer.name,
      firstName: composer.first_name || undefined,
      surname: composer.surname || undefined,
      cae: composer.cae || undefined,
      mainPro: composer.main_pro || undefined,
      role: 'CA',
      share: 0,
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
    };
    onWritersChange([...writers, newWriter]);
    setComposerSearch('');
  };

  // Create new composer via shared dialog
  const handleAddComposer = async (data: Omit<Composer, 'id'>) => {
    if (!apiClient) return;

    setCreatingComposer(true);
    try {
      const response = await apiClient.post<{ composer: Composer }>(
        API_ENDPOINTS.DASHBOARD_COMPOSERS(accountId),
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

      const newWriter: Writer = {
        tempId: `writer-${Date.now()}`,
        isNew: false,
        isControlled: data.controlled || false,
        composerId: createdComposer.id,
        name: data.name,
        firstName: data.first_name || undefined,
        surname: data.surname || undefined,
        cae: data.cae || undefined,
        mainPro: data.main_pro || undefined,
        role: 'CA',
        share: 0,
        mechanicalOwnership: 0,
        performanceOwnership: 0,
        mechanicalCollection: 0,
        performanceCollection: 0,
      };
      onWritersChange([...writers, newWriter]);
    } catch {
      // Silent fail - writer won't be added if composer creation fails
    } finally {
      setCreatingComposer(false);
    }
  };

  // Split shares equally
  const shareSplitsEqually = () => {
    if (writers.length === 0) return;
    const equalShare = Math.floor((100 / writers.length) * 100) / 100;
    const remainder = 100 - equalShare * writers.length;

    const updatedWriters = writers.map((w, i) => ({
      ...w,
      share: i === 0 ? equalShare + remainder : equalShare,
      mechanicalOwnership: i === 0 ? equalShare + remainder : equalShare,
      performanceOwnership: i === 0 ? equalShare + remainder : equalShare,
    }));
    onWritersChange(updatedWriters);
  };

  // Update writer field
  const updateWriter = (tempId: string, field: keyof Writer, value: Writer[keyof Writer]) => {
    onWritersChange(
      writers.map((w) => (w.tempId === tempId ? { ...w, [field]: value } : w))
    );
  };

  // Remove writer
  const removeWriter = (tempId: string) => {
    onWritersChange(writers.filter((w) => w.tempId !== tempId));
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Writers</SheetTitle>
            <SheetDescription>
              Add or remove writers and set their ownership shares.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Editor Mode</span>
              <div className="flex items-center gap-1">
                <Button
                  variant={editorMode === 'simple' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('simple')}
                >
                  Simple
                </Button>
                <Button
                  variant={editorMode === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setEditorMode('advanced')}
                >
                  Advanced
                </Button>
              </div>
            </div>

            {/* Search & Add */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search composers..."
                  value={composerSearch}
                  onChange={(e) => setComposerSearch(e.target.value)}
                  className="pl-10"
                  aria-label="Search composers"
                />
              </div>
              <Button variant="outline" onClick={() => setShowNewComposerDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>

            {/* Search Results */}
            {composerSearch && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {loadingComposers ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : filteredComposers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No composers found.{' '}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => setShowNewComposerDialog(true)}
                    >
                      Create new
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filteredComposers.map((composer) => {
                      const alreadyAdded = isComposerAlreadyAdded(composer.id);
                      return (
                        <li key={composer.id}>
                          <button
                            className={cn(
                              'w-full text-left p-3 transition-colors flex items-center justify-between',
                              alreadyAdded
                                ? 'opacity-50 cursor-not-allowed bg-muted/30'
                                : 'hover:bg-muted/50'
                            )}
                            onClick={() => !alreadyAdded && addExistingComposer(composer)}
                            disabled={alreadyAdded}
                          >
                            <div>
                              <p className="font-medium">{composer.name}</p>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                {composer.cae && <span>CAE: {composer.cae}</span>}
                                {composer.controlled && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Controlled
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {alreadyAdded ? (
                              <Badge variant="outline" className="text-xs">Added</Badge>
                            ) : (
                              <Plus className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Writers List */}
            {writers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Writers ({writers.length})</span>
                  <div className="flex items-center gap-3">
                    {/* Progress Circle */}
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            className="stroke-muted" strokeWidth="3"
                          />
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            className={
                              totalShare === 100
                                ? 'stroke-green-500'
                                : totalShare > 100
                                  ? 'stroke-red-500'
                                  : 'stroke-primary'
                            }
                            strokeWidth="3"
                            strokeDasharray={`${Math.min(totalShare, 100) * 0.94} 94`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span
                          className={cn(
                            'absolute inset-0 flex items-center justify-center text-xs font-semibold',
                            totalShare === 100 ? 'text-green-600' : totalShare > 100 ? 'text-red-600' : ''
                          )}
                        >
                          {totalShare.toFixed(0)}%
                        </span>
                      </div>
                      {!hasControlledWriter && (
                        <span title="No controlled writer">
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        </span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={shareSplitsEqually}>
                      <Divide className="w-3 h-3 mr-1" />
                      Split
                    </Button>
                  </div>
                </div>

                {/* Writer Cards */}
                <div className="space-y-3">
                  {writers.map((writer) => (
                    <div key={writer.tempId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center',
                              writer.isControlled
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <UserCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{writer.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {writer.cae && <span>CAE: {writer.cae}</span>}
                              {writer.mainPro && <span>• {writer.mainPro}</span>}
                            </div>
                          </div>
                          {writer.isControlled && (
                            <Badge variant="default" className="ml-2">Controlled</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWriter(writer.tempId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove writer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Simple Mode */}
                      {editorMode === 'simple' && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Role</Label>
                            <Select
                              value={writer.role}
                              onValueChange={(val) => updateWriter(writer.tempId, 'role', val)}
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
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                value={writer.share || ''}
                                onChange={(e) =>
                                  updateWriter(writer.tempId, 'share', parseFloat(e.target.value) || 0)
                                }
                                className="h-9 pr-7"
                                placeholder="0"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                %
                              </span>
                            </div>
                          </div>
                          <div className="flex items-end pb-1">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`ctrl-${writer.tempId}`}
                                checked={writer.isControlled}
                                onCheckedChange={(checked) =>
                                  updateWriter(writer.tempId, 'isControlled', checked as boolean)
                                }
                              />
                              <Label htmlFor={`ctrl-${writer.tempId}`} className="text-xs cursor-pointer">
                                Controlled
                              </Label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advanced Mode */}
                      {editorMode === 'advanced' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Role</Label>
                              <Select
                                value={writer.role}
                                onValueChange={(val) => updateWriter(writer.tempId, 'role', val)}
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
                            <div className="flex items-end pb-1">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`ctrl-adv-${writer.tempId}`}
                                  checked={writer.isControlled}
                                  onCheckedChange={(checked) =>
                                    updateWriter(writer.tempId, 'isControlled', checked as boolean)
                                  }
                                />
                                <Label htmlFor={`ctrl-adv-${writer.tempId}`} className="text-xs cursor-pointer">
                                  Controlled
                                </Label>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Mech. Own %</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={writer.mechanicalOwnership || ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  updateWriter(writer.tempId, 'mechanicalOwnership', val);
                                  updateWriter(writer.tempId, 'share', val);
                                }}
                                className="h-9"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Perf. Own %</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={writer.performanceOwnership || ''}
                                onChange={(e) =>
                                  updateWriter(writer.tempId, 'performanceOwnership', parseFloat(e.target.value) || 0)
                                }
                                className="h-9"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Mech. Coll %</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={writer.mechanicalCollection || ''}
                                onChange={(e) =>
                                  updateWriter(writer.tempId, 'mechanicalCollection', parseFloat(e.target.value) || 0)
                                }
                                className="h-9"
                                placeholder="0"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Perf. Coll %</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={writer.performanceCollection || ''}
                                onChange={(e) =>
                                  updateWriter(writer.tempId, 'performanceCollection', parseFloat(e.target.value) || 0)
                                }
                                className="h-9"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!isValidOwnership && (
                  <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Total must equal 100%. Current: {totalShare.toFixed(2)}%
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {writers.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">No writers added</p>
                <p className="text-sm text-muted-foreground">Search above to add writers</p>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={onSave}
                disabled={saving || writers.length === 0 || !isValidOwnership}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Writers'
                )}
              </Button>
              {writers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Add at least one writer to save
                </p>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add New Composer Dialog - using shared component */}
      <AddComposerDialog
        open={showNewComposerDialog}
        onOpenChange={setShowNewComposerDialog}
        onAddComposer={handleAddComposer}
        existingComposers={existingComposers}
        onAddExistingComposer={addExistingComposer}
        addedComposerIds={writers.map((w) => w.composerId).filter(Boolean) as string[]}
        creating={creatingComposer}
      />
    </>
  );
}
