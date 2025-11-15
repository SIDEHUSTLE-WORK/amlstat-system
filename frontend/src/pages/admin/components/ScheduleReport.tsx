// frontend/src/pages/admin/components/ScheduleReport.tsx
import { useState } from 'react';
import { Calendar, Clock, Mail, X } from 'lucide-react';
import { adminAPI } from '../../../services/api';
import toast from 'react-hot-toast';

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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addRecipient = () => {
    setError('');
    
    if (!emailInput.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(emailInput)) {
      setError('Please enter a valid email address');
      return;
    }

    if (schedule.recipients.includes(emailInput.toLowerCase())) {
      setError('This email is already added');
      return;
    }

    setSchedule({
      ...schedule,
      recipients: [...schedule.recipients, emailInput.toLowerCase()]
    });
    setEmailInput('');
  };

  const removeRecipient = (email: string) => {
    setSchedule({
      ...schedule,
      recipients: schedule.recipients.filter(r => r !== email)
    });
  };

  // 🔥 REAL API SCHEDULE REPORT
  const handleSubmit = async () => {
    setError('');
    
    if (schedule.recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await adminAPI.scheduleReport({
        reportType,
        frequency: schedule.frequency,
        time: schedule.time,
        format: schedule.format,
        recipients: schedule.recipients
      });

      if (response.data.success) {
        toast.success(
          `Report scheduled successfully! You'll receive ${reportType} reports ${schedule.frequency} at ${schedule.time}.`
        );
        onSchedule(schedule);
        onClose();
      }
    } catch (error: any) {
      console.error('Schedule report error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setError('Failed to schedule report');
        toast.error('Failed to schedule report');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Schedule Report</h2>
              <p className="text-white/80 capitalize mt-1">{reportType} Report</p>
            </div>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Frequency
            </label>
            <select
              value={schedule.frequency}
              onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value as ReportSchedule['frequency'] })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (Every Monday)</option>
              <option value="monthly">Monthly (1st of each month)</option>
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Time (EAT - East Africa Time)
            </label>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {(['csv', 'pdf', 'excel'] as const).map(format => (
                <label key={format} className="cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={schedule.format === format}
                    onChange={(e) => setSchedule({ ...schedule, format: e.target.value as ReportSchedule['format'] })}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  <div className={`p-3 border-2 rounded-lg text-center transition-all ${
                    schedule.format === format
                      ? 'border-blue-900 bg-blue-900 text-white shadow-md'
                      : 'border-gray-300 hover:border-blue-900 hover:bg-gray-50'
                  }`}>
                    <span className="font-semibold uppercase text-sm">{format}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Recipients
            </label>
            
            <div className="flex space-x-2 mb-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError('');
                }}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                placeholder="director@fia.go.ug"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={addRecipient}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {schedule.recipients.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {schedule.recipients.map(email => (
                  <div key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">{email}</span>
                    <button
                      onClick={() => removeRecipient(email)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                      aria-label={`Remove ${email}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No recipients added yet</p>
            )}
          </div>

          {/* Summary */}
          {schedule.recipients.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Summary:</strong> {reportType} report will be sent {schedule.frequency} at {schedule.time} EAT to {schedule.recipients.length} recipient{schedule.recipients.length > 1 ? 's' : ''} as {schedule.format.toUpperCase()}.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={schedule.recipients.length === 0 || isSubmitting}
              className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <span>Schedule Report</span>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}