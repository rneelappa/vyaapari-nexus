import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Search, Building, Building2, Users, MapPin, Briefcase, UserCheck } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
  roles: Array<{
    id: string;
    user_id: string;
    role: string;
    company_id?: string;
    division_id?: string;
  }>;
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

export interface EditUserWizardProps {
  user: User;
  companies: Company[];
  divisions: Division[];
  workspaces: Workspace[];
  onUpdate: () => void;
  onClose: () => void;
}

export function EditUserWizard({ user, companies, divisions, workspaces, onUpdate, onClose }: EditUserWizardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [selectedRole, setSelectedRole] = useState<string>('workspace_member');
  const [companySearch, setCompanySearch] = useState('');
  const [divisionSearch, setDivisionSearch] = useState('');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);

  // Filtered lists based on search and selection
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredDivisions = divisions.filter(d => 
    d.name.toLowerCase().includes(divisionSearch.toLowerCase()) &&
    (selectedCompanies.length === 0 || selectedCompanies.includes(d.company_id))
  );
  const filteredWorkspaces = workspaces.filter(w => 
    w.name.toLowerCase().includes(workspaceSearch.toLowerCase()) &&
    (selectedDivisions.length === 0 || selectedDivisions.includes(w.division_id))
  );

  // Initialize selections based on user's current assignments
  useEffect(() => {
    setSelectedCompanies(user.company_assignments || []);
    setSelectedDivisions(user.division_assignments || []);
    setSelectedWorkspaces(user.workspace_assignments || []);
    
    // Set the primary role (first non-specific role)
    const primaryRole = user.roles.find(r => !r.company_id && !r.division_id)?.role || 'workspace_member';
    setSelectedRole(primaryRole);
  }, [user]);

  // Helper functions
  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev => {
      const newSelection = prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId];
      
      // Remove divisions and workspaces that are no longer valid
      if (!newSelection.includes(companyId)) {
        const invalidDivisions = divisions
          .filter(d => d.company_id === companyId)
          .map(d => d.id);
        setSelectedDivisions(prev => prev.filter(id => !invalidDivisions.includes(id)));
        
        const invalidWorkspaces = workspaces
          .filter(w => invalidDivisions.includes(w.division_id))
          .map(w => w.id);
        setSelectedWorkspaces(prev => prev.filter(id => !invalidWorkspaces.includes(id)));
      }
      
      return newSelection;
    });
  };

  const toggleDivision = (divisionId: string) => {
    setSelectedDivisions(prev => {
      const newSelection = prev.includes(divisionId)
        ? prev.filter(id => id !== divisionId)
        : [...prev, divisionId];
      
      // Remove workspaces that are no longer valid
      if (!newSelection.includes(divisionId)) {
        const invalidWorkspaces = workspaces
          .filter(w => w.division_id === divisionId)
          .map(w => w.id);
        setSelectedWorkspaces(prev => prev.filter(id => !invalidWorkspaces.includes(id)));
      }
      
      return newSelection;
    });
  };

  const toggleWorkspace = (workspaceId: string) => {
    setSelectedWorkspaces(prev => 
      prev.includes(workspaceId)
        ? prev.filter(id => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const nextStep = () => {
    // Clear search when moving to next step
    if (step === 2) setDivisionSearch('');
    if (step === 3) setWorkspaceSearch('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    // Clear search when going back
    if (step === 2) setCompanySearch('');
    if (step === 3) setDivisionSearch('');
    if (step === 4) setWorkspaceSearch('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Remove existing roles
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
      onClose();
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
    <div className="space-y-6 min-h-0">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i}
              </div>
              {i < 4 && <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {step} of 4
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-4 min-h-0">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                User Information & Role
              </CardTitle>
              <CardDescription>
                Viewing user details and setting primary role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                {user.full_name && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Name:</span>
                    <span>{user.full_name}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="font-medium">Current Roles:</span>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role, index) => (
                      <Badge key={index} variant="outline">
                        {role.role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Primary User Role *</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="workspace_member">Workspace Member</SelectItem>
                    <SelectItem value="workspace_admin">Workspace Admin</SelectItem>
                    <SelectItem value="division_admin">Division Admin</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Assignments
                <Badge variant="outline" className="ml-auto">
                  {selectedCompanies.length} selected
                </Badge>
              </CardTitle>
              <CardDescription>Select companies this user has access to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search Companies</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Type to search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Companies List */}
              <div className="space-y-2">
                <Label>Available Companies</Label>
                <ScrollArea className="h-[350px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                          selectedCompanies.includes(company.id)
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border'
                        }`}
                        onClick={() => toggleCompany(company.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{company.name}</span>
                          </div>
                          {selectedCompanies.includes(company.id) && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {filteredCompanies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No companies found matching your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Division Assignments
                <Badge variant="outline" className="ml-auto">
                  {selectedDivisions.length} selected
                </Badge>
              </CardTitle>
              <CardDescription>Select divisions within assigned companies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search Divisions</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Type to search divisions..."
                    value={divisionSearch}
                    onChange={(e) => setDivisionSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Divisions List */}
              <div className="space-y-2">
                <Label>Available Divisions</Label>
                {selectedCompanies.length > 0 ? (
                  <ScrollArea className="h-[350px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {filteredDivisions.map((division) => (
                        <div
                          key={division.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                            selectedDivisions.includes(division.id)
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border'
                          }`}
                          onClick={() => toggleDivision(division.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{division.name}</span>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Company: {companies.find(c => c.id === division.company_id)?.name}
                                </p>
                              </div>
                            </div>
                            {selectedDivisions.includes(division.id) && (
                              <Badge variant="default">Selected</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select companies first to see available divisions</p>
                  </div>
                )}
                
                {selectedCompanies.length > 0 && filteredDivisions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No divisions found matching your search</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Workspace Assignments
                <Badge variant="outline" className="ml-auto">
                  {selectedWorkspaces.length} selected
                </Badge>
              </CardTitle>
              <CardDescription>Select workspaces within assigned divisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search Workspaces</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Type to search workspaces..."
                    value={workspaceSearch}
                    onChange={(e) => setWorkspaceSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Workspaces List */}
              <div className="space-y-2">
                <Label>Available Workspaces</Label>
                {selectedDivisions.length > 0 ? (
                  <ScrollArea className="h-[350px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {filteredWorkspaces.map((workspace) => (
                        <div
                          key={workspace.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                            selectedWorkspaces.includes(workspace.id)
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border'
                          }`}
                          onClick={() => toggleWorkspace(workspace.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <span className="font-medium">{workspace.name}</span>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Division: {divisions.find(d => d.id === workspace.division_id)?.name}
                                </p>
                              </div>
                            </div>
                            {selectedWorkspaces.includes(workspace.id) && (
                              <Badge variant="default">Selected</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select divisions first to see available workspaces</p>
                  </div>
                )}
                
                {selectedDivisions.length > 0 && filteredWorkspaces.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No workspaces found matching your search</p>
                  </div>
                )}
              </div>

              {/* Summary */}
              {(selectedCompanies.length > 0 || selectedDivisions.length > 0 || selectedWorkspaces.length > 0) && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium">Assignment Summary:</h4>
                  <div className="text-sm space-y-1">
                    <div>Primary Role: <Badge variant="outline">{selectedRole}</Badge></div>
                    {selectedCompanies.length > 0 && (
                      <div>Companies: {selectedCompanies.length} selected</div>
                    )}
                    {selectedDivisions.length > 0 && (
                      <div>Divisions: {selectedDivisions.length} selected</div>
                    )}
                    {selectedWorkspaces.length > 0 && (
                      <div>Workspaces: {selectedWorkspaces.length} selected</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={step === 1 ? onClose : prevStep}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Cancel' : 'Previous'}
        </Button>

        {step < 4 ? (
          <Button type="button" onClick={nextStep}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );
}