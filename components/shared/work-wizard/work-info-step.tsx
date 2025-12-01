'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Plus, X, UserCircle } from 'lucide-react';
import type { WorkInfoStepProps } from './types';
import {
  LANGUAGES,
  WORK_CATEGORIES,
  VERSION_TYPES,
  ARRANGEMENT_TYPES,
  COMPOSITE_TYPES,
} from './constants';

export function WorkInfoStep({
  workData,
  onWorkDataChange,
  detailsData,
  onDetailsDataChange,
  accountName,
  onNext,
}: WorkInfoStepProps) {
  const [performerInput, setPerformerInput] = useState('');
  const canProceed = workData.title.trim() !== '';

  const updateField = <K extends keyof typeof workData>(
    field: K,
    value: (typeof workData)[K]
  ) => {
    onWorkDataChange({ ...workData, [field]: value });
  };

  const updateDetailsField = <K extends keyof typeof detailsData>(
    field: K,
    value: (typeof detailsData)[K]
  ) => {
    onDetailsDataChange({ ...detailsData, [field]: value });
  };

  const addPerformer = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const currentPerformers = detailsData.performers || [];
    if (currentPerformers.includes(trimmedName)) return;
    updateDetailsField('performers', [...currentPerformers, trimmedName]);
    setPerformerInput('');
  };

  const removePerformer = (name: string) => {
    const currentPerformers = detailsData.performers || [];
    updateDetailsField('performers', currentPerformers.filter((p) => p !== name));
  };

  const handlePerformerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPerformer(performerInput);
    }
  };

  // Format duration for display
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse duration input (mm:ss or just seconds)
  const parseDuration = (value: string): number | null => {
    if (!value) return null;
    if (value.includes(':')) {
      const [mins, secs] = value.split(':').map(Number);
      return mins * 60 + (secs || 0);
    }
    return parseInt(value) || null;
  };

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Work Information</CardTitle>
          <CardDescription>Enter the basic details of your musical work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Work Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={workData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter the work title"
              className="text-lg"
            />
          </div>

          {/* ISWC, Duration, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iswc">ISWC</Label>
              <Input
                id="iswc"
                value={workData.iswc}
                onChange={(e) => updateField('iswc', e.target.value)}
                placeholder="T-XXX.XXX.XXX-X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={detailsData.duration ? formatDuration(detailsData.duration) : ''}
                onChange={(e) => updateDetailsField('duration', parseDuration(e.target.value))}
                placeholder="3:45 or 225"
              />
              <p className="text-xs text-muted-foreground">mm:ss or seconds</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workLanguage">Language</Label>
              <Select
                value={detailsData.workLanguage || ''}
                onValueChange={(value) => updateDetailsField('workLanguage', value || undefined)}
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
          </div>

          {/* Performers */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Performers
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
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
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Quick add account name */}
            {accountName && !(detailsData.performers || []).includes(accountName) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addPerformer(accountName)}
                className="h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                {accountName}
              </Button>
            )}

            {/* Added performers */}
            {(detailsData.performers?.length ?? 0) > 0 && (
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
          <CardDescription>Optional details for cataloging and registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Label Copy */}
          <div className="space-y-2">
            <Label htmlFor="labelCopy">Label Copy</Label>
            <Input
              id="labelCopy"
              value={detailsData.labelCopy || ''}
              onChange={(e) => updateDetailsField('labelCopy', e.target.value || undefined)}
              placeholder="Writer credits as shown on releases"
            />
          </div>

          {/* Category, Work Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workDescriptionCategory">Category</Label>
              <Select
                value={detailsData.workDescriptionCategory || ''}
                onValueChange={(value) => updateDetailsField('workDescriptionCategory', value || undefined)}
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
                onValueChange={(value) => updateDetailsField('versionType', value || undefined)}
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
          </div>

          {/* Arrangement Type, Composite Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrangementType">Arrangement Type</Label>
              <Select
                value={detailsData.arrangementType || ''}
                onValueChange={(value) => updateDetailsField('arrangementType', value || undefined)}
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
                onValueChange={(value) => updateDetailsField('compositeType', value || undefined)}
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
          </div>

          {/* Composite Count (conditional) */}
          {detailsData.compositeType && detailsData.compositeType !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="compositeCount">Number of Works in Composite</Label>
              <Input
                id="compositeCount"
                type="number"
                value={detailsData.compositeCount || 0}
                onChange={(e) => updateDetailsField('compositeCount', parseInt(e.target.value) || 0)}
                placeholder="Number of works"
                min={0}
                className="max-w-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes & Options Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes & Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={workData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Add any notes about this work..."
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="priority"
                checked={workData.priority}
                onCheckedChange={(checked) => updateField('priority', checked as boolean)}
              />
              <Label htmlFor="priority" className="font-normal cursor-pointer">
                Priority Work
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="productionLibrary"
                checked={workData.productionLibrary}
                onCheckedChange={(checked) => updateField('productionLibrary', checked as boolean)}
              />
              <Label htmlFor="productionLibrary" className="font-normal cursor-pointer">
                Production Library
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="grandRights"
                checked={workData.grandRights}
                onCheckedChange={(checked) => updateField('grandRights', checked as boolean)}
              />
              <Label htmlFor="grandRights" className="font-normal cursor-pointer">
                Grand Rights
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onNext} disabled={!canProceed}>
            Next: Add Writers
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
