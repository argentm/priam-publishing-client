'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PRO_LIST } from '@/lib/constants/pros';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

interface ProSelectorProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ProSelector({
  value,
  onChange,
  placeholder = 'Select PRO...',
  disabled = false,
  className,
}: ProSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedPro = PRO_LIST.find((pro) => pro.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          {selectedPro ? selectedPro.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search PRO..." />
          <CommandList>
            <CommandEmpty>No PRO found.</CommandEmpty>
            <CommandGroup>
              {PRO_LIST.map((pro) => (
                <CommandItem
                  key={pro.value || 'no-pro'}
                  value={pro.label}
                  onSelect={(currentValue) => {
                    const selected = PRO_LIST.find(
                      (item) => item.label.toLowerCase() === currentValue.toLowerCase()
                    );
                    onChange(selected?.value || null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === pro.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {pro.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
