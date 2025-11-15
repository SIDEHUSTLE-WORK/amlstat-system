// frontend/src/pages/LandingPage.tsx
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  BarChart3, 
  Lock, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Building2,
  Shield,
  FileCheck,
  Globe,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fia-navy via-fia-navy-light to-fia-teal">
{/* 🔥 SLEEK & COMPACT NAVBAR! */}
<nav className="fixed w-full z-50 px-8 py-2 bg-gradient-to-r from-white via-white to-fia-gold/20 shadow-lg backdrop-blur-sm">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <div className="flex items-center space-x-3">
      {/* 🎯 SMALLER FIA LOGO! */}
      <div className="flex items-center space-x-2">
        <img 
          src="/fia-logo.png" 
          alt="FIA Uganda Logo" 
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextElement = e.currentTarget.nextElementSibling;
            if (nextElement) nextElement.classList.remove('hidden');
          }}
        />
        <Shield className="h-10 w-10 text-fia-navy hidden" />
        <div>
          <h1 className="text-base font-bold text-fia-navy">FIA Uganda</h1>
          <p className="text-[10px] text-fia-gold font-semibold">Financial Intelligence Authority</p>
        </div>
      </div>
    </div>
    <button
      onClick={() => navigate('/login')}
      className="bg-fia-navy hover:bg-fia-navy-light text-white px-5 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-xl"
    >
      Sign In
    </button>
  </div>
</nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 pt-32 pb-20">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-fia-gold/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
              <CheckCircle className="w-4 h-4 text-fia-gold" />
              <span className="text-fia-gold font-semibold text-sm">FIA Compliant System</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AML/CFT Statistics
              <br />
              <span className="text-fia-gold">Management System</span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Uganda's premier platform for managing Anti-Money Laundering and Counter-Financing of Terrorism compliance. 
              Empowering financial institutions with real-time reporting, analytics, and regulatory oversight.
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="bg-fia-gold hover:bg-fia-gold-light text-fia-navy px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-2xl flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="border-2 border-white text-white hover:bg-white hover:text-fia-navy px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
          
          {/* 🔥 TRUST BADGES - INSTEAD OF STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { icon: FileCheck, label: 'FATF Compliant', color: 'text-green-400' },
              { icon: Shield, label: 'Bank-Grade Security', color: 'text-blue-400' },
              { icon: Globe, label: 'Multi-Institution', color: 'text-purple-400' },
              { icon: Clock, label: '24/7 Monitoring', color: 'text-yellow-400' },
            ].map((badge, i) => (
              <div 
                key={i} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center animate-slide-up hover:bg-white/20 transition-all duration-300" 
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <badge.icon className={`w-12 h-12 ${badge.color} mx-auto mb-3`} />
                <div className="text-sm font-semibold text-white">{badge.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-fia-navy mb-4">Comprehensive AML/CFT Management</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to ensure compliance, detect suspicious activities, and protect Uganda's financial system
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: 'Multi-Tenant Support',
                description: 'Dedicated dashboards for Banks, Mobile Money Operators, MFIs, Forex Bureaus, SACCOs, and Insurance Companies',
                color: 'text-mmo'
              },
              {
                icon: Database,
                title: 'Real-Time Data Collection',
                description: 'Automated data ingestion via API or bulk upload. Instant synchronization across all stakeholders',
                color: 'text-bank'
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'ML-powered risk scoring, anomaly detection, and predictive analytics for proactive monitoring',
                color: 'text-mfi'
              },
              {
                icon: Shield,
                title: 'Bank-Grade Security',
                description: 'Multi-factor authentication, end-to-end encryption, and comprehensive audit trails',
                color: 'text-fia-teal'
              },
              {
                icon: Lock,
                title: 'Role-Based Access',
                description: 'Granular permissions for Super Admins, Analysts, Validators, and Organization Users',
                color: 'text-forex'
              },
              {
                icon: TrendingUp,
                title: 'Automated Reporting',
                description: 'Generate compliance reports on-demand or scheduled. Export in multiple formats (PDF, Excel, CSV)',
                color: 'text-sacco'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover border border-gray-100">
                <div className={`w-14 h-14 ${feature.color} bg-gray-50 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-fia-navy mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organizations Section - NO NUMBERS */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-fia-navy mb-4">Trusted by Leading Organizations</h2>
            <p className="text-xl text-gray-600">
              Serving all types of financial institutions across Uganda
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Mobile Money', color: 'bg-mmo' },
              { name: 'Banks', color: 'bg-bank' },
              { name: 'MFIs', color: 'bg-mfi' },
              { name: 'Forex Bureaus', color: 'bg-forex' },
              { name: 'SACCOs', color: 'bg-sacco' },
              { name: 'Insurance', color: 'bg-insurance' },
            ].map((org, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300">
                <div className={`w-16 h-16 ${org.color}/10 ${org.color.replace('bg-', 'text-')} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="text-lg font-bold text-fia-navy">{org.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-navy py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Enhance Your Compliance?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join hundreds of organizations using FIA's platform to ensure regulatory compliance and protect Uganda's financial system
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-fia-gold hover:bg-fia-gold-light text-fia-navy px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-2xl inline-flex items-center space-x-2"
          >
            <span>Access Your Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-fia-navy-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {/* Footer FIA Logo */}
                <img 
                  src="/fia-logo.png" 
                  alt="FIA Uganda Logo" 
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling;
                    if (nextElement) nextElement.classList.remove('hidden');
                  }}
                />
                <Shield className="h-12 w-12 text-fia-gold hidden" />
                <span className="font-bold text-lg">FIA Uganda</span>
              </div>
              <p className="text-gray-400 text-sm">
                Protecting Uganda's financial system through intelligence and compliance
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-fia-gold transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-fia-gold transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-fia-gold transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-fia-gold transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-fia-gold transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-fia-gold transition-colors">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                Plot 13, Clement Hill Road<br />
                Kampala, Uganda<br />
                info@fia.go.ug<br />
                +256 414 343 365
              </p>
            </div>
          </div>
          
          {/* 🔥 CTS CONCEPTS GLOBAL BRANDING */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <p className="text-center text-gray-400 text-sm">
                &copy; 2025 Financial Intelligence Authority - Uganda. All rights reserved.
              </p>
              
              {/* Built by CTS Concepts Global */}
              <a 
                href="https://www.ctsconceptsglobal.space" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-fia-gold transition-all duration-300 group"
              >
                <span className="text-sm font-medium">Built by</span>
                <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-300">
                  <img 
                    src="https://i.postimg.cc/cvpBZjDF/cts-logo.png" 
                    alt="CTS Concepts Global Logo" 
                    className="h-6 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm font-bold text-white">CTS Concepts Global</span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-fia-gold transition-colors" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}