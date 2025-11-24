import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function AdminPage() {
  redirect(ROUTES.ADMIN_DASHBOARD);
}

