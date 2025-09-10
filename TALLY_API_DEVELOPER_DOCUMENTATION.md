# Tally API Developer Documentation
**Version**: 1.0  
**Last Updated**: 2025-09-10  
**Base URL**: `https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1`

## 🎯 **Overview**

The Tally API provides comprehensive access to Tally ERP data including ledgers, groups, stock items, vouchers, and more. All endpoints use a unified interface with action-based requests.

## 🔑 **Authentication**

### API Key
```
API Key: RAJK22**kjar
```

### Authentication Method
- **No JWT required** - Direct API key authentication
- **No Authorization header** - API key passed in request body
- **Content-Type**: `application/json`

## 📡 **Base Configuration**

### Endpoint
```
POST https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api
```

### Headers
```javascript
{
  'Content-Type': 'application/json'
}
```

### Request Body Structure
```javascript
{
  "api_key": "RAJK22**kjar",
  "action": "ACTION_NAME",
  "companyId": "your-company-id",
  "divisionId": "your-division-id",
  "filters": {
    "limit": 100,
    "offset": 0,
    "search": "optional-search-term",
    "dateFrom": "2024-01-01", // For vouchers
    "dateTo": "2024-12-31"    // For vouchers
  }
}
```

## 📚 **Available Actions**

### 1. Get Ledgers
Fetch account ledgers with optional filtering.

**Action**: `getLedgers`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return (default: 100)
- `offset` - Pagination offset (default: 0)
- `search` - Search term for ledger names

**Example Request**:
```javascript
const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: "RAJK22**kjar",
    action: "getLedgers",
    companyId: "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
    divisionId: "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
    filters: {
      limit: 100,
      offset: 0,
      search: "Cash"
    }
  })
});
```

**Response Format**:
```json
{
  "data": [
    {
      "guid": "tally-ledger-1757511095435-1",
      "company_id": "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
      "division_id": "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
      "name": "3C ENGINEERING",
      "parent": "Sundry Debtors",
      "_parent": "",
      "alias": "",
      "description": "",
      "notes": "",
      "is_revenue": null,
      "is_deemedpositive": null,
      "opening_balance": 0,
      "closing_balance": 0,
      "mailing_name": "",
      "mailing_address": "",
      "mailing_state": "",
      "mailing_country": "",
      "mailing_pincode": "",
      "email": "",
      "it_pan": "",
      "gstn": "",
      "gst_registration_type": "",
      "gst_supply_type": "",
      "gst_duty_head": "",
      "tax_rate": 0,
      "bank_account_holder": "",
      "bank_account_number": "",
      "bank_ifsc": "",
      "bank_swift": "",
      "bank_name": "",
      "bank_branch": "",
      "bill_credit_period": 0
    }
  ],
  "count": 10
}
```

### 2. Get Groups
Fetch account groups with optional filtering.

**Action**: `getGroups`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return
- `offset` - Pagination offset
- `search` - Search term for group names

**Example Request**:
```javascript
const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: "RAJK22**kjar",
    action: "getGroups",
    companyId: "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
    divisionId: "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
    filters: {
      limit: 50,
      offset: 0,
      search: "Assets"
    }
  })
});
```

### 3. Get Stock Items
Fetch inventory stock items with optional filtering.

**Action**: `getStockItems`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return
- `offset` - Pagination offset
- `search` - Search term for item names

**Example Request**:
```javascript
const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: "RAJK22**kjar",
    action: "getStockItems",
    companyId: "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
    divisionId: "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
    filters: {
      limit: 100,
      offset: 0,
      search: "Product"
    }
  })
});
```

### 4. Get Vouchers
Fetch transaction vouchers with optional filtering and date range.

**Action**: `getVouchers`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return
- `offset` - Pagination offset
- `search` - Search term for voucher types
- `dateFrom` - Start date (YYYY-MM-DD format)
- `dateTo` - End date (YYYY-MM-DD format)

**Example Request**:
```javascript
const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: "RAJK22**kjar",
    action: "getVouchers",
    companyId: "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
    divisionId: "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
    filters: {
      limit: 200,
      offset: 0,
      search: "INV",
      dateFrom: "2024-01-01",
      dateTo: "2024-12-31"
    }
  })
});
```

### 5. Get Cost Centers
Fetch cost centers with optional filtering.

**Action**: `getCostCenters`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return
- `offset` - Pagination offset
- `search` - Search term for cost center names

### 6. Get Godowns
Fetch warehouse/location data with optional filtering.

**Action**: `getGodowns`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return
- `offset` - Pagination offset
- `search` - Search term for godown names

### 7. Get Employees
Fetch employee data with optional filtering.

**Action**: `getEmployees`

**Required Parameters**:
- `companyId` - Company UUID
- `divisionId` - Division UUID

**Optional Filters**:
- `limit` - Number of records to return
- `offset` - Pagination offset
- `search` - Search term for employee names

## 🔧 **Common Parameters**

### Company and Division IDs
Use the provided company and division IDs for testing:

**Working IDs**:
- `companyId`: `bc90d453-0c64-4f6f-8bbe-dca32aba40d1`
- `divisionId`: `b38bfb72-3dd7-4aa5-b970-71b919d5ded4`

**New IDs** (for testing):
- `companyId`: `629f49fb-983e-4141-8c48-e1423b39e921`
- `divisionId`: `37f3cc0c-58ad-4baf-b309-360116ffc3cd`

### Filter Parameters
All endpoints support these optional filters:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `limit` | number | Maximum records to return | 100 |
| `offset` | number | Pagination offset | 0 |
| `search` | string | Search term for names | "" |
| `dateFrom` | string | Start date (YYYY-MM-DD) | null |
| `dateTo` | string | End date (YYYY-MM-DD) | null |

## 📊 **Response Format**

All endpoints return a consistent response format:

```json
{
  "data": [...], // Array of records
  "count": 10    // Number of records returned
}
```

## 🚀 **Usage Examples**

### JavaScript/Node.js
```javascript
async function fetchTallyData(action, companyId, divisionId, filters = {}) {
  const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: "RAJK22**kjar",
      action: action,
      companyId: companyId,
      divisionId: divisionId,
      filters: filters
    })
  });
  
  return await response.json();
}

// Usage examples
const ledgers = await fetchTallyData('getLedgers', 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1', 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4', {
  limit: 50,
  search: 'Cash'
});

const vouchers = await fetchTallyData('getVouchers', 'bc90d453-0c64-4f6f-8bbe-dca32aba40d1', 'b38bfb72-3dd7-4aa5-b970-71b919d5ded4', {
  limit: 100,
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});
```

### React/TypeScript
```typescript
interface TallyApiResponse<T> {
  data: T[];
  count: number;
}

interface TallyApiFilters {
  limit?: number;
  offset?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

class TallyApiService {
  private apiKey = 'RAJK22**kjar';
  private baseUrl = 'https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api';

  async fetchData<T>(
    action: string,
    companyId: string,
    divisionId: string,
    filters: TallyApiFilters = {}
  ): Promise<TallyApiResponse<T>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        action,
        companyId,
        divisionId,
        filters
      })
    });

    return await response.json();
  }

  async getLedgers(companyId: string, divisionId: string, filters?: TallyApiFilters) {
    return this.fetchData('getLedgers', companyId, divisionId, filters);
  }

  async getGroups(companyId: string, divisionId: string, filters?: TallyApiFilters) {
    return this.fetchData('getGroups', companyId, divisionId, filters);
  }

  async getStockItems(companyId: string, divisionId: string, filters?: TallyApiFilters) {
    return this.fetchData('getStockItems', companyId, divisionId, filters);
  }

  async getVouchers(companyId: string, divisionId: string, filters?: TallyApiFilters) {
    return this.fetchData('getVouchers', companyId, divisionId, filters);
  }
}
```

### Python
```python
import requests
import json

class TallyApiClient:
    def __init__(self):
        self.api_key = "RAJK22**kjar"
        self.base_url = "https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api"
    
    def fetch_data(self, action, company_id, division_id, filters=None):
        if filters is None:
            filters = {}
        
        payload = {
            "api_key": self.api_key,
            "action": action,
            "companyId": company_id,
            "divisionId": division_id,
            "filters": filters
        }
        
        response = requests.post(
            self.base_url,
            headers={'Content-Type': 'application/json'},
            data=json.dumps(payload)
        )
        
        return response.json()
    
    def get_ledgers(self, company_id, division_id, filters=None):
        return self.fetch_data('getLedgers', company_id, division_id, filters)
    
    def get_groups(self, company_id, division_id, filters=None):
        return self.fetch_data('getGroups', company_id, division_id, filters)
    
    def get_stock_items(self, company_id, division_id, filters=None):
        return self.fetch_data('getStockItems', company_id, division_id, filters)
    
    def get_vouchers(self, company_id, division_id, filters=None):
        return self.fetch_data('getVouchers', company_id, division_id, filters)

# Usage
client = TallyApiClient()
ledgers = client.get_ledgers(
    'bc90d453-0c64-4f6f-8bbe-dca32aba40d1',
    'b38bfb72-3dd7-4aa5-b970-71b919d5ded4',
    {'limit': 50, 'search': 'Cash'}
)
```

## ⚠️ **Error Handling**

### Common Error Responses
```json
{
  "error": "permission denied for table mst_ledger"
}
```

### Error Handling Example
```javascript
try {
  const response = await fetch('https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: "RAJK22**kjar",
      action: "getLedgers",
      companyId: "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
      divisionId: "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
      filters: {}
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Success:', data);
  } else {
    console.error('Error:', data.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

## 🔒 **Security Notes**

- **API Key**: Keep the API key secure and don't expose it in client-side code
- **HTTPS**: All requests must be made over HTTPS
- **Rate Limiting**: Be mindful of rate limits for production use
- **Data Privacy**: Ensure compliance with data privacy regulations

## 📞 **Support**

For technical support or questions about the Tally API:
- **API Key**: `RAJK22**kjar`
- **Base URL**: `https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api`
- **Status**: ✅ Production Ready

## 🎉 **Quick Start**

1. **Get your company and division IDs**
2. **Use the API key**: `RAJK22**kjar`
3. **Make a POST request** to the base URL
4. **Include the action** and required parameters
5. **Handle the response** data

**Example**:
```bash
curl -X POST "https://hycyhnjsldiokfkpqzoz.supabase.co/functions/v1/tally-api" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "RAJK22**kjar",
    "action": "getLedgers",
    "companyId": "bc90d453-0c64-4f6f-8bbe-dca32aba40d1",
    "divisionId": "b38bfb72-3dd7-4aa5-b970-71b919d5ded4",
    "filters": {"limit": 10}
  }'
```

The Tally API is **fully functional** and **ready for production use**! 🚀
