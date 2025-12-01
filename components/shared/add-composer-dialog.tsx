'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, AlertCircle } from 'lucide-react';
import { ProSelector } from '@/components/ui/pro-selector';
import type { Composer } from '@/components/shared/work-wizard/types';

interface ComposerFormData {
  name: string;
  firstName: string;
  surname: string;
  cae: string;
  mainPro: string;
  controlled: boolean;
}

interface AddComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComposer: (data: Omit<Composer, 'id'>) => Promise<void>;
  existingComposers?: Composer[];
  onAddExistingComposer?: (composer: Composer) => void;
  addedComposerIds?: string[];
  creating?: boolean;
}

/**
 * Shared dialog for adding new composers/writers.
 * Used by both work wizard and work editor to maintain consistency.
 */
export function AddComposerDialog({
  open,
  onOpenChange,
  onAddComposer,
  existingComposers = [],
  onAddExistingComposer,
  addedComposerIds = [],
  creating = false,
}: AddComposerDialogProps) {
  const [showProConfirmDialog, setShowProConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<ComposerFormData>({
    name: '',
    firstName: '',
    surname: '',
    cae: '',
    mainPro: '',
    controlled: true,
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        firstName: '',
        surname: '',
        cae: '',
        mainPro: '',
        controlled: true,
      });
      setShowProConfirmDialog(false);
    }
  }, [open]);

  // Check if PRO info is missing (neither CAE nor PRO provided)
  const isMissingProInfo = !formData.cae.trim() && !formData.mainPro;

  // Check for partial PRO info (CAE without PRO or PRO without CAE)
  const hasPartialProInfo =
    (formData.cae.trim() !== '' && !formData.mainPro) ||
    (!!formData.mainPro && !formData.cae.trim());

  // Check for duplicate composer name (case-insensitive)
  const duplicateComposerCheck = useMemo(() => {
    const newName = formData.name.trim().toLowerCase();
    if (!newName) return null;

    const existingComposer = existingComposers.find(
      (c) => c.name.toLowerCase() === newName
    );

    if (!existingComposer) return null;

    const isAlreadyInWork = addedComposerIds.includes(existingComposer.id);

    return {
      composer: existingComposer,
      isAlreadyInWork,
    };
  }, [formData.name, existingComposers, addedComposerIds]);

  // Handle add composer
  const handleAddComposer = async () => {
    if (!formData.firstName.trim() || !formData.surname.trim()) return;

    await onAddComposer({
      name: formData.name,
      first_name: formData.firstName || null,
      surname: formData.surname || null,
      cae: formData.cae || null,
      main_pro: formData.mainPro || null,
      controlled: formData.controlled,
    });

    onOpenChange(false);
  };

  // Handle add button click - show confirmation if no PRO info
  const handleAddClick = () => {
    if (isMissingProInfo) {
      setShowProConfirmDialog(true);
    } else {
      handleAddComposer();
    }
  };

  // Confirm adding without PRO
  const handleConfirmNoProAffiliation = () => {
    setShowProConfirmDialog(false);
    handleAddComposer();
  };

  // Handle adding existing composer instead
  const handleAddExistingComposer = () => {
    if (duplicateComposerCheck && onAddExistingComposer) {
      onAddExistingComposer(duplicateComposerCheck.composer);
      onOpenChange(false);
    }
  };

  const canAdd =
    formData.firstName.trim() &&
    formData.surname.trim() &&
    !creating &&
    !duplicateComposerCheck &&
    !hasPartialProInfo;

  return (
    <>
      <Dialog open={open && !showProConfirmDialog} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Writer</DialogTitle>
            <DialogDescription>
              Create a new composer/writer. They will be added to your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => {
                    const firstName = e.target.value;
                    setFormData((prev) => ({
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
                  value={formData.surname}
                  onChange={(e) => {
                    const surname = e.target.value;
                    setFormData((prev) => ({
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
                value={formData.name}
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
                        {onAddExistingComposer && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddExistingComposer}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add existing composer instead
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CAE/IPI Number</Label>
                <Input
                  value={formData.cae}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cae: e.target.value }))
                  }
                  placeholder="I-000000000-0"
                />
              </div>
              <div className="space-y-2">
                <Label>PRO</Label>
                <ProSelector
                  value={formData.mainPro || null}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, mainPro: value || '' }))
                  }
                  placeholder="Select PRO..."
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newControlled"
                checked={formData.controlled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, controlled: checked as boolean }))
                }
              />
              <Label htmlFor="newControlled" className="font-normal cursor-pointer">
                This is a controlled writer (you administer their rights)
              </Label>
            </div>

            {/* Validation: CAE requires PRO and vice versa */}
            {formData.cae.trim() && !formData.mainPro && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                PRO is required when CAE/IPI Number is provided
              </div>
            )}
            {formData.mainPro && !formData.cae.trim() && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                CAE/IPI Number is required when PRO is selected
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClick} disabled={!canAdd}>
              {creating ? 'Adding...' : 'Add Writer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PRO Confirmation Dialog */}
      <Dialog open={showProConfirmDialog} onOpenChange={setShowProConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Confirm PRO Affiliation
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure this writer is <strong>not affiliated</strong> with a PRO?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Writers affiliated with PROs (like ASCAP, BMI, PRS, GEMA) need their CAE/IPI
              number for proper royalty collection. Missing this information may delay payments.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowProConfirmDialog(false)}>
              Go Back
            </Button>
            <Button onClick={handleConfirmNoProAffiliation}>
              Yes, Not Affiliated
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
