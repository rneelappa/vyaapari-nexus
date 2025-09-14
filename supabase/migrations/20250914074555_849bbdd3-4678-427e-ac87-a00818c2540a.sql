-- Create a function to get voucher counts by account group
CREATE OR REPLACE FUNCTION get_voucher_counts_by_group(p_company_id uuid, p_division_id uuid)
RETURNS TABLE (
  group_name text,
  voucher_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH voucher_ledgers AS (
    -- Get vouchers with their associated ledgers through accounting entries
    SELECT DISTINCT 
      v.guid as voucher_guid,
      a.ledger as ledger_name
    FROM tally_trn_voucher v
    LEFT JOIN trn_accounting a ON v.guid = a.voucher_guid
    WHERE (v.company_id = p_company_id OR v.company_id IS NULL)
      AND (v.division_id = p_division_id OR v.division_id IS NULL)
      AND a.ledger IS NOT NULL AND a.ledger != ''
    
    UNION
    
    -- Also include vouchers with party ledger names
    SELECT DISTINCT
      v.guid as voucher_guid,
      v.party_ledger_name as ledger_name
    FROM tally_trn_voucher v
    WHERE (v.company_id = p_company_id OR v.company_id IS NULL)
      AND (v.division_id = p_division_id OR v.division_id IS NULL)
      AND v.party_ledger_name IS NOT NULL AND v.party_ledger_name != ''
  ),
  ledger_groups AS (
    -- Map ledgers to their groups
    SELECT DISTINCT
      vl.voucher_guid,
      CASE 
        WHEN l.parent IS NOT NULL AND l.parent != '' THEN l.parent
        ELSE 'Ungrouped'
      END as group_name
    FROM voucher_ledgers vl
    LEFT JOIN mst_ledger l ON vl.ledger_name = l.name
    WHERE (l.company_id = p_company_id OR l.company_id IS NULL)
      AND (l.division_id = p_division_id OR l.division_id IS NULL)
  )
  SELECT 
    lg.group_name::text,
    COUNT(DISTINCT lg.voucher_guid) as voucher_count
  FROM ledger_groups lg
  WHERE lg.group_name IS NOT NULL
  GROUP BY lg.group_name
  ORDER BY lg.group_name;
END;
$$;