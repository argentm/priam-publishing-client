'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS, ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { ApiClient } from '@/lib/api/client';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2,
  UserCircle,
  Music,
  AlertCircle,
  Search,
} from 'lucide-react';
import Link from 'next/link';

// PRO (Performance Rights Organizations) list - commonly used ones
const PRO_LIST = [
  'PRS', 'ASCAP', 'BMI', 'SOCAN', 'GEMA', 'SACEM', 'SIAE', 'SGAE', 'JASRAC', 
  'APRA', 'IMRO', 'MCPS', 'SESAC', 'KOMCA', 'SABAM', 'SUISA', 'STIM', 'BUMA',
  'TONO', 'KODA', 'TEOSTO', 'AKM', 'CASH', 'SAMRO', 'Other'
];

interface Composer {
  id: string;
  name: string;
  first_name?: string | null;
  middle_names?: string | null;
  surname?: string | null;
  cae?: string | null;
  main_pro?: string | null;
  controlled?: boolean;
}

interface Writer {
  id?: string;
  tempId: string;
  isNew: boolean;
  isControlled: boolean;
  composerId?: string;
  name: string;
  firstName?: string;
  surname?: string;
  cae?: string;
  mainPro?: string;
  mechanicalOwnership: number;
  performanceOwnership: number;
  mechanicalCollection: number;
  performanceCollection: number;
  publisherName?: string;
}

interface WorkCreationWizardProps {
  accountId: string;
  accountName: string;
}

export function WorkCreationWizard({ accountId, accountName }: WorkCreationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<'basic' | 'writers' | 'review'>('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiClient, setApiClient] = useState<ApiClient | null>(null);

  // Existing composers for search
  const [existingComposers, setExistingComposers] = useState<Composer[]>([]);
  const [loadingComposers, setLoadingComposers] = useState(false);
  const [composerSearch, setComposerSearch] = useState('');

  // New composer dialog
  const [showNewComposerDialog, setShowNewComposerDialog] = useState(false);
  const [newComposerData, setNewComposerData] = useState({
    name: '',
    firstName: '',
    surname: '',
    cae: '',
    mainPro: '',
    controlled: true,
  });

  // Work form data
  const [workData, setWorkData] = useState({
    title: '',
    iswc: '',
    tunecode: '',
    notes: '',
    priority: false,
    productionLibrary: false,
    grandRights: false,
  });

  // Writers (IP Chain)
  const [writers, setWriters] = useState<Writer[]>([]);

  // Initialize API client
  useEffect(() => {
    const initClient = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setApiClient(new ApiClient(async () => session?.access_token || null));
    };
    initClient();
  }, []);

  // Fetch existing composers
  useEffect(() => {
    const fetchComposers = async () => {
      if (!apiClient) return;
      setLoadingComposers(true);
      try {
        const response = await apiClient.get<{ composers: Composer[]; total: number }>(
          `${API_ENDPOINTS.DASHBOARD_ACCOUNT(accountId)}/composers?limit=100`
        );
        setExistingComposers(response.composers || []);
      } catch (err) {
        console.error('Failed to fetch composers:', err);
      } finally {
        setLoadingComposers(false);
      }
    };
    fetchComposers();
  }, [apiClient, accountId]);

  // Filter composers based on search
  const filteredComposers = existingComposers.filter(c => 
    c.name.toLowerCase().includes(composerSearch.toLowerCase()) ||
    c.cae?.includes(composerSearch) ||
    c.first_name?.toLowerCase().includes(composerSearch.toLowerCase()) ||
    c.surname?.toLowerCase().includes(composerSearch.toLowerCase())
  );

  // Add existing composer as writer
  const addExistingComposer = (composer: Composer) => {
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
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
    };
    setWriters(prev => [...prev, newWriter]);
    setComposerSearch('');
  };

  // Add new composer as writer
  const addNewComposer = () => {
    if (!newComposerData.name.trim()) return;

    const newWriter: Writer = {
      tempId: `writer-${Date.now()}`,
      isNew: true,
      isControlled: newComposerData.controlled,
      name: newComposerData.name,
      firstName: newComposerData.firstName || undefined,
      surname: newComposerData.surname || undefined,
      cae: newComposerData.cae || undefined,
      mainPro: newComposerData.mainPro || undefined,
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
    };
    setWriters(prev => [...prev, newWriter]);
    setShowNewComposerDialog(false);
    setNewComposerData({
      name: '',
      firstName: '',
      surname: '',
      cae: '',
      mainPro: '',
      controlled: true,
    });
  };

  // Update writer field
  const updateWriter = (tempId: string, field: keyof Writer, value: any) => {
    setWriters(prev => prev.map(w => 
      w.tempId === tempId ? { ...w, [field]: value } : w
    ));
  };

  // Remove writer
  const removeWriter = (tempId: string) => {
    setWriters(prev => prev.filter(w => w.tempId !== tempId));
  };

  // Calculate totals
  const totalMechOwnership = writers.reduce((sum, w) => sum + (w.mechanicalOwnership || 0), 0);
  const totalPerfOwnership = writers.reduce((sum, w) => sum + (w.performanceOwnership || 0), 0);

  // Validation
  const canProceedToWriters = workData.title.trim() !== '';
  const canProceedToReview = writers.length > 0;
  const isValidOwnership = totalMechOwnership <= 100 && totalPerfOwnership <= 100;

  // Handle save
  const handleSave = async () => {
    if (!apiClient) return;
    
    if (!canProceedToWriters || !canProceedToReview) {
      setError('Please complete all required fields');
      return;
    }

    if (!isValidOwnership) {
      setError('Total ownership percentages cannot exceed 100%');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // First, create any new composers
      const composerIds: string[] = [];
      for (const writer of writers) {
        if (writer.isNew) {
          // Create new composer using user-facing endpoint
          const composerResponse = await apiClient.post<{ composer: Composer }>(
            `${API_ENDPOINTS.DASHBOARD_ACCOUNT(accountId)}/composers`,
            {
              name: writer.name,
              first_name: writer.firstName || null,
              surname: writer.surname || null,
              cae: writer.cae || null,
              main_pro: writer.mainPro || null,
              controlled: writer.isControlled,
            }
          );
          composerIds.push(composerResponse.composer.id);
        } else if (writer.composerId) {
          composerIds.push(writer.composerId);
        }
      }

      // Create the work
      const workResponse = await apiClient.post<{ work: { id: string } }>(
        API_ENDPOINTS.WORKS,
        {
          account_id: accountId,
          title: workData.title,
          iswc: workData.iswc || null,
          tunecode: workData.tunecode || null,
          notes: workData.notes || null,
          priority: workData.priority,
          production_library: workData.productionLibrary,
          grand_rights: workData.grandRights,
          composers: composerIds,
          // Rights chain would be added here in a more complete implementation
        }
      );

      // Navigate to the work detail page
      router.push(`/dashboard/account/${accountId}/works/${workResponse.work.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create work');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.WORKSPACE_WORKS(accountId)}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Register New Work</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {accountName} • {step === 'basic' && 'Basic information'}
              {step === 'writers' && 'Add writers and ownership'}
              {step === 'review' && 'Review and submit'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Step {step === 'basic' ? '1' : step === 'writers' ? '2' : '3'} of 3
        </Badge>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step === 'basic' ? 'bg-primary text-primary-foreground' : 'bg-green-500 text-white'
              }`}>
                {step === 'basic' ? <Music className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <span className="font-medium hidden sm:inline">Work Info</span>
            </div>
            <div className="flex-1 h-1 bg-muted mx-4 rounded-full overflow-hidden">
              <div className={`h-full bg-primary transition-all ${step !== 'basic' ? 'w-full' : 'w-0'}`} />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step === 'writers' ? 'bg-primary text-primary-foreground' : 
                step === 'review' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'review' ? <CheckCircle2 className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
              </div>
              <span className="font-medium hidden sm:inline">Writers</span>
            </div>
            <div className="flex-1 h-1 bg-muted mx-4 rounded-full overflow-hidden">
              <div className={`h-full bg-primary transition-all ${step === 'review' ? 'w-full' : 'w-0'}`} />
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="font-medium hidden sm:inline">Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Basic Information */}
      {step === 'basic' && (
        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
            <CardDescription>
              Enter the basic details of your musical work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Work Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={workData.title}
                onChange={(e) => setWorkData(prev => ({ ...prev, title: e.target.value }))}
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
                  onChange={(e) => setWorkData(prev => ({ ...prev, iswc: e.target.value }))}
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
                  onChange={(e) => setWorkData(prev => ({ ...prev, tunecode: e.target.value }))}
                  placeholder="Enter tunecode"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={workData.notes}
                onChange={(e) => setWorkData(prev => ({ ...prev, notes: e.target.value }))}
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
                    onCheckedChange={(checked) => setWorkData(prev => ({ ...prev, priority: checked as boolean }))}
                  />
                  <Label htmlFor="priority" className="font-normal cursor-pointer">
                    Priority Work
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="productionLibrary"
                    checked={workData.productionLibrary}
                    onCheckedChange={(checked) => setWorkData(prev => ({ ...prev, productionLibrary: checked as boolean }))}
                  />
                  <Label htmlFor="productionLibrary" className="font-normal cursor-pointer">
                    Production Library
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="grandRights"
                    checked={workData.grandRights}
                    onCheckedChange={(checked) => setWorkData(prev => ({ ...prev, grandRights: checked as boolean }))}
                  />
                  <Label htmlFor="grandRights" className="font-normal cursor-pointer">
                    Grand Rights
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => setStep('writers')} disabled={!canProceedToWriters}>
              Next: Add Writers
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Writers */}
      {step === 'writers' && (
        <div className="space-y-6">
          {/* Add Writer Section */}
          <Card>
            <CardHeader>
              <CardTitle>Writers & Ownership</CardTitle>
              <CardDescription>
                Add the writers for this work. Typically you'll add yourself as the controlled writer, 
                then add any co-writers.
              </CardDescription>
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
                      <div className="space-y-2">
                        <Label>Full Name <span className="text-destructive">*</span></Label>
                        <Input
                          value={newComposerData.name}
                          onChange={(e) => setNewComposerData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Stage name or full name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            value={newComposerData.firstName}
                            onChange={(e) => setNewComposerData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Legal first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Surname</Label>
                          <Input
                            value={newComposerData.surname}
                            onChange={(e) => setNewComposerData(prev => ({ ...prev, surname: e.target.value }))}
                            placeholder="Legal surname"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CAE/IPI Number</Label>
                          <Input
                            value={newComposerData.cae}
                            onChange={(e) => setNewComposerData(prev => ({ ...prev, cae: e.target.value }))}
                            placeholder="I-000000000-0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>PRO</Label>
                          <Select
                            value={newComposerData.mainPro}
                            onValueChange={(value) => setNewComposerData(prev => ({ ...prev, mainPro: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select PRO" />
                            </SelectTrigger>
                            <SelectContent>
                              {PRO_LIST.map(pro => (
                                <SelectItem key={pro} value={pro}>{pro}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="newControlled"
                          checked={newComposerData.controlled}
                          onCheckedChange={(checked) => setNewComposerData(prev => ({ ...prev, controlled: checked as boolean }))}
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
                      <Button onClick={addNewComposer} disabled={!newComposerData.name.trim()}>
                        Add Writer
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
                      No composers found. <button 
                        className="text-primary hover:underline"
                        onClick={() => {
                          setNewComposerData(prev => ({ ...prev, name: composerSearch }));
                          setShowNewComposerDialog(true);
                        }}
                      >Create new writer</button>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {filteredComposers.map(composer => (
                        <li key={composer.id}>
                          <button
                            className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
                            onClick={() => addExistingComposer(composer)}
                          >
                            <div>
                              <p className="font-medium">{composer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {composer.cae && <span>CAE: {composer.cae} • </span>}
                                {composer.main_pro && <span>{composer.main_pro}</span>}
                                {composer.controlled && <Badge variant="secondary" className="ml-2 text-xs">Controlled</Badge>}
                              </p>
                            </div>
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Writers List */}
          {writers.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Added Writers ({writers.length})</CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className={totalMechOwnership > 100 ? 'text-destructive' : 'text-muted-foreground'}>
                      Mech: {totalMechOwnership}%
                    </span>
                    <span className={totalPerfOwnership > 100 ? 'text-destructive' : 'text-muted-foreground'}>
                      Perf: {totalPerfOwnership}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {writers.map((writer, index) => (
                  <div key={writer.tempId} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          writer.isControlled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
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
                        {writer.isNew && (
                          <Badge variant="outline" className="ml-2">New</Badge>
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Mech. Ownership %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={writer.mechanicalOwnership}
                          onChange={(e) => updateWriter(writer.tempId, 'mechanicalOwnership', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Perf. Ownership %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={writer.performanceOwnership}
                          onChange={(e) => updateWriter(writer.tempId, 'performanceOwnership', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Mech. Collection %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={writer.mechanicalCollection}
                          onChange={(e) => updateWriter(writer.tempId, 'mechanicalCollection', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Perf. Collection %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={writer.performanceCollection}
                          onChange={(e) => updateWriter(writer.tempId, 'performanceCollection', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {!writer.isControlled && (
                      <div className="space-y-2">
                        <Label className="text-xs">Publisher (for uncontrolled writers)</Label>
                        <Input
                          value={writer.publisherName || ''}
                          onChange={(e) => updateWriter(writer.tempId, 'publisherName', e.target.value)}
                          placeholder="Their publisher's name"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {!isValidOwnership && (
                  <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Total ownership percentages cannot exceed 100%
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
            <Button variant="outline" onClick={() => setStep('basic')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep('review')} disabled={!canProceedToReview || !isValidOwnership}>
              Next: Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Work</CardTitle>
              <CardDescription>
                Please review all the information before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Work Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  Work Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title</span>
                    <p className="font-medium">{workData.title}</p>
                  </div>
                  {workData.iswc && (
                    <div>
                      <span className="text-muted-foreground">ISWC</span>
                      <p className="font-mono">{workData.iswc}</p>
                    </div>
                  )}
                  {workData.tunecode && (
                    <div>
                      <span className="text-muted-foreground">Tunecode</span>
                      <p className="font-mono">{workData.tunecode}</p>
                    </div>
                  )}
                </div>
                {(workData.priority || workData.productionLibrary || workData.grandRights) && (
                  <div className="flex gap-2">
                    {workData.priority && <Badge>Priority</Badge>}
                    {workData.productionLibrary && <Badge variant="secondary">Production Library</Badge>}
                    {workData.grandRights && <Badge variant="outline">Grand Rights</Badge>}
                  </div>
                )}
              </div>

              <hr />

              {/* Writers Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Writers ({writers.length})
                </h3>
                <div className="space-y-3">
                  {writers.map(writer => (
                    <div key={writer.tempId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          writer.isControlled ? 'bg-primary/10 text-primary' : 'bg-muted'
                        }`}>
                          <UserCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{writer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {writer.mainPro} {writer.isControlled && '• Controlled'}
                            {writer.isNew && ' • New composer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>Mech: {writer.mechanicalOwnership}%</p>
                        <p>Perf: {writer.performanceOwnership}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-6 text-sm font-medium">
                  <span>Total Mechanical: {totalMechOwnership}%</span>
                  <span>Total Performance: {totalPerfOwnership}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('writers')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Creating Work...' : 'Create Work'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

