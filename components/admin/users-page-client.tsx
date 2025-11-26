'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Plus, Edit, Search, Users, Ban } from 'lucide-react';
import type { User } from '@/lib/types';
import { UserActions } from './actions/user-actions';
import { UserEditor } from './editors/user-editor';

interface UsersPageClientProps {
  users: User[];
  admins: User[];
  normalUsers: User[];
  currentUserId?: string;
}

export function UsersPageClient({
  users,
  admins,
  normalUsers,
  currentUserId,
}: UsersPageClientProps) {
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.email?.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const filteredAdmins = filteredUsers.filter((user) => user.is_admin === true);
  const filteredNormalUsers = filteredUsers.filter((user) => user.is_admin !== true);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {users.length} total user{users.length !== 1 ? 's' : ''} • {admins.length} administrator{admins.length !== 1 ? 's' : ''} • {normalUsers.length} normal user{normalUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
              <Button onClick={() => setShowAddUser(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All ({users.length})
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admins ({admins.length})
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users ({normalUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? (
                    <>
                      <p className="mb-4">No users found matching "{searchQuery}"</p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-4">No users found</p>
                      <Button onClick={() => setShowAddUser(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First User
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Administrators Section */}
                  {filteredAdmins.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Administrators</h3>
                        <Badge variant="default">{filteredAdmins.length}</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAdmins.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.full_name || (
                                  <span className="text-muted-foreground italic">No name</span>
                                )}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {user.created_at
                                  ? new Date(user.created_at).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {user.updated_at
                                  ? new Date(user.updated_at).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingUser(user)}
                                    title="Edit user"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <UserActions user={user} currentUserId={currentUserId} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Normal Users Section */}
                  {filteredNormalUsers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Normal Users</h3>
                        <Badge variant="secondary">{filteredNormalUsers.length}</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredNormalUsers.map((user) => (
                            <TableRow key={user.id} className={user.suspended ? 'opacity-60' : ''}>
                              <TableCell className="font-medium">
                                {user.full_name || (
                                  <span className="text-muted-foreground italic">No name</span>
                                )}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                {user.suspended ? (
                                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                    <Ban className="w-3 h-3" />
                                    Suspended
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Active
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {user.created_at
                                  ? new Date(user.created_at).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingUser(user)}
                                    title="Edit user"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <UserActions user={user} currentUserId={currentUserId} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="admins" className="mt-0">
              {filteredAdmins.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? (
                    <>
                      <p className="mb-4">No administrators found matching "{searchQuery}"</p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No administrators found</p>
                    </>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || (
                            <span className="text-muted-foreground italic">No name</span>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.updated_at
                            ? new Date(user.updated_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <UserActions user={user} currentUserId={currentUserId} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              {filteredNormalUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? (
                    <>
                      <p className="mb-4">No users found matching "{searchQuery}"</p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No normal users found</p>
                    </>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNormalUsers.map((user) => (
                      <TableRow key={user.id} className={user.suspended ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">
                          {user.full_name || (
                            <span className="text-muted-foreground italic">No name</span>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.suspended ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <Ban className="w-3 h-3" />
                              Suspended
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <UserActions user={user} currentUserId={currentUserId} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Editor Modal */}
      {editingUser && (
        <UserEditor
          user={editingUser}
          isNew={false}
          onClose={() => setEditingUser(undefined)}
        />
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <UserEditor
          isNew={true}
          onClose={() => setShowAddUser(false)}
        />
      )}
    </>
  );
}

