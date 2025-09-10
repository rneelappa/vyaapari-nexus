# Safe Migration Instructions for Vyaapari ERP

## Overview
This document provides safe migration instructions for deploying Tally integration using Supabase Edge Functions instead of local Supabase instances.

## 🏗️ Architecture

### Current Setup (Local)
```
Tally Prime → NGROK → Local Supabase → Backend API → UI
```

### New Setup (Production)
```
Tally Prime → NGROK → Supabase Edge Function → Production Supabase → UI
```

## 📁 Staging Environment Setup

### 1. Staging Folder Structure
```
staging/
├── vyaapari-nexus-staging/          # Main ERP staging
│   ├── src/
│   │   ├── services/
│   │   │   └── tally-supabase-loader.ts
│   │   └── components/tally/
│   │       └── TallyLoader.tsx
│   └── supabase/
│       └── functions/
│           └── tally-loader/
│               └── index.ts
└── SAFE_MIGRATION_INSTRUCTIONS.md
```

### 2. Git Workflow
```bash
# Development workflow
cd staging/vyaapari-nexus-staging
git checkout -b feature/tally-supabase-functions
# Make changes
git add .
git commit -m "feat: Add Supabase functions for Tally loader"
git push origin feature/tally-supabase-functions
# Create PR to main
```

## 🚀 Deployment Steps

### Step 1: Deploy Supabase Functions
```bash
# Navigate to staging directory
cd staging/vyaapari-nexus-staging

# Deploy the Tally loader function
supabase functions deploy tally-loader

# Verify deployment
supabase functions list
```

### Step 2: Update Environment Variables
```bash
# Add to .env.local
VITE_SUPABASE_URL=https://hycyhnjsldiokfkpqzoz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Step 3: Test Staging Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test Tally loader component
# Navigate to /tally/loader in the UI
```

### Step 4: Production Deployment
```bash
# Merge to main branch
git checkout main
git merge feature/tally-supabase-functions

# Deploy to production
npm run build
# Deploy to your hosting platform
```

## 🔧 Supabase Functions Configuration

### 1. Function Dependencies
The `tally-loader` function requires:
- `@supabase/supabase-js` for database operations
- Deno standard library for HTTP handling

### 2. Environment Variables
Set in Supabase Dashboard → Functions → Environment Variables:
```
SUPABASE_URL=https://hycyhnjsldiokfkpqzoz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Function Permissions
Ensure the function has access to:
- `tally_mst_group` table
- `tally_mst_ledger` table
- `tally_mst_stock_item` table
- `tally_trn_voucher` table

## 🛡️ Safety Measures

### 1. Data Isolation
- All Tally data stored in `tally_*` prefixed tables
- Company/Division ID filtering for data isolation
- No impact on existing ERP data

### 2. Error Handling
- Comprehensive error handling in Edge Functions
- Graceful fallbacks for failed operations
- Detailed logging for debugging

### 3. Rollback Plan
```bash
# If issues occur, rollback to previous version
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main

# Redeploy previous function version
supabase functions deploy tally-loader --version previous
```

## 📊 Monitoring and Logs

### 1. Function Logs
```bash
# View function logs
supabase functions logs tally-loader

# Follow logs in real-time
supabase functions logs tally-loader --follow
```

### 2. Database Monitoring
- Monitor `tally_*` table sizes
- Check for failed imports
- Verify data consistency

## 🧪 Testing Checklist

### Pre-Deployment
- [ ] Supabase function deploys successfully
- [ ] Function can connect to Tally instance
- [ ] Data parsing works correctly
- [ ] Database operations complete without errors
- [ ] UI components render properly

### Post-Deployment
- [ ] Full sync works correctly
- [ ] Incremental sync works correctly
- [ ] Data appears in UI
- [ ] No impact on existing functionality
- [ ] Performance is acceptable

## 🔄 Migration Process

### Phase 1: Preparation
1. Set up staging environment
2. Deploy Supabase functions
3. Test thoroughly in staging

### Phase 2: Deployment
1. Deploy to production
2. Monitor for issues
3. Verify data integrity

### Phase 3: Cleanup
1. Remove old local Supabase dependencies
2. Update documentation
3. Train users on new workflow

## 📞 Support and Troubleshooting

### Common Issues
1. **Function deployment fails**: Check Deno version and dependencies
2. **Tally connection fails**: Verify NGROK URL and Tally instance
3. **Data not appearing**: Check database permissions and RLS policies
4. **Performance issues**: Monitor function execution time and database queries

### Debug Commands
```bash
# Test function locally
supabase functions serve tally-loader

# Check function status
supabase functions list

# View function details
supabase functions describe tally-loader
```

## 📋 Rollback Procedures

### Emergency Rollback
1. Disable Tally loader function
2. Revert to previous UI version
3. Restore from database backup if needed
4. Investigate and fix issues
5. Re-deploy when ready

### Data Recovery
```sql
-- If data corruption occurs, restore from backup
-- (Backup procedures should be in place)
```

## ✅ Success Criteria

- [ ] Tally data loads successfully via Supabase functions
- [ ] No local Supabase dependency
- [ ] UI displays loaded data correctly
- [ ] Performance meets requirements
- [ ] No impact on existing functionality
- [ ] Users can perform full and incremental syncs
- [ ] Error handling works properly
- [ ] Monitoring and logging are functional

## 📚 Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Runtime Documentation](https://deno.land/manual)
- [Tally XML API Documentation](https://tallysolutions.com/developers/)
- [Vyaapari ERP Documentation](./prompt/DOCUMENTATION_INDEX.md)

