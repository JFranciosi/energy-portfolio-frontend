
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

// Sample comparison data
const comparisonData = [
  {
    zone: 'Manufacturing Floor',
    actual: 532,
    target: 500,
    unit: 'kWh',
    progress: 106.4,
    trend: -2.3,
  },
  {
    zone: 'Administrative Offices',
    actual: 215,
    target: 230,
    unit: 'kWh',
    progress: 93.5,
    trend: 5.2,
  },
  {
    zone: 'Server Room',
    actual: 347,
    target: 320,
    unit: 'kWh',
    progress: 108.4,
    trend: 1.8,
  },
  {
    zone: 'Warehouse',
    actual: 176,
    target: 180,
    unit: 'kWh',
    progress: 97.8,
    trend: -4.1,
  },
  {
    zone: 'Cafeteria',
    actual: 84,
    target: 90,
    unit: 'kWh',
    progress: 93.3,
    trend: -8.7,
  },
];

interface TargetComparisonTableProps {
  className?: string;
}

export function TargetComparisonTable({ className }: TargetComparisonTableProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Actual vs. Target Consumption</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row, i) => {
                const isOverBudget = row.actual > row.target;
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.zone}</TableCell>
                    <TableCell className="text-right">
                      {row.actual} {row.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.target} {row.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={row.progress}
                          className="h-2"
                          indicatorClassName={
                            isOverBudget
                              ? 'bg-energyAccent-warning'
                              : 'bg-energyAccent-success'
                          }
                        />
                        <span className="text-xs w-10">
                          {row.progress.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'inline-flex items-center',
                          row.trend < 0
                            ? 'text-energyAccent-success'
                            : 'text-energyAccent-warning'
                        )}
                      >
                        {row.trend < 0 ? (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(row.trend)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
