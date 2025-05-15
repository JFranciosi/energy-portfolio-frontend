
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Sample data
const hourlyData = [
  { time: '00:00', consumption: 42, baseline: 40 },
  { time: '01:00', consumption: 38, baseline: 38 },
  { time: '02:00', consumption: 35, baseline: 36 },
  { time: '03:00', consumption: 34, baseline: 35 },
  { time: '04:00', consumption: 36, baseline: 37 },
  { time: '05:00', consumption: 40, baseline: 39 },
  { time: '06:00', consumption: 45, baseline: 42 },
  { time: '07:00', consumption: 55, baseline: 50 },
  { time: '08:00', consumption: 70, baseline: 63 },
  { time: '09:00', consumption: 85, baseline: 78 },
  { time: '10:00', consumption: 92, baseline: 82 },
  { time: '11:00', consumption: 96, baseline: 85 },
  { time: '12:00', consumption: 98, baseline: 87 },
  { time: '13:00', consumption: 94, baseline: 86 },
  { time: '14:00', consumption: 91, baseline: 84 },
  { time: '15:00', consumption: 93, baseline: 85 },
  { time: '16:00', consumption: 95, baseline: 84 },
  { time: '17:00', consumption: 91, baseline: 82 },
  { time: '18:00', consumption: 84, baseline: 77 },
  { time: '19:00', consumption: 75, baseline: 72 },
  { time: '20:00', consumption: 70, baseline: 68 },
  { time: '21:00', consumption: 65, baseline: 62 },
  { time: '22:00', consumption: 58, baseline: 55 },
  { time: '23:00', consumption: 50, baseline: 48 },
];

const dailyData = [
  { day: 'Mon', consumption: 1580, baseline: 1520 },
  { day: 'Tue', consumption: 1620, baseline: 1540 },
  { day: 'Wed', consumption: 1700, baseline: 1580 },
  { day: 'Thu', consumption: 1640, baseline: 1590 },
  { day: 'Fri', consumption: 1590, baseline: 1560 },
  { day: 'Sat', consumption: 1200, baseline: 1180 },
  { day: 'Sun', consumption: 1100, baseline: 1090 },
];

const monthlyData = [
  { month: 'Jan', consumption: 42000, baseline: 40000 },
  { month: 'Feb', consumption: 38000, baseline: 39000 },
  { month: 'Mar', consumption: 45000, baseline: 42000 },
  { month: 'Apr', consumption: 40000, baseline: 41000 },
  { month: 'May', consumption: 43000, baseline: 41500 },
  { month: 'Jun', consumption: 48000, baseline: 44000 },
  { month: 'Jul', consumption: 52000, baseline: 47000 },
  { month: 'Aug', consumption: 51000, baseline: 46500 },
  { month: 'Sep', consumption: 47000, baseline: 44000 },
  { month: 'Oct', consumption: 44000, baseline: 42500 },
  { month: 'Nov', consumption: 46000, baseline: 43000 },
  { month: 'Dec', consumption: 50000, baseline: 45000 },
];

interface ConsumptionChartProps {
  className?: string;
}

export function ConsumptionAreaChart({ className }: ConsumptionChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Energy Consumption Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center text-xs">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 rounded-full bg-energyBlue-medium mr-1"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/30 mr-1"></div>
                <span>Baseline</span>
              </div>
            </div>
          </div>
          
          <TabsContent value="hourly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#9e9e9e" 
                  fill="#e0e0e0" 
                  strokeWidth={2}
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#2A4E6E" 
                  fill="#3E6990" 
                  strokeWidth={2}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="daily" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#9e9e9e" 
                  fill="#e0e0e0" 
                  strokeWidth={2}
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#2A4E6E" 
                  fill="#3E6990" 
                  strokeWidth={2}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#9e9e9e" 
                  fill="#e0e0e0" 
                  strokeWidth={2}
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#2A4E6E" 
                  fill="#3E6990" 
                  strokeWidth={2}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function ConsumptionBarChart({ className }: ConsumptionChartProps) {
  // Department data
  const departmentData = [
    { department: 'Manufacturing', actual: 45, target: 40 },
    { department: 'Offices', actual: 25, target: 22 },
    { department: 'Warehouse', actual: 18, target: 20 },
    { department: 'Cafeteria', actual: 8, target: 10 },
    { department: 'Utilities', actual: 12, target: 12 }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Consumption by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="target" name="Target" fill="#9e9e9e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#3E6990" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
