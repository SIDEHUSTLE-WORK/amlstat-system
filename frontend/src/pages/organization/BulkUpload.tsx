import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  Upload, 
  Download, 
  File,
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useAppStore } from '../../store';
import toast from 'react-hot-toast';
import type { IndicatorData } from '../../types';

export default function BulkUpload() {
  const navigate = useNavigate();
  const { currentUser, addSubmission } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload CSV or Excel files only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload with validation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate processing
    setTimeout(() => {
      // Create mock indicators from "file"
      const mockIndicators: IndicatorData[] = [
        { section: 'A', number: '1.1', description: 'Total STRs received', value: 245, required: true },
        { section: 'A', number: '1.2', description: 'STRs from banks', value: 120, required: true },
        { section: 'A', number: '1.3', description: 'STRs from mobile money', value: 98, required: true },
        { section: 'B', number: '2.1', description: 'Total reporting entities', value: 47, required: true },
        { section: 'C', number: '3.1', description: 'Inspections conducted', value: 12, required: true },
      ];

      // Add submission
      addSubmission({
        id: `sub-${Date.now()}`,
        organizationId: currentUser!.organizationId!,
        organization: currentUser!.organization,
        month: 12,
        year: 2024,
        status: 'submitted',
        indicators: mockIndicators,
        totalIndicators: mockIndicators.length,
        filledIndicators: mockIndicators.length,
        completionRate: 100,
        submittedBy: currentUser!.name,
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setUploadResult({
        success: true,
        totalRecords: mockIndicators.length,
        successfulRecords: mockIndicators.length,
        failedRecords: 0,
      });

      setUploading(false);
      toast.success('File uploaded and statistics submitted successfully!');
      
      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/organization/dashboard');
      }, 2000);
    }, 2500);
  };

  const downloadTemplate = () => {
    toast.success('Template download started!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/organization/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-fia-navy">Bulk Data Upload</h1>
              <p className="text-gray-600">Upload statistics via Excel or CSV file</p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Upload Instructions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>Download the template</strong> specific to December 2024</li>
            <li>• <strong>Fill in all required indicators</strong> following the exact format</li>
            <li>• <strong>Supported formats:</strong> CSV (.csv), Excel (.xls, .xlsx)</li>
            <li>• <strong>Maximum file size:</strong> 10 MB</li>
            <li>• The system will validate all data before submitting to FIA</li>
          </ul>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive ? 'border-fia-teal bg-fia-teal/5' : 'border-gray-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".csv,.xls,.xlsx"
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Drop your file here or click to browse
                </h3>
                <p className="text-gray-600 mb-6">
                  Supports CSV, XLS, XLSX files up to 10MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Select File
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <File className="w-16 h-16 text-fia-teal mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedFile.name}</h3>
                  <p className="text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button onClick={handleUpload} className="btn-primary" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload & Submit'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="btn-outline"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Processing...</span>
                <span className="text-sm font-semibold text-fia-navy">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-fia-teal h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900">Upload Successful!</h3>
                  <p className="text-green-700">Your statistics have been submitted to FIA</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{uploadResult.totalRecords}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{uploadResult.successfulRecords}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{uploadResult.failedRecords}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sample Data Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sample Template Format</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Section</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Number</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left font-bold text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2">A</td>
                  <td className="px-4 py-2">1.1</td>
                  <td className="px-4 py-2">Total number of STRs received</td>
                  <td className="px-4 py-2 text-blue-600 font-semibold">245</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">A</td>
                  <td className="px-4 py-2">1.2</td>
                  <td className="px-4 py-2">Number of STRs from banks</td>
                  <td className="px-4 py-2 text-blue-600 font-semibold">120</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">A</td>
                  <td className="px-4 py-2">1.3</td>
                  <td className="px-4 py-2">Number of STRs from mobile money</td>
                  <td className="px-4 py-2 text-blue-600 font-semibold">98</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
