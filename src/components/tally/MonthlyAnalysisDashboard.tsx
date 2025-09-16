import React from 'react';

interface MonthlyAnalysisDashboardProps {
  companyId: string;
  divisionId: string;
}

export function MonthlyAnalysisDashboard({ companyId, divisionId }: MonthlyAnalysisDashboardProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monthly Analysis Dashboard</h1>
      <p className="text-muted-foreground">
        Monthly Analysis Dashboard is temporarily disabled for maintenance.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Company: {companyId} | Division: {divisionId}
      </p>
    </div>
  );
}

export default MonthlyAnalysisDashboard;