import { UserEditor } from '@/components/admin/editors/user-editor';

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-6">
      <UserEditor isNew />
    </div>
  );
}
