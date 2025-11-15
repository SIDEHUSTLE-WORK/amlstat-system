// frontend/src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login); // 🔥 FIXED: Get login function from store
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 REAL API LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔥 FIXED: Use store's login function directly
      const success = await login(email, password);

      if (success) {
        const user = useAppStore.getState().currentUser;
        toast.success(`Welcome back, ${user?.name}!`);
        
        if (user?.role === 'fia_admin' || user?.role === 'fia_analyst') {
          navigate('/admin/dashboard');
        } else if (user?.role === 'org_admin' || user?.role === 'org_user') {
          navigate('/org/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid credentials. Please try again.');
        toast.error('Invalid credentials');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 🔥 LEFT SIDE - ULTRA SWEET ANIMATED GRADIENT! */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0A2647 0%, #144272 25%, #205295 50%, #2C74B3 75%, #0A2647 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
        }}
      >
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, rgba(236, 201, 75, 0.3) 50%, transparent 100%)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 8s ease infinite'
          }}
        />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-yellow-400/20"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo with glow effect */}
          <div className="flex items-center space-x-4 mb-8 animate-fade-in">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl relative"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
                boxShadow: '0 0 40px rgba(252, 211, 77, 0.5), 0 0 80px rgba(252, 211, 77, 0.3)'
              }}
            >
              <Shield className="w-12 h-12 text-white drop-shadow-lg" />
              <Sparkles className="w-4 h-4 text-white absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">FIA Uganda</h1>
              <p 
                className="text-xl font-bold mt-1"
                style={{
                  background: 'linear-gradient(90deg, #FCD34D, #FBBF24, #FCD34D)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s linear infinite'
                }}
              >
                Financial Intelligence Authority
              </p>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
            AML/CFT Statistics<br />
            <span 
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #FCD34D, #FBBF24, #F59E0B, #FBBF24, #FCD34D)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 4s linear infinite'
              }}
            >
              Management System
            </span>
          </h2>
          
          <p className="text-gray-100 text-xl mb-10 leading-relaxed drop-shadow-md">
            Secure access to Uganda's premier platform for Anti-Money Laundering and Counter-Financing of Terrorism compliance management.
          </p>
          
          <div className="space-y-5">
            {[
              'Real-time STR submission and tracking',
              'Multi-tenant organization management',
              'Advanced analytics and risk scoring',
              'FATF compliant reporting',
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex items-center space-x-4 animate-slide-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    boxShadow: '0 0 20px rgba(252, 211, 77, 0.4)'
                  }}
                >
                  <svg className="w-5 h-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-semibold text-lg drop-shadow-md">{feature}</span>
              </div>
            ))}
          </div>
          
          <div 
            className="mt-12 rounded-2xl p-6 shadow-2xl border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              borderColor: 'rgba(252, 211, 77, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(252, 211, 77, 0.1)'
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                  boxShadow: '0 0 20px rgba(252, 211, 77, 0.4)'
                }}
              >
                <AlertCircle className="w-6 h-6 text-blue-900" />
              </div>
              <span className="font-bold text-xl text-white">System Security</span>
            </div>
            <p className="text-gray-100 leading-relaxed">
              This system uses bank-grade encryption and multi-factor authentication to protect sensitive financial intelligence data.
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 RIGHT SIDE - CLEAN LOGIN WITH GRADIENT ACCENTS */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
              }}
            >
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-900">FIA Uganda</h1>
              <p className="text-yellow-600 text-sm font-semibold">Financial Intelligence Authority</p>
            </div>
          </div>
          
          <div 
            className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(10, 38, 71, 0.05)'
            }}
          >
            <h2 
              className="text-4xl font-bold mb-3"
              style={{
                background: 'linear-gradient(135deg, #0A2647 0%, #205295 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome Back
            </h2>
            <p className="text-gray-600 mb-8 text-lg">Sign in to access your dashboard</p>
            
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-800 font-medium"
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-800 font-medium"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 border-2 border-gray-300 rounded focus:ring-blue-500" 
                    disabled={loading} 
                    style={{ accentColor: '#0A2647' }} 
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-700">Remember me</span>
                </label>
                <button 
                  type="button"
                  className="text-sm font-bold transition-colors hover:underline"
                  style={{ 
                    background: 'linear-gradient(90deg, #0A2647, #205295)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
              
              {/* 🔥 GRADIENT SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #0A2647 0%, #144272 50%, #205295 100%)',
                  boxShadow: '0 8px 24px rgba(10, 38, 71, 0.3), 0 4px 12px rgba(10, 38, 71, 0.2)'
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #144272 0%, #205295 50%, #2C74B3 100%)',
                  }}
                />
                <span className="relative z-10 flex items-center space-x-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </span>
              </button>
            </form>
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-6 font-medium">
            Don't have an account? <span className="font-bold text-blue-900">Contact your administrator</span>
          </p>
        </div>
      </div>

      {/* 🔥 ADD KEYFRAME ANIMATIONS */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}