'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTRIES, type Country } from '@/lib/data/countries';
import { Globe } from 'lucide-react';

interface CountrySelectProps {
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

// Group countries by first letter for better navigation
function groupCountriesByLetter(countries: Country[]): Map<string, Country[]> {
  const grouped = new Map<string, Country[]>();
  
  // Put 'Worldwide' first in its own group
  const wwCountry = countries.find(c => c.code === 'WW');
  if (wwCountry) {
    grouped.set('★', [wwCountry]);
  }
  
  // Group the rest alphabetically
  countries
    .filter(c => c.code !== 'WW')
    .forEach(country => {
      const letter = country.name.charAt(0).toUpperCase();
      if (!grouped.has(letter)) {
        grouped.set(letter, []);
      }
      grouped.get(letter)!.push(country);
    });
  
  return grouped;
}

const groupedCountries = groupCountriesByLetter(COUNTRIES);

export function CountrySelect({
  value,
  onValueChange,
  placeholder = 'Select country',
  id,
  disabled = false,
  allowClear = true,
}: CountrySelectProps) {
  return (
    <Select
      value={value || 'none'}
      onValueChange={(val) => onValueChange(val === 'none' ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder}>
          {value && (
            <span className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">{value}</span>
              <span>{COUNTRIES.find(c => c.code === value)?.name || value}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="none">
            <span className="text-muted-foreground">No country selected</span>
          </SelectItem>
        )}
        {Array.from(groupedCountries.entries()).map(([letter, countries]) => (
          <SelectGroup key={letter}>
            <SelectLabel>{letter === '★' ? 'Global' : letter}</SelectLabel>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground w-6">{country.code}</span>
                  <span>{country.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

