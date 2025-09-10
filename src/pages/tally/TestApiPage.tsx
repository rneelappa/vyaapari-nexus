import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TallyApiV2Test } from '@/components/tally/TallyApiV2Test';

const TestApiPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tally API Testing</h1>
          <p className="text-muted-foreground">
            Test the V2 GET endpoints with proper authentication
          </p>
        </div>
        
        <TallyApiV2Test />
      </div>
    </MainLayout>
  );
};

export default TestApiPage;