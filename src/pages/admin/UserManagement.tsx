import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, UserPlus, Building2, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { UserAssignmentForm } from '@/components/admin/UserAssignmentForm';

interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  roles: { role: string; company_id?: string; division_id?: string }[];
  company_assignments: string[];
  division_assignments: string[];
  workspace_assignments: string[];
}

interface Company {
  id: string;
  name: string;
  description?: string;
}

interface Division {
  id: string;
  name: string;
  company_id: string;
}

interface Workspace {
  id: string;
  name: string;
  division_id: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true);

      if (companiesError) {
        console.error('Companies query failed:', companiesError);
        throw new Error(`Failed to load companies: ${companiesError.message}`);
      }

      // Load divisions
      const { data: divisionsData, error: divisionsError } = await supabase
        .from('divisions')
        .select('*')
        .eq('is_active', true);

      if (divisionsError) {
        console.error('Divisions query failed:', divisionsError);
        throw new Error(`Failed to load divisions: ${divisionsError.message}`);
      }

      // Load workspaces
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*');

      if (workspacesError) {
        console.error('Workspaces query failed:', workspacesError);
        throw new Error(`Failed to load workspaces: ${workspacesError.message}`);
      }

      // Load profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Profiles query failed:', profilesError);
        throw new Error(`Failed to load profiles: ${profilesError.message}`);
      }

      // Load user roles separately
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (userRolesError) {
        console.error('User roles query failed:', userRolesError);
        throw new Error(`Failed to load user roles: ${userRolesError.message}`);
      }

      // Load workspace members separately
      const { data: workspaceMembersData, error: workspaceMembersError } = await supabase
        .from('workspace_members')
        .select('*');

      if (workspaceMembersError) {
        console.error('Workspace members query failed:', workspaceMembersError);
        throw new Error(`Failed to load workspace members: ${workspaceMembersError.message}`);
      }

      // Structure user data
      const structuredUsers = profilesData?.map(profile => {
        const userRoles = userRolesData?.filter(role => role.user_id === profile.user_id) || [];
        const workspaceMembers = workspaceMembersData?.filter(member => member.user_id === profile.user_id) || [];
        
        return {
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          last_sign_in_at: profile.updated_at,
          email_confirmed_at: profile.created_at,
          roles: userRoles,
          company_assignments: userRoles.filter(r => r.company_id).map(r => r.company_id),
          division_assignments: userRoles.filter(r => r.division_id).map(r => r.division_id),
          workspace_assignments: workspaceMembers.map(w => w.workspace_id)
        };
      }) || [];

      setUsers(structuredUsers);
      setCompanies(companiesData || []);
      setDivisions(divisionsData || []);
      setWorkspaces(workspacesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load user management data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: { email: string; password: string; fullName: string }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to create users');
      }

      const response = await fetch(`https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server returned ${response.status}`);
      }

      toast({
        title: "Success",
        description: result.message || "User created successfully"
      });

      setCreateUserOpen(false);
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to delete users');
      }

      const response = await fetch(`https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/admin-delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: userId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server returned ${response.status}`);
      }

      toast({
        title: "Success",
        description: result.message || "User deleted successfully"
      });

      loadData(); // Reload data
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompany === 'all' || 
                          user.company_assignments.includes(selectedCompany);
    
    const matchesRole = selectedRole === 'all' || 
                       user.roles.some(role => role.role === selectedRole);

    return matchesSearch && matchesCompany && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'company_admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'division_admin': return 'bg-green-100 text-green-800 border-green-200';
      case 'workspace_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and organizational assignments</p>
        </div>
        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with email and password
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm onSubmit={handleCreateUser} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles.some(r => r.role.includes('admin'))).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaces.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
                <SelectItem value="division_admin">Division Admin</SelectItem>
                <SelectItem value="workspace_admin">Workspace Admin</SelectItem>
                <SelectItem value="workspace_member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and their organizational assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Divisions</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <Badge key={index} variant="outline" className={getRoleColor(role.role)}>
                          {role.role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.company_assignments.map(companyId => {
                        const company = companies.find(c => c.id === companyId);
                        return (
                          <Badge key={companyId} variant="secondary" className="mr-1">
                            {company?.name || 'Unknown'}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.division_assignments.map(divisionId => {
                        const division = divisions.find(d => d.id === divisionId);
                        return (
                          <Badge key={divisionId} variant="secondary" className="mr-1">
                            {division?.name || 'Unknown'}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.workspace_assignments.slice(0, 2).map(workspaceId => {
                        const workspace = workspaces.find(w => w.id === workspaceId);
                        return (
                          <Badge key={workspaceId} variant="secondary" className="mr-1">
                            {workspace?.name || 'Unknown'}
                          </Badge>
                        );
                      })}
                      {user.workspace_assignments.length > 2 && (
                        <Badge variant="secondary">+{user.workspace_assignments.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditUserOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Assignments</DialogTitle>
            <DialogDescription>
              Manage user roles and organizational assignments
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserAssignmentForm
              user={selectedUser}
              companies={companies}
              divisions={divisions}
              workspaces={workspaces}
              onSubmit={() => {
                setEditUserOpen(false);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}