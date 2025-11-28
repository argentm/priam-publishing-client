'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight } from 'lucide-react';
import type { WorkInfoStepProps } from './types';

export function WorkInfoStep({ workData, onWorkDataChange, onNext }: WorkInfoStepProps) {
  const canProceed = workData.title.trim() !== '';

  const updateField = <K extends keyof typeof workData>(
    field: K,
    value: (typeof workData)[K]
  ) => {
    onWorkDataChange({ ...workData, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Information</CardTitle>
        <CardDescription>Enter the basic details of your musical work</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="iswc">ISWC</Label>
            <Input
              id="iswc"
              value={workData.iswc}
              onChange={(e) => updateField('iswc', e.target.value)}
              placeholder="T-XXX.XXX.XXX-X"
            />
            <p className="text-xs text-muted-foreground">
              International Standard Musical Work Code (if registered)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tunecode">Tunecode</Label>
            <Input
              id="tunecode"
              value={workData.tunecode}
              onChange={(e) => updateField('tunecode', e.target.value)}
              placeholder="Enter tunecode"
            />
          </div>
        </div>

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

        <div className="space-y-3">
          <Label>Options</Label>
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
                onCheckedChange={(checked) =>
                  updateField('productionLibrary', checked as boolean)
                }
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
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          Next: Add Writers
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
