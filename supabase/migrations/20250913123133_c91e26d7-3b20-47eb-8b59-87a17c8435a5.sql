-- Add foreign key columns to mst_company table to link with companies and divisions
ALTER TABLE mst_company 
ADD COLUMN vyaapari_company_id UUID,
ADD COLUMN vyaapari_division_id UUID;

-- Add foreign key constraints
ALTER TABLE mst_company 
ADD CONSTRAINT fk_mst_company_vyaapari_company 
FOREIGN KEY (vyaapari_company_id) REFERENCES companies(id),
ADD CONSTRAINT fk_mst_company_vyaapari_division 
FOREIGN KEY (vyaapari_division_id) REFERENCES divisions(id);

-- Update the existing SKM Steels record with proper foreign keys
UPDATE mst_company 
SET vyaapari_company_id = '629f49fb-983e-4141-8c48-e1423b39e921',
    vyaapari_division_id = '37f3cc0c-58ad-4baf-b309-360116ffc3cd'
WHERE company_name = 'SKM Steels';