import React from 'react';

interface BusinessIntelligenceDashboardProps {
  companyId: string;
  divisionId: string;
}

export function BusinessIntelligenceDashboard({ companyId, divisionId }: BusinessIntelligenceDashboardProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Business Intelligence Dashboard</h1>
      <p className="text-muted-foreground">
        Business Intelligence Dashboard is temporarily disabled for maintenance.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Company: {companyId} | Division: {divisionId}
      </p>
    </div>
  );
}

export default BusinessIntelligenceDashboard;