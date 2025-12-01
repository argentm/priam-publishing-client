import { AccountEditor } from '@/components/admin/editors/account-editor';

export default function NewAccountPage() {
  const emptyAccount = {
    id: '',
    name: '',
    client_id: null,
    spotify_artist_id: null,
    spotify_artist_name: null,
    spotify_artist_image_url: null,
    spotify_linked_at: null,
    social_instagram: null,
    social_facebook: null,
    social_twitter: null,
    created_at: '',
    updated_at: '',
  };

  return <AccountEditor account={emptyAccount} isNew={true} />;
}
