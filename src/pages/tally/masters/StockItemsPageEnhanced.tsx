import React from 'react';

interface StockItemsPageEnhancedProps {
  companyId?: string;
  divisionId?: string;
}

export function StockItemsPageEnhanced({ companyId, divisionId }: StockItemsPageEnhancedProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stock Items Management</h1>
      <p className="text-muted-foreground">
        Stock Items page is temporarily disabled for maintenance.
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Company: {companyId || 'default'} | Division: {divisionId || 'default'}
      </p>
    </div>
  );
}

export default StockItemsPageEnhanced;