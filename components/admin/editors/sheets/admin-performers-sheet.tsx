'use client';

import { useState } from 'react';
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
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import type { AdminPerformer } from '../types';

interface AdminPerformersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  performers: AdminPerformer[];
  onPerformersChange: (performers: AdminPerformer[]) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
}

export function AdminPerformersSheet({
  open,
  onOpenChange,
  performers,
  onPerformersChange,
  onSave,
  saving = false,
}: AdminPerformersSheetProps) {
  const [newPerformerName, setNewPerformerName] = useState('');

  const handleAddPerformer = () => {
    if (!newPerformerName.trim()) return;

    const newPerformer: AdminPerformer = {
      tempId: `performer-${Date.now()}`,
      performer_name: newPerformerName.trim(),
    };

    onPerformersChange([...performers, newPerformer]);
    setNewPerformerName('');
  };

  const handleRemovePerformer = (tempId: string) => {
    onPerformersChange(performers.filter((p) => p.tempId !== tempId));
  };

  const handleUpdatePerformer = (tempId: string, name: string) => {
    onPerformersChange(
      performers.map((p) =>
        p.tempId === tempId ? { ...p, performer_name: name } : p
      )
    );
  };

  const handleSaveAndClose = async () => {
    await onSave();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Performers</SheetTitle>
          <SheetDescription>
            Manage performers associated with this work.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Add new performer form */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <Label className="text-sm font-medium">Add New Performer</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter performer name..."
                value={newPerformerName}
                onChange={(e) => setNewPerformerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPerformer();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddPerformer}
                disabled={!newPerformerName.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Existing performers list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Current Performers ({performers.length})
            </Label>

            {performers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No performers added yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {performers.map((performer) => (
                  <div
                    key={performer.tempId}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-background"
                  >
                    <Input
                      value={performer.performer_name}
                      onChange={(e) =>
                        handleUpdatePerformer(performer.tempId, e.target.value)
                      }
                      placeholder="Performer name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePerformer(performer.tempId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
          <Button type="button" onClick={handleSaveAndClose} disabled={saving}>
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
  );
}
