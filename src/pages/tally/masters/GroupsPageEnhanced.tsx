import React from 'react';
import GroupsPage from './GroupsPage';

interface GroupsPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function GroupsPageEnhanced({ companyId, divisionId }: GroupsPageEnhancedProps) {
  // Use the main GroupsPage which now supports API service
  return <GroupsPage />;
}

export default GroupsPageEnhanced;