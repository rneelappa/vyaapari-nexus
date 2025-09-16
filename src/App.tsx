import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { TallyProvider } from "@/contexts/TallyContext";

// Pages
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import CompanyPage from "@/pages/CompanyPage";
import DivisionPage from "@/pages/DivisionPage";
import WorkspaceListPage from "@/pages/WorkspaceListPage";
import WorkspacePage from "@/pages/WorkspacePage";
import NotFound from "@/pages/NotFound";

// Workspace modules
import { WorkspaceChat } from "@/components/workspace/WorkspaceChat";
import { WorkspaceDrive } from "@/components/workspace/WorkspaceDrive";
import { WorkspaceTasks } from "@/components/workspace/WorkspaceTasks";

// Tally Router
import { TallyRouter } from "@/components/tally/TallyRouter";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TallyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <Index />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/company/:companyId"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <CompanyPage />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/company/:companyId/division/:divisionId"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <DivisionPage />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                {/* Tally Routes */}
                <Route
                  path="/company/:companyId/division/:divisionId/tally/*"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <TallyRouter />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                {/* Workspace */}
                <Route
                  path="/workspaces"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <WorkspaceListPage />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/workspace/:workspaceId"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <WorkspacePage />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/workspace/:workspaceId/chat"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <WorkspaceChat />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/workspace/:workspaceId/drive"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <WorkspaceDrive />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/workspace/:workspaceId/tasks"
                  element={
                    <AuthGuard>
                      <MainLayout>
                        <WorkspaceTasks />
                      </MainLayout>
                    </AuthGuard>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TallyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
