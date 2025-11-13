import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center">
      <div className="text-center text-white space-y-6 animate-fade-in px-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-fia-gold rounded-full mb-4">
          <span className="text-6xl">🇺🇬</span>
        </div>
        <h1 className="text-6xl font-bold mb-4">
          AML/CFT Statistics Portal
        </h1>
        <p className="text-2xl text-gray-200 mb-8">
          Financial Intelligence Authority - Uganda
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="bg-fia-gold hover:bg-fia-gold-light text-fia-navy px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
          >
            Sign In →
          </button>
        </div>
        <p className="text-sm text-gray-300 mt-8">
          📊 17 Government Organizations | 1,061 Indicators | 6 Months Data Collection
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Powered by Financial Intelligence Authority - Uganda
        </p>
      </div>
    </div>
  );
}
