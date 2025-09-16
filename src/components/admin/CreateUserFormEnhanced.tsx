import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, ChevronLeft, Building, Building2, Briefcase } from 'lucide-react';

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
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        companyId: '',
        divisionId: '',
        workspaceIds: []
      });
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
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const toggleWorkspace = (workspaceId: string) => {
    setFormData(prev => ({
      ...prev,
      workspaceIds: prev.workspaceIds.includes(workspaceId)
        ? prev.workspaceIds.filter(id => id !== workspaceId)
        : [...prev.workspaceIds, workspaceId]
    }));
  };

  const selectedCompany = companies.find(c => c.id === formData.companyId);
  const selectedDivision = divisions.find(d => d.id === formData.divisionId);

  return (
    <div className="space-y-6">
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Select value={formData.companyId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, companyId: value, divisionId: '', workspaceIds: [] }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCompany && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Company:</p>
                  <p className="font-medium">{selectedCompany.name}</p>
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Division *</Label>
                <Select value={formData.divisionId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, divisionId: value, workspaceIds: [] }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a division" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDivisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {availableDivisions.length === 0 && formData.companyId && (
                <p className="text-sm text-muted-foreground">No divisions available for selected company</p>
              )}
              {selectedDivision && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Division:</p>
                  <p className="font-medium">{selectedDivision.name}</p>
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableWorkspaces.length > 0 ? (
                <div className="space-y-2">
                  <Label>Workspaces (Optional)</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {availableWorkspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.workspaceIds.includes(workspace.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleWorkspace(workspace.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{workspace.name}</span>
                          {formData.workspaceIds.includes(workspace.id) && (
                            <Badge variant="secondary">Selected</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No workspaces available for selected division</p>
              )}

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium">Summary:</h4>
                <p className="text-sm">Email: {formData.email}</p>
                {formData.fullName && <p className="text-sm">Name: {formData.fullName}</p>}
                <p className="text-sm">Company: {selectedCompany?.name}</p>
                <p className="text-sm">Division: {selectedDivision?.name}</p>
                {formData.workspaceIds.length > 0 && (
                  <p className="text-sm">
                    Workspaces: {formData.workspaceIds.map(id => 
                      workspaces.find(w => w.id === id)?.name
                    ).join(', ')}
                  </p>
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