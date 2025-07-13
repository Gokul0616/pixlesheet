import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Move, RotateCcw } from "lucide-react";

interface ChartProps {
  id: string;
  type: 'column' | 'line' | 'pie' | 'bar' | 'area' | 'scatter';
  dataRange: string;
  title: string;
  showLegend: boolean;
  sheetId: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

interface ChartData {
  [key: string]: any;
}

export function Chart({
  id,
  type,
  dataRange,
  title,
  showLegend,
  sheetId,
  position,
  size,
  onUpdate,
  onDelete
}: ChartProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const { data: cells } = useQuery({
    queryKey: ["/api/sheets", sheetId, "cells"],
    enabled: !!sheetId,
  });

  useEffect(() => {
    if (cells && dataRange) {
      const data = parseDataRange(cells, dataRange);
      setChartData(data);
    }
  }, [cells, dataRange]);

  const parseDataRange = (cells: any[], range: string): ChartData[] => {
    try {
      // Parse range like "A1:C3"
      const [startCell, endCell] = range.split(':');
      const startCol = startCell.match(/[A-Z]+/)?.[0];
      const startRow = parseInt(startCell.match(/\d+/)?.[0] || '1');
      const endCol = endCell.match(/[A-Z]+/)?.[0];
      const endRow = parseInt(endCell.match(/\d+/)?.[0] || '1');

      if (!startCol || !endCol) return [];

      const startColNum = columnToNumber(startCol);
      const endColNum = columnToNumber(endCol);

      const data: ChartData[] = [];
      
      // Get headers from first row
      const headers: string[] = [];
      for (let col = startColNum; col <= endColNum; col++) {
        const cell = cells.find(c => c.row === startRow && c.column === col);
        headers.push(cell?.value || `Column ${col}`);
      }

      // Get data rows
      for (let row = startRow + 1; row <= endRow; row++) {
        const rowData: ChartData = {};
        for (let col = startColNum; col <= endColNum; col++) {
          const cell = cells.find(c => c.row === row && c.column === col);
          const value = cell?.value;
          const headerIndex = col - startColNum;
          const header = headers[headerIndex];
          
          // Try to parse as number, otherwise use string
          const numValue = parseFloat(value);
          rowData[header] = !isNaN(numValue) ? numValue : value;
        }
        data.push(rowData);
      }

      return data;
    } catch (error) {
      console.error('Error parsing data range:', error);
      return [];
    }
  };

  const columnToNumber = (col: string): number => {
    let result = 0;
    for (const char of col) {
      result = result * 26 + (char.charCodeAt(0) - 64);
    }
    return result;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onUpdate(id, {
        position: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff7f'];

    switch (type) {
      case 'column':
      case 'bar':
        return (
          <BarChart {...commonProps} layout={type === 'bar' ? 'horizontal' : 'vertical'}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {Object.keys(chartData[0] || {}).slice(1).map((key, index) => (
              <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {Object.keys(chartData[0] || {}).slice(1).map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            {Object.keys(chartData[0] || {}).slice(1).map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        const pieData = chartData.map((item, index) => ({
          name: item[Object.keys(item)[0]],
          value: item[Object.keys(item)[1]],
          fill: colors[index % colors.length]
        }));
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid />
            <XAxis dataKey={Object.keys(chartData[0] || {})[0]} />
            <YAxis dataKey={Object.keys(chartData[0] || {})[1]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            <Scatter dataKey={Object.keys(chartData[0] || {})[1]} fill={colors[0]} />
          </ScatterChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg cursor-move"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 10
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onDelete(id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={size.height - 80}>
            {renderChart()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}