import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreateUserFormEnhanced } from '@/components/admin/CreateUserFormEnhanced';
import { UserAssignmentForm } from '@/components/admin/UserAssignmentForm';
import { Search, UserPlus, Users, Building2, Shield, Edit, Trash2 } from 'lucide-react';

// User interface with role objects
interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  roles: Array<{
    id: string;
    user_id: string;
    role: string;
    company_id?: string;
    division_id?: string;
    created_at: string;
  }>;
  company_assignments: string[];
  division_assignments: string[];
  workspace_assignments: string[];
}

interface Company {
  id: string;
  name: string;
  description?: string;
  company_id: string;
}

interface Division {
  id: string;
  name: string;
  description?: string;
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
      
      const { data: responseData, error: functionError } = await supabase.functions.invoke('admin-list-users');
      
      if (functionError) {
        throw new Error(`Failed to load user data: ${functionError.message}`);
      }
      
      if (!responseData) {
        throw new Error('No data returned from admin function');
      }
      
      const {
        companies: companiesData,
        divisions: divisionsData,
        workspaces: workspacesData,
        profiles: profilesData,
        userRoles: userRolesData,
        workspaceMembers: workspaceMembersData
      } = responseData;

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
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: `Failed to load user management data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: { 
    email: string; 
    password: string; 
    fullName: string;
    companyId?: string;
    divisionId?: string;
    workspaceIds?: string[];
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { 
          email: userData.email, 
          password: userData.password, 
          fullName: userData.fullName,
          companyId: userData.companyId,
          divisionId: userData.divisionId,
          workspaceIds: userData.workspaceIds
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setCreateUserOpen(false);
      loadData(); // Reload the data
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
    try {
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      loadData(); // Reload the data
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCompany = selectedCompany === 'all' || 
                          user.company_assignments.includes(selectedCompany);
    
    const matchesRole = selectedRole === 'all' || 
                       user.roles.some(role => role.role === selectedRole);
    
    return matchesSearch && matchesCompany && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'company_admin': return 'default';
      case 'division_admin': return 'secondary';
      case 'workspace_admin': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading user management data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and organizational assignments</p>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline">Users: {users.length}</Badge>
            <Badge variant="outline">Companies: {companies.length}</Badge>
            <Badge variant="outline">Divisions: {divisions.length}</Badge>
            <Badge variant="outline">Workspaces: {workspaces.length}</Badge>
          </div>
        </div>
        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with organizational assignments
              </DialogDescription>
            </DialogHeader>
            <CreateUserFormEnhanced 
              companies={companies}
              divisions={divisions}
              workspaces={workspaces}
              onSubmit={handleCreateUser} 
            />
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
              <SelectContent className="bg-background border z-50">
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
              <SelectContent className="bg-background border z-50">
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      {user.full_name && (
                        <div className="text-sm text-muted-foreground">{user.full_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role, index) => (
                        <Badge key={index} variant={getRoleColor(role.role)}>
                          {role.role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {user.company_assignments.length > 0 && (
                        <div>
                          <span className="font-medium">Companies:</span>{' '}
                          {user.company_assignments.map(id => 
                            companies.find(c => c.id === id)?.name
                          ).filter(Boolean).join(', ')}
                        </div>
                      )}
                      {user.workspace_assignments.length > 0 && (
                        <div>
                          <span className="font-medium">Workspaces:</span>{' '}
                          {user.workspace_assignments.map(id => 
                            workspaces.find(w => w.id === id)?.name
                          ).filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Assignments</DialogTitle>
            <DialogDescription>
              Manage organizational assignments for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserAssignmentForm
              user={selectedUser}
              companies={companies}
              divisions={divisions}
              workspaces={workspaces}
              onUpdate={() => {
                loadData();
                setEditUserOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}