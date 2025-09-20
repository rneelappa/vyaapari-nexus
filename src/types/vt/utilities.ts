/**
 * VT Utility Types
 * 
 * Common utility types and interfaces for VT system
 * Generated on: 2025-09-20T20:45:31.630Z
 */


/**
 * Base interface for all multi-tenant entities
 */
export interface VtMultiTenantBase {
  /** Multi-tenant company identifier */
  company_id: string;
  /** Multi-tenant division identifier */
  division_id: string;
}

/**
 * Base interface for entities with Tally GUID
 */
export interface VtTallyBase extends VtMultiTenantBase {
  /** Tally GUID for external system integration */
  guid: string;
}

/**
 * Base interface for entities with timestamps
 */
export interface VtTimestampBase {
  /** Record creation timestamp */
  created_at: string;
  /** Record last update timestamp */
  updated_at: string;
}

/**
 * Complete base interface for VT entities
 */
export interface VtEntityBase extends VtTallyBase, VtTimestampBase {
  /** Primary key identifier */
  id: string;
}

/**
 * Filter options for VT queries
 */
export interface VtQueryFilters {
  company_id?: string;
  division_id?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
}

/**
 * Pagination response wrapper
 */
export interface VtPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/**
 * API response wrapper
 */
export interface VtApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

