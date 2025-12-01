'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  Users,
  Loader2,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Shield,
  Mail,
  Clock,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/constants';
import { ApiClient } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { sanitizeApiError } from '@/lib/utils/api-errors';
import type { PermissionLevel, AccountMember, AccountInvite } from '@/lib/types';

interface Account {
  id: string;
  name: string;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface AccountSettingsProps {
  account: Account;
  members: AccountMember[];
  userRole: string;
  canEdit: boolean;
  currentUserId: string;
}

export function AccountSettings({
  account,
  members: initialMembers,
  userRole,
  canEdit,
  currentUserId,
}: AccountSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(account.name);
  const [clientId, setClientId] = useState(account.client_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Team state
  const [members, setMembers] = useState<AccountMember[]>(initialMembers);
  const [invites, setInvites] = useState<AccountInvite[]>([]);
  const [, setLoadingInvites] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermCatalog, setInvitePermCatalog] = useState<PermissionLevel>('edit');
  const [invitePermBusiness, setInvitePermBusiness] = useState<PermissionLevel>('none');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Edit member state
  const [editingMember, setEditingMember] = useState<AccountMember | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'member'>('member');
  const [editPermCatalog, setEditPermCatalog] = useState<PermissionLevel>('edit');
  const [editPermBusiness, setEditPermBusiness] = useState<PermissionLevel>('none');
  const [savingMember, setSavingMember] = useState(false);

  // Invite link state
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  const canManageTeam = userRole === 'owner' || userRole === 'admin';

  const getApiClient = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return new ApiClient(async () => session?.access_token || null);
  };

  // Fetch invites on mount if user can manage team
  const fetchInvites = async () => {
    if (!canManageTeam) return;
    setLoadingInvites(true);
    try {
      const apiClient = await getApiClient();
      const response = await apiClient.get<{ invites: AccountInvite[] }>(
        API_ENDPOINTS.ACCOUNT_INVITES(account.id)
      );
      setInvites(response.invites || []);
    } catch {
      // Silent fail - invites list will remain empty
    } finally {
      setLoadingInvites(false);
    }
  };

  // Load invites on mount if user can manage team
  useEffect(() => {
    if (canManageTeam) {
      fetchInvites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTeam]);

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiClient = await getApiClient();
      await apiClient.put(`/api/accounts/${account.id}`, {
        name: name.trim(),
        client_id: clientId.trim() || null,
      });
      setSuccess('Settings saved successfully');
      router.refresh();
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to save settings. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    setError(null);

    try {
      const apiClient = await getApiClient();
      const response = await apiClient.post<{ invite: AccountInvite; message: string }>(
        API_ENDPOINTS.ACCOUNT_INVITES(account.id),
        {
          email: inviteEmail.trim().toLowerCase(),
          permissions_catalog: invitePermCatalog,
          permissions_business: invitePermBusiness,
        }
      );
      setInvites((prev) => [response.invite, ...prev]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInvitePermCatalog('edit');
      setInvitePermBusiness('none');

      // Generate and show the invite link
      const inviteLink = `${window.location.origin}/invite/${response.invite.token}`;
      setCreatedInviteLink(inviteLink);
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to send invite. Please try again.'));
    } finally {
      setSendingInvite(false);
    }
  };

  const getInviteLink = (token: string) => {
    return `${window.location.origin}/invite/${token}`;
  };

  const copyToClipboard = async (text: string, inviteId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (inviteId) {
        setCopiedInviteId(inviteId);
        setTimeout(() => setCopiedInviteId(null), 2000);
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const apiClient = await getApiClient();
      await apiClient.delete(API_ENDPOINTS.ACCOUNT_INVITE(account.id, inviteId));
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      setSuccess('Invite revoked');
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to revoke invite. Please try again.'));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const apiClient = await getApiClient();
      await apiClient.delete(API_ENDPOINTS.ACCOUNT_MEMBER(account.id, userId));
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setSuccess('Member removed');
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to remove member. Please try again.'));
    }
  };

  const openEditMember = (member: AccountMember) => {
    setEditingMember(member);
    setEditRole(member.role === 'owner' ? 'admin' : (member.role as 'admin' | 'member'));
    setEditPermCatalog(member.permissions_catalog || 'edit');
    setEditPermBusiness(member.permissions_business || 'none');
  };

  const handleSaveMember = async () => {
    if (!editingMember) return;
    setSavingMember(true);
    setError(null);

    try {
      const apiClient = await getApiClient();
      const response = await apiClient.put<{ member: AccountMember }>(
        API_ENDPOINTS.ACCOUNT_MEMBER(account.id, editingMember.user_id!),
        {
          role: editRole,
          permissions_catalog: editPermCatalog,
          permissions_business: editPermBusiness,
        }
      );
      setMembers((prev) =>
        prev.map((m) => (m.user_id === editingMember.user_id ? response.member : m))
      );
      setEditingMember(null);
      setSuccess('Member updated');
    } catch (err) {
      setError(sanitizeApiError(err, 'Failed to update member. Please try again.'));
    } finally {
      setSavingMember(false);
    }
  };

  const hasChanges = name !== account.name || (clientId || '') !== (account.client_id || '');

  const getPermissionLabel = (level: PermissionLevel) => {
    switch (level) {
      case 'edit':
        return 'Can edit';
      case 'view':
        return 'View only';
      case 'none':
        return 'No access';
    }
  };

  const getPermissionBadgeVariant = (level: PermissionLevel) => {
    switch (level) {
      case 'edit':
        return 'default';
      case 'view':
        return 'secondary';
      case 'none':
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and team members</p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between">
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/10 text-green-600 text-sm flex items-center justify-between">
          {success}
          <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Basic account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                placeholder="Enter account name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={!canEdit}
                placeholder="Optional identifier"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(account.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Your Role</Label>
              <Badge variant="outline" className="capitalize">
                {userRole}
              </Badge>
            </div>
          </div>

          {canEdit && (
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving || !hasChanges || !name.trim()}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? 's' : ''} in this account
              </CardDescription>
            </div>
            {canManageTeam && (
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId;
              const isOwner = member.role === 'owner';
              const canModify = canManageTeam && !isCurrentUser && !isOwner;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {(member.full_name || member.email || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.full_name || member.email?.split('@')[0]}
                      {isCurrentUser && (
                        <span className="text-muted-foreground text-sm ml-2">(you)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                    {member.permissions_catalog && (
                      <Badge variant={getPermissionBadgeVariant(member.permissions_catalog)} className="text-xs">
                        Catalog: {getPermissionLabel(member.permissions_catalog)}
                      </Badge>
                    )}
                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditMember(member)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Edit permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemoveMember(member.user_id!)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {canManageTeam && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invites
            </CardTitle>
            <CardDescription>
              {invites.length} pending invite{invites.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{invite.email}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getInviteLink(invite.token), invite.id)}
                      title="Copy invite link"
                    >
                      {copiedInviteId === invite.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(invite.id)}
                      title="Revoke invite"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invite to join this account. They&apos;ll receive an email with a link to
              accept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Catalog Access</Label>
                <Select
                  value={invitePermCatalog}
                  onValueChange={(v) => setInvitePermCatalog(v as PermissionLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="none">No access</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Works, tracks, composers</p>
              </div>
              <div className="space-y-2">
                <Label>Business Access</Label>
                <Select
                  value={invitePermBusiness}
                  onValueChange={(v) => setInvitePermBusiness(v as PermissionLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="none">No access</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Contracts, payees, financials</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={sendingInvite || !inviteEmail.trim()}>
              {sendingInvite && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member Permissions</DialogTitle>
            <DialogDescription>
              Update role and permissions for {editingMember?.full_name || editingMember?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as 'admin' | 'member')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Catalog Access</Label>
                <Select
                  value={editPermCatalog}
                  onValueChange={(v) => setEditPermCatalog(v as PermissionLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="none">No access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Business Access</Label>
                <Select
                  value={editPermBusiness}
                  onValueChange={(v) => setEditPermBusiness(v as PermissionLevel)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">Can edit</SelectItem>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="none">No access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember} disabled={savingMember}>
              {savingMember && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Link Modal */}
      <Dialog open={!!createdInviteLink} onOpenChange={(open) => !open && setCreatedInviteLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Invite Created
            </DialogTitle>
            <DialogDescription>
              Share this link with the person you want to invite. The link expires in 7 days.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={createdInviteLink || ''}
                className="font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (createdInviteLink) {
                    copyToClipboard(createdInviteLink);
                    setSuccess('Link copied to clipboard');
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Email delivery is not yet configured. Please share this link manually.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedInviteLink(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
