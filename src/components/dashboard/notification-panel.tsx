
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle, Bell, Check, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

// Sample notification data
const notifications = [
  {
    id: 1,
    type: 'alert',
    title: 'Consumption Spike',
    description: 'Unusual energy consumption detected in Manufacturing Zone B',
    time: '12 min ago',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Energy Target',
    description: 'Server Room is 8.4% above target consumption for the day',
    time: '45 min ago',
  },
  {
    id: 3,
    type: 'info',
    title: 'Maintenance Update',
    description: 'HVAC system maintenance scheduled for tomorrow',
    time: '1 hour ago',
  },
  {
    id: 4,
    type: 'success',
    title: 'Target Achieved',
    description: 'Office wing consumption under target for the third week',
    time: '3 hours ago',
  },
];

interface NotificationPanelProps {
  className?: string;
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Bell size={18} className="mr-2" />
            Notifications
          </CardTitle>
          <Badge className="bg-energyAccent-warning text-white">4 New</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="mr-3">
                {notification.type === 'alert' && (
                  <div className="rounded-full p-2 bg-red-100">
                    <AlertTriangle
                      size={16}
                      className="text-energyAccent-warning"
                    />
                  </div>
                )}
                {notification.type === 'warning' && (
                  <div className="rounded-full p-2 bg-yellow-100">
                    <AlertTriangle
                      size={16}
                      className="text-yellow-500"
                    />
                  </div>
                )}
                {notification.type === 'info' && (
                  <div className="rounded-full p-2 bg-blue-100">
                    <Info size={16} className="text-energyBlue-medium" />
                  </div>
                )}
                {notification.type === 'success' && (
                  <div className="rounded-full p-2 bg-green-100">
                    <Check size={16} className="text-energyAccent-success" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.description}
                </p>
              </div>
              <button className="ml-2 opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          ))}
          
          <button className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-2">
            View all notifications
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
