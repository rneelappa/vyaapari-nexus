import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Building, Building2, Database, Users, BookOpen, Package, Warehouse, Target, FileSignature, TrendingUp, Calculator, FileText, BarChart3, PieChart, FileBarChart, Activity, Settings, Scale } from "lucide-react";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TallyMenuItemContainer from "./TallyMenuItem";
import TallyApiTest from "./TallyApiTest";

// Tally workspace structure
const tallyMenuStructure = {
  masters: {
    name: "Masters",
    icon: Database,
    children: [{
      name: "Groups",
      icon: Users,
      path: "/tally/masters/groups"
    }, {
      name: "Ledgers",
      icon: BookOpen,
      path: "/tally/masters/ledgers"
    }, {
      name: "Stock Items",
      icon: Package,
      path: "/tally/masters/stock-items"
    }, {
      name: "Godowns",
      icon: Warehouse,
      path: "/tally/masters/godowns"
    }, {
      name: "Cost Centers",
      icon: Target,
      path: "/tally/masters/cost-centers"
    }, {
      name: "Voucher Types",
      icon: FileSignature,
      path: "/tally/masters/voucher-types"
    }, {
      name: "Employees",
      icon: Users,
      path: "/tally/masters/employees"
    }, {
      name: "UOM",
      icon: Scale,
      path: "/tally/masters/uom"
    }, {
      name: "Cost Categories",
      icon: Target,
      path: "/tally/masters/cost-categories"
    }, {
      name: "Payheads",
      icon: Calculator,
      path: "/tally/masters/payheads"
    }]
  },
  transactions: {
    name: "Transactions",
    icon: TrendingUp,
    children: [{
      name: "Accounting",
      icon: Calculator,
      path: "/tally/transactions/accounting"
    }, {
      name: "Non-Accounting",
      icon: FileText,
      path: "/tally/transactions/non-accounting"
    }, {
      name: "Inventory",
      icon: Package,
      path: "/tally/transactions/inventory"
    }]
  },
  display: {
    name: "Display",
    icon: BarChart3,
    children: [{
      name: "DayBook",
      icon: BookOpen,
      path: "/tally/display/daybook"
    }, {
      name: "Statistics",
      icon: PieChart,
      path: "/tally/display/statistics"
    }, {
      name: "Financial Statements",
      icon: FileBarChart,
      path: "/tally/display/financial-statements"
    }, {
      name: "Reports",
      icon: Activity,
      path: "/tally/display/reports"
    }]
  },
  utilities: {
    name: "Utilities",
    icon: Settings,
    children: [{
      name: "Tally Configuration",
      icon: Settings,
      path: "/tally/utilities/configuration"
    }, {
      name: "Test API",
      icon: Activity,
      path: "/tally/test-api"
    }]
  }
};
interface Company {
  id: string;
  name: string;
  divisions: Division[];
}
interface Division {
  id: string;
  name: string;
  description: string | null;
  company_id: string;
  manager_name: string | null;
  status: string | null;
  budget: number | null;
  employee_count: number | null;
  performance_score: number | null;
  parent_division_id: string | null;
  is_active: boolean;
  tally_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
interface CompanyHierarchyItemProps {
  company: Company;
  isExpanded: boolean;
  onToggle: () => void;
}
const CompanyHierarchyItem = ({
  company,
  isExpanded,
  onToggle
}: CompanyHierarchyItemProps) => {
  // Filter to only show tally-enabled divisions
  const tallyEnabledDivisions = company.divisions.filter(division => {
    return division.is_active && division.tally_enabled;
  });
  if (tallyEnabledDivisions.length === 0) {
    return null; // Don't show company if no tally-enabled divisions
  }
  return <div className="mb-3">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div className="flex items-center w-full rounded-lg hover:bg-muted/50 transition-smooth">
            <button onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }} className="mr-1 p-1 rounded hover:bg-accent/20 transition-smooth">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="flex items-center flex-1 p-2">
              <Building size={16} className="mr-2 flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-semibold">{company.name}</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isExpanded && <div className="ml-6 mt-1 border-l border-border/30 pl-4">
          {tallyEnabledDivisions.map((division: Division) => <DivisionHierarchyItem key={division.id} division={division} />)}
        </div>}
    </div>;
};
interface DivisionHierarchyItemProps {
  division: Division;
}
const DivisionHierarchyItem = ({
  division
}: DivisionHierarchyItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return <div className="mb-2">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div className="flex items-center w-full rounded-lg hover:bg-muted/50 transition-smooth">
            <button onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }} className="mr-1 p-1 rounded hover:bg-accent/20 transition-smooth">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <Link to={`/company/${division.company_id}/division/${division.id}`} className="flex items-center flex-1 p-2 hover:bg-accent/10 rounded transition-smooth">
              <Building2 size={16} className="mr-2 flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-medium">{division.name}</span>
              <div className="w-2 h-2 rounded-full bg-green-500 ml-2" title="Tally Enabled" />
            </Link>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isExpanded && <div className="mt-2 -mx-3">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary py-3 px-4 shadow-soft">
            <div className="space-y-1">
              {Object.values(tallyMenuStructure).map(category => <TallyMenuItemContainer key={category.name} item={category} level={0} />)}
            </div>
          </div>
        </div>}
    </div>;
};
const TallyHierarchy = () => {
  const { user } = useAuth();
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchTallyEnabledData = async () => {
      // Only fetch if user is authenticated
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch companies with their tally-enabled divisions
        const {
          data: companiesData,
          error: companiesError
        } = await supabase.from('companies').select('*');
        if (companiesError) {
          console.error('TallyHierarchy: Error fetching companies:', companiesError);
          setLoading(false);
          return;
        }
        const {
          data: divisionsData,
          error: divisionsError
        } = await supabase.from('divisions').select('*').eq('is_active', true).eq('tally_enabled', true);
        if (divisionsError) {
          console.error('TallyHierarchy: Error fetching divisions:', divisionsError);
          setLoading(false);
          return;
        }

        // Group divisions by company and filter for Tally-enabled divisions
        const companiesWithDivisions: Company[] = companiesData.map(company => ({
          ...company,
          divisions: divisionsData.filter(division => division.company_id === company.id && division.is_active && division.tally_enabled)
        })).filter(company => company.divisions.length > 0); // Only include companies with tally-enabled divisions

        setCompanies(companiesWithDivisions);
      } catch (error) {
        console.error('Error fetching tally data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTallyEnabledData();
  }, [user]);
  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };
  if (loading) {
    return <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
          Tally Workspaces
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="text-xs text-muted-foreground px-3 py-2">
            Loading...
          </div>
        </SidebarGroupContent>
      </SidebarGroup>;
  }
  if (companies.length === 0) {
    return <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
          Tally Workspaces
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="text-xs text-muted-foreground px-3 py-2">
            No Tally-enabled divisions found
          </div>
        </SidebarGroupContent>
      </SidebarGroup>;
  }
  return <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
        Tally Workspaces
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="list-none">
          {companies.map(company => <CompanyHierarchyItem key={company.id} company={company} isExpanded={expandedCompanies.has(company.id)} onToggle={() => toggleCompany(company.id)} />)}
        </SidebarMenu>
      </SidebarGroupContent>
      
      {/* API Test Component */}
      
    </SidebarGroup>;
};
export default TallyHierarchy;