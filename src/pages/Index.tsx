
import React from 'react';
import { EnergyDashboard } from '@/components/dashboard/energy-dashboard';
import { TechnicalNotes } from '@/components/technical-notes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Tabs defaultValue="dashboard" className="h-full">
        <TabsList className="fixed bottom-0 left-0 right-0 w-full flex z-50 justify-center md:hidden bg-background border-t">
          <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">Technical Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-0 h-full">
          <EnergyDashboard />
        </TabsContent>
        
        <TabsContent value="notes" className="mt-0 h-full">
          <TechnicalNotes />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Index;
