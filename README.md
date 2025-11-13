# 🇺🇬 National AML/CFT Statistics Collection System

A comprehensive system for collecting and analyzing Anti-Money Laundering and Counter-Financing of Terrorism statistics across 17 government organizations in Uganda.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd aml-cft-statistics-system
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env .env.local
npm run dev
```

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

4. **Setup Database**
```bash
# Create database
createdb aml_cft_stats

# Run migrations
psql aml_cft_stats < database/schema.sql
psql aml_cft_stats < database/seed_organizations.sql
psql aml_cft_stats < database/seed_indicators.sql
```

## 📊 Organizations

The system supports 17 organizations:
- BOU (Bank of Uganda)
- CMA (Capital Markets Authority)
- IRA (Insurance Regulatory Authority)
- UMRA (Uganda Microfinance Regulatory Authority)
- URSB (Uganda Registration Services Bureau)
- And 12 more...

## 🎯 Features

- ✅ Monthly statistics collection (1,061 indicators)
- ✅ Auto-save functionality
- ✅ Real-time analytics dashboard
- ✅ Excel/PDF report generation
- ✅ Role-based access control
- ✅ Email notifications

## 📚 Documentation

See the `docs/` folder for detailed documentation.

## 🤝 Contributing

Built with ❤️ for Uganda's Financial Intelligence Authority

## 📝 License

Copyright © 2025 Financial Intelligence Authority - Uganda
