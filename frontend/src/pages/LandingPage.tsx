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
  Shield
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fia-navy via-fia-navy-light to-fia-teal">
      {/* 🔥 SLEEK NAVBAR WITH GRADIENT FADE! */}
      <nav className="fixed w-full z-50 px-8 py-3 bg-gradient-to-r from-white via-white to-fia-gold/20 shadow-lg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* 🎯 BIG LOGO! */}
            <img 
              src="https://i.ibb.co/HTGMYb1J/fia-logo.png" 
              alt="FIA Uganda Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                // Fallback to Shield icon if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <Shield className="w-14 h-14 text-fia-gold hidden" />
            <div>
              <h1 className="text-xl font-bold text-fia-navy">FIA Uganda</h1>
              <p className="text-xs text-fia-gold font-semibold">Financial Intelligence Authority</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-fia-navy hover:bg-fia-navy-light text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-300 hover:shadow-xl"
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
              <button className="border-2 border-white text-white hover:bg-white hover:text-fia-navy px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { label: 'Active Organizations', value: '284+' },
              { label: 'Reports Processed', value: '45K+' },
              { label: 'Compliance Rate', value: '96.5%' },
              { label: 'Response Time', value: '<24h' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl font-bold text-fia-gold mb-2">{stat.value}</div>
                <div className="text-sm text-gray-200">{stat.label}</div>
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

      {/* Organizations Section */}
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
              { name: 'Mobile Money', count: '5', color: 'bg-mmo' },
              { name: 'Banks', count: '25', color: 'bg-bank' },
              { name: 'MFIs', count: '64', color: 'bg-mfi' },
              { name: 'Forex Bureaus', count: '130', color: 'bg-forex' },
              { name: 'SACCOs', count: '48', color: 'bg-sacco' },
              { name: 'Insurance', count: '12', color: 'bg-insurance' },
            ].map((org, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300">
                <div className={`w-12 h-12 ${org.color}/10 ${org.color.replace('bg-', 'text-')} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-fia-navy mb-1">{org.count}+</div>
                <div className="text-sm text-gray-600">{org.name}</div>
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
                {/* Footer logo stays same size */}
                <img 
                  src="https://i.ibb.co/HTGMYb1J/fia-logo.png" 
                  alt="FIA Uganda Logo" 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Shield className="w-8 h-8 text-fia-gold hidden" />
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
                Plot 1234, Kampala Road<br />
                Kampala, Uganda<br />
                info@fia.go.ug<br />
                +256 312 000 000
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Financial Intelligence Authority - Uganda. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}