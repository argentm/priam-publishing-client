import { Loader2 } from 'lucide-react';

/**
 * Create Account Loading State
 *
 * Shows a spinner while the AccountCreationWizard component loads.
 * The wizard itself has internal loading states for status checking.
 */
export default function CreateAccountLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
