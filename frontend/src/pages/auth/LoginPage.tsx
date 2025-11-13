import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        // Check role and navigate accordingly
        const user = useAppStore.getState().currentUser;
        if (user?.role === 'fia_admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/organization/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fia-navy via-fia-navy-light to-fia-teal flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-fia-gold rounded-full mb-4 shadow-xl">
            <span className="text-5xl">🇺🇬</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            AML/CFT Statistics Portal
          </h1>
          <p className="text-gray-200 text-lg">Financial Intelligence Authority - Uganda</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-fia-navy mr-3" />
            <h2 className="text-2xl font-bold text-fia-navy">Sign In</h2>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent transition-all"
                  placeholder="user@organization.go.ug"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-fia-teal focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fia-navy hover:bg-fia-navy-light text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4 font-semibold">
              Test Credentials:
            </p>
            <div className="space-y-3 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-bold text-blue-900 mb-1">FIA Admin:</p>
                <p className="text-blue-800">📧 admin@fia.go.ug</p>
                <p className="text-blue-800">🔑 admin123</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="font-bold text-green-900 mb-1">Any Organization:</p>
                <p className="text-green-800">📧 user@[org-code].go.ug</p>
                <p className="text-green-800">🔑 password123</p>
                <p className="text-green-700 text-xs mt-1">Example: user@bou.go.ug</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-200 text-sm mt-8">
          © 2025 Financial Intelligence Authority - Uganda
        </p>
      </div>
    </div>
  );
}