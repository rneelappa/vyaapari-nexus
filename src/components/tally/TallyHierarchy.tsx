import { useState } from "react";
import { ChevronDown, ChevronRight, Building, Building2, Calculator, BookOpen, FileText, BarChart3, Database, Package, Warehouse, Target, FileSignature, TrendingUp, PieChart, FileBarChart, Activity, Settings, Users } from "lucide-react";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import TallyMenuItemContainer from "./TallyMenuItem";

// Mock data for tally-enabled divisions
const mockTallyData = {
  companies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Acme Corporation",
      divisions: [
        {
          id: "div1",
          name: "Engineering",
          tallyEnabled: true,
          tallyUrl: "http://localhost:9000"
        },
        {
          id: "div2",
          name: "Marketing", 
          tallyEnabled: false // This won't show up
        }
      ]
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "TechStart Inc",
      divisions: [
        {
          id: "div3",
          name: "Product",
          tallyEnabled: true,
          tallyUrl: "http://localhost:9001"
        }
      ]
    }
  ]
};

// Tally workspace structure
const tallyMenuStructure = {
  masters: {
    name: "Masters",
    icon: Database,
    children: [
      { name: "Groups", icon: Users, path: "/tally/masters/groups" },
      { name: "Ledgers", icon: BookOpen, path: "/tally/masters/ledgers" },
      { name: "Stock Items", icon: Package, path: "/tally/masters/stock-items" },
      { name: "Godowns", icon: Warehouse, path: "/tally/masters/godowns" },
      { name: "Cost Centers", icon: Target, path: "/tally/masters/cost-centers" },
      { name: "Voucher Types", icon: FileSignature, path: "/tally/masters/voucher-types" },
    ]
  },
  transactions: {
    name: "Transactions",
    icon: TrendingUp,
    children: [
      { name: "Accounting", icon: Calculator, path: "/tally/transactions/accounting" },
      { name: "Non-Accounting", icon: FileText, path: "/tally/transactions/non-accounting" },
      { name: "Inventory", icon: Package, path: "/tally/transactions/inventory" },
    ]
  },
  display: {
    name: "Display",
    icon: BarChart3,
    children: [
      { name: "DayBook", icon: BookOpen, path: "/tally/display/daybook" },
      { name: "Statistics", icon: PieChart, path: "/tally/display/statistics" },
      { name: "Financial Statements", icon: FileBarChart, path: "/tally/display/financial-statements" },
      { name: "Reports", icon: Activity, path: "/tally/display/reports" },
    ]
  },
  utilities: {
    name: "Utilities",
    icon: Settings,
    children: [
      { name: "Tally Configuration", icon: Settings, path: "/tally/utilities/configuration" },
    ]
  }
};

interface CompanyHierarchyItemProps {
  company: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const CompanyHierarchyItem = ({ company, isExpanded, onToggle }: CompanyHierarchyItemProps) => {
  // Filter to only show tally-enabled divisions
  const tallyEnabledDivisions = company.divisions.filter((division: any) => division.tallyEnabled);
  
  if (tallyEnabledDivisions.length === 0) {
    return null; // Don't show company if no tally-enabled divisions
  }

  return (
    <div className="mb-3">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div className="flex items-center w-full rounded-lg hover:bg-muted/50 transition-smooth">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              className="mr-1 p-1 rounded hover:bg-accent/20 transition-smooth"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="flex items-center flex-1 p-2">
              <Building size={16} className="mr-2 flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-semibold">{company.name}</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isExpanded && (
        <div className="ml-4 mt-1">
          {tallyEnabledDivisions.map((division: any) => (
            <DivisionHierarchyItem key={division.id} division={division} />
          ))}
        </div>
      )}
    </div>
  );
};

interface DivisionHierarchyItemProps {
  division: any;
}

const DivisionHierarchyItem = ({ division }: DivisionHierarchyItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div className="flex items-center w-full rounded-lg hover:bg-muted/50 transition-smooth">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mr-1 p-1 rounded hover:bg-accent/20 transition-smooth"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <div className="flex items-center flex-1 p-2">
              <Building2 size={16} className="mr-2 flex-shrink-0" />
              <span className="flex-1 truncate text-sm font-medium">{division.name}</span>
              <div className="w-2 h-2 rounded-full bg-green-500 ml-2" title="Tally Enabled" />
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isExpanded && (
        <div className="ml-4 mt-1">
          {Object.values(tallyMenuStructure).map((category) => (
            <TallyMenuItemContainer key={category.name} item={category} level={0} />
          ))}
        </div>
      )}
    </div>
  );
};

const TallyHierarchy = () => {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());

  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  // Filter companies that have at least one tally-enabled division
  const companiesWithTally = mockTallyData.companies.filter(company => 
    company.divisions.some(division => division.tallyEnabled)
  );

  if (companiesWithTally.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
          Tally Workspaces
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="text-xs text-muted-foreground px-3 py-2">
            No Tally-enabled divisions found
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3">
        Tally Workspaces
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="list-none">
          {companiesWithTally.map((company) => (
            <CompanyHierarchyItem
              key={company.id}
              company={company}
              isExpanded={expandedCompanies.has(company.id)}
              onToggle={() => toggleCompany(company.id)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default TallyHierarchy;