// src/pages/admin/components/ScheduleReport.tsx
import { useState } from 'react';
import { Calendar, Clock, Mail, X } from 'lucide-react';

interface ScheduleReportProps {
  reportType: string;
  onClose: () => void;
  onSchedule: (schedule: ReportSchedule) => void;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  format: 'csv' | 'pdf' | 'excel';
}

export default function ScheduleReport({ reportType, onClose, onSchedule }: ScheduleReportProps) {
  const [schedule, setSchedule] = useState<ReportSchedule>({
    frequency: 'weekly',
    time: '09:00',
    recipients: [],
    format: 'pdf'
  });

  const [emailInput, setEmailInput] = useState('');

  const addRecipient = () => {
    if (emailInput && emailInput.includes('@')) {
      setSchedule({
        ...schedule,
        recipients: [...schedule.recipients, emailInput]
      });
      setEmailInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter(r => r !== email)
    });
  };

  const handleSubmit = () => {
    if (schedule.recipients.length === 0) {
      alert('Please add at least one recipient');
      return;
    }
    onSchedule(schedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Schedule Report</h2>
              <p className="text-white/80 capitalize">{reportType} Report</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Frequency
            </label>
            <select
              value={schedule.frequency}
              onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Time
            </label>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
            <div className="flex space-x-3">
              {['csv', 'pdf', 'excel'].map(format => (
                <label key={format} className="flex-1">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={schedule.format === format}
                    onChange={(e) => setSchedule({ ...schedule, format: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${
                    schedule.format === format
                      ? 'border-fia-navy bg-fia-navy text-white'
                      : 'border-gray-300 hover:border-fia-navy'
                  }`}>
                    <span className="font-semibold uppercase">{format}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Recipients
            </label>
            
            <div className="flex space-x-2 mb-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                placeholder="Enter email address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal"
              />
              <button
                onClick={addRecipient}
                className="px-6 py-2 bg-fia-navy text-white rounded-lg font-semibold hover:bg-fia-navy-dark"
              >
                Add
              </button>
            </div>

            {schedule.recipients.length > 0 && (
              <div className="space-y-2">
                {schedule.recipients.map(email => (
                  <div key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{email}</span>
                    <button
                      onClick={() => removeRecipient(email)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-fia-navy text-white px-6 py-3 rounded-lg font-bold hover:bg-fia-navy-dark"
            >
              Schedule Report
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}