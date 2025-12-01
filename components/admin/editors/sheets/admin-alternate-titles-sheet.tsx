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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { LANGUAGES } from '@/components/shared/work-wizard/constants';
import type { AdminAlternateTitle } from '../types';

interface AdminAlternateTitlesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alternateTitles: AdminAlternateTitle[];
  onAlternateTitlesChange: (titles: AdminAlternateTitle[]) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
}

export function AdminAlternateTitlesSheet({
  open,
  onOpenChange,
  alternateTitles,
  onAlternateTitlesChange,
  onSave,
  saving = false,
}: AdminAlternateTitlesSheetProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState<string>('');

  const handleAddTitle = () => {
    if (!newTitle.trim()) return;

    const newAlternateTitle: AdminAlternateTitle = {
      tempId: `alt-${Date.now()}`,
      title: newTitle.trim(),
      language: newLanguage || null,
      title_type: null,
    };

    onAlternateTitlesChange([...alternateTitles, newAlternateTitle]);
    setNewTitle('');
    setNewLanguage('');
  };

  const handleRemoveTitle = (tempId: string) => {
    onAlternateTitlesChange(alternateTitles.filter((t) => t.tempId !== tempId));
  };

  const handleUpdateTitle = (tempId: string, field: keyof AdminAlternateTitle, value: string | null) => {
    onAlternateTitlesChange(
      alternateTitles.map((t) =>
        t.tempId === tempId ? { ...t, [field]: value } : t
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
          <SheetTitle>Alternate Titles</SheetTitle>
          <SheetDescription>
            Manage alternate titles and aliases for this work.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Add new title form */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <Label className="text-sm font-medium">Add New Title</Label>
            <div className="space-y-3">
              <Input
                placeholder="Enter alternate title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTitle();
                  }
                }}
              />
              <div className="flex gap-2">
                <Select value={newLanguage || '__none__'} onValueChange={(val) => setNewLanguage(val === '__none__' ? '' : val)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Language (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No language</SelectItem>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddTitle}
                  disabled={!newTitle.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Existing titles list */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Current Titles ({alternateTitles.length})
            </Label>

            {alternateTitles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No alternate titles added yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {alternateTitles.map((title) => (
                  <div
                    key={title.tempId}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-background"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        value={title.title}
                        onChange={(e) =>
                          handleUpdateTitle(title.tempId, 'title', e.target.value)
                        }
                        placeholder="Title"
                      />
                      <Select
                        value={title.language || '__none__'}
                        onValueChange={(value) =>
                          handleUpdateTitle(title.tempId, 'language', value === '__none__' ? null : value)
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No language</SelectItem>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTitle(title.tempId)}
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
