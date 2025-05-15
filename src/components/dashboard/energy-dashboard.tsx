
import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { StatsCard } from './stats-card';
import { ConsumptionAreaChart, ConsumptionBarChart } from './consumption-chart';
import { HeatMap } from './heat-map';
import { TargetComparisonTable } from './target-comparison-table';
import { NotificationPanel } from './notification-panel';
import { Thermometer, BarChart, AlertTriangle, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function EnergyDashboard() {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Current Consumption"
                value="86.4"
                valueSuffix=" kWh"
                trend={{ value: 3.2, isPositive: false }}
                icon={<Thermometer size={20} />}
              />
              <StatsCard
                title="Monthly Average"
                value="2,345"
                valueSuffix=" kWh"
                trend={{ value: 5.1, isPositive: false }}
                icon={<BarChart size={20} />}
              />
              <StatsCard
                title="Efficiency Rating"
                value="92"
                valueSuffix="%"
                trend={{ value: 2.8, isPositive: true }}
                positive="up"
              />
              <StatsCard
                title="Anomalies"
                value="3"
                trend={{ value: 15, isPositive: true }}
                icon={<AlertTriangle size={20} />}
              />
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <ConsumptionAreaChart className="lg:col-span-2" />
              <ConsumptionBarChart className="lg:col-span-1" />
            </div>
            
            {/* Heat Map and Comparison Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <HeatMap />
              <TargetComparisonTable />
            </div>
            
            {/* Notifications */}
            <div className="grid grid-cols-1 gap-6">
              <NotificationPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
