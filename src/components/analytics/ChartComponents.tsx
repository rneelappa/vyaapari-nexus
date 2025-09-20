/**
 * Chart Components for Analytics
 * Reusable chart components for data visualization
 * Built with React and CSS for maximum compatibility
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}

interface BarChartProps {
  data: ChartData;
  options?: ChartOptions;
  title?: string;
  description?: string;
  className?: string;
}

export function BarChart({ data, options, title, description, className }: BarChartProps) {
  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data));
  const minValue = Math.min(...data.datasets.flatMap(dataset => dataset.data));
  const range = maxValue - minValue;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {data.labels.map((label, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-muted-foreground">
                  {data.datasets[0]?.data[index]?.toLocaleString() || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((data.datasets[0]?.data[index] || 0) - minValue) / range * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LineChartProps {
  data: ChartData;
  options?: ChartOptions;
  title?: string;
  description?: string;
  className?: string;
}

export function LineChart({ data, options, title, description, className }: LineChartProps) {
  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data));
  const minValue = Math.min(...data.datasets.flatMap(dataset => dataset.data));
  const range = maxValue - minValue;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {data.labels.map((label, index) => {
              if (index === 0) return null;
              const x1 = (index - 1) * (400 / (data.labels.length - 1));
              const x2 = index * (400 / (data.labels.length - 1));
              const y1 = 200 - ((data.datasets[0]?.data[index - 1] || 0) - minValue) / range * 200;
              const y2 = 200 - ((data.datasets[0]?.data[index] || 0) - minValue) / range * 200;
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
              );
            })}
            {data.labels.map((label, index) => {
              const x = index * (400 / (data.labels.length - 1));
              const y = 200 - ((data.datasets[0]?.data[index] || 0) - minValue) / range * 200;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {data.labels.map((label, index) => (
            <span key={index} className="text-center">
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface PieChartProps {
  data: ChartData;
  options?: ChartOptions;
  title?: string;
  description?: string;
  className?: string;
}

export function PieChart({ data, options, title, description, className }: PieChartProps) {
  const total = data.datasets[0]?.data.reduce((sum, value) => sum + value, 0) || 0;
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  let currentAngle = 0;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {data.labels.map((label, index) => {
                const value = data.datasets[0]?.data[index] || 0;
                const percentage = total > 0 ? value / total : 0;
                const angle = percentage * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                currentAngle += angle;
                
                const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
          <div className="space-y-2">
            {data.labels.map((label, index) => {
              const value = data.datasets[0]?.data[index] || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DonutChartProps {
  data: ChartData;
  options?: ChartOptions;
  title?: string;
  description?: string;
  className?: string;
  centerText?: string;
}

export function DonutChart({ data, options, title, description, className, centerText }: DonutChartProps) {
  const total = data.datasets[0]?.data.reduce((sum, value) => sum + value, 0) || 0;
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  let currentAngle = 0;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {data.labels.map((label, index) => {
                const value = data.datasets[0]?.data[index] || 0;
                const percentage = total > 0 ? value / total : 0;
                const angle = percentage * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                currentAngle += angle;
                
                const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = [
                  `M 50 50`,
                  `L ${x1} ${y1}`,
                  `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="1"
                  />
                );
              })}
              <circle
                cx="50"
                cy="50"
                r="20"
                fill="white"
              />
            </svg>
            {centerText && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-center">{centerText}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {data.labels.map((label, index) => {
              const value = data.datasets[0]?.data[index] || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AreaChartProps {
  data: ChartData;
  options?: ChartOptions;
  title?: string;
  description?: string;
  className?: string;
}

export function AreaChart({ data, options, title, description, className }: AreaChartProps) {
  const maxValue = Math.max(...data.datasets.flatMap(dataset => dataset.data));
  const minValue = Math.min(...data.datasets.flatMap(dataset => dataset.data));
  const range = maxValue - minValue;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`M 0 200 ${data.labels.map((label, index) => {
                const x = index * (400 / (data.labels.length - 1));
                const y = 200 - ((data.datasets[0]?.data[index] || 0) - minValue) / range * 200;
                return `L ${x} ${y}`;
              }).join(' ')} L 400 200 Z`}
              fill="url(#areaGradient)"
            />
            {data.labels.map((label, index) => {
              if (index === 0) return null;
              const x1 = (index - 1) * (400 / (data.labels.length - 1));
              const x2 = index * (400 / (data.labels.length - 1));
              const y1 = 200 - ((data.datasets[0]?.data[index - 1] || 0) - minValue) / range * 200;
              const y2 = 200 - ((data.datasets[0]?.data[index] || 0) - minValue) / range * 200;
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
              );
            })}
            {data.labels.map((label, index) => {
              const x = index * (400 / (data.labels.length - 1));
              const y = 200 - ((data.datasets[0]?.data[index] || 0) - minValue) / range * 200;
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {data.labels.map((label, index) => (
            <span key={index} className="text-center">
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, description, icon, className }: MetricCardProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return '↗';
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${getChangeColor(change.type)}`}>
                <span className="mr-1">{getChangeIcon(change.type)}</span>
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
