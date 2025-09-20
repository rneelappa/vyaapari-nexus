import React from 'react';
import { useParams } from 'react-router-dom';
import { VoucherViewsManager } from './VoucherViewsManager';

export function VoucherViewsPage() {
  const { companyId, divisionId } = useParams<{
    companyId: string;
    divisionId: string;
  }>();

  if (!companyId || !divisionId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Invalid Parameters</h2>
        <p className="text-muted-foreground">Company ID and Division ID are required.</p>
      </div>
    );
  }

  return <VoucherViewsManager companyId={companyId} divisionId={divisionId} />;
}