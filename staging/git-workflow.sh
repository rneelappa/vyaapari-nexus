#!/bin/bash

# Git Workflow Script for Vyaapari ERP Staging
# This script helps manage git operations for the staging environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the staging directory
if [ ! -d "vyaapari-nexus-staging" ]; then
    print_error "vyaapari-nexus-staging directory not found!"
    print_status "Please run this script from the staging directory"
    exit 1
fi

cd vyaapari-nexus-staging

# Function to show current status
show_status() {
    print_status "Current Git Status:"
    git status --short
    echo
    print_status "Current Branch:"
    git branch --show-current
    echo
    print_status "Recent Commits:"
    git log --oneline -5
}

# Function to create a new feature branch
create_feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        print_error "Please provide a feature name"
        echo "Usage: $0 create-feature <feature-name>"
        exit 1
    fi
    
    print_status "Creating feature branch: feature/$feature_name"
    git checkout -b "feature/$feature_name"
    print_success "Feature branch created and checked out"
}

# Function to sync with main
sync_main() {
    print_status "Syncing with main branch..."
    git checkout main
    git pull origin main
    print_success "Synced with main branch"
}

# Function to commit changes
commit_changes() {
    local message=$1
    if [ -z "$message" ]; then
        print_error "Please provide a commit message"
        echo "Usage: $0 commit <message>"
        exit 1
    fi
    
    print_status "Adding all changes..."
    git add .
    
    print_status "Committing changes: $message"
    git commit -m "$message"
    print_success "Changes committed"
}

# Function to push changes
push_changes() {
    local branch=$(git branch --show-current)
    print_status "Pushing changes to origin/$branch..."
    git push origin "$branch"
    print_success "Changes pushed to remote"
}

# Function to create pull request
create_pr() {
    local branch=$(git branch --show-current)
    if [[ "$branch" == "main" ]]; then
        print_error "Cannot create PR from main branch"
        exit 1
    fi
    
    print_status "Creating pull request for $branch..."
    print_status "Please visit: https://github.com/rneelappa/vyaapari-nexus/compare/$branch"
    print_status "Or use GitHub CLI: gh pr create --title \"$branch\" --body \"Description of changes\""
}

# Function to merge feature branch
merge_feature() {
    local branch=$(git branch --show-current)
    if [[ "$branch" == "main" ]]; then
        print_error "Cannot merge from main branch"
        exit 1
    fi
    
    print_status "Merging $branch to main..."
    git checkout main
    git merge "$branch"
    git push origin main
    git branch -d "$branch"
    print_success "Feature branch merged and deleted"
}

# Function to deploy to staging
deploy_staging() {
    print_status "Deploying to staging..."
    ../deploy-staging.sh
}

# Main script logic
case "$1" in
    "status")
        show_status
        ;;
    "create-feature")
        create_feature "$2"
        ;;
    "sync")
        sync_main
        ;;
    "commit")
        commit_changes "$2"
        ;;
    "push")
        push_changes
        ;;
    "pr")
        create_pr
        ;;
    "merge")
        merge_feature
        ;;
    "deploy")
        deploy_staging
        ;;
    "help"|"")
        echo "Vyaapari ERP Git Workflow Script"
        echo
        echo "Usage: $0 <command> [options]"
        echo
        echo "Commands:"
        echo "  status                    Show current git status"
        echo "  create-feature <name>     Create a new feature branch"
        echo "  sync                      Sync with main branch"
        echo "  commit <message>          Commit changes with message"
        echo "  push                      Push changes to remote"
        echo "  pr                        Create pull request"
        echo "  merge                     Merge feature branch to main"
        echo "  deploy                    Deploy to staging"
        echo "  help                      Show this help message"
        echo
        echo "Examples:"
        echo "  $0 create-feature tally-supabase-functions"
        echo "  $0 commit \"feat: Add Supabase functions for Tally loader\""
        echo "  $0 push"
        echo "  $0 pr"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac

