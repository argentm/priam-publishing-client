"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Send, CheckCircle2, XCircle, Truck, ListFilter } from 'lucide-react';

export type DeliveryStatus = 'all' | 'pending' | 'submitted' | 'approved' | 'rejected' | 'delivered';

interface StatusOption {
  value: DeliveryStatus;
  label: string;
  icon: typeof Clock;
  color: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'all', label: 'All Statuses', icon: ListFilter, color: 'text-muted-foreground' },
  { value: 'pending', label: 'Draft', icon: Clock, color: 'text-slate-600' },
  { value: 'submitted', label: 'Submitted', icon: Send, color: 'text-blue-600' },
  { value: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-600' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'text-red-600' },
  { value: 'delivered', label: 'Delivered', icon: Truck, color: 'text-purple-600' },
];

interface StatusFilterSelectProps {
  currentStatus: DeliveryStatus;
  basePath: string;
}

export function StatusFilterSelect({ currentStatus, basePath }: StatusFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering Select on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStatusChange = (newStatus: DeliveryStatus) => {
    const params = new URLSearchParams(searchParams.toString());

    // Preserve search param
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }

    // Reset to page 1 when filter changes
    params.delete('page');

    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === currentStatus) || STATUS_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  // Show a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-[180px] h-10 flex items-center gap-2 px-3 border rounded-md bg-background">
        <CurrentIcon className={`w-4 h-4 shrink-0 ${currentOption.color}`} />
        <span className="truncate text-sm">{currentOption.label}</span>
      </div>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <div className="flex items-center gap-2">
          <CurrentIcon className={`w-4 h-4 shrink-0 ${currentOption.color}`} />
          <span className="truncate">{currentOption.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

