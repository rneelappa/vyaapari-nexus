#!/bin/bash

# Transfer Tally data from local Supabase to production Supabase
# This script exports data from local database and imports it to production

set -e

echo "🚀 Starting Tally data transfer to production Supabase..."

# Database connections
LOCAL_DB="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
PROD_DB="postgresql://postgres:RAJK22**kjar@db.hycyhnjsldiokfkpqzoz.supabase.co:5432/postgres"

# Create temporary directory for data export
TEMP_DIR="/tmp/tally_data_export"
mkdir -p "$TEMP_DIR"

echo "📊 Exporting data from local database..."

# Export company data
echo "  - Exporting company data..."
psql "$LOCAL_DB" -c "COPY mst_company TO STDOUT WITH CSV HEADER" > "$TEMP_DIR/mst_company.csv"

# Export division data
echo "  - Exporting division data..."
psql "$LOCAL_DB" -c "COPY mst_division TO STDOUT WITH CSV HEADER" > "$TEMP_DIR/mst_division.csv"

# Export ledger data
echo "  - Exporting ledger data..."
psql "$LOCAL_DB" -c "COPY mst_ledger TO STDOUT WITH CSV HEADER" > "$TEMP_DIR/mst_ledger.csv"

# Export group data
echo "  - Exporting group data..."
psql "$LOCAL_DB" -c "COPY mst_group TO STDOUT WITH CSV HEADER" > "$TEMP_DIR/mst_group.csv"

# Export voucher data
echo "  - Exporting voucher data..."
psql "$LOCAL_DB" -c "COPY trn_voucher TO STDOUT WITH CSV HEADER" > "$TEMP_DIR/trn_voucher.csv"

echo "📥 Importing data to production database..."

# Import company data
echo "  - Importing company data..."
psql "$PROD_DB" -c "COPY mst_company FROM STDIN WITH CSV HEADER" < "$TEMP_DIR/mst_company.csv"

# Import division data
echo "  - Importing division data..."
psql "$PROD_DB" -c "COPY mst_division FROM STDIN WITH CSV HEADER" < "$TEMP_DIR/mst_division.csv"

# Import ledger data
echo "  - Importing ledger data..."
psql "$PROD_DB" -c "COPY mst_ledger FROM STDIN WITH CSV HEADER" < "$TEMP_DIR/mst_ledger.csv"

# Import group data
echo "  - Importing group data..."
psql "$PROD_DB" -c "COPY mst_group FROM STDIN WITH CSV HEADER" < "$TEMP_DIR/mst_group.csv"

# Import voucher data
echo "  - Importing voucher data..."
psql "$PROD_DB" -c "COPY trn_voucher FROM STDIN WITH CSV HEADER" < "$TEMP_DIR/trn_voucher.csv"

echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "✅ Data transfer completed successfully!"
echo "📊 Verifying data in production database..."

# Verify data import
echo "  - Company count: $(psql "$PROD_DB" -t -c "SELECT COUNT(*) FROM mst_company;")"
echo "  - Division count: $(psql "$PROD_DB" -t -c "SELECT COUNT(*) FROM mst_division;")"
echo "  - Ledger count: $(psql "$PROD_DB" -t -c "SELECT COUNT(*) FROM mst_ledger;")"
echo "  - Group count: $(psql "$PROD_DB" -t -c "SELECT COUNT(*) FROM mst_group;")"
echo "  - Voucher count: $(psql "$PROD_DB" -t -c "SELECT COUNT(*) FROM trn_voucher;")"

echo "🎉 Tally data successfully transferred to production Supabase!"

