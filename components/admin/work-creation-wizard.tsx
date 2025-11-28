'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';
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
  WizardStep,
} from '@/components/shared/work-wizard';

interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkCreationWizardProps {
  accounts: Account[];
}

// Admin wizard has 6 steps: Account + 5 shared steps
type AdminStep = 'account' | WizardStep;

const SHARED_STEPS: WizardStepConfig[] = [
  { id: 'basic', label: 'Work Info', icon: 'music' },
  { id: 'writers', label: 'Writers', icon: 'users' },
  { id: 'recordings', label: 'Recordings', icon: 'radio' },
  { id: 'details', label: 'Details', icon: 'settings' },
  { id: 'review', label: 'Review', icon: 'check' },
];

const ACCOUNTS_DISPLAY_LIMIT = 6;
const LAST_USED_ACCOUNTS_KEY = 'priam_last_used_accounts';

// Helper to get last used account IDs from localStorage
const getLastUsedAccountIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LAST_USED_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save account as last used
const saveLastUsedAccount = (accountId: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getLastUsedAccountIds();
    // Remove if already exists, then add to front
    const filtered = current.filter((id) => id !== accountId);
    const updated = [accountId, ...filtered].slice(0, 20); // Keep last 20
    localStorage.setItem(LAST_USED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

export function WorkCreationWizard({ accounts }: WorkCreationWizardProps) {
  const router = useRouter();

  // Account selection state
  const [adminStep, setAdminStep] = useState<AdminStep>(
    accounts.length === 1 ? 'basic' : 'account'
  );
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.length === 1 ? accounts[0].id : ''
  );
  const [accountSearch, setAccountSearch] = useState('');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Sort accounts by last used, then filter by search
  const sortedAndFilteredAccounts = useMemo(() => {
    const lastUsedIds = getLastUsedAccountIds();

    // Sort accounts: last used first, then by created_at desc
    const sorted = [...accounts].sort((a, b) => {
      const aIndex = lastUsedIds.indexOf(a.id);
      const bIndex = lastUsedIds.indexOf(b.id);

      // Both are in last used list - sort by recency
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // Only a is in last used list
      if (aIndex !== -1) return -1;
      // Only b is in last used list
      if (bIndex !== -1) return 1;
      // Neither in last used - sort by created_at desc
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Apply search filter
    if (!accountSearch.trim()) return sorted;
    const query = accountSearch.toLowerCase();
    return sorted.filter(
      (account) =>
        account.name.toLowerCase().includes(query) ||
        account.client_id?.toLowerCase().includes(query)
    );
  }, [accounts, accountSearch]);

  // Visible accounts - show all when searching, limit to 6 otherwise
  const visibleAccounts = useMemo(() => {
    if (accountSearch.trim()) return sortedAndFilteredAccounts;
    return sortedAndFilteredAccounts.slice(0, ACCOUNTS_DISPLAY_LIMIT);
  }, [sortedAndFilteredAccounts, accountSearch]);

  // API configuration for admin context
  const apiConfig = {
    getComposers: (id: string) => API_ENDPOINTS.ADMIN_ACCOUNT_COMPOSERS(id),
    createComposer: (id: string) => API_ENDPOINTS.ADMIN_ACCOUNT_COMPOSERS(id),
    getTracks: (id: string) => API_ENDPOINTS.ADMIN_ACCOUNT_TRACKS(id),
    createTrack: API_ENDPOINTS.ADMIN_TRACKS,
    createWork: API_ENDPOINTS.ADMIN_WORKS,
  };

  // Use shared wizard hook (only when account is selected)
  const wizard = useWorkWizard({
    accountId: selectedAccountId,
    apiConfig,
    onSuccess: () => {
      // Save this account as last used
      if (selectedAccountId) {
        saveLastUsedAccount(selectedAccountId);
      }
      router.push(ROUTES.ADMIN_WORKS);
    },
  });

  // Sync admin step with wizard step changes
  useEffect(() => {
    if (adminStep !== 'account' && wizard.step !== adminStep) {
      setAdminStep(wizard.step);
    }
  }, [wizard.step, adminStep]);

  // Navigation helpers
  const goToAccount = () => setAdminStep('account');
  const goToBasicFromAccount = () => {
    if (selectedAccountId) {
      setAdminStep('basic');
    }
  };

  // Calculate step number for display
  const getStepNumber = () => {
    if (adminStep === 'account') return 1;
    const sharedIndex = SHARED_STEPS.findIndex((s) => s.id === adminStep);
    return sharedIndex + 2; // +2 because account is step 1
  };

  const totalSteps = SHARED_STEPS.length + 1; // +1 for account step

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={ROUTES.ADMIN_WORKS}>
          <ArrowLeft className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Work</h1>
          <p className="text-muted-foreground">
            {selectedAccount ? selectedAccount.name : 'Select the account for this work'}
          </p>
        </div>
        <div className="ml-auto">
          <span className="text-sm text-muted-foreground">
            Step {getStepNumber()} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Progress indicator - only show when past account selection */}
      {adminStep !== 'account' && (
        <WizardProgress
          steps={SHARED_STEPS}
          currentStep={adminStep as WizardStep}
          completedSteps={wizard.completedSteps}
        />
      )}

      {/* Account Selection Step */}
      {adminStep === 'account' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Account</CardTitle>
            <CardDescription>
              Choose which account this work belongs to. The account determines ownership and access
              rights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="pl-10"
              />
              {accountSearch && (
                <button
                  onClick={() => setAccountSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search result count */}
            {accountSearch && (
              <p className="text-sm text-muted-foreground">
                {sortedAndFilteredAccounts.length} of {accounts.length} accounts matching &quot;
                {accountSearch}&quot;
              </p>
            )}

            {/* Accounts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleAccounts.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No accounts found matching &quot;{accountSearch}&quot;
                </div>
              ) : (
                visibleAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`cursor-pointer transition-all p-4 rounded-lg border hover:shadow-md flex items-center gap-3 ${
                      selectedAccountId === account.id
                        ? 'border-primary ring-2 ring-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedAccountId(account.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{account.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedAccountId === account.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={goToBasicFromAccount} disabled={!selectedAccountId}>
                Next: Work Info
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shared Step Components */}
      {adminStep === 'basic' && (
        <WorkInfoStep
          workData={wizard.workData}
          onWorkDataChange={wizard.setWorkData}
          onNext={wizard.goToWriters}
        />
      )}

      {adminStep === 'writers' && (
        <WritersStep
          accountId={selectedAccountId}
          writers={wizard.writers}
          onWritersChange={wizard.setWriters}
          editorMode={wizard.editorMode}
          onEditorModeChange={wizard.setEditorMode}
          existingComposers={wizard.existingComposers}
          loadingComposers={wizard.loadingComposers}
          onCreateComposer={wizard.createComposer}
          onBack={accounts.length === 1 ? wizard.goToBasic : goToAccount}
          onNext={wizard.goToRecordings}
        />
      )}

      {adminStep === 'recordings' && (
        <RecordingsStep
          accountId={selectedAccountId}
          linkedTracks={wizard.linkedTracks}
          onLinkedTracksChange={wizard.setLinkedTracks}
          existingTracks={wizard.existingTracks}
          loadingTracks={wizard.loadingTracks}
          onCreateTrack={wizard.createTrack}
          onBack={wizard.goToWriters}
          onNext={wizard.goToDetails}
        />
      )}

      {adminStep === 'details' && (
        <DetailsStep
          detailsData={wizard.detailsData}
          onDetailsDataChange={wizard.setDetailsData}
          linkedTracks={wizard.linkedTracks}
          accountName={selectedAccount?.name}
          onBack={wizard.goToRecordings}
          onNext={wizard.goToReview}
        />
      )}

      {adminStep === 'review' && (
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
