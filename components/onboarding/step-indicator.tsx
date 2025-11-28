'use client';

import { cn } from '@/lib/utils';
import { Check, Mail, FileText, User, Shield } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const ONBOARDING_STEPS: Step[] = [
  { id: 1, label: 'Verify Email', icon: <Mail className="w-4 h-4" /> },
  { id: 2, label: 'Accept Terms', icon: <FileText className="w-4 h-4" /> },
  { id: 3, label: 'Create Account', icon: <User className="w-4 h-4" /> },
  { id: 4, label: 'Verify Identity', icon: <Shield className="w-4 h-4" /> },
];

interface StepIndicatorProps {
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function StepIndicator({ currentStep, completedSteps = [], className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {ONBOARDING_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isUpcoming = step.id > currentStep && !completedSteps.includes(step.id);

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                isCompleted && 'bg-primary border-primary text-white',
                isCurrent && 'border-primary bg-primary/10 text-primary',
                isUpcoming && 'border-muted-foreground/30 text-muted-foreground/50'
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                step.icon
              )}
            </div>

            {/* Connector line */}
            {index < ONBOARDING_STEPS.length - 1 && (
              <div
                className={cn(
                  'hidden sm:block w-12 h-0.5 mx-1 transition-colors duration-300',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface StepIndicatorCompactProps {
  currentStep: number;
  totalSteps?: number;
  className?: string;
}

export function StepIndicatorCompact({
  currentStep,
  totalSteps = 4,
  className
}: StepIndicatorCompactProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={cn(
            'h-1 rounded-full transition-all duration-300',
            step <= currentStep ? 'bg-primary w-10' : 'bg-muted w-6'
          )}
        />
      ))}
    </div>
  );
}

export function getStepLabel(step: number): string {
  return ONBOARDING_STEPS.find(s => s.id === step)?.label || '';
}
