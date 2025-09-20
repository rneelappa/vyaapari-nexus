import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Users, MessageCircle, FolderOpen, CheckSquare, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  division_name?: string;
  company_name?: string;
}

export default function WorkspaceListPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { companyId, divisionId } = useParams();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('workspaces')
          .select(`
            *,
            divisions!inner(name, company_id),
            companies!inner(name)
          `);

        // Filter by company and/or division if provided in URL
        if (divisionId) {
          query = query.eq('division_id', divisionId);
        } else if (companyId) {
          query = query.eq('company_id', companyId);
        }

        const { data: workspacesData, error } = await query;

        if (error) {
          console.error('Error fetching workspaces:', error);
          return;
        }

        const formattedWorkspaces = workspacesData.map((workspace: any) => ({
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          is_default: workspace.is_default,
          created_at: workspace.created_at,
          division_name: workspace.divisions?.name,
          company_name: workspace.companies?.name
        }));

        setWorkspaces(formattedWorkspaces);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, companyId, divisionId]);

  const modules = [
    { name: "Chat", icon: MessageCircle, color: "text-blue-600" },
    { name: "Drive", icon: FolderOpen, color: "text-green-600" },
    { name: "Tasks", icon: CheckSquare, color: "text-purple-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Workspaces
            </h1>
            <p className="text-muted-foreground">
              Manage your team workspaces and collaboration modules.
            </p>
          </div>
          <Button className="mt-4 lg:mt-0">
            <Plus size={16} className="mr-2" />
            Create New Workspace
          </Button>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="shadow-soft hover:shadow-medium transition-smooth group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {workspace.name}
                      {workspace.is_default && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {workspace.description || "No description available"}
                    </CardDescription>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {workspace.company_name} • {workspace.division_name}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Workspace Modules */}
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">Available Modules</div>
                    <div className="grid grid-cols-3 gap-2">
                      {modules.map((module) => (
                        <Link
                          key={module.name}
                          to={`/workspace/${workspace.id}/${module.name.toLowerCase()}`}
                          className="group/module"
                        >
                          <div className="flex flex-col items-center p-3 rounded-lg border border-border hover:bg-accent transition-smooth">
                            <module.icon size={20} className={`${module.color} mb-1`} />
                            <span className="text-xs font-medium">{module.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Workspace Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users size={14} className="mr-1" />
                      Created {new Date(workspace.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                      <Settings size={14} className="mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No workspaces found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first workspace.
            </p>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Workspace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}