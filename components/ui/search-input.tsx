'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

interface SearchInputProps {
  placeholder?: string;
  /** If true, updates URL with ?q= param for server-side filtering */
  useUrlParams?: boolean;
  /** Callback for controlled search (client-side filtering) */
  onSearch?: (value: string) => void;
  /** Initial/controlled value */
  value?: string;
  /** Additional CSS classes */
  className?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  useUrlParams = false,
  onSearch,
  value: controlledValue,
  className,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // For URL-based search
  const urlValue = searchParams.get('q') || '';
  
  // Internal state - use controlled value if provided, otherwise URL value if using URL params
  const [searchValue, setSearchValue] = useState(
    controlledValue ?? (useUrlParams ? urlValue : '')
  );

  // Sync with URL changes (for URL mode)
  useEffect(() => {
    if (useUrlParams) {
      setSearchValue(searchParams.get('q') || '');
    }
  }, [searchParams, useUrlParams]);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchValue(controlledValue);
    }
  }, [controlledValue]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    
    if (useUrlParams) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set('q', value);
        } else {
          params.delete('q');
        }
        router.push(`?${params.toString()}`);
      });
    }
    
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    
    if (useUrlParams) {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        router.push(`?${params.toString()}`);
      });
    }
    
    onSearch?.('');
  };

  return (
    <div className={`relative w-full max-w-sm ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-9 pr-9"
      />
      {searchValue && !isPending && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}

