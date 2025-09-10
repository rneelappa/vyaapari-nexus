# Vyaapari ERP Staging Environment

This directory contains the staging environment for Vyaapari ERP with Supabase Edge Functions for Tally integration.

## 🏗️ Architecture

### Staging Setup
```
Tally Prime → NGROK → Supabase Edge Function → Production Supabase → UI
```

### Key Features
- ✅ No local Supabase dependency
- ✅ Supabase Edge Functions for Tally data loading
- ✅ Safe data isolation with prefixed tables
- ✅ Full and incremental sync support
- ✅ Comprehensive error handling
- ✅ Production-ready deployment

## 📁 Directory Structure

```
staging/
├── vyaapari-nexus-staging/          # Main ERP staging repository
│   ├── src/
│   │   ├── services/
│   │   │   └── tally-supabase-loader.ts    # Supabase function client
│   │   └── components/tally/
│   │       └── TallyLoader.tsx             # Tally loader UI component
│   └── supabase/
│       └── functions/
│           └── tally-loader/
│               └── index.ts                # Supabase Edge Function
├── deploy-staging.sh                       # Deployment script
├── SAFE_MIGRATION_INSTRUCTIONS.md         # Migration guide
└── README.md                               # This file
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase CLI
- Git

### 2. Deploy Staging Environment
```bash
# Run the deployment script
./deploy-staging.sh
```

### 3. Manual Setup (Alternative)
```bash
# Navigate to staging directory
cd vyaapari-nexus-staging

# Install dependencies
npm install

# Link Supabase (if not already linked)
supabase link --project-ref hycyhnjsldiokfkpqzoz

# Deploy functions
supabase functions deploy tally-loader

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` in the staging directory:
```env
VITE_SUPABASE_URL=https://hycyhnjsldiokfkpqzoz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Supabase Function Environment
Set in Supabase Dashboard → Functions → Environment Variables:
```
SUPABASE_URL=https://hycyhnjsldiokfkpqzoz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing

### 1. Test Tally Connection
- Navigate to `/tally/loader` in the UI
- Enter your Tally NGROK URL
- Click "Test" to verify connection

### 2. Test Data Loading
- Select sync type (Full/Incremental)
- Set date range for incremental sync
- Click "Load Tally Data"
- Verify data appears in the UI

### 3. Test Function Logs
```bash
# View function logs
supabase functions logs tally-loader

# Follow logs in real-time
supabase functions logs tally-loader --follow
```

## 📊 Data Flow

### 1. Tally Data Extraction
- Edge Function connects to Tally via NGROK
- Extracts Groups, Ledgers, Stock Items, and Vouchers
- Parses XML data into structured format

### 2. Data Processing
- Validates data integrity
- Applies company/division filtering
- Handles data type conversions

### 3. Database Storage
- Stores data in `tally_*` prefixed tables
- Uses upsert operations for data consistency
- Maintains referential integrity

### 4. UI Display
- Real-time data updates
- Pagination and filtering
- Error handling and user feedback

## 🛡️ Safety Features

### Data Isolation
- All Tally data in separate `tally_*` tables
- Company/Division ID filtering
- No impact on existing ERP data

### Error Handling
- Comprehensive error catching
- Graceful fallbacks
- Detailed error messages

### Rollback Support
- Git-based version control
- Function versioning
- Database backup procedures

## 🔄 Migration Process

### Phase 1: Staging Deployment
1. Deploy Supabase functions
2. Test thoroughly in staging
3. Verify all functionality

### Phase 2: Production Deployment
1. Merge changes to main branch
2. Deploy to production
3. Monitor for issues

### Phase 3: Cleanup
1. Remove old dependencies
2. Update documentation
3. Train users

## 📞 Support

### Common Issues
1. **Function deployment fails**: Check Supabase CLI and project access
2. **Tally connection fails**: Verify NGROK URL and Tally instance
3. **Data not loading**: Check function logs and database permissions

### Debug Commands
```bash
# Check function status
supabase functions list

# View function details
supabase functions describe tally-loader

# Test function locally
supabase functions serve tally-loader
```

## 📚 Documentation

- [Safe Migration Instructions](./SAFE_MIGRATION_INSTRUCTIONS.md)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Tally XML API](https://tallysolutions.com/developers/)

## ✅ Success Criteria

- [ ] Functions deploy successfully
- [ ] Tally connection works
- [ ] Data loads correctly
- [ ] UI displays data
- [ ] No local Supabase dependency
- [ ] Performance meets requirements
- [ ] Error handling works
- [ ] Monitoring is functional

## 🎯 Next Steps

1. Test staging environment thoroughly
2. Deploy to production
3. Monitor performance
4. Gather user feedback
5. Optimize as needed

---

**Note**: This staging environment is designed for safe testing and migration. Always test thoroughly before deploying to production.

