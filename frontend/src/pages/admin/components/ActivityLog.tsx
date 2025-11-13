// src/pages/admin/components/ActivityLog.tsx
import { Activity, User, FileText, Power, Edit, Trash2, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'submission';
  user: string;
  organization: string;
  description: string;
  timestamp: Date;
}

interface ActivityLogProps {
  organizationId?: string;
}

export default function ActivityLog({ organizationId }: ActivityLogProps) {
  // Mock activity data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'submission',
      user: 'John Doe',
      organization: 'BOU',
      description: 'Submitted October 2024 statistics',
      timestamp: new Date('2024-11-10T14:30:00')
    },
    {
      id: '2',
      type: 'update',
      user: 'Admin User',
      organization: 'CMA',
      description: 'Updated contact information',
      timestamp: new Date('2024-11-09T10:15:00')
    },
    {
      id: '3',
      type: 'activate',
      user: 'Admin User',
      organization: 'IRA',
      description: 'Activated organization',
      timestamp: new Date('2024-11-08T16:45:00')
    },
    {
      id: '4',
      type: 'create',
      user: 'Admin User',
      organization: 'INTERPOL',
      description: 'Created new organization',
      timestamp: new Date('2024-11-07T09:00:00')
    }
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create': return <FileText className="w-5 h-5 text-green-600" />;
      case 'update': return <Edit className="w-5 h-5 text-blue-600" />;
      case 'delete': return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'activate': return <Power className="w-5 h-5 text-green-600" />;
      case 'deactivate': return <Power className="w-5 h-5 text-red-600" />;
      case 'submission': return <FileText className="w-5 h-5 text-purple-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create': return 'bg-green-100 border-green-200';
      case 'update': return 'bg-blue-100 border-blue-200';
      case 'delete': return 'bg-red-100 border-red-200';
      case 'activate': return 'bg-green-100 border-green-200';
      case 'deactivate': return 'bg-red-100 border-red-200';
      case 'submission': return 'bg-purple-100 border-purple-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="w-6 h-6 text-fia-navy" />
        <h3 className="text-xl font-bold text-gray-900">Activity Log</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative pl-8 pb-4 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Activity Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="badge badge-info">{activity.organization}</span>
                  <span className="text-sm font-semibold text-gray-700">{activity.user}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{activity.timestamp.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button className="w-full mt-6 px-4 py-2 text-fia-navy font-semibold hover:bg-gray-50 rounded-lg transition-colors">
        Load More Activities
      </button>
    </div>
  );
}
