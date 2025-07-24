'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { useAuth } from '@/hooks/useAuth';
import { Users, Plus, Mail, Crown, User } from 'lucide-react';
import { UserRole } from '@/types/organization';

interface InviteMemberFormData {
  email: string;
  role: UserRole;
}

export default function MembersPage() {
  const { currentOrganization, userRole } = useOrganizationContext();
  const { user } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteMemberFormData>({
    email: '',
    role: 'LIMITED_ACCESS'
  });
  const [isInviting, setIsInviting] = useState(false);

  if (!currentOrganization || !user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  const members = Object.entries(currentOrganization.members).map(([userId, role]) => ({
    id: userId,
    role,
    isCurrentUser: userId === user.uid
  }));

  const canManageMembers = userRole === 'FULL_ACCESS';

  const handleInvite = async () => {
    if (!inviteForm.email.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      // Note: This would integrate with the auth service to send invitations
      // For now, we'll show a success message
      alert(`Invitation sent to ${inviteForm.email}! (Feature coming soon)`);
      setInviteDialogOpen(false);
      setInviteForm({ email: '', role: 'LIMITED_ACCESS' });
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    return (
      <Badge variant={role === 'FULL_ACCESS' ? 'default' : 'secondary'}>
        <div className="flex items-center space-x-1">
          {role === 'FULL_ACCESS' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
          <span>{role === 'FULL_ACCESS' ? 'Full Access' : 'Limited Access'}</span>
        </div>
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-gray-600 mt-1">Manage organization members and their access levels</p>
        </div>
        {canManageMembers && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Access Level</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: UserRole) => setInviteForm({ ...inviteForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIMITED_ACCESS">Limited Access</SelectItem>
                      <SelectItem value="FULL_ACCESS">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Limited Access: View only • Full Access: View and manage
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleInvite} disabled={isInviting} className="flex-1">
                    {isInviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Access Level Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Access Levels</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Full Access</span>
              </div>
              <p className="text-sm text-gray-600">
                Can view, create, edit, and delete all assets and tasks. Can manage organization settings and members.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Limited Access</span>
              </div>
              <p className="text-sm text-gray-600">
                Can view assets and tasks, but cannot create, edit, or delete. Cannot manage organization settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl text-gray-300">👥</div>
              <div>
                <h3 className="text-lg font-semibold">No members yet</h3>
                <p className="text-gray-600 mt-2">Invite team members to collaborate on asset management</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {member.isCurrentUser ? `${user.displayName || user.email} (You)` : 'Team Member'}
                        </p>
                        {member.isCurrentUser && (
                          <Badge variant="outline">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {member.isCurrentUser ? user.email : 'Member'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getRoleBadge(member.role)}
                    {canManageMembers && !member.isCurrentUser && (
                      <Button variant="ghost" size="sm" disabled>
                        Manage
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations (placeholder for future feature) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Pending Invitations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl text-gray-300">📧</div>
            <div>
              <h3 className="text-lg font-semibold">No pending invitations</h3>
              <p className="text-gray-600 mt-2">Invitations you send will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!canManageMembers && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              <strong>Limited Access:</strong> You can view members but cannot invite new members or manage access levels. 
              Contact an administrator for access changes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}