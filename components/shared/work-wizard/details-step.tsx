'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, ArrowRight, Plus, X, UserCircle } from 'lucide-react';
import type { DetailsStepProps } from './types';
import {
  LANGUAGES,
  WORK_CATEGORIES,
  VERSION_TYPES,
  ARRANGEMENT_TYPES,
  COMPOSITE_TYPES,
} from './constants';

export function DetailsStep({
  detailsData,
  onDetailsDataChange,
  linkedTracks,
  accountName,
  onBack,
  onNext,
}: DetailsStepProps) {
  const [performerInput, setPerformerInput] = useState('');

  const updateField = <K extends keyof typeof detailsData>(
    field: K,
    value: (typeof detailsData)[K]
  ) => {
    onDetailsDataChange({ ...detailsData, [field]: value });
  };

  // Get unique artist suggestions from linked tracks
  const artistSuggestions = useMemo(() => {
    const artists = new Set<string>();
    if (accountName) artists.add(accountName);
    linkedTracks.forEach((track) => {
      if (track.artist) artists.add(track.artist);
    });
    // Remove already added performers
    const currentPerformers = detailsData.performers || [];
    return Array.from(artists).filter((a) => !currentPerformers.includes(a));
  }, [linkedTracks, accountName, detailsData.performers]);

  const addPerformer = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const currentPerformers = detailsData.performers || [];
    if (currentPerformers.includes(trimmedName)) return;
    updateField('performers', [...currentPerformers, trimmedName]);
    setPerformerInput('');
  };

  const removePerformer = (name: string) => {
    const currentPerformers = detailsData.performers || [];
    updateField('performers', currentPerformers.filter((p) => p !== name));
  };

  const handlePerformerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPerformer(performerInput);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <CardDescription>
            Optional: Add more information about the work. These fields help with cataloging and
            registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="foreignId">Foreign ID</Label>
                <Input
                  id="foreignId"
                  value={detailsData.foreignId || ''}
                  onChange={(e) => updateField('foreignId', e.target.value || undefined)}
                  placeholder="External system identifier"
                />
                <p className="text-xs text-muted-foreground">
                  ID from an external system (e.g., your internal catalog)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  value={detailsData.projectId || ''}
                  onChange={(e) => updateField('projectId', e.target.value || undefined)}
                  placeholder="Project identifier"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyrightDate">Copyright Date</Label>
                <Input
                  id="copyrightDate"
                  type="date"
                  value={detailsData.copyrightDate || ''}
                  onChange={(e) => updateField('copyrightDate', e.target.value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labelCopy">Label Copy</Label>
                <Input
                  id="labelCopy"
                  value={detailsData.labelCopy || ''}
                  onChange={(e) => updateField('labelCopy', e.target.value || undefined)}
                  placeholder="Label copy information"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={detailsData.duration || ''}
                  onChange={(e) =>
                    updateField('duration', e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  placeholder="Duration in seconds"
                  min={0}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workLanguage">Language</Label>
                <Select
                  value={detailsData.workLanguage || ''}
                  onValueChange={(value) => updateField('workLanguage', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workDescriptionCategory">Category</Label>
                <Select
                  value={detailsData.workDescriptionCategory || ''}
                  onValueChange={(value) =>
                    updateField('workDescriptionCategory', value || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="versionType">Work Version</Label>
                <Select
                  value={detailsData.versionType || ''}
                  onValueChange={(value) => updateField('versionType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERSION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrangementType">Arrangement Type</Label>
                <Select
                  value={detailsData.arrangementType || ''}
                  onValueChange={(value) => updateField('arrangementType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select arrangement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARRANGEMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compositeType">Composite Type</Label>
                <Select
                  value={detailsData.compositeType || ''}
                  onValueChange={(value) => updateField('compositeType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select composite type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPOSITE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {detailsData.compositeType && detailsData.compositeType !== 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="compositeCount">Number of Works in Composite</Label>
                  <Input
                    id="compositeCount"
                    type="number"
                    value={detailsData.compositeCount || 0}
                    onChange={(e) =>
                      updateField('compositeCount', parseInt(e.target.value) || 0)
                    }
                    placeholder="Number of works"
                    min={0}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Performers
          </CardTitle>
          <CardDescription>
            Add performers/artists associated with this work. This is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add performer input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter performer name..."
              value={performerInput}
              onChange={(e) => setPerformerInput(e.target.value)}
              onKeyDown={handlePerformerKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addPerformer(performerInput)}
              disabled={!performerInput.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Suggestions */}
          {artistSuggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {artistSuggestions.map((artist) => (
                  <Button
                    key={artist}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPerformer(artist)}
                    className="h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {artist}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Added performers */}
          {(detailsData.performers?.length ?? 0) > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Added performers:</p>
              <div className="flex flex-wrap gap-2">
                {detailsData.performers?.map((performer) => (
                  <Badge key={performer} variant="secondary" className="pl-3 pr-1 py-1">
                    {performer}
                    <button
                      type="button"
                      onClick={() => removePerformer(performer)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {(!detailsData.performers || detailsData.performers.length === 0) &&
            artistSuggestions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No performers added yet. Type a name above to add one.
              </p>
            )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Next: Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
