/**
 * VT Types Index
 * 
 * Main export file for all VT types and interfaces
 * Generated on: 2025-09-20T20:45:31.645Z
 */

// Core interfaces
export * from './interfaces';

// Additional interfaces
export * from './additional-interfaces';

// Utility types
export * from './utilities';

// Enums and constants
export * from './enums';

/**
 * Type guard to check if a table name is a valid VT table
 */
export function isVtTable(tableName: string): tableName is VtTableName {
  return tableName.startsWith('vt_');
}

/**
 * Get table information by name
 */
export function getVtTableInfo(tableName: VtTableName): VtTableInfo | undefined {
  return VT_TABLES.find(table => table.name === tableName);
}

/**
 * Get tables by category
 */
export function getVtTablesByCategory(category: VtTableCategory): VtTableInfo[] {
  return VT_TABLES.filter(table => table.category === category);
}
