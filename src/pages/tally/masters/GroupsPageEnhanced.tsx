import React from 'react';

interface GroupsPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function GroupsPageEnhanced({ companyId, divisionId }: GroupsPageEnhancedProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Groups Management</h1>
      <p className="text-muted-foreground">
        Groups page is temporarily disabled for maintenance.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Company: {companyId || 'default'} | Division: {divisionId || 'default'}
      </p>
    </div>
  );
}

export default GroupsPageEnhanced;