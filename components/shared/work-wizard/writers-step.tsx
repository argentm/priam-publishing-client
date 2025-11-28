'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  UserCircle,
  AlertCircle,
  Search,
  CheckCircle2,
  Divide,
} from 'lucide-react';
import type { WritersStepProps, Writer, Composer } from './types';
import { PRO_LIST, WRITER_ROLES } from './constants';

export function WritersStep({
  writers,
  onWritersChange,
  editorMode,
  onEditorModeChange,
  existingComposers,
  loadingComposers,
  onCreateComposer,
  onBack,
  onNext,
}: WritersStepProps) {
  const [composerSearch, setComposerSearch] = useState('');
  const [showNewComposerDialog, setShowNewComposerDialog] = useState(false);
  const [creatingComposer, setCreatingComposer] = useState(false);
  const [newComposerData, setNewComposerData] = useState({
    name: '',
    firstName: '',
    surname: '',
    cae: '',
    mainPro: '',
    controlled: true,
  });

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

  // Check for duplicate composer name (case-insensitive) when creating new writer
  const duplicateComposerCheck = useMemo(() => {
    const newName = newComposerData.name.trim().toLowerCase();
    if (!newName) return null;

    const existingComposer = existingComposers.find(
      (c) => c.name.toLowerCase() === newName
    );

    if (!existingComposer) return null;

    const isAlreadyInWork = writers.some((w) => w.composerId === existingComposer.id);

    return {
      composer: existingComposer,
      isAlreadyInWork,
    };
  }, [newComposerData.name, existingComposers, writers]);

  // Calculate totals
  const totalShare = writers.reduce((sum, w) => sum + (w.share || 0), 0);
  const hasControlledWriter = writers.some((w) => w.isControlled);
  const isValidOwnership = Math.abs(totalShare - 100) < 0.01;
  const canProceed = writers.length > 0 && isValidOwnership;

  // Check if composer is already added as writer
  const isComposerAlreadyAdded = (composerId: string) => {
    return writers.some((w) => w.composerId === composerId);
  };

  // Add existing composer as writer
  const addExistingComposer = (composer: Composer) => {
    // Prevent duplicate writers
    if (isComposerAlreadyAdded(composer.id)) {
      return;
    }

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

  // Add new composer as writer
  const handleAddNewComposer = async () => {
    if (!newComposerData.firstName.trim() || !newComposerData.surname.trim()) return;

    setCreatingComposer(true);
    try {
      const createdComposer = await onCreateComposer({
        name: newComposerData.name,
        first_name: newComposerData.firstName || null,
        surname: newComposerData.surname || null,
        cae: newComposerData.cae || null,
        main_pro: newComposerData.mainPro || null,
        controlled: newComposerData.controlled,
      });

      const newWriter: Writer = {
        tempId: `writer-${Date.now()}`,
        isNew: false,
        isControlled: newComposerData.controlled,
        composerId: createdComposer.id,
        name: newComposerData.name,
        firstName: newComposerData.firstName || undefined,
        surname: newComposerData.surname || undefined,
        cae: newComposerData.cae || undefined,
        mainPro: newComposerData.mainPro || undefined,
        role: 'CA',
        share: 0,
        mechanicalOwnership: 0,
        performanceOwnership: 0,
        mechanicalCollection: 0,
        performanceCollection: 0,
      };
      onWritersChange([...writers, newWriter]);
      setShowNewComposerDialog(false);
      setNewComposerData({
        name: '',
        firstName: '',
        surname: '',
        cae: '',
        mainPro: '',
        controlled: true,
      });
    } finally {
      setCreatingComposer(false);
    }
  };

  // Share splits equally
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
    <div className="space-y-6">
      {/* Writers & Ownership - Main Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Writers & Ownership</CardTitle>
              <CardDescription>
                {editorMode === 'simple'
                  ? "Add writers with a single share percentage. We'll handle the rest."
                  : 'Add writers with detailed mechanical & performance ownership percentages.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant={editorMode === 'simple' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onEditorModeChange('simple')}
              >
                Simple
              </Button>
              <Button
                variant={editorMode === 'advanced' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onEditorModeChange('advanced')}
              >
                Advanced
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search existing composers */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search existing composers by name or CAE..."
                value={composerSearch}
                onChange={(e) => setComposerSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showNewComposerDialog} onOpenChange={setShowNewComposerDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Writer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Writer</DialogTitle>
                  <DialogDescription>
                    Create a new composer/writer. They will be added to your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={newComposerData.firstName}
                        onChange={(e) => {
                          const firstName = e.target.value;
                          setNewComposerData((prev) => ({
                            ...prev,
                            firstName,
                            name: `${firstName} ${prev.surname}`.trim(),
                          }));
                        }}
                        placeholder="Legal first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Surname <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={newComposerData.surname}
                        onChange={(e) => {
                          const surname = e.target.value;
                          setNewComposerData((prev) => ({
                            ...prev,
                            surname,
                            name: `${prev.firstName} ${surname}`.trim(),
                          }));
                        }}
                        placeholder="Legal surname"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={newComposerData.name}
                      readOnly
                      disabled
                      className="bg-muted"
                      placeholder="Auto-generated from first name and surname"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-generated from first name and surname
                    </p>
                  </div>

                  {/* Duplicate name warning */}
                  {duplicateComposerCheck && (
                    <div
                      className={`p-3 rounded-lg border ${
                        duplicateComposerCheck.isAlreadyInWork
                          ? 'bg-destructive/10 border-destructive/50'
                          : 'bg-yellow-500/10 border-yellow-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle
                          className={`w-4 h-4 mt-0.5 ${
                            duplicateComposerCheck.isAlreadyInWork
                              ? 'text-destructive'
                              : 'text-yellow-600'
                          }`}
                        />
                        <div className="flex-1 space-y-2">
                          {duplicateComposerCheck.isAlreadyInWork ? (
                            <p className="text-sm text-destructive">
                              <strong>{duplicateComposerCheck.composer.name}</strong> already exists
                              and is already added to this work.
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                A composer named <strong>{duplicateComposerCheck.composer.name}</strong>{' '}
                                already exists in this account.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  addExistingComposer(duplicateComposerCheck.composer);
                                  setShowNewComposerDialog(false);
                                  setNewComposerData({
                                    name: '',
                                    firstName: '',
                                    surname: '',
                                    cae: '',
                                    mainPro: '',
                                    controlled: true,
                                  });
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add existing composer instead
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CAE/IPI Number</Label>
                      <Input
                        value={newComposerData.cae}
                        onChange={(e) =>
                          setNewComposerData((prev) => ({ ...prev, cae: e.target.value }))
                        }
                        placeholder="I-000000000-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>PRO</Label>
                      <Select
                        value={newComposerData.mainPro}
                        onValueChange={(value) =>
                          setNewComposerData((prev) => ({ ...prev, mainPro: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select PRO" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRO_LIST.map((pro) => (
                            <SelectItem key={pro} value={pro}>
                              {pro}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newControlled"
                      checked={newComposerData.controlled}
                      onCheckedChange={(checked) =>
                        setNewComposerData((prev) => ({ ...prev, controlled: checked as boolean }))
                      }
                    />
                    <Label htmlFor="newControlled" className="font-normal cursor-pointer">
                      This is a controlled writer (you administer their rights)
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewComposerDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddNewComposer}
                    disabled={
                      !newComposerData.firstName.trim() ||
                      !newComposerData.surname.trim() ||
                      creatingComposer ||
                      !!duplicateComposerCheck
                    }
                  >
                    {creatingComposer ? 'Adding...' : 'Add Writer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search results */}
          {composerSearch && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {loadingComposers ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : filteredComposers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No composers found.{' '}
                  <button
                    className="text-primary hover:underline"
                    onClick={() => {
                      setNewComposerData((prev) => ({ ...prev, name: composerSearch }));
                      setShowNewComposerDialog(true);
                    }}
                  >
                    Create new writer
                  </button>
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredComposers.map((composer) => {
                    const alreadyAdded = isComposerAlreadyAdded(composer.id);
                    return (
                      <li key={composer.id}>
                        <button
                          className={`w-full text-left p-3 transition-colors flex items-center justify-between ${
                            alreadyAdded
                              ? 'opacity-50 cursor-not-allowed bg-muted/30'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => !alreadyAdded && addExistingComposer(composer)}
                          disabled={alreadyAdded}
                        >
                          <div>
                            <p className="font-medium">{composer.name}</p>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              {composer.cae && <span>CAE: {composer.cae} • </span>}
                              {composer.main_pro && <span>{composer.main_pro}</span>}
                              {composer.controlled && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Controlled
                                </Badge>
                              )}
                            </div>
                          </div>
                          {alreadyAdded ? (
                            <Badge variant="outline" className="text-xs">
                              Added
                            </Badge>
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

        </CardContent>
      </Card>

      {/* Writers List */}
      {writers.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Added Writers ({writers.length})</CardTitle>
              <div className="flex items-center gap-3">
                {/* Circular Progress */}
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        className="stroke-muted"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
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
                      className={`absolute inset-0 flex items-center justify-center text-xs font-semibold ${
                        totalShare === 100
                          ? 'text-green-600'
                          : totalShare > 100
                            ? 'text-red-600'
                            : ''
                      }`}
                    >
                      {totalShare.toFixed(0)}%
                    </span>
                  </div>
                  {!hasControlledWriter && (
                    <span title="No writer has Right To Collect">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareSplitsEqually}
                >
                  <Divide className="w-3 h-3 mr-1" />
                  Split Equally
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {writers.map((writer) => (
              <div key={writer.tempId} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        writer.isControlled
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
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
                      <Badge variant="default" className="ml-2">
                        Controlled
                      </Badge>
                    )}
                    {writer.isNew && (
                      <Badge variant="outline" className="ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWriter(writer.tempId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Simple Mode Fields */}
                {editorMode === 'simple' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Writer Role</Label>
                      <Select
                        value={writer.role}
                        onValueChange={(val) => updateWriter(writer.tempId, 'role', val)}
                      >
                        <SelectTrigger>
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

                    <div className="space-y-2">
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
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              updateWriter(writer.tempId, 'share', 0);
                            }
                          }}
                          className="pr-8"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id={`controlled-${writer.tempId}`}
                        checked={writer.isControlled}
                        onCheckedChange={(checked) =>
                          updateWriter(writer.tempId, 'isControlled', checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`controlled-${writer.tempId}`}
                        className="font-normal cursor-pointer text-xs"
                      >
                        Right To Collect
                      </Label>
                    </div>
                  </div>
                )}

                {/* Advanced Mode Fields */}
                {editorMode === 'advanced' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Writer Role</Label>
                        <Select
                          value={writer.role}
                          onValueChange={(val) => updateWriter(writer.tempId, 'role', val)}
                        >
                          <SelectTrigger>
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
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`controlled-adv-${writer.tempId}`}
                          checked={writer.isControlled}
                          onCheckedChange={(checked) =>
                            updateWriter(writer.tempId, 'isControlled', checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`controlled-adv-${writer.tempId}`}
                          className="font-normal cursor-pointer text-xs"
                        >
                          Controlled
                        </Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Mech. Ownership %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={writer.mechanicalOwnership || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateWriter(writer.tempId, 'mechanicalOwnership', val);
                            updateWriter(writer.tempId, 'share', val);
                          }}
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              updateWriter(writer.tempId, 'mechanicalOwnership', 0);
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Perf. Ownership %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={writer.performanceOwnership || ''}
                          onChange={(e) =>
                            updateWriter(
                              writer.tempId,
                              'performanceOwnership',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              updateWriter(writer.tempId, 'performanceOwnership', 0);
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Mech. Collection %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={writer.mechanicalCollection || ''}
                          onChange={(e) =>
                            updateWriter(
                              writer.tempId,
                              'mechanicalCollection',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              updateWriter(writer.tempId, 'mechanicalCollection', 0);
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Perf. Collection %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.01}
                          value={writer.performanceCollection || ''}
                          onChange={(e) =>
                            updateWriter(
                              writer.tempId,
                              'performanceCollection',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          onBlur={(e) => {
                            if (e.target.value === '') {
                              updateWriter(writer.tempId, 'performanceCollection', 0);
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!writer.isControlled && (
                  <div className="space-y-2">
                    <Label className="text-xs">Publisher (Optional)</Label>
                    <Input
                      value={writer.publisherName || ''}
                      onChange={(e) => updateWriter(writer.tempId, 'publisherName', e.target.value)}
                      placeholder="Their publisher's name"
                    />
                  </div>
                )}
              </div>
            ))}

            {!isValidOwnership && writers.length > 0 && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                Total ownership percentages must equal 100%. Currently: {totalShare.toFixed(2)}%
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {writers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No writers added yet</h3>
            <p className="text-muted-foreground mb-4">
              Search for existing composers above or create a new one
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next: Recordings
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
