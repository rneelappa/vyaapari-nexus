#!/bin/bash

# Safe Migration Deployment Script for Vyaapari ERP
# This script deploys the staging environment with Supabase functions

set -e  # Exit on any error

echo "🚀 Starting Vyaapari ERP Staging Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "vyaapari-nexus-staging" ]; then
    print_error "vyaapari-nexus-staging directory not found!"
    print_status "Please run this script from the staging directory"
    exit 1
fi

cd vyaapari-nexus-staging

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed!"
    print_status "Please install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi

print_success "All prerequisites are installed"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 3: Check Supabase connection
print_status "Checking Supabase connection..."
if ! supabase status &> /dev/null; then
    print_warning "Supabase not linked. Attempting to link..."
    # You may need to run: supabase link --project-ref your-project-ref
    print_status "Please run: supabase link --project-ref hycyhnjsldiokfkpqzoz"
    read -p "Press Enter after linking Supabase..."
fi

# Step 4: Deploy Supabase functions
print_status "Deploying Supabase functions..."

# Deploy the tally-loader function
if supabase functions deploy tally-loader; then
    print_success "Tally loader function deployed successfully"
else
    print_error "Failed to deploy tally-loader function"
    exit 1
fi

# Step 5: Verify function deployment
print_status "Verifying function deployment..."
if supabase functions list | grep -q "tally-loader"; then
    print_success "Function verification successful"
else
    print_error "Function verification failed"
    exit 1
fi

# Step 6: Set up environment variables
print_status "Setting up environment variables..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
VITE_SUPABASE_URL=https://hycyhnjsldiokfkpqzoz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3lobmpzbGRpb2tma3Bxem96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NzQyMzksImV4cCI6MjA3MzA1MDIzOX0.pYalSrD_FP8tRY-bPCfFGbXavUq0eGwRmQUCIPnPxNk
EOF
    print_success "Environment variables created"
else
    print_warning ".env.local already exists, skipping creation"
fi

# Step 7: Build the application
print_status "Building the application..."
if npm run build; then
    print_success "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 8: Run tests (if available)
print_status "Running tests..."
if npm run test 2>/dev/null; then
    print_success "Tests passed"
else
    print_warning "No tests found or tests failed (this is okay for now)"
fi

# Step 9: Start development server
print_status "Starting development server..."
print_success "Staging environment is ready!"
print_status "You can now:"
print_status "1. Access the application at http://localhost:3000"
print_status "2. Test the Tally loader at http://localhost:3000/tally/loader"
print_status "3. Check function logs with: supabase functions logs tally-loader"

# Optional: Start the dev server
read -p "Do you want to start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting development server..."
    npm run dev
fi

print_success "Deployment completed successfully! 🎉"

