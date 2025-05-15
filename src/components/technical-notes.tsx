
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function TechnicalNotes() {
  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Implementation Notes for Energy Monitoring Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Framework Setup</h3>
            <p>
              Although this dashboard is built with React, it can be easily implemented using Next.js for better SEO, improved performance through server-side rendering, and file-based routing system. Here's how to set it up:
            </p>
            <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`# Create a new Next.js project
npx create-next-app@latest energy-dashboard --typescript
cd energy-dashboard

# Install required dependencies
npm install recharts lucide-react tailwindcss @headlessui/react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Data Visualization</h3>
            <p>
              For chart libraries, we recommend:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Recharts</strong>: React components for composable and customizable charts with a clean API. Used in this dashboard for its simplicity and flexibility.
                <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`npm install recharts`}
                </pre>
              </li>
              <li>
                <strong>Chart.js with react-chartjs-2</strong>: An alternative with more chart types and customization options.
                <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`npm install chart.js react-chartjs-2`}
                </pre>
                <p className="mt-2">Chart.js example for energy consumption:</p>
                <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Chart configuration
const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Energy Consumption' }
  }
};

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Consumption',
      data: [33, 25, 35, 51, 54, 76],
      borderColor: '#2A4E6E',
      backgroundColor: '#3E6990',
    }
  ]
};

<Line options={options} data={data} />`}
                </pre>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">UI Component Libraries</h3>
            <p>While this dashboard uses Tailwind CSS with custom components, you could also consider:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Material UI</strong>: Comprehensive React component library implementing Google's Material Design.
                <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`npm install @mui/material @mui/icons-material @emotion/react @emotion/styled`}
                </pre>
                <p className="mt-2">MUI Theme customization for the energy dashboard colors:</p>
                <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A365D',
      light: '#3E6990',
      dark: '#0F172A',
    },
    secondary: {
      main: '#4ECDC4',
    },
    error: {
      main: '#FF6B6B',
    },
  },
  shape: {
    borderRadius: 8,
  },
});`}
                </pre>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Real-time Data Integration</h3>
            <p>For real implementation, you'd want to connect to real-time energy monitoring systems via:</p>
            <ul className="list-disc pl-5">
              <li>REST APIs for data fetching with SWR or React Query for caching/revalidation</li>
              <li>WebSockets for real-time updates from sensors and meters</li>
              <li>Time-series databases like InfluxDB or TimescaleDB for historical data</li>
            </ul>
            <p className="mt-2">Example implementation with React Query:</p>
            <pre className="bg-muted p-3 rounded-md mt-2 text-xs overflow-x-auto">
{`import { useQuery } from '@tanstack/react-query';

// Data fetching function
const fetchEnergyData = async () => {
  const response = await fetch('/api/energy/consumption');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

// In your component
const { data, error, isLoading } = useQuery({
  queryKey: ['energyData'],
  queryFn: fetchEnergyData,
  refetchInterval: 60000, // Refetch every minute
});`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Responsive Design Implementation</h3>
            <p>
              This dashboard is fully responsive using Tailwind CSS breakpoints. Key practices:
            </p>
            <ul className="list-disc pl-5">
              <li>Mobile-first approach with progressive enhancement</li>
              <li>Collapsible sidebar that transforms into a bottom navigation on mobile</li>
              <li>Stacked layout on mobile vs. grid layout on desktop</li>
              <li>Dynamic component sizing based on screen real estate</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Performance Considerations</h3>
            <p>For optimal performance, especially with data-heavy dashboards:</p>
            <ul className="list-disc pl-5">
              <li>Virtualized lists for large datasets using react-window or react-virtualized</li>
              <li>Data aggregation at different time intervals to reduce payload size</li>
              <li>Incremental loading of historical data</li>
              <li>Code splitting to reduce initial bundle size</li>
              <li>Memoization of expensive computations and component rendering</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
