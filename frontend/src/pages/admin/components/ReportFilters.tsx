// src/pages/admin/components/ReportFilters.tsx
import { useState } from 'react';
import { Filter, Calendar, X, Download, Printer } from 'lucide-react';

interface ReportFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onExport: (format: 'csv' | 'pdf' | 'excel') => void;
  onPrint: () => void;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  organizationIds: string[];
  status: string[];
  type: string[];
}

export default function ReportFilters({ onFilterChange, onExport, onPrint }: ReportFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    organizationIds: [],
    status: [],
    type: []
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      startDate: '',
      endDate: '',
      organizationIds: [],
      status: [],
      type: []
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = 
    filters.startDate || 
    filters.endDate || 
    filters.organizationIds.length > 0 || 
    filters.status.length > 0 || 
    filters.type.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              showFilters ? 'bg-fia-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-fia-gold text-fia-navy px-2 py-0.5 rounded-full text-xs font-bold">
                Active
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onPrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print</span>
          </button>

          <div className="relative group">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-fia-navy text-white hover:bg-fia-navy-dark transition-colors">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onExport('csv')}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg"
              >
                <p className="font-semibold text-gray-900">Export as CSV</p>
                <p className="text-xs text-gray-500">Comma-separated values</p>
              </button>
              <button
                onClick={() => onExport('excel')}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <p className="font-semibold text-gray-900">Export as Excel</p>
                <p className="text-xs text-gray-500">Microsoft Excel format</p>
              </button>
              <button
                onClick={() => onExport('pdf')}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors last:rounded-b-lg"
              >
                <p className="font-semibold text-gray-900">Export as PDF</p>
                <p className="text-xs text-gray-500">Portable document format</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-3">
              {['draft', 'submitted', 'approved', 'rejected'].map(status => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...filters.status, status]
                        : filters.status.filter(s => s !== status);
                      updateFilter('status', newStatus);
                    }}
                    className="rounded text-fia-teal focus:ring-fia-teal"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Organization Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Type</label>
            <div className="flex flex-wrap gap-3">
              {['regulator', 'ministry', 'professional', 'law_enforcement', 'prosecution'].map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(type)}
                    onChange={(e) => {
                      const newType = e.target.checked
                        ? [...filters.type, type]
                        : filters.type.filter(t => t !== type);
                      updateFilter('type', newType);
                    }}
                    className="rounded text-fia-teal focus:ring-fia-teal"
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}