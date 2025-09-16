import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Building, Building2, Briefcase, Search, Users, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Company {
  id: string;
  name: string;
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

interface CreateUserFormEnhancedProps {
  companies: Company[];
  divisions: Division[];
  workspaces: Workspace[];
  onSubmit: (userData: { 
    email: string; 
    password: string; 
    fullName: string;
    companyId?: string;
    divisionId?: string;
    workspaceIds?: string[];
  }) => Promise<void>;
}

export function CreateUserFormEnhanced({ 
  companies, 
  divisions, 
  workspaces, 
  onSubmit 
}: CreateUserFormEnhancedProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [companySearch, setCompanySearch] = useState('');
  const [divisionSearch, setDivisionSearch] = useState('');
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyId: '',
    divisionId: '',
    workspaceIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const availableDivisions = divisions.filter(d => d.company_id === formData.companyId);
  const availableWorkspaces = workspaces.filter(w => w.division_id === formData.divisionId);
  
  // Filtered lists based on search
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );
  const filteredDivisions = availableDivisions.filter(d => 
    d.name.toLowerCase().includes(divisionSearch.toLowerCase())
  );
  const filteredWorkspaces = availableWorkspaces.filter(w => 
    w.name.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Email and password are required",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      
      // Reset form and search
      setFormData({
        email: '',
        password: '',
        fullName: '',
        companyId: '',
        divisionId: '',
        workspaceIds: []
      });
      setCompanySearch('');
      setDivisionSearch('');
      setWorkspaceSearch('');
      setStep(1);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.email || !formData.password)) {
      toast({
        title: "Validation Error",
        description: "Please fill in email and password before proceeding",
        variant: "destructive"
      });
      return;
    }
    if (step === 2 && !formData.companyId) {
      toast({
        title: "Validation Error", 
        description: "Please select a company before proceeding",
        variant: "destructive"
      });
      return;
    }
    if (step === 3 && !formData.divisionId) {
      toast({
        title: "Validation Error",
        description: "Please select a division before proceeding", 
        variant: "destructive"
      });
      return;
    }
    // Clear search when moving to next step
    if (step === 2) setDivisionSearch('');
    if (step === 3) setWorkspaceSearch('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    // Clear search when going back
    if (step === 3) setCompanySearch('');
    if (step === 4) setDivisionSearch('');
    setStep(prev => prev - 1);
  };

  const toggleWorkspace = (workspaceId: string) => {
    setFormData(prev => ({
      ...prev,
      workspaceIds: prev.workspaceIds.includes(workspaceId)
        ? prev.workspaceIds.filter(id => id !== workspaceId)
        : [...prev.workspaceIds, workspaceId]
    }));
  };

  const selectCompany = (companyId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      companyId, 
      divisionId: '', 
      workspaceIds: [] 
    }));
    setDivisionSearch('');
    setWorkspaceSearch('');
  };

  const selectDivision = (divisionId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      divisionId, 
      workspaceIds: [] 
    }));
    setWorkspaceSearch('');
  };

  const selectedCompany = companies.find(c => c.id === formData.companyId);
  const selectedDivision = divisions.find(d => d.id === formData.divisionId);

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
      <form onSubmit={handleSubmit} className="space-y-4 min-h-0">
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generatePassword}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Select Company
                <Badge variant="outline" className="ml-auto">
                  {filteredCompanies.length} of {companies.length}
                </Badge>
              </CardTitle>
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
                <Label>Available Companies *</Label>
                <ScrollArea className="h-[300px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                          formData.companyId === company.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border'
                        }`}
                        onClick={() => selectCompany(company.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{company.name}</span>
                            </div>
                          </div>
                          {formData.companyId === company.id && (
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

              {/* Selected Company Summary */}
              {formData.companyId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Company:</p>
                  <p className="font-medium">{companies.find(c => c.id === formData.companyId)?.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Select Division
                <Badge variant="outline" className="ml-auto">
                  {filteredDivisions.length} of {availableDivisions.length}
                </Badge>
              </CardTitle>
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
                <Label>Available Divisions *</Label>
                {availableDivisions.length > 0 ? (
                  <ScrollArea className="h-[300px] border rounded-lg p-2">
                    <div className="space-y-2">
                      {filteredDivisions.map((division) => (
                        <div
                          key={division.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                            formData.divisionId === division.id
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border'
                          }`}
                          onClick={() => selectDivision(division.id)}
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
                            {formData.divisionId === division.id && (
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
                    <p>No divisions available for selected company</p>
                  </div>
                )}
                
                {availableDivisions.length > 0 && filteredDivisions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No divisions found matching your search</p>
                  </div>
                )}
              </div>

              {/* Selected Division Summary */}
              {formData.divisionId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Division:</p>
                  <p className="font-medium">{divisions.find(d => d.id === formData.divisionId)?.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Select Workspaces
                <Badge variant="outline" className="ml-auto">
                  {formData.workspaceIds.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableWorkspaces.length > 0 ? (
                <>
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
                    <Label>Available Workspaces (Optional)</Label>
                    <ScrollArea className="h-[300px] border rounded-lg p-2">
                      <div className="space-y-2">
                        {filteredWorkspaces.map((workspace) => (
                          <div
                            key={workspace.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                              formData.workspaceIds.includes(workspace.id)
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
                              {formData.workspaceIds.includes(workspace.id) && (
                                <Badge variant="default">Selected</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {filteredWorkspaces.length === 0 && workspaceSearch && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No workspaces found matching your search</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No workspaces available for selected division</p>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium">Assignment Summary:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email:</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  {formData.fullName && (
                    <div>
                      <p className="text-muted-foreground">Name:</p>
                      <p className="font-medium">{formData.fullName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Company:</p>
                    <p className="font-medium">{companies.find(c => c.id === formData.companyId)?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Division:</p>
                    <p className="font-medium">{divisions.find(d => d.id === formData.divisionId)?.name}</p>
                  </div>
                </div>
                {formData.workspaceIds.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground mb-2">Selected Workspaces:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.workspaceIds.map(id => {
                        const workspace = workspaces.find(w => w.id === id);
                        return workspace ? (
                          <Badge key={id} variant="secondary" className="text-xs">
                            {workspace.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {step < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}