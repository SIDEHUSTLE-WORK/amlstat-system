// frontend/src/pages/organization/SubmitStatistics.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { 
  FileText, 
  Save, 
  Send, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  X,
  Download
} from 'lucide-react';
import { useAppStore } from '../../store';
import { submissionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import type { IndicatorData } from '../../types';

export default function SubmitStatistics() {
  const navigate = useNavigate();
  const { currentUser, fetchSubmissionsByOrg } = useAppStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [indicators, setIndicators] = useState<IndicatorData[]>(getInitialIndicators());
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Format number with commas
  const formatNumber = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // If empty, return empty
    if (!numericValue) return '';
    
    // Split by decimal point
    const parts = numericValue.split('.');
    
    // Add commas to integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Return with decimal if exists
    return parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
  };

  // Parse number (remove commas for storage)
  const parseNumber = (value: string | number): string => {
    // If it's already a number, convert to string first
    if (typeof value === 'number') {
      return value.toString();
    }
    // Remove commas from string
    return value.replace(/,/g, '');
  };

  // Get initial indicators
  function getInitialIndicators(): IndicatorData[] {
    return [
      // Section A: STRs and SARs
      { section: 'A', number: '1.1', description: 'Total number of STRs received during the month', value: '', required: true },
      { section: 'A', number: '1.2', description: 'Number of STRs from banks', value: '', required: true },
      { section: 'A', number: '1.3', description: 'Number of STRs from mobile money operators', value: '', required: true },
      { section: 'A', number: '1.4', description: 'Number of STRs from microfinance institutions', value: '', required: true },
      { section: 'A', number: '1.5', description: 'Number of STRs from forex bureaus', value: '', required: true },
      { section: 'A', number: '1.6', description: 'Total value of STRs (UGX)', value: '', required: true },
      { section: 'A', number: '1.7', description: 'Number of STRs forwarded to law enforcement', value: '', required: true },
      { section: 'A', number: '1.8', description: 'Number of STRs under analysis', value: '', required: true },
      
      // Section B: Reporting Entities
      { section: 'B', number: '2.1', description: 'Total number of registered reporting entities', value: '', required: true },
      { section: 'B', number: '2.2', description: 'Number of banks', value: '', required: true },
      { section: 'B', number: '2.3', description: 'Number of mobile money operators', value: '', required: true },
      { section: 'B', number: '2.4', description: 'Number of microfinance institutions', value: '', required: true },
      { section: 'B', number: '2.5', description: 'Number of forex bureaus', value: '', required: true },
      { section: 'B', number: '2.6', description: 'Number of insurance companies', value: '', required: true },
      { section: 'B', number: '2.7', description: 'Number of SACCOs', value: '', required: true },
      { section: 'B', number: '2.8', description: 'Number of designated non-financial businesses', value: '', required: true },
      
      // Section C: Compliance and Supervision
      { section: 'C', number: '3.1', description: 'Number of on-site inspections conducted', value: '', required: true },
      { section: 'C', number: '3.2', description: 'Number of off-site reviews conducted', value: '', required: true },
      { section: 'C', number: '3.3', description: 'Number of enforcement actions taken', value: '', required: true },
      { section: 'C', number: '3.4', description: 'Total value of fines imposed (UGX)', value: '', required: false },
      { section: 'C', number: '3.5', description: 'Number of licenses suspended', value: '', required: false },
      { section: 'C', number: '3.6', description: 'Number of licenses revoked', value: '', required: false },
      
      // Section D: International Cooperation
      { section: 'D', number: '4.1', description: 'Number of international requests received', value: '', required: true },
      { section: 'D', number: '4.2', description: 'Number of international requests sent', value: '', required: true },
      { section: 'D', number: '4.3', description: 'Number of requests from INTERPOL', value: '', required: false },
      { section: 'D', number: '4.4', description: 'Number of requests from ESAAMLG', value: '', required: false },
      
      // Section E: Training and Capacity Building
      { section: 'E', number: '5.1', description: 'Number of training sessions conducted', value: '', required: true },
      { section: 'E', number: '5.2', description: 'Number of participants trained', value: '', required: true },
      { section: 'E', number: '5.3', description: 'Number of reporting entities trained', value: '', required: true },
      
      // Section F: Investigations and Prosecutions
      { section: 'F', number: '6.1', description: 'Number of cases under investigation', value: '', required: true },
      { section: 'F', number: '6.2', description: 'Number of cases forwarded to DPP', value: '', required: true },
      { section: 'F', number: '6.3', description: 'Number of convictions', value: '', required: true },
      { section: 'F', number: '6.4', description: 'Total value of assets frozen (UGX)', value: '', required: false },
      { section: 'F', number: '6.5', description: 'Total value of assets seized (UGX)', value: '', required: false },
    ];
  }

  const sections = [
    { id: 'A', name: 'STRs and SARs', description: 'Suspicious Transaction and Activity Reports' },
    { id: 'B', name: 'Reporting Entities', description: 'Registered financial institutions and entities' },
    { id: 'C', name: 'Compliance & Supervision', description: 'Inspections, reviews, and enforcement actions' },
    { id: 'D', name: 'International Cooperation', description: 'Cross-border requests and cooperation' },
    { id: 'E', name: 'Training & Capacity', description: 'Training sessions and capacity building' },
    { id: 'F', name: 'Investigations', description: 'Investigations, prosecutions, and asset recovery' },
  ];

  const currentSectionData = sections[currentSection];
  const currentIndicators = indicators.filter(i => i.section === currentSectionData.id);
  
  const handleInputChange = (number: string, value: string) => {
    const formattedValue = formatNumber(value);
    setIndicators(prev => 
      prev.map(ind => 
        ind.number === number ? { ...ind, value: formattedValue } : ind
      )
    );
  };

  const isSectionComplete = () => {
    return currentIndicators.every(ind => 
      !ind.required || (ind.value !== '' && ind.value !== null)
    );
  };

  const calculateProgress = () => {
    const filled = indicators.filter(i => i.value !== '').length;
    return Math.round((filled / indicators.length) * 100);
  };

  // 🔥 SAVE DRAFT WITH REAL API
  const handleSaveDraft = async () => {
    if (!currentUser?.organizationId) {
      toast.error('Organization not found');
      return;
    }

    setIsSavingDraft(true);
    
    try {
      const filled = indicators.filter(i => i.value !== '').length;
      
      // Parse values before saving
      const parsedIndicators = indicators.map(ind => ({
        ...ind,
        value: ind.value ? parseNumber(ind.value) : ''
      }));

      // Convert to object format for API
      const indicatorsObject = parsedIndicators.reduce((acc, ind) => {
        acc[ind.number] = ind.value;
        return acc;
      }, {} as Record<string, string>);
      
      const now = new Date();
      const response = await submissionsAPI.create({
        organizationId: currentUser.organizationId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        indicators: indicatorsObject,
      });

      if (response.data.success) {
        toast.success('Draft saved successfully!');
        // Refresh submissions
        await fetchSubmissionsByOrg(currentUser.organizationId);
        navigate('/organization/dashboard');
      }
    } catch (error: any) {
      console.error('Save draft error:', error);
      toast.error(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePreview = () => {
    const required = indicators.filter(i => i.required && i.value === '').length;
    
    if (required > 0) {
      toast.error(`Please fill in all ${required} required fields before previewing!`);
      return;
    }
    
    setShowPreview(true);
  };

  // 🔥 FINAL SUBMIT WITH REAL API
  const handleFinalSubmit = async () => {
    if (!currentUser?.organizationId) {
      toast.error('Organization not found');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const filled = indicators.filter(i => i.value !== '').length;
      
      // Parse values before saving
      const parsedIndicators = indicators.map(ind => ({
        ...ind,
        value: ind.value ? parseNumber(ind.value) : ''
      }));

      // Convert to object format for API
      const indicatorsObject = parsedIndicators.reduce((acc, ind) => {
        acc[ind.number] = ind.value;
        return acc;
      }, {} as Record<string, string>);
      
      const now = new Date();
      
      // Create submission
      const createResponse = await submissionsAPI.create({
        organizationId: currentUser.organizationId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        indicators: indicatorsObject,
      });

      if (createResponse.data.success) {
        const submissionId = createResponse.data.data.submission.id;
        
        // Submit it immediately
        const submitResponse = await submissionsAPI.submit(submissionId);
        
        if (submitResponse.data.success) {
          setShowPreview(false);
          toast.success('Statistics submitted successfully to FIA!');
          
          // Refresh submissions
          await fetchSubmissionsByOrg(currentUser.organizationId);
          
          // Navigate after short delay
          setTimeout(() => {
            navigate('/organization/dashboard');
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit statistics');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPreview = () => {
    // Create a simple text export
    let exportText = `FIA Uganda - AML/CFT Statistics Submission\n`;
    exportText += `Organization: ${currentUser?.organization?.name}\n`;
    exportText += `Month: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n`;
    exportText += `Submitted By: ${currentUser?.name}\n`;
    exportText += `Date: ${new Date().toLocaleDateString()}\n\n`;
    exportText += `${'='.repeat(80)}\n\n`;
    
    sections.forEach(section => {
      const sectionIndicators = indicators.filter(i => i.section === section.id && i.value !== '');
      if (sectionIndicators.length > 0) {
        exportText += `Section ${section.id}: ${section.name}\n`;
        exportText += `${'-'.repeat(80)}\n`;
        sectionIndicators.forEach(ind => {
          exportText += `${ind.number}. ${ind.description}: ${ind.value}\n`;
        });
        exportText += `\n`;
      }
    });
    
    // Create blob and download
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FIA-Statistics-${currentUser?.organization?.code}-${new Date().toISOString().slice(0, 7)}.txt`;
    link.click();
    
    toast.success('Preview exported successfully!');
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
              <h1 className="text-3xl font-bold text-fia-navy">
                Submit {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Statistics
              </h1>
              <p className="text-gray-600">{currentUser?.organization?.name}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="btn-outline flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              onClick={handlePreview}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-fia-navy">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-fia-navy to-fia-teal h-4 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {indicators.filter(i => i.value !== '').length} of {indicators.length} indicators filled
          </p>
        </div>

        {/* Section Navigator */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-6 divide-x divide-gray-200">
            {sections.map((section, index) => {
              const sectionIndicators = indicators.filter(i => i.section === section.id);
              const filled = sectionIndicators.filter(i => i.value !== '').length;
              const isComplete = sectionIndicators.every(i => !i.required || i.value !== '');
              
              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(index)}
                  className={`p-4 text-center transition-all ${
                    currentSection === index
                      ? 'bg-fia-navy text-white'
                      : isComplete
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {isComplete ? (
                      <CheckCircle className={`w-6 h-6 ${currentSection === index ? 'text-white' : 'text-green-500'}`} />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        currentSection === index ? 'bg-white text-fia-navy' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {section.id}
                      </div>
                    )}
                  </div>
                  <p className={`text-sm font-semibold ${currentSection === index ? 'text-white' : 'text-gray-900'}`}>
                    {section.name}
                  </p>
                  <p className={`text-xs mt-1 ${currentSection === index ? 'text-white/80' : 'text-gray-500'}`}>
                    {filled}/{sectionIndicators.length}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Section Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Section {currentSectionData.id}: {currentSectionData.name}
            </h2>
            <p className="text-gray-600">{currentSectionData.description}</p>
          </div>

          <div className="space-y-6">
            {currentIndicators.map((indicator) => (
              <div key={indicator.number} className="border-b border-gray-200 pb-6 last:border-0">
                <label className="block mb-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <span className="font-bold text-fia-navy">{indicator.number}</span>
                      <span className="ml-3 text-gray-900">{indicator.description}</span>
                    </div>
                    {indicator.required && (
                      <span className="ml-4 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={indicator.value}
                    onChange={(e) => handleInputChange(indicator.number, e.target.value)}
                    placeholder="Enter value (e.g., 10,000)..."
                    className="input-field font-mono"
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Section Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Section
            </button>
            
            <div className="text-center">
              {isSectionComplete() ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Section Complete!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Please fill all required fields</span>
                </div>
              )}
            </div>

            {currentSection < sections.length - 1 ? (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                className="btn-primary"
              >
                Next Section
              </button>
            ) : (
              <button
                onClick={handlePreview}
                className="btn-primary flex items-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Preview & Submit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-fia-navy to-fia-teal p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Preview Submission</h2>
                  <p className="text-white/80">Review your statistics before submitting to FIA</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Submission Info */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Organization</p>
                  <p className="font-bold text-gray-900">{currentUser?.organization?.name}</p>
                  <p className="text-sm text-gray-600">{currentUser?.organization?.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reporting Period</p>
                  <p className="font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted By</p>
                  <p className="font-bold text-gray-900">{currentUser?.name}</p>
                  <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {sections.map(section => {
                const sectionIndicators = indicators.filter(i => i.section === section.id && i.value !== '');
                if (sectionIndicators.length === 0) return null;
                
                return (
                  <div key={section.id} className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-fia-navy text-white rounded-lg flex items-center justify-center font-bold">
                        {section.id}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{section.name}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      {sectionIndicators.map(ind => (
                        <div key={ind.number} className="flex items-start justify-between border-b border-gray-200 pb-3 last:border-0">
                          <div className="flex-1">
                            <span className="font-bold text-fia-navy">{ind.number}</span>
                            <span className="ml-2 text-gray-700">{ind.description}</span>
                          </div>
                          <span className="font-bold text-gray-900 ml-4 font-mono">{ind.value || '0'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handleExportPreview}
                disabled={isSubmitting}
                className="btn-outline flex items-center space-x-2 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>Export Preview</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  disabled={isSubmitting}
                  className="btn-outline disabled:opacity-50"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Confirm & Submit to FIA'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}