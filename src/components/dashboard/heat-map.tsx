
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample heat map data
const generateHeatMapData = (rows: number, cols: number) => {
  const data = [];
  // Different consumption levels for visualization (1-10 scale)
  for (let i = 0; i < rows; i++) {
    const rowData = [];
    for (let j = 0; j < cols; j++) {
      // Generate a value between 1-10
      const value = Math.floor(Math.random() * 10) + 1;
      rowData.push({
        value,
        label: `Zone ${String.fromCharCode(65 + i)}${j + 1}`
      });
    }
    data.push(rowData);
  }
  return data;
};

// Generate sample data for different floors
const floorData = {
  floor1: generateHeatMapData(5, 5),
  floor2: generateHeatMapData(4, 6),
  floor3: generateHeatMapData(3, 4)
};

// Get color for a consumption value (1-10)
const getHeatColor = (value: number) => {
  // From green (low) to orange to red (high)
  if (value <= 3) return 'bg-green-100';
  if (value <= 5) return 'bg-green-300';
  if (value <= 7) return 'bg-yellow-300';
  if (value <= 9) return 'bg-orange-400';
  return 'bg-red-500';
};

interface HeatMapProps {
  className?: string;
}

export function HeatMap({ className }: HeatMapProps) {
  const isMobile = useIsMobile();
  const cellSize = isMobile ? 'w-10 h-10' : 'w-16 h-16';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Energy Consumption Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="floor1">
          <TabsList className="mb-4">
            <TabsTrigger value="floor1">Floor 1</TabsTrigger>
            <TabsTrigger value="floor2">Floor 2</TabsTrigger>
            <TabsTrigger value="floor3">Floor 3</TabsTrigger>
          </TabsList>

          {Object.entries(floorData).map(([floor, data]) => (
            <TabsContent key={floor} value={floor} className="overflow-x-auto">
              <div className="flex flex-col space-y-1">
                {data.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex space-x-1">
                    {row.map((cell, cellIndex) => (
                      <div
                        key={`${rowIndex}-${cellIndex}`}
                        className={`${cellSize} ${getHeatColor(
                          cell.value
                        )} rounded-md flex flex-col items-center justify-center`}
                        title={`${cell.label}: ${cell.value}/10`}
                      >
                        <span className="text-xs font-medium">{cell.label}</span>
                        <span className="text-xs opacity-75">{cell.value}/10</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">Low</span>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <div className="w-4 h-4 bg-green-300 rounded"></div>
                    <div className="w-4 h-4 bg-yellow-300 rounded"></div>
                    <div className="w-4 h-4 bg-orange-400 rounded"></div>
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                  </div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
