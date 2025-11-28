'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Music, UserCircle, Radio, Settings } from 'lucide-react';
import type { WizardProgressProps, WizardStep } from './types';

const STEP_ICONS = {
  music: Music,
  users: UserCircle,
  radio: Radio,
  settings: Settings,
  check: CheckCircle2,
} as const;

export function WizardProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  const isStepCompleted = (stepId: WizardStep) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: WizardStep) => stepId === currentStep;
  const isStepClickable = (stepId: WizardStep) =>
    onStepClick && (isStepCompleted(stepId) || isStepCurrent(stepId));

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[step.icon];
            const isCompleted = isStepCompleted(step.id);
            const isCurrent = isStepCurrent(step.id);
            const clickable = isStepClickable(step.id);

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && onStepClick?.(step.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    } ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </button>
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 bg-muted mx-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-primary transition-all ${
                        index < currentIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
