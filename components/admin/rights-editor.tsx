'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Trash2, RefreshCw } from 'lucide-react';

// Contract type (mirrored from server/src/types/database.ts)
interface Contract {
  id: string;
  payee_id: string;
  account_id: string;
  name: string;
  client_id?: string | null;
  foreign_id?: string | null;
  project_id?: string | null;
  contract_type?: string | null;
  active?: boolean;
  complete?: boolean;
  primary_contract?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

interface RightsEditorProps {
  workId: string;
  accountId: string;
  rights: any; // Typed as RightsResponse
  contracts: Contract[];
  onSave: (type: 'sales-returns' | 'costs', data: any) => Promise<void>;
  onDelete: (rightId: string, type: 'sales-returns' | 'costs') => Promise<void>;
  onFlush: () => Promise<void>;
}

export function RightsEditor({ workId, accountId, rights, contracts, onSave, onDelete, onFlush }: RightsEditorProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'costs'>('sales');
  const [newRight, setNewRight] = useState({
    contractId: '',
    percentage: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newRight.contractId || newRight.percentage <= 0) return;
    
    setLoading(true);
    try {
      await onSave(activeTab === 'sales' ? 'sales-returns' : 'costs', {
        contract_id: newRight.contractId,
        percentage: newRight.percentage,
        display_percentage: newRight.percentage
      });
      setNewRight({ contractId: '', percentage: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this rate?')) return;
    setLoading(true);
    try {
      await onDelete(id, activeTab === 'sales' ? 'sales-returns' : 'costs');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlush = async () => {
    if (!confirm('This will overwrite existing participation rates with data from the IP Chain. Continue?')) return;
    setLoading(true);
    try {
      await onFlush();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentRights = activeTab === 'sales' ? rights?.sales_returns_rights : rights?.costs_rights;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button 
            variant={activeTab === 'sales' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sales')}
          >
            Participation Rates
          </Button>
          <Button 
            variant={activeTab === 'costs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('costs')}
          >
            Costs Rates
          </Button>
        </div>
        {activeTab === 'sales' && (
          <Button variant="secondary" onClick={handleFlush} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Flush Contracts To Work
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'sales' ? 'Participation Rates' : 'Costs Rates'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'sales' 
              ? 'Set the percentage of revenue that flows through to each contract.'
              : 'Set the percentage of costs allocated to each contract.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Rate */}
          <div className="flex items-end gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex-1 space-y-2">
              <Label>Contract</Label>
              <Select 
                value={newRight.contractId} 
                onValueChange={(val) => setNewRight(prev => ({ ...prev, contractId: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Contract" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map(contract => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32 space-y-2">
              <Label>Rate %</Label>
              <Input 
                type="number" 
                min="0" 
                max="100"
                value={newRight.percentage}
                onChange={(e) => setNewRight(prev => ({ ...prev, percentage: parseFloat(e.target.value) }))}
              />
            </div>
            <Button onClick={handleAdd} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rate
            </Button>
          </div>

          {/* List Rates */}
          <div className="space-y-2">
            {currentRights?.map((right: any) => (
              <div key={right.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div>
                  <p className="font-medium">{right.contract?.name || 'Unknown Contract'}</p>
                  <p className="text-xs text-muted-foreground">Contract ID: {right.contract_id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">{right.percentage}%</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(right.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!currentRights || currentRights.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No rates defined. Add a contract above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

