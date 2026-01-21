# Code Review Report - Meta Campaign Manager

**Reviewer**: Claude Sonnet 4.5
**Date**: 2026-01-20
**Project**: Meta Campaign Manager (Next.js 16 + FastAPI)
**Lines Reviewed**: ~3,200+ lines across 20+ critical files

---

## Executive Summary

**Overall Code Quality Score: 6.5/10**

| Category | Score | Status |
|----------|-------|--------|
| Code Quality | 6/10 | Needs Improvement |
| Maintainability | 5/10 | Critical Issues |
| Performance | 7/10 | Good |
| Security | 4/10 | Critical Issues |
| Type Safety | 7/10 | Good |
| Error Handling | 6/10 | Needs Improvement |

**Key Findings**:
- 274 console.log statements across 30 files (security risk)
- 150+ lines of duplicated logic between dashboard and analytics
- God Object pattern in `meta_api.py` (458 lines, 8 functions)
- Missing input validation in 60% of API routes
- No centralized error handling pattern
- Inadequate logger usage despite having a logger utility

**Estimated Technical Debt**: 15-20 developer days

---

## 1. CRITICAL ISSUES (Must Fix)

### 1.1 Security Vulnerabilities

#### 1.1.1 Excessive Console Logging (CRITICAL)
**Files Affected**: 30 files
**Occurrences**: 274 console.log/error/warn statements

**Impact**: Leaking sensitive data to browser console and server logs in production.

**Example Violations**:
```typescript
// ❌ BAD: /frontend/src/app/api/campaigns/route.ts (Line 48)
console.log('Buscando campanhas com filtro:', where);

// ❌ BAD: /frontend/src/app/api/campaigns/route.ts (Line 71)
console.log(`Encontradas ${campaigns.length} campanhas de ${total} total`);

// ❌ BAD: /frontend/src/app/api/dashboard/route.ts (Line 264)
console.error('Error fetching dashboard data:', error);

// ❌ BAD: /frontend/src/app/api/campaigns/[id]/duplicate/route.ts (Line 137)
console.error(`Erro ao duplicar campanha ${i + 1}:`, error);
```

**Fix**: Replace ALL console statements with the existing logger utility:

```typescript
// ✅ GOOD: Use existing logger from /lib/logger.ts
import { logger } from '@/lib/logger';

// Replace console.log
logger.info('Fetching campaigns', { filter: where });

// Replace console.error
logger.error('Failed to fetch dashboard data', error);

// Replace console.warn
logger.warn('Campaign duplication failed', error, { campaignId });
```

**Action Required**:
1. Search and replace all `console.log` → `logger.info`
2. Search and replace all `console.error` → `logger.error`
3. Search and replace all `console.warn` → `logger.warn`
4. Add pre-commit hook to prevent new console statements

**Priority**: CRITICAL (Fix before production deployment)

---

#### 1.1.2 Missing Input Validation
**Files Affected**: 8 API routes
**Risk Level**: HIGH

**Example Violations**:

```typescript
// ❌ BAD: /frontend/src/app/api/dashboard/route.ts (No validation)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  // No validation of query parameters
  const campaigns = await prisma.campaign.findMany({...});
}

// ❌ BAD: /frontend/src/app/api/campaigns/route.ts (Line 158)
const body = await request.json();
const { campaign, adSet, ad } = body;
// Minimal validation, no schema validation
```

**Fix**: Use Zod for comprehensive validation:

```typescript
// ✅ GOOD: Add Zod validation
import { z } from 'zod';

const createCampaignSchema = z.object({
  campaign: z.object({
    name: z.string().min(1).max(200),
    objective: z.enum(['OUTCOME_SALES', 'OUTCOME_LEADS', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT']),
    status: z.enum(['ACTIVE', 'PAUSED']).default('PAUSED'),
    dailyBudget: z.number().positive().optional(),
    lifetimeBudget: z.number().positive().optional(),
  }),
  adSet: z.object({
    name: z.string().min(1).max(200),
    dailyBudget: z.number().positive(),
    targeting: z.record(z.unknown()).optional(),
  }),
  ad: z.object({
    name: z.string().min(1).max(200).optional(),
    creative: z.record(z.unknown()).optional(),
    mediaUrl: z.string().url().optional(),
    mediaType: z.enum(['IMAGE', 'VIDEO']).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCampaignSchema.parse(body);
    // Use validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

**Action Required**:
1. Create validation schemas for all API routes
2. Add input sanitization for user-provided strings
3. Validate all query parameters
4. Add rate limiting validation

**Priority**: CRITICAL

---

### 1.2 Code Duplication

#### 1.2.1 Dashboard vs Analytics Routes (150+ Lines Duplicated)
**Files**:
- `/frontend/src/app/api/dashboard/route.ts` (271 lines)
- `/frontend/src/app/api/analytics/route.ts` (217 lines)

**Duplicated Logic**:
1. **Metric Calculation** (Lines 40-76 in dashboard, 69-119 in analytics)
2. **Date Filtering** (Lines 93-113 in dashboard, 27-47 in analytics)
3. **Trend Calculation** (Lines 192-232 in dashboard, 106-118 in analytics)
4. **Campaign Aggregation** (Lines 116-140 in dashboard, 157-164 in analytics)

**Impact**:
- Maintenance burden (fix bugs twice)
- Inconsistent calculations
- Higher test coverage requirements

**Example Duplication**:

```typescript
// ❌ DUPLICATED: Both files have identical metric reduction
// dashboard/route.ts (Line 56-59)
const monthSpend = monthMetrics.reduce((sum, m) => sum + m.spend, 0);
const monthImpressions = monthMetrics.reduce((sum, m) => sum + m.impressions, 0);
const monthClicks = monthMetrics.reduce((sum, m) => sum + m.clicks, 0);
const monthConversions = monthMetrics.reduce((sum, m) => sum + m.conversions, 0);

// analytics/route.ts (Line 71-78)
const totals = allMetrics.reduce(
  (acc, m) => ({
    spend: acc.spend + m.spend,
    impressions: acc.impressions + m.impressions,
    clicks: acc.clicks + m.clicks,
    conversions: acc.conversions + m.conversions,
  }),
  { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
);
```

**Fix**: Extract to shared service layer:

```typescript
// ✅ GOOD: /frontend/src/lib/metrics/calculator.ts
export interface MetricsSummary {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  reach?: number;
}

export class MetricsCalculator {
  static aggregate(metrics: CampaignMetric[]): MetricsSummary {
    return metrics.reduce(
      (acc, m) => ({
        spend: acc.spend + m.spend,
        impressions: acc.impressions + m.impressions,
        clicks: acc.clicks + m.clicks,
        conversions: acc.conversions + m.conversions,
      }),
      { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
    );
  }

  static calculateCTR(impressions: number, clicks: number): number {
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  }

  static calculateCPC(spend: number, clicks: number): number {
    return clicks > 0 ? spend / clicks : 0;
  }

  static calculateCPM(spend: number, impressions: number): number {
    return impressions > 0 ? (spend / impressions) * 1000 : 0;
  }

  static calculateROAS(revenue: number, spend: number): number {
    return spend > 0 ? revenue / spend : 0;
  }

  static calculateTrend(current: number, previous: number): number {
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }
}

// ✅ GOOD: /frontend/src/lib/metrics/date-filters.ts
export class DateFilters {
  static getLast7Days(): Date {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  static getLast30Days(): Date {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  static getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  static getDateRange(period: '7d' | '14d' | '30d' | '90d'): { start: Date; days: number } {
    const days = parseInt(period);
    return {
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      days,
    };
  }
}

// ✅ GOOD: Usage in dashboard/route.ts
import { MetricsCalculator } from '@/lib/metrics/calculator';
import { DateFilters } from '@/lib/metrics/date-filters';

export async function GET(request: NextRequest) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      userId: session.user.id,
      status: { not: 'ARCHIVED' },
    },
    include: {
      metrics: {
        where: { date: { gte: DateFilters.getLast30Days() } },
        orderBy: { date: 'desc' },
      },
    },
  });

  const allMetrics = campaigns.flatMap(c => c.metrics);
  const totals = MetricsCalculator.aggregate(allMetrics);
  const ctr = MetricsCalculator.calculateCTR(totals.impressions, totals.clicks);
  const roas = MetricsCalculator.calculateROAS(totals.conversions * 100, totals.spend);

  return NextResponse.json({ stats: { ...totals, ctr, roas } });
}
```

**Action Required**:
1. Create `/lib/metrics/calculator.ts` with MetricsCalculator class
2. Create `/lib/metrics/date-filters.ts` with DateFilters class
3. Refactor dashboard/route.ts to use shared utilities (remove 100+ lines)
4. Refactor analytics/route.ts to use shared utilities (remove 50+ lines)
5. Add unit tests for MetricsCalculator (target: 100% coverage)

**Priority**: CRITICAL (Maintainability)

---

#### 1.2.2 Reduce() Pattern Duplication
**Occurrences**: 15+ times across 5 files

**Example**:
```typescript
// ❌ DUPLICATED: Same pattern repeated everywhere
const totals = campaign.metrics.reduce(
  (acc, m) => ({
    spend: acc.spend + m.spend,
    impressions: acc.impressions + m.impressions,
    clicks: acc.clicks + m.clicks,
    conversions: acc.conversions + m.conversions,
  }),
  { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
);
```

Already addressed in MetricsCalculator solution above.

---

## 2. MAJOR ISSUES (Should Fix)

### 2.1 God Object - meta_api.py

**File**: `/backend/app/tools/meta_api.py`
**Size**: 458 lines, 8 functions
**Violation**: Single Responsibility Principle

**Issues**:
1. Mixing concerns: API client, error handling, pagination, validation
2. Duplicated error handling in every function
3. Hardcoded configuration (API version, timeouts)
4. No abstraction layer for HTTP client

**Current Structure**:
```python
# ❌ BAD: Everything in one file
def list_campaigns(...):  # 163 lines
def get_campaign_details(...):  # 31 lines
def create_campaign(...):  # 67 lines
def update_campaign_status(...):  # 35 lines
def duplicate_campaign(...):  # 116 lines
def get_campaign_insights(...):  # 54 lines
```

**Refactored Structure**:

```python
# ✅ GOOD: /backend/app/services/meta/client.py
from typing import Optional
import httpx
from app.config import settings

class MetaAPIClient:
    """Low-level Meta API HTTP client"""

    BASE_URL = "https://graph.facebook.com/v24.0"

    def __init__(self, access_token: str, ad_account_id: str):
        self.access_token = access_token
        self.ad_account_id = self._normalize_account_id(ad_account_id)

    def _normalize_account_id(self, account_id: str) -> str:
        """Ensure account ID has 'act_' prefix"""
        return account_id if account_id.startswith('act_') else f'act_{account_id}'

    def _get_headers(self) -> dict:
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.access_token}"}

    async def get(self, endpoint: str, params: dict = None, timeout: int = 30) -> dict:
        """Make GET request to Meta API"""
        url = f"{self.BASE_URL}/{endpoint}"
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                params=params,
                headers=self._get_headers(),
                timeout=timeout
            )
            return self._handle_response(response)

    async def post(self, endpoint: str, data: dict = None, json: dict = None, timeout: int = 30) -> dict:
        """Make POST request to Meta API"""
        url = f"{self.BASE_URL}/{endpoint}"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                data=data,
                json=json,
                headers=self._get_headers(),
                timeout=timeout
            )
            return self._handle_response(response)

    def _handle_response(self, response: httpx.Response) -> dict:
        """Handle Meta API response and errors"""
        data = response.json()

        if "error" in data:
            error = data["error"]
            error_code = error.get("code")
            error_message = error.get("message", "Unknown error")

            # Rate limiting
            if error_code == 80004 or "too many calls" in error_message.lower():
                raise MetaRateLimitError(error_message, error_code)

            raise MetaAPIError(error_message, error_code, error.get("error_subcode"))

        return data


# ✅ GOOD: /backend/app/services/meta/exceptions.py
class MetaAPIError(Exception):
    """Base exception for Meta API errors"""
    def __init__(self, message: str, code: int = None, subcode: int = None):
        self.message = message
        self.code = code
        self.subcode = subcode
        super().__init__(message)

class MetaRateLimitError(MetaAPIError):
    """Raised when rate limit is exceeded"""
    pass


# ✅ GOOD: /backend/app/services/meta/campaigns.py
from typing import Optional, List
from app.services.meta.client import MetaAPIClient
from app.services.meta.exceptions import MetaAPIError, MetaRateLimitError
from app.services.meta.pagination import PaginatedResult, Paginator

class CampaignService:
    """High-level campaign operations"""

    def __init__(self, client: MetaAPIClient):
        self.client = client

    async def list_campaigns(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        include_drafts: bool = True
    ) -> PaginatedResult:
        """List campaigns with pagination"""
        endpoint = f"{self.client.ad_account_id}/campaigns"

        params = {
            "fields": "id,name,objective,status,effective_status,daily_budget,lifetime_budget,created_time,updated_time",
            "limit": limit,
        }

        if status:
            params["filtering"] = f'[{{"field":"effective_status","operator":"IN","value":["{status}"]}}]'

        try:
            paginator = Paginator(self.client, endpoint, params)
            result = await paginator.fetch_all(max_pages=50)

            if not include_drafts:
                result.data = [
                    c for c in result.data
                    if c.get("effective_status") not in ["PREVIEW", "DRAFT"]
                    and c.get("status") != "PREPAUSED"
                ]

            return result
        except MetaRateLimitError as e:
            return PaginatedResult(
                data=[],
                success=False,
                error="Rate limit exceeded. Please try again later.",
            )
        except MetaAPIError as e:
            return PaginatedResult(
                data=[],
                success=False,
                error=str(e),
            )

    async def create_campaign(
        self,
        name: str,
        objective: str,
        status: str = "PAUSED",
        daily_budget: Optional[int] = None,
    ) -> dict:
        """Create new campaign"""
        endpoint = f"{self.client.ad_account_id}/campaigns"

        data = {
            "name": name,
            "objective": objective,
            "status": status,
            "special_ad_categories": [],
        }

        if daily_budget:
            data["daily_budget"] = daily_budget

        try:
            result = await self.client.post(endpoint, json=data)
            return {
                "success": True,
                "campaign_id": result.get("id"),
                "message": f"Campaign '{name}' created successfully!",
            }
        except MetaAPIError as e:
            return {
                "success": False,
                "error": str(e),
            }


# ✅ GOOD: /backend/app/services/meta/pagination.py
from dataclasses import dataclass
from typing import List, Optional
import asyncio

@dataclass
class PaginatedResult:
    data: List[dict]
    success: bool = True
    error: Optional[str] = None
    pages_fetched: int = 0
    has_more: bool = False

class Paginator:
    """Handle Meta API pagination"""

    def __init__(self, client, endpoint: str, params: dict):
        self.client = client
        self.endpoint = endpoint
        self.params = params

    async def fetch_all(self, max_pages: int = 50) -> PaginatedResult:
        """Fetch all pages up to max_pages"""
        all_data = []
        page_count = 0

        # First page
        data = await self.client.get(self.endpoint, self.params)
        all_data.extend(data.get("data", []))
        next_url = data.get("paging", {}).get("next")
        page_count = 1

        # Subsequent pages
        while next_url and page_count < max_pages:
            await asyncio.sleep(0.5)  # Rate limit protection

            try:
                data = await self.client.get(next_url)
                all_data.extend(data.get("data", []))
                next_url = data.get("paging", {}).get("next")
                page_count += 1
            except Exception as e:
                # Stop on error but return what we have
                break

        return PaginatedResult(
            data=all_data,
            pages_fetched=page_count,
            has_more=next_url is not None and page_count >= max_pages,
        )


# ✅ GOOD: /backend/app/services/meta/factory.py
from app.config import settings
from app.services.meta.client import MetaAPIClient
from app.services.meta.campaigns import CampaignService

def create_campaign_service() -> CampaignService:
    """Factory to create campaign service"""
    if not settings.meta_access_token:
        raise ValueError("META_ACCESS_TOKEN not configured")

    client = MetaAPIClient(
        access_token=settings.meta_access_token,
        ad_account_id=settings.meta_ad_account_id,
    )

    return CampaignService(client)


# ✅ GOOD: /backend/app/api/campaigns.py (simplified)
from app.services.meta.factory import create_campaign_service

@router.get("/")
async def get_campaigns(status: Optional[str] = None, limit: int = 50):
    """List campaigns"""
    service = create_campaign_service()
    result = await service.list_campaigns(status=status, limit=limit)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return {
        "success": True,
        "campaigns": result.data,
        "total": len(result.data),
        "pages_fetched": result.pages_fetched,
    }
```

**Benefits**:
1. Single Responsibility: Each class has one job
2. Easier testing: Mock MetaAPIClient in tests
3. Reusable: Client can be used for ad sets, ads, etc.
4. Consistent error handling
5. Configuration in one place

**Action Required**:
1. Create service layer structure
2. Migrate functions one by one
3. Add comprehensive unit tests
4. Update all consumers

**Priority**: HIGH (Maintainability, Testability)

---

### 2.2 Error Handling Issues

#### 2.2.1 Inconsistent Error Responses

**Issue**: Different error response formats across routes

```typescript
// ❌ INCONSISTENT: Different formats
// /api/dashboard/route.ts (Line 265-267)
return NextResponse.json(
  { error: 'Erro ao buscar dados do dashboard' },
  { status: 500 }
);

// /api/campaigns/route.ts (Line 135-143)
return NextResponse.json(
  {
    error: 'Erro ao buscar campanhas',
    details: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
  },
  { status: 500 }
);

// /api/analytics/route.ts (Line 210-214)
return NextResponse.json(
  { error: 'Erro ao buscar dados de analytics' },
  { status: 500 }
);
```

**Fix**: Standardize error response format:

```typescript
// ✅ GOOD: /frontend/src/lib/api/error-handler.ts
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: this.message,
      code: this.code,
      details: process.env.NODE_ENV === 'development' ? this.details : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: error.errors,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Unknown error
  logger.error('Unhandled API error', error);
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

// ✅ GOOD: Usage
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const campaigns = await prisma.campaign.findMany({...});
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Action Required**:
1. Create error handler utility
2. Update all API routes to use handleApiError
3. Create custom error classes (ValidationError, AuthError, etc.)

**Priority**: HIGH

---

#### 2.2.2 Missing Try-Catch in Client Components

**Files**: Multiple client components lack error boundaries

**Fix**: Add error boundaries and proper error handling:

```typescript
// ✅ GOOD: /frontend/src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground mt-2">{error.message}</p>
        <Button onClick={reset} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  );
}
```

**Priority**: MEDIUM

---

### 2.3 Type Safety Issues

#### 2.3.1 Usage of `any` Type
**Occurrences**: 7 across 3 files

```typescript
// ❌ BAD: /frontend/src/lib/logger.ts (Line 10)
function sanitize(data: any): any {
  // ...
}

// ❌ BAD: /frontend/src/app/(dashboard)/page.tsx (Line 203)
formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Gasto']}

// ❌ BAD: /frontend/src/app/(dashboard)/campaigns/page.tsx (Line 174)
const formattedCampaigns: Campaign[] = data.campaigns.map((camp: any) => ({
```

**Fix**: Use proper types:

```typescript
// ✅ GOOD: Generic type for sanitize
function sanitize<T>(data: T): T {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  // ... implementation
}

// ✅ GOOD: Recharts tooltip type
type TooltipValue = string | number | Array<string | number>;

formatter={(value: TooltipValue) => [
  `R$ ${Number(value).toFixed(2)}`,
  'Gasto'
]}

// ✅ GOOD: Define API response type
interface CampaignsApiResponse {
  campaigns: Array<{
    id: string;
    metaId?: string;
    name: string;
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
    objective: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    roas?: number;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const data: CampaignsApiResponse = await response.json();
const formattedCampaigns: Campaign[] = data.campaigns.map((camp) => ({...}));
```

**Priority**: MEDIUM

---

### 2.4 Performance Issues

#### 2.4.1 N+1 Query Pattern

**File**: `/frontend/src/app/api/campaigns/route.ts`

```typescript
// ❌ BAD: Fetching metrics separately for each campaign
const campaigns = await prisma.campaign.findMany({
  include: {
    metrics: { take: 7 },  // Could trigger N queries
    adSets: { select: { id: true } },  // Another N queries
  },
});
```

**Analysis**: Prisma handles this well with eager loading, but be cautious of deep nesting.

**Recommendation**: Monitor query performance with Prisma logging:

```typescript
// ✅ GOOD: Enable query logging in development
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});
```

**Priority**: MEDIUM (Monitor)

---

#### 2.4.2 Unnecessary Re-renders in Client Components

**File**: `/frontend/src/app/(dashboard)/campaigns/page.tsx`

**Issue**: State updates triggering multiple re-renders

```typescript
// ❌ POTENTIAL ISSUE: Multiple state updates
const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

const toggleCampaign = (campaignId: string) => {
  const newSelected = new Set(selectedCampaigns);  // Creates new Set every time
  if (newSelected.has(campaignId)) {
    newSelected.delete(campaignId);
  } else {
    newSelected.add(campaignId);
  }
  setSelectedCampaigns(newSelected);
};
```

**Fix**: Use useCallback to memoize:

```typescript
// ✅ GOOD: Memoize callbacks
import { useCallback } from 'react';

const toggleCampaign = useCallback((campaignId: string) => {
  setSelectedCampaigns((prev) => {
    const newSelected = new Set(prev);
    if (newSelected.has(campaignId)) {
      newSelected.delete(campaignId);
    } else {
      newSelected.add(campaignId);
    }
    return newSelected;
  });
}, []);
```

**Priority**: LOW (Optimization)

---

## 3. MINOR ISSUES (Nice to Have)

### 3.1 Magic Numbers

```typescript
// ❌ BAD: Magic numbers scattered throughout
const last7Days = Array.from({ length: 7 }, (_, i) => { ... });
const monthMetrics = await prisma.campaign.findMany({ take: 7 });
await asyncio.sleep(0.5);  // Python
```

**Fix**: Use named constants:

```typescript
// ✅ GOOD: /frontend/src/lib/constants.ts
export const METRICS_CONFIG = {
  LAST_N_DAYS: 7,
  LAST_N_DAYS_FOR_TRENDS: 30,
  MAX_PAGINATION_PAGES: 50,
  RATE_LIMIT_DELAY_MS: 500,
  DEFAULT_CAMPAIGN_LIMIT: 50,
} as const;
```

**Priority**: LOW

---

### 3.2 Component Size

**Large Components**:
- `/frontend/src/app/(dashboard)/page.tsx` - 597 lines
- `/frontend/src/app/(dashboard)/campaigns/page.tsx` - 826 lines

**Recommendation**: Extract sub-components:

```typescript
// ✅ GOOD: Break into smaller components
// /components/dashboard/MetricCard.tsx
// /components/dashboard/BudgetCard.tsx
// /components/dashboard/SpendingChart.tsx
// /components/dashboard/TopCampaignsCard.tsx
// /components/dashboard/AlertsCard.tsx
```

**Priority**: LOW (Maintainability)

---

### 3.3 Hardcoded Strings

```typescript
// ❌ BAD: Hardcoded error messages
return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
toast.error('Erro ao buscar campanhas');
```

**Fix**: Use i18n for localization:

```typescript
// ✅ GOOD: /lib/i18n/pt-BR.ts
export const translations = {
  errors: {
    unauthorized: 'Não autorizado',
    fetchCampaigns: 'Erro ao buscar campanhas',
    // ...
  },
};
```

**Priority**: LOW

---

## 4. CODE SMELLS

### 4.1 Feature Envy

**Example**: Campaigns page knows too much about campaign internal structure

```typescript
// ❌ SMELL: Component manipulating campaign data directly
const formattedCampaigns: Campaign[] = data.campaigns.map((camp: any) => ({
  id: camp.id,
  metaId: camp.metaId,
  name: camp.name,
  status: camp.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED',
  objective: camp.objective || 'UNKNOWN',
  spend: camp.spend || 0,
  impressions: camp.impressions || 0,
  clicks: camp.clicks || 0,
  ctr: camp.ctr || 0,
  roas: camp.roas || null,
}));
```

**Fix**: Move to data mapper:

```typescript
// ✅ GOOD: /lib/mappers/campaign-mapper.ts
export class CampaignMapper {
  static fromApi(apiCampaign: ApiCampaign): Campaign {
    return {
      id: apiCampaign.id,
      metaId: apiCampaign.metaId,
      name: apiCampaign.name,
      status: apiCampaign.status as CampaignStatus,
      objective: apiCampaign.objective || 'UNKNOWN',
      spend: apiCampaign.spend || 0,
      impressions: apiCampaign.impressions || 0,
      clicks: apiCampaign.clicks || 0,
      ctr: apiCampaign.ctr || 0,
      roas: apiCampaign.roas || null,
    };
  }
}
```

---

### 4.2 Primitive Obsession

**Example**: Using strings for status everywhere

```typescript
// ❌ SMELL: String literals scattered
if (campaign.status === 'ACTIVE') { ... }
if (status === 'PAUSED') { ... }
```

**Fix**: Use enums or const objects:

```typescript
// ✅ GOOD: /types/campaign.ts
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

// Usage
if (campaign.status === CampaignStatus.ACTIVE) { ... }
```

---

### 4.3 Long Parameter Lists

```python
# ❌ SMELL: Too many parameters
async def list_campaigns(
    status: Optional[str] = None,
    limit: int = 50,
    include_drafts: bool = True
) -> dict:
```

**Fix**: Use parameter object:

```python
# ✅ GOOD:
from dataclasses import dataclass

@dataclass
class CampaignListOptions:
    status: Optional[str] = None
    limit: int = 50
    include_drafts: bool = True

async def list_campaigns(options: CampaignListOptions) -> dict:
    # ...
```

---

## 5. BEST PRACTICES VIOLATIONS

### 5.1 Immutability Violations

**Violation**: Mutating state directly in some places

```typescript
// ❌ BAD: Direct mutation (though using Set correctly elsewhere)
const newSelected = new Set(selectedCampaigns);
newSelected.delete(campaignId);  // Mutation
```

**Note**: This is acceptable for `Set` since we create a new Set. No violation here.

---

### 5.2 Missing Repository Pattern

**Issue**: Direct Prisma usage in API routes

```typescript
// ❌ COUPLING: Routes tightly coupled to Prisma
export async function GET(request: NextRequest) {
  const campaigns = await prisma.campaign.findMany({...});
}
```

**Fix**: Introduce repository layer:

```typescript
// ✅ GOOD: /lib/repositories/campaign-repository.ts
export class CampaignRepository {
  async findByUserId(userId: string, filters: CampaignFilters): Promise<Campaign[]> {
    return prisma.campaign.findMany({
      where: {
        userId,
        status: filters.status,
        name: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
      },
      include: {
        metrics: { orderBy: { date: 'desc' }, take: 7 },
        adSets: { select: { id: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: filters.limit,
      skip: filters.offset,
    });
  }

  async countByUserId(userId: string, filters: CampaignFilters): Promise<number> {
    return prisma.campaign.count({
      where: {
        userId,
        status: filters.status,
        name: filters.search ? { contains: filters.search, mode: 'insensitive' } : undefined,
      },
    });
  }
}

// ✅ GOOD: Usage in route
export async function GET(request: NextRequest) {
  const session = await auth();
  const filters = parseFilters(request.nextUrl.searchParams);

  const repository = new CampaignRepository();
  const [campaigns, total] = await Promise.all([
    repository.findByUserId(session.user.id, filters),
    repository.countByUserId(session.user.id, filters),
  ]);

  return NextResponse.json({ campaigns, total });
}
```

**Priority**: LOW (Architecture improvement)

---

## 6. SECURITY REVIEW

### 6.1 Issues Found

1. ✅ **No SQL Injection**: Prisma ORM prevents SQL injection
2. ✅ **Authentication**: Using NextAuth properly
3. ❌ **CSRF Protection**: Missing CSRF tokens for state-changing operations
4. ❌ **Rate Limiting**: No rate limiting on API routes
5. ❌ **Input Validation**: Inadequate validation (covered in Critical section)

### 6.2 Recommendations

```typescript
// ✅ GOOD: Add rate limiting
// /lib/rate-limit.ts (already exists, use it!)
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const rateLimitResult = await rateLimit(ip);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

---

## 7. PRIORITY MATRIX

### Impact vs Effort

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Remove console.log statements | HIGH | LOW | CRITICAL |
| Add input validation (Zod) | HIGH | MEDIUM | CRITICAL |
| Extract duplicated metrics logic | HIGH | MEDIUM | CRITICAL |
| Refactor meta_api.py God Object | MEDIUM | HIGH | HIGH |
| Standardize error handling | MEDIUM | MEDIUM | HIGH |
| Add rate limiting | HIGH | LOW | HIGH |
| Fix type safety (any types) | LOW | LOW | MEDIUM |
| Extract large components | LOW | MEDIUM | LOW |
| Add i18n | LOW | HIGH | LOW |

---

## 8. TESTING GAPS

### Current Coverage: Unknown (No tests found)

**Critical Missing Tests**:

1. **Unit Tests**:
   - MetricsCalculator (once created)
   - DateFilters utility
   - CampaignMapper
   - Error handler

2. **Integration Tests**:
   - API routes (campaigns, dashboard, analytics)
   - Meta API service layer
   - Prisma repository layer

3. **E2E Tests**:
   - Campaign creation flow
   - Sync workflow
   - Dashboard metrics display

**Recommendation**: Achieve 80% coverage minimum

```typescript
// ✅ GOOD: Example test structure
// /tests/lib/metrics/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { MetricsCalculator } from '@/lib/metrics/calculator';

describe('MetricsCalculator', () => {
  describe('aggregate', () => {
    it('should sum all metrics correctly', () => {
      const metrics = [
        { spend: 100, impressions: 1000, clicks: 50, conversions: 5 },
        { spend: 200, impressions: 2000, clicks: 100, conversions: 10 },
      ];

      const result = MetricsCalculator.aggregate(metrics);

      expect(result).toEqual({
        spend: 300,
        impressions: 3000,
        clicks: 150,
        conversions: 15,
      });
    });

    it('should handle empty array', () => {
      const result = MetricsCalculator.aggregate([]);
      expect(result.spend).toBe(0);
    });
  });

  describe('calculateCTR', () => {
    it('should calculate CTR correctly', () => {
      const ctr = MetricsCalculator.calculateCTR(1000, 50);
      expect(ctr).toBe(5);
    });

    it('should return 0 when impressions is 0', () => {
      const ctr = MetricsCalculator.calculateCTR(0, 50);
      expect(ctr).toBe(0);
    });
  });
});
```

---

## 9. ACTION PLAN

### Phase 1: Critical Fixes (Week 1)

**Day 1-2**: Security & Console Logging
- [ ] Create `logger` wrapper utility (already exists, use it)
- [ ] Replace all 274 console statements with logger
- [ ] Add pre-commit hook to prevent console.log

**Day 3-4**: Input Validation
- [ ] Create Zod schemas for all API routes
- [ ] Add validation middleware
- [ ] Add rate limiting to all routes

**Day 5**: Code Duplication
- [ ] Create MetricsCalculator utility class
- [ ] Create DateFilters utility class
- [ ] Refactor dashboard/route.ts
- [ ] Refactor analytics/route.ts

### Phase 2: Major Improvements (Week 2)

**Day 1-3**: Refactor meta_api.py
- [ ] Create MetaAPIClient class
- [ ] Create service layer (CampaignService, etc.)
- [ ] Create pagination helper
- [ ] Add custom exceptions
- [ ] Migrate all functions

**Day 4-5**: Error Handling
- [ ] Create error handler utility
- [ ] Standardize error responses
- [ ] Add error boundaries to client components

### Phase 3: Testing & Documentation (Week 3)

**Day 1-3**: Unit Tests
- [ ] Test MetricsCalculator (100% coverage)
- [ ] Test DateFilters (100% coverage)
- [ ] Test error handler
- [ ] Test repositories

**Day 4-5**: Integration Tests
- [ ] Test API routes
- [ ] Test Meta API service layer
- [ ] Achieve 80% coverage overall

---

## 10. METRICS TRACKING

### Before Refactoring
- Lines of duplicated code: 150+
- Console.log statements: 274
- Test coverage: 0%
- Type safety violations (`any`): 7
- Average file size (API routes): 200 lines

### Target After Refactoring
- Lines of duplicated code: 0
- Console.log statements: 0
- Test coverage: 80%+
- Type safety violations: 0
- Average file size (API routes): 100 lines

---

## 11. CONCLUSION

The Meta Campaign Manager codebase demonstrates **solid architectural foundation** with Next.js 16 and FastAPI, but suffers from **maintainability and security issues** that need immediate attention.

**Strengths**:
- Modern tech stack (Next.js 16, TypeScript, Prisma, FastAPI)
- Good separation of concerns (frontend/backend)
- Proper authentication with NextAuth
- Responsive UI with shadcn/ui

**Critical Weaknesses**:
- 274 console.log statements leaking data
- 150+ lines of duplicated metric calculations
- Missing input validation
- God Object in meta_api.py
- No automated tests

**Immediate Actions**:
1. Replace all console statements with logger (1-2 days)
2. Add Zod validation to all routes (2-3 days)
3. Extract duplicated metrics logic (1 day)

**Long-term Improvements**:
1. Refactor meta_api.py into service layer (3-4 days)
2. Achieve 80% test coverage (5-7 days)
3. Add repository pattern (2-3 days)

**Estimated Effort**: 15-20 developer days to address all critical and major issues.

---

**Next Steps**:
1. Review this report with the team
2. Prioritize fixes based on impact/effort matrix
3. Create GitHub issues for each action item
4. Start with Phase 1 (Critical Fixes)

---

*Report generated by Claude Sonnet 4.5 - Code Review Agent*
*Date: 2026-01-20*
