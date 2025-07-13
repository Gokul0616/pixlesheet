import { useState } from "react";
import { Chart } from "./Chart";

interface ChartConfig {
  id: string;
  type: 'column' | 'line' | 'pie' | 'bar' | 'area' | 'scatter';
  dataRange: string;
  title: string;
  showLegend: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface ChartManagerProps {
  sheetId: number;
  charts: ChartConfig[];
  onChartsUpdate: (charts: ChartConfig[]) => void;
}

export function ChartManager({ sheetId, charts, onChartsUpdate }: ChartManagerProps) {
  const handleChartUpdate = (id: string, updates: Partial<ChartConfig>) => {
    const updatedCharts = charts.map(chart =>
      chart.id === id ? { ...chart, ...updates } : chart
    );
    onChartsUpdate(updatedCharts);
  };

  const handleChartDelete = (id: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== id);
    onChartsUpdate(updatedCharts);
  };

  const addChart = (config: Omit<ChartConfig, 'id'>) => {
    const newChart: ChartConfig = {
      ...config,
      id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    onChartsUpdate([...charts, newChart]);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {charts.map(chart => (
        <div key={chart.id} className="pointer-events-auto">
          <Chart
            {...chart}
            sheetId={sheetId}
            onUpdate={handleChartUpdate}
            onDelete={handleChartDelete}
          />
        </div>
      ))}
    </div>
  );
}

// Hook to manage charts
export function useChartManager(sheetId: number) {
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  const addChart = (config: {
    type: 'column' | 'line' | 'pie' | 'bar' | 'area' | 'scatter';
    dataRange: string;
    title: string;
    showLegend: boolean;
  }) => {
    const newChart: ChartConfig = {
      ...config,
      id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 }
    };
    setCharts(prev => [...prev, newChart]);
  };

  return {
    charts,
    setCharts,
    addChart
  };
}