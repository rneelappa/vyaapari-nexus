import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
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

interface UserAssignmentFormProps {
  user: User;
  companies: Company[];
  divisions: Division[];
  workspaces: Workspace[];
  onUpdate: () => void;
}

export function UserAssignmentForm({ user, companies, divisions, workspaces, onUpdate }: UserAssignmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('workspace_member');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(user.company_assignments);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(user.division_assignments);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(user.workspace_assignments);

  // Filter divisions based on selected companies
  const availableDivisions = divisions.filter(division => 
    selectedCompanies.includes(division.company_id)
  );

  // Filter workspaces based on selected divisions
  const availableWorkspaces = workspaces.filter(workspace => 
    selectedDivisions.includes(workspace.division_id)
  );

  useEffect(() => {
    // Auto-deselect divisions if their company is unselected
    setSelectedDivisions(prev => prev.filter(divId => 
      availableDivisions.some(div => div.id === divId)
    ));
  }, [selectedCompanies, availableDivisions]);

  useEffect(() => {
    // Auto-deselect workspaces if their division is unselected
    setSelectedWorkspaces(prev => prev.filter(wsId => 
      availableWorkspaces.some(ws => ws.id === wsId)
    ));
  }, [selectedDivisions, availableWorkspaces]);

  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    if (checked) {
      setSelectedCompanies(prev => [...prev, companyId]);
    } else {
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    }
  };

  const handleDivisionToggle = (divisionId: string, checked: boolean) => {
    if (checked) {
      setSelectedDivisions(prev => [...prev, divisionId]);
    } else {
      setSelectedDivisions(prev => prev.filter(id => id !== divisionId));
    }
  };

  const handleWorkspaceToggle = (workspaceId: string, checked: boolean) => {
    if (checked) {
      setSelectedWorkspaces(prev => [...prev, workspaceId]);
    } else {
      setSelectedWorkspaces(prev => prev.filter(id => id !== workspaceId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Remove existing user roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Add new roles
      const newRoles = [];

      // Add global role
      newRoles.push({
        user_id: user.id,
        role: selectedRole
      });

      // Add company-specific roles
      for (const companyId of selectedCompanies) {
        newRoles.push({
          user_id: user.id,
          role: 'company_admin',
          company_id: companyId
        });
      }

      // Add division-specific roles
      for (const divisionId of selectedDivisions) {
        newRoles.push({
          user_id: user.id,
          role: 'division_admin',
          division_id: divisionId
        });
      }

      if (newRoles.length > 0) {
        const { error: insertRoleError } = await supabase
          .from('user_roles')
          .insert(newRoles);

        if (insertRoleError) throw insertRoleError;
      }

      // Remove existing workspace memberships
      const { error: deleteWsError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('user_id', user.id);

      if (deleteWsError) throw deleteWsError;

      // Add new workspace memberships
      if (selectedWorkspaces.length > 0) {
        const workspaceMemberships = selectedWorkspaces.map(workspaceId => ({
          user_id: user.id,
          workspace_id: workspaceId,
          role: 'admin'
        }));

        const { error: insertWsError } = await supabase
          .from('workspace_members')
          .insert(workspaceMemberships);

        if (insertWsError) throw insertWsError;
      }

      toast({
        title: "Success",
        description: "User assignments updated successfully"
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating user assignments:', error);
      toast({
        title: "Error",
        description: "Failed to update user assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
        <div>
          <h3 className="font-medium">{user.full_name || 'Unnamed User'}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Base Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Base Role</CardTitle>
          <CardDescription>Select the primary role for this user</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="company_admin">Company Admin</SelectItem>
              <SelectItem value="division_admin">Division Admin</SelectItem>
              <SelectItem value="workspace_admin">Workspace Admin</SelectItem>
              <SelectItem value="workspace_member">Member</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Company Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Company Assignments</CardTitle>
          <CardDescription>Select companies this user has access to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {companies.map(company => (
              <div key={company.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`company-${company.id}`}
                  checked={selectedCompanies.includes(company.id)}
                  onCheckedChange={(checked) => handleCompanyToggle(company.id, !!checked)}
                />
                <Label htmlFor={`company-${company.id}`} className="flex-1">
                  <div className="font-medium">{company.name}</div>
                  {company.description && (
                    <div className="text-sm text-muted-foreground">{company.description}</div>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Division Assignments */}
      {selectedCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Division Assignments</CardTitle>
            <CardDescription>Select divisions within assigned companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableDivisions.map(division => {
                const company = companies.find(c => c.id === division.company_id);
                return (
                  <div key={division.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`division-${division.id}`}
                      checked={selectedDivisions.includes(division.id)}
                      onCheckedChange={(checked) => handleDivisionToggle(division.id, !!checked)}
                    />
                    <Label htmlFor={`division-${division.id}`} className="flex-1">
                      <div className="font-medium">{division.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Company: {company?.name}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workspace Assignments */}
      {selectedDivisions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workspace Assignments</CardTitle>
            <CardDescription>Select workspaces within assigned divisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableWorkspaces.map(workspace => {
                const division = divisions.find(d => d.id === workspace.division_id);
                const company = companies.find(c => c.id === division?.company_id);
                return (
                  <div key={workspace.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`workspace-${workspace.id}`}
                      checked={selectedWorkspaces.includes(workspace.id)}
                      onCheckedChange={(checked) => handleWorkspaceToggle(workspace.id, !!checked)}
                    />
                    <Label htmlFor={`workspace-${workspace.id}`} className="flex-1">
                      <div className="font-medium">{workspace.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {company?.name} › {division?.name}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Assignments Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Companies:</strong> 
              {selectedCompanies.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedCompanies.map(companyId => {
                    const company = companies.find(c => c.id === companyId);
                    return (
                      <Badge key={companyId} variant="secondary">
                        {company?.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground ml-2">None selected</span>
              )}
            </div>
            
            <div>
              <strong>Divisions:</strong>
              {selectedDivisions.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedDivisions.map(divisionId => {
                    const division = divisions.find(d => d.id === divisionId);
                    return (
                      <Badge key={divisionId} variant="secondary">
                        {division?.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground ml-2">None selected</span>
              )}
            </div>
            
            <div>
              <strong>Workspaces:</strong>
              {selectedWorkspaces.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedWorkspaces.map(workspaceId => {
                    const workspace = workspaces.find(w => w.id === workspaceId);
                    return (
                      <Badge key={workspaceId} variant="secondary">
                        {workspace?.name}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground ml-2">None selected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? 'Updating...' : 'Update Assignments'}
        </Button>
      </div>
    </form>
  );
}