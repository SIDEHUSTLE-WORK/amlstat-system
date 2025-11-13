// src/pages/admin/components/DetailedAnalytics.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DetailedAnalyticsProps {
  data: any[];
  title: string;
  metric: string;
}

export default function DetailedAnalytics({ data, title, metric }: DetailedAnalyticsProps) {
  // Calculate trends
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = data[data.length - 1][metric];
    const previous = data[data.length - 2][metric];
    
    if (recent > previous) {
      return {
        direction: 'up',
        percentage: Math.round(((recent - previous) / previous) * 100)
      };
    } else if (recent < previous) {
      return {
        direction: 'down',
        percentage: Math.round(((previous - recent) / previous) * 100)
      };
    }
    
    return { direction: 'stable', percentage: 0 };
  };

  const trend = calculateTrend();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold ${
          trend.direction === 'up' ? 'bg-green-100 text-green-700' :
          trend.direction === 'down' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {trend.direction === 'up' && <TrendingUp className="w-5 h-5" />}
          {trend.direction === 'down' && <TrendingDown className="w-5 h-5" />}
          {trend.direction === 'stable' && <Minus className="w-5 h-5" />}
          <span>
            {trend.direction === 'stable' ? 'No change' : `${trend.percentage}%`}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={metric} fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.reduce((sum, d) => sum + d[metric], 0) / data.length)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Highest</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.max(...data.map(d => d[metric]))}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">Lowest</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.min(...data.map(d => d[metric]))}
          </p>
        </div>
      </div>
    </div>
  );
}