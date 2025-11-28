import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

// Redirect to the full-screen onboarding wizard
export default function NewAccountPage() {
  redirect(ROUTES.ONBOARDING_NEW_ACCOUNT);
}
