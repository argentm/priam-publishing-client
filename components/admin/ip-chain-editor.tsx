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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Globe, ChevronRight, ChevronDown } from 'lucide-react';

// IP Chain Types (mirrored from server/src/types/api.ts)
export interface IpChainNode {
  composerId?: string;
  publisherId?: string;
  category?: string;
  contractType?: string;
  controlled?: boolean;
  mechanicalOwnership?: number;
  performanceOwnership?: number;
  mechanicalCollection?: number;
  performanceCollection?: number;
  children?: IpChainNode[];
}

export interface IpChainTerritory {
  territory: string;
  children: IpChainNode[];
  totalMechanicalOwnership?: number;
  totalPerformanceOwnership?: number;
  totalMechanicalCollection?: number;
  totalPerformanceCollection?: number;
}

export type IpChain = IpChainTerritory[];

interface IpChainEditorProps {
  initialChain: IpChainTerritory[] | null;
  onChange: (chain: IpChainTerritory[]) => void;
  readOnly?: boolean;
}

const TERRITORIES = [
  { code: 'World', name: 'World' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  // Add more as needed
];

const CATEGORIES = [
  'Original Publisher',
  'Sub Publisher',
  'Administrator',
  'Income Participant',
  'Composer',
  'Author',
  'Composer/Author',
  'Arranger',
  'Adapter',
  'Translator',
];

export function IpChainEditor({ initialChain, onChange, readOnly = false }: IpChainEditorProps) {
  const [chain, setChain] = useState<IpChainTerritory[]>(initialChain || []);
  const [expandedTerritories, setExpandedTerritories] = useState<string[]>(['World']);

  const toggleTerritory = (territory: string) => {
    setExpandedTerritories(prev => 
      prev.includes(territory) 
        ? prev.filter(t => t !== territory)
        : [...prev, territory]
    );
  };

  const addTerritory = () => {
    // Find first unused territory or default to US if World exists
    const used = chain.map(c => c.territory);
    const next = used.includes('World') 
      ? TERRITORIES.find(t => !used.includes(t.code))?.code || 'US'
      : 'World';
    
    if (used.includes(next)) return; // Should show error or select unused

    const newTerritory: IpChainTerritory = {
      territory: next,
      children: [],
      totalMechanicalOwnership: 0,
      totalPerformanceOwnership: 0,
      totalMechanicalCollection: 0,
      totalPerformanceCollection: 0
    };

    const newChain = [...chain, newTerritory];
    setChain(newChain);
    onChange(newChain);
    setExpandedTerritories(prev => [...prev, next]);
  };

  const removeTerritory = (index: number) => {
    const newChain = chain.filter((_, i) => i !== index);
    setChain(newChain);
    onChange(newChain);
  };

  const updateTerritoryCode = (index: number, code: string) => {
    const newChain = [...chain];
    newChain[index] = { ...newChain[index], territory: code };
    setChain(newChain);
    onChange(newChain);
  };

  const addNode = (territoryIndex: number, parentPath: number[], type: 'publisher' | 'composer') => {
    const newChain = [...chain];
    const territory = newChain[territoryIndex];
    
    const newNode: IpChainNode = {
      category: type === 'publisher' ? 'Original Publisher' : 'Composer',
      controlled: false,
      mechanicalOwnership: 0,
      performanceOwnership: 0,
      mechanicalCollection: 0,
      performanceCollection: 0,
      children: []
    };

    // Navigate to parent
    let currentLevel = territory.children;
    for (const idx of parentPath) {
      if (!currentLevel[idx].children) currentLevel[idx].children = [];
      currentLevel = currentLevel[idx].children!;
    }
    
    currentLevel.push(newNode);
    
    // Recalculate totals if at root
    if (parentPath.length === 0) {
      recalculateTotals(territory);
    }

    setChain(newChain);
    onChange(newChain);
  };

  const updateNode = (territoryIndex: number, path: number[], field: keyof IpChainNode, value: any) => {
    const newChain = [...chain];
    const territory = newChain[territoryIndex];
    
    let currentLevel = territory.children;
    let node: IpChainNode | null = null;
    
    for (let i = 0; i < path.length; i++) {
      const idx = path[i];
      if (i === path.length - 1) {
        node = currentLevel[idx];
      } else {
        currentLevel = currentLevel[idx].children!;
      }
    }

    if (node) {
      // @ts-ignore
      node[field] = value;
      recalculateTotals(territory);
      setChain(newChain);
      onChange(newChain);
    }
  };

  const removeNode = (territoryIndex: number, path: number[]) => {
    const newChain = [...chain];
    const territory = newChain[territoryIndex];
    
    const idxToRemove = path[path.length - 1];
    const parentPath = path.slice(0, -1);
    
    let currentLevel = territory.children;
    for (const idx of parentPath) {
      currentLevel = currentLevel[idx].children!;
    }
    
    currentLevel.splice(idxToRemove, 1);
    recalculateTotals(territory);
    
    setChain(newChain);
    onChange(newChain);
  };

  const recalculateTotals = (territory: IpChainTerritory) => {
    // Simplified total calculation (only root nodes usually count for ownership totals in flat view, 
    // but IP chains are hierarchical. Usually ownership sums up at the bottom? 
    // Or maybe we sum everything? Curve validates that ownership totals 100. 
    // Typically ownership resides with the writers (composers), publishers collect.
    // But publishers can own too.
    // For this editor, we'll sum all nodes in the tree recursively? 
    // No, usually you sum specific nodes.
    // Let's assume simple sum of all nodes for now to show the total.)
    
    let mechOwn = 0, perfOwn = 0, mechCol = 0, perfCol = 0;

    const sumNode = (node: IpChainNode) => {
      mechOwn += node.mechanicalOwnership || 0;
      perfOwn += node.performanceOwnership || 0;
      mechCol += node.mechanicalCollection || 0;
      perfCol += node.performanceCollection || 0;
      
      if (node.children) {
        node.children.forEach(sumNode);
      }
    };

    territory.children.forEach(sumNode);

    territory.totalMechanicalOwnership = mechOwn;
    territory.totalPerformanceOwnership = perfOwn;
    territory.totalMechanicalCollection = mechCol;
    territory.totalPerformanceCollection = perfCol;
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">IP Chain</h3>
        {!readOnly && (
          <Button onClick={addTerritory} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Territory
          </Button>
        )}
      </div>

      {/* Territories */}
      {chain.map((territory, tIndex) => (
        <Card key={tIndex} className="border-l-4 border-l-primary">
          <div className="p-4 bg-muted/30 flex items-center justify-between border-b">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto hover:bg-transparent"
                onClick={() => toggleTerritory(territory.territory)}
              >
                {expandedTerritories.includes(territory.territory) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {!readOnly ? (
                  <Select 
                    value={territory.territory} 
                    onValueChange={(val) => updateTerritoryCode(tIndex, val)}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TERRITORIES.map(t => (
                        <SelectItem key={t.code} value={t.code}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="font-medium">{TERRITORIES.find(t => t.code === territory.territory)?.name || territory.territory}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <span className="block text-muted-foreground text-[10px] uppercase">Mech Own</span>
                  <Badge variant={Math.abs((territory.totalMechanicalOwnership || 0) - 100) < 0.1 ? 'default' : 'destructive'}>
                    {(territory.totalMechanicalOwnership || 0).toFixed(2)}%
                  </Badge>
                </div>
                <div>
                  <span className="block text-muted-foreground text-[10px] uppercase">Perf Own</span>
                  <Badge variant={Math.abs((territory.totalPerformanceOwnership || 0) - 100) < 0.1 ? 'default' : 'destructive'}>
                    {(territory.totalPerformanceOwnership || 0).toFixed(2)}%
                  </Badge>
                </div>
                <div>
                  <span className="block text-muted-foreground text-[10px] uppercase">Mech Col</span>
                  <Badge variant={Math.abs((territory.totalMechanicalCollection || 0) - 100) < 0.1 ? 'default' : 'destructive'}>
                    {(territory.totalMechanicalCollection || 0).toFixed(2)}%
                  </Badge>
                </div>
                <div>
                  <span className="block text-muted-foreground text-[10px] uppercase">Perf Col</span>
                  <Badge variant={Math.abs((territory.totalPerformanceCollection || 0) - 100) < 0.1 ? 'default' : 'destructive'}>
                    {(territory.totalPerformanceCollection || 0).toFixed(2)}%
                  </Badge>
                </div>
              </div>
              
              {!readOnly && (
                <div className="flex gap-1 ml-4">
                  <Button size="sm" variant="secondary" onClick={() => addNode(tIndex, [], 'publisher')}>+ Pub</Button>
                  <Button size="sm" variant="secondary" onClick={() => addNode(tIndex, [], 'composer')}>+ Comp</Button>
                  <Button size="sm" variant="destructive" onClick={() => removeTerritory(tIndex)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {expandedTerritories.includes(territory.territory) && (
            <CardContent className="p-4 space-y-4">
              <NodeList 
                nodes={territory.children} 
                tIndex={tIndex} 
                path={[]} 
                updateNode={updateNode} 
                removeNode={removeNode} 
                addNode={addNode}
                readOnly={readOnly}
              />
            </CardContent>
          )}
        </Card>
      ))}
      
      {chain.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
          No territories defined. Add a territory to start building the IP Chain.
        </div>
      )}
    </div>
  );
}

interface NodeListProps {
  nodes: IpChainNode[];
  tIndex: number;
  path: number[];
  updateNode: (tIndex: number, path: number[], field: keyof IpChainNode, value: any) => void;
  removeNode: (tIndex: number, path: number[]) => void;
  addNode: (tIndex: number, path: number[], type: 'publisher' | 'composer') => void;
  readOnly: boolean;
}

function NodeList({ nodes, tIndex, path, updateNode, removeNode, addNode, readOnly }: NodeListProps) {
  return (
    <div className="space-y-4">
      {nodes.map((node, index) => {
        const currentPath = [...path, index];
        const isPublisher = !node.composerId; // Simple heuristic

        return (
          <div key={index} className="relative">
            {/* Tree line */}
            {path.length > 0 && (
              <div className="absolute -left-4 top-8 w-4 h-px bg-border" />
            )}
            
            <div className={`border rounded-md p-3 bg-card ${path.length > 0 ? 'ml-8' : ''}`}>
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* Entity Info */}
                <div className="col-span-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {isPublisher ? 'PUB' : 'COMP'}
                    </Badge>
                    {readOnly ? (
                      <span className="font-medium">{node.publisherId || node.composerId || 'Unknown'}</span>
                    ) : (
                      <Input 
                        className="h-8" 
                        placeholder={isPublisher ? "Publisher Name/ID" : "Composer Name/ID"}
                        value={isPublisher ? node.publisherId || '' : node.composerId || ''}
                        onChange={(e) => updateNode(tIndex, currentPath, isPublisher ? 'publisherId' : 'composerId', e.target.value)}
                      />
                    )}
                  </div>
                  
                  {!readOnly ? (
                    <Select 
                      value={node.category || ''} 
                      onValueChange={(val) => updateNode(tIndex, currentPath, 'category', val)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-xs text-muted-foreground">{node.category}</span>
                  )}
                </div>

                {/* Controls */}
                <div className="col-span-1 flex justify-center pt-2">
                  <div className="flex flex-col items-center space-y-1">
                    <Checkbox 
                      checked={node.controlled || false} 
                      onCheckedChange={(checked) => !readOnly && updateNode(tIndex, currentPath, 'controlled', checked)}
                      disabled={readOnly}
                    />
                    <Label className="text-[10px] text-muted-foreground">Cont.</Label>
                  </div>
                </div>

                {/* Percentages */}
                <div className="col-span-6 grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground block text-center">Own Mech</Label>
                    <Input 
                      type="number" 
                      className="h-8 text-right" 
                      value={node.mechanicalOwnership || 0}
                      onChange={(e) => updateNode(tIndex, currentPath, 'mechanicalOwnership', parseFloat(e.target.value))}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground block text-center">Own Perf</Label>
                    <Input 
                      type="number" 
                      className="h-8 text-right" 
                      value={node.performanceOwnership || 0}
                      onChange={(e) => updateNode(tIndex, currentPath, 'performanceOwnership', parseFloat(e.target.value))}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground block text-center">Col Mech</Label>
                    <Input 
                      type="number" 
                      className="h-8 text-right" 
                      value={node.mechanicalCollection || 0}
                      onChange={(e) => updateNode(tIndex, currentPath, 'mechanicalCollection', parseFloat(e.target.value))}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground block text-center">Col Perf</Label>
                    <Input 
                      type="number" 
                      className="h-8 text-right" 
                      value={node.performanceCollection || 0}
                      onChange={(e) => updateNode(tIndex, currentPath, 'performanceCollection', parseFloat(e.target.value))}
                      readOnly={readOnly}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex flex-col gap-1 items-end">
                  {!readOnly && (
                    <>
                      {isPublisher && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          title="Add Sub-node"
                          onClick={() => addNode(tIndex, currentPath, 'composer')}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeNode(tIndex, currentPath)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recursive Children */}
            {node.children && node.children.length > 0 && (
              <NodeList 
                nodes={node.children} 
                tIndex={tIndex} 
                path={currentPath} 
                updateNode={updateNode} 
                removeNode={removeNode} 
                addNode={addNode}
                readOnly={readOnly}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

