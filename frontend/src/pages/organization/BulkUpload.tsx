// frontend/src/pages/organization/BulkUpload.tsx
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
import { submissionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function BulkUpload() {
  const navigate = useNavigate();
  const { currentUser, fetchSubmissionsByOrg } = useAppStore();
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
    setUploadResult(null); // Clear previous results
  };

  // 🔥 REAL API UPLOAD
  const handleUpload = async () => {
    if (!selectedFile || !currentUser?.organizationId) {
      toast.error('Please select a file and ensure you are logged in');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('organizationId', currentUser.organizationId);
      
      const now = new Date();
      formData.append('month', String(now.getMonth() + 1));
      formData.append('year', String(now.getFullYear()));

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 🔥 Call bulk upload API
      const response = await submissionsAPI.bulkUpload(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        const { submission, validation } = response.data.data;

        // Auto-submit if validation is successful
        if (validation.isValid && submission.id) {
          try {
            await submissionsAPI.submit(submission.id);
            
            setUploadResult({
              success: true,
              totalRecords: validation.totalIndicators || 0,
              successfulRecords: validation.validIndicators || 0,
              failedRecords: validation.invalidIndicators || 0,
              submitted: true,
            });

            toast.success('File uploaded and statistics submitted successfully!');
          } catch (submitError) {
            // If submission fails, still show upload success
            setUploadResult({
              success: true,
              totalRecords: validation.totalIndicators || 0,
              successfulRecords: validation.validIndicators || 0,
              failedRecords: validation.invalidIndicators || 0,
              submitted: false,
            });

            toast.success('File uploaded! Please submit from dashboard.');
          }
        } else {
          setUploadResult({
            success: true,
            totalRecords: validation.totalIndicators || 0,
            successfulRecords: validation.validIndicators || 0,
            failedRecords: validation.invalidIndicators || 0,
            submitted: false,
            errors: validation.errors || [],
          });

          if (validation.invalidIndicators > 0) {
            toast(`⚠️ File uploaded with ${validation.invalidIndicators} validation errors`, {
              icon: '⚠️',
            });
          } else {
            toast.success('File uploaded successfully!');
          }
        }

        // Refresh submissions
        await fetchSubmissionsByOrg(currentUser.organizationId);

        // Navigate back after delay
        setTimeout(() => {
          navigate('/organization/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      setUploadResult({
        success: false,
        error: error.response?.data?.message || 'Failed to upload file',
      });

      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const now = new Date();
    const template = `Section,Number,Description,Value
A,1.1,Total number of STRs received during the month,
A,1.2,Number of STRs from banks,
A,1.3,Number of STRs from mobile money operators,
A,1.4,Number of STRs from microfinance institutions,
A,1.5,Number of STRs from forex bureaus,
A,1.6,Total value of STRs (UGX),
A,1.7,Number of STRs forwarded to law enforcement,
A,1.8,Number of STRs under analysis,
B,2.1,Total number of registered reporting entities,
B,2.2,Number of banks,
B,2.3,Number of mobile money operators,
B,2.4,Number of microfinance institutions,
B,2.5,Number of forex bureaus,
B,2.6,Number of insurance companies,
B,2.7,Number of SACCOs,
B,2.8,Number of designated non-financial businesses,
C,3.1,Number of on-site inspections conducted,
C,3.2,Number of off-site reviews conducted,
C,3.3,Number of enforcement actions taken,
C,3.4,Total value of fines imposed (UGX),
C,3.5,Number of licenses suspended,
C,3.6,Number of licenses revoked,
D,4.1,Number of international requests received,
D,4.2,Number of international requests sent,
D,4.3,Number of requests from INTERPOL,
D,4.4,Number of requests from ESAAMLG,
E,5.1,Number of training sessions conducted,
E,5.2,Number of participants trained,
E,5.3,Number of reporting entities trained,
F,6.1,Number of cases under investigation,
F,6.2,Number of cases forwarded to DPP,
F,6.3,Number of convictions,
F,6.4,Total value of assets frozen (UGX),
F,6.5,Total value of assets seized (UGX),`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FIA-Statistics-Template-${currentUser?.organization?.code}-${now.toISOString().slice(0, 7)}.csv`;
    link.click();
    
    toast.success('Template downloaded successfully!');
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
            <li>• <strong>Download the template</strong> specific to {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
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
                  disabled={uploading}
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
                  <button 
                    onClick={handleUpload} 
                    className="btn-primary" 
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload & Submit'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setUploadResult(null);
                    }}
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
          {uploadResult && uploadResult.success && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-bold text-green-900">Upload Successful!</h3>
                  <p className="text-green-700">
                    {uploadResult.submitted 
                      ? 'Your statistics have been submitted to FIA'
                      : 'File uploaded - review and submit from dashboard'}
                  </p>
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
              
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Validation Errors:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {uploadResult.errors.slice(0, 5).map((error: string, idx: number) => (
                      <li key={idx}>• {error}</li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li className="font-semibold">...and {uploadResult.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Upload Error */}
          {uploadResult && !uploadResult.success && (
            <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-bold text-red-900">Upload Failed</h3>
                  <p className="text-red-700">{uploadResult.error}</p>
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