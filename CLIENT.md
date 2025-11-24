# Priam Publishing - Client Documentation

> **Version**: 0.2.0  
> **Stack**: Next.js 16.0.3 | React 19.2.0 | TypeScript | Tailwind CSS 4 | Shadcn UI  
> **Last Updated**: November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Core Concepts](#core-concepts)
6. [Authentication](#authentication)
7. [API Integration](#api-integration)
8. [Components](#components)
9. [Admin Panel](#admin-panel)
10. [Styling & Theming](#styling--theming)
11. [SaaS Features Roadmap](#saas-features-roadmap)
12. [Development Guidelines](#development-guidelines)
13. [Deployment](#deployment)

---

## Overview

Priam Publishing Client is the frontend application for a **music publishing SaaS platform**. It provides:

- **User Dashboard**: Account management, works, tracks, contracts
- **Admin Panel**: System-wide administration for super users
- **Multi-tenancy**: Users can belong to multiple accounts/workspaces
- **Role-based Access**: Owner, Admin, Member roles per account

### Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Complete | Supabase Auth with JWT |
| User Dashboard | ✅ Complete | Account overview, navigation |
| Admin Panel | ✅ Complete | Users, Accounts, Works, Tracks, Contracts, Composers |
| Works Management | ✅ Complete | CRUD with creation wizard |
| Tracks Management | ✅ Complete | CRUD operations |
| Contracts Management | ✅ Complete | CRUD operations |
| Composers Management | ✅ Complete | CRUD operations |
| Spotify OAuth | 🔴 Pending | Social login via Spotify |
| Stripe Billing | 🔴 Planned | Subscription management |
| Real-time Updates | 🔴 Planned | Supabase Realtime |

---

## Architecture

### Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Next.js 16)                     │
├─────────────────────────────────────────────────────────────┤
│  App Router │ React 19 │ TypeScript │ Tailwind CSS 4        │
├─────────────────────────────────────────────────────────────┤
│                    Shadcn UI Components                      │
├─────────────────────────────────────────────────────────────┤
│  Supabase Auth (Browser) │ API Client (Server/Browser)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                       │
│                    Port: 3001                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE                                  │
│         PostgreSQL │ Auth │ Storage │ Realtime              │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Server Components**: Fetch data directly using `createServerApiClient()`
2. **Client Components**: Use browser API client with `'use client'` directive
3. **Authentication**: JWT tokens passed via cookies (HTTP-only) and Authorization headers

### Multi-tenancy Model

```
User (1) ──────┬────── (N) Accounts
               │
               ├── Account 1 (Owner)
               │    ├── Works
               │    ├── Tracks
               │    ├── Contracts
               │    └── Composers
               │
               └── Account 2 (Member)
                    └── Read-only access
```

---

## Project Structure

```
client/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group (no layout)
│   │   ├── login/page.tsx            # Login page
│   │   └── signup/page.tsx           # Signup page
│   │
│   ├── (dashboard)/                  # User dashboard route group
│   │   ├── layout.tsx                # Dashboard layout wrapper
│   │   └── dashboard/page.tsx        # Main dashboard
│   │
│   ├── admin/                        # Admin panel routes
│   │   ├── layout.tsx                # Admin layout
│   │   ├── dashboard/page.tsx        # Admin dashboard
│   │   ├── users/page.tsx            # User management
│   │   ├── accounts/                 # Account management
│   │   │   ├── page.tsx              # List accounts
│   │   │   └── [id]/page.tsx         # Account detail
│   │   ├── works/                    # Works management
│   │   │   ├── page.tsx              # List works
│   │   │   ├── new/page.tsx          # Create work wizard
│   │   │   └── [id]/page.tsx         # Edit work
│   │   ├── tracks/                   # Tracks management
│   │   ├── contracts/                # Contracts management
│   │   └── composers/                # Composers management
│   │
│   ├── auth/signout/route.ts         # Signout API route
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home (redirects based on role)
│   └── globals.css                   # Global styles (Tailwind)
│
├── components/
│   ├── ui/                           # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   │
│   ├── layout/                       # Layout components
│   │   ├── dashboard-layout.tsx      # User dashboard layout
│   │   ├── admin-layout.tsx          # Admin panel layout
│   │   ├── header.tsx                # User header
│   │   ├── admin-header.tsx          # Admin header
│   │   ├── sidebar.tsx               # User sidebar
│   │   └── admin-sidebar.tsx         # Admin sidebar
│   │
│   └── admin/                        # Admin-specific components
│       ├── account-actions.tsx       # Account CRUD actions
│       ├── account-editor.tsx        # Account edit form
│       ├── work-actions.tsx          # Work CRUD actions
│       ├── work-editor.tsx           # Work edit form
│       ├── work-creation-wizard.tsx  # Multi-step work creation
│       ├── track-actions.tsx         # Track CRUD actions
│       ├── track-editor.tsx          # Track edit form
│       ├── contract-actions.tsx      # Contract CRUD actions
│       ├── contract-editor.tsx       # Contract edit form
│       ├── composer-actions.tsx      # Composer CRUD actions
│       ├── composer-editor.tsx       # Composer edit form
│       └── user-editor.tsx           # User edit form
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Browser API client
│   │   └── server-client.ts          # Server component API client
│   │
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client
│   │   └── middleware.ts             # Middleware Supabase client
│   │
│   ├── constants/
│   │   └── index.ts                  # Routes, API endpoints, constants
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   │
│   ├── features/
│   │   └── dashboard/queries.ts      # Dashboard data fetching
│   │
│   ├── utils/
│   │   └── roles.ts                  # Role utilities
│   │
│   └── utils.ts                      # cn() utility for classnames
│
├── middleware.ts                     # Next.js middleware (auth protection)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── components.json                   # Shadcn UI config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- Running server (port 3001)

### Installation

```bash
# Clone and navigate
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Server
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Core Concepts

### Next.js 16 Patterns

#### Dynamic Route Parameters (IMPORTANT!)

In Next.js 16, dynamic route params are **Promises** and must be awaited:

```tsx
// ✅ CORRECT - Next.js 16
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Use id...
}

// ❌ WRONG - Will cause errors
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params; // params.id will be undefined!
}
```

#### Server vs Client Components

```tsx
// Server Component (default) - Can fetch data directly
export default async function Page() {
  const client = await createServerApiClient();
  const data = await client.get('/api/data');
  return <div>{data}</div>;
}

// Client Component - For interactivity
'use client';
export default function Button() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### API Response Format

Admin API routes return **wrapped objects**:

```typescript
// API returns: { work: Work }
interface WorkResponse {
  work: Work;
}

// Extract the entity
const response = await client.get<WorkResponse>(API_ENDPOINTS.ADMIN_WORK(id));
return response.work; // Not response directly!
```

---

## Authentication

### Flow

1. User logs in via `/login` page
2. Supabase Auth creates session
3. JWT token stored in HTTP-only cookie
4. Server validates token on each request
5. Admin users redirected to `/admin/dashboard`
6. Regular users redirected to `/dashboard`

### Middleware Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect unauthenticated users
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### Admin Check

```tsx
// Check admin status
const { data: user } = await supabase
  .from('users')
  .select('is_admin')
  .eq('id', session.user.id)
  .single();

if (user?.is_admin) {
  redirect('/admin/dashboard');
}
```

---

## API Integration

### Server Components (Recommended)

```tsx
import { createServerApiClient } from '@/lib/api/server-client';
import { API_ENDPOINTS } from '@/lib/constants';

export default async function WorksPage() {
  const client = await createServerApiClient();
  
  try {
    const { works, total } = await client.get(API_ENDPOINTS.ADMIN_WORKS);
    return <WorksTable works={works} total={total} />;
  } catch (error) {
    return <ErrorMessage error={error} />;
  }
}
```

### Client Components

```tsx
'use client';
import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';

export function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    const client = new ApiClient();
    await client.delete(API_ENDPOINTS.ADMIN_WORK(id));
    router.refresh();
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

### Constants

```typescript
// lib/constants/index.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_WORKS: '/admin/works',
  ADMIN_WORK: (id: string) => `/admin/works/${id}`,
  // ...
} as const;

export const API_ENDPOINTS = {
  ADMIN_WORKS: '/api/admin/works',
  ADMIN_WORK: (id: string) => `/api/admin/works/${id}`,
  ADMIN_WORKS_STATS: '/api/admin/works/stats',
  // ...
} as const;
```

---

## Components

### Shadcn UI

Add new components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add select
npx shadcn@latest add sheet
```

### Admin Components Pattern

```tsx
// components/admin/entity-actions.tsx
'use client';

interface EntityActionsProps {
  entity: Entity;
  showViewButton?: boolean;
  onDeleted?: () => void;
}

export function EntityActions({ entity, showViewButton = true, onDeleted }: EntityActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    setIsDeleting(true);
    try {
      const client = new ApiClient();
      await client.delete(API_ENDPOINTS.ADMIN_ENTITY(entity.id));
      onDeleted?.();
      router.refresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {showViewButton && (
        <Link href={ROUTES.ADMIN_ENTITY(entity.id)}>
          <Button variant="outline" size="sm">View</Button>
        </Link>
      )}
      <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
      <EntityEditor entity={entity} open={showEditor} onOpenChange={setShowEditor} />
    </div>
  );
}
```

### Editor Pattern (Sheet)

```tsx
// components/admin/entity-editor.tsx
'use client';

export function EntityEditor({ entity, open, onOpenChange }: EntityEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: entity.name });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const client = new ApiClient();
      await client.put(API_ENDPOINTS.ADMIN_ENTITY(entity.id), formData);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Entity</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
```

---

## Admin Panel

### Routes

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Overview with stats |
| `/admin/users` | User management |
| `/admin/accounts` | Account management |
| `/admin/accounts/[id]` | Account detail with deletion validation |
| `/admin/works` | Works list |
| `/admin/works/new` | Create work wizard |
| `/admin/works/[id]` | Edit work |
| `/admin/tracks` | Tracks list |
| `/admin/contracts` | Contracts list |
| `/admin/composers` | Composers list |

### Dashboard Stats

```tsx
// Fetch stats from multiple endpoints
const [usersStats, accountsStats, worksStats, tracksStats, contractsStats] = await Promise.all([
  client.get(API_ENDPOINTS.ADMIN_USERS_STATS),
  client.get(API_ENDPOINTS.ADMIN_ACCOUNTS_STATS),
  client.get(API_ENDPOINTS.ADMIN_WORKS_STATS),
  client.get(API_ENDPOINTS.ADMIN_TRACKS_STATS),
  client.get(API_ENDPOINTS.ADMIN_CONTRACTS_STATS),
]);
```

### Deletion Validation

Accounts cannot be deleted if they have content:

```tsx
// Server checks for related entities
const counts = await getAccountCounts(accountId);
if (counts.works > 0 || counts.tracks > 0 || counts.composers > 0 || counts.contracts > 0) {
  return res.status(400).json({
    error: 'Bad Request',
    message: `Cannot delete account with existing content: ${worksCount} work(s), ${tracksCount} track(s)...`
  });
}
```

---

## Styling & Theming

### Tailwind CSS 4

```css
/* globals.css */
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

### Component Variants

```tsx
// Using cva for variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

---

## SaaS Features Roadmap

### Phase 1: Core SaaS Infrastructure 🔴 Priority

| Feature | Description | Status |
|---------|-------------|--------|
| **Stripe Integration** | Subscription billing, usage-based pricing | Planned |
| **Pricing Tiers** | Free, Pro, Enterprise plans | Planned |
| **Usage Limits** | Works, Tracks, Storage per plan | Planned |
| **Onboarding Flow** | Guided setup for new users | Planned |
| **Billing Portal** | Manage subscriptions, invoices | Planned |

### Phase 2: Authentication Enhancements 🟡

| Feature | Description | Status |
|---------|-------------|--------|
| **Spotify OAuth** | Sign in with Spotify | Pending |
| **Google OAuth** | Sign in with Google | Planned |
| **Apple OAuth** | Sign in with Apple | Planned |
| **2FA** | Two-factor authentication | Planned |
| **SSO** | Enterprise single sign-on | Planned |

### Phase 3: Collaboration Features 🟡

| Feature | Description | Status |
|---------|-------------|--------|
| **Team Invites** | Invite users via email | Planned |
| **Role Management** | Custom roles and permissions | Planned |
| **Activity Log** | Audit trail for all actions | Planned |
| **Comments** | Comments on works/tracks | Planned |
| **Notifications** | Email and in-app notifications | Planned |

### Phase 4: Advanced Features 🟢

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Sync** | Supabase Realtime for live updates | Planned |
| **File Uploads** | Audio files, documents | Planned |
| **Reporting** | Analytics dashboard | Planned |
| **CSV Export** | Export data to CSV | Planned |
| **API Access** | Public API for integrations | Planned |
| **Webhooks** | Event notifications | Planned |

### Phase 5: Enterprise Features 🟢

| Feature | Description | Status |
|---------|-------------|--------|
| **White-labeling** | Custom branding | Planned |
| **Custom Domains** | Vanity URLs | Planned |
| **SLA** | Service level agreements | Planned |
| **Priority Support** | Dedicated support | Planned |
| **Data Residency** | Regional data storage | Planned |

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode, no `any` types
- **Components**: Prefer server components, use `'use client'` only when needed
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Use `@/` alias for absolute imports

### File Naming

```
page.tsx          # Page components
layout.tsx        # Layout components
loading.tsx       # Loading UI
error.tsx         # Error boundary
not-found.tsx     # 404 page
route.ts          # API routes
```

### Component Structure

```tsx
// 1. Imports
import { ... } from 'react';
import { ... } from '@/lib/...';

// 2. Types
interface Props {
  // ...
}

// 3. Component
export function Component({ prop }: Props) {
  // 3a. Hooks
  const [state, setState] = useState();
  
  // 3b. Derived state
  const computed = useMemo(() => ..., []);
  
  // 3c. Effects
  useEffect(() => ..., []);
  
  // 3d. Handlers
  const handleClick = () => ...;
  
  // 3e. Render
  return <div>...</div>;
}
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Docker

```dockerfile
# Dockerfile.client
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Quick Reference

### Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npx shadcn@latest add [component]  # Add UI component
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/constants/index.ts` | Routes and API endpoints |
| `lib/api/server-client.ts` | Server-side API client |
| `lib/api/client.ts` | Browser API client |
| `middleware.ts` | Auth protection |
| `app/page.tsx` | Home redirect logic |

### Common Patterns

```tsx
// Fetch data in server component
const client = await createServerApiClient();
const data = await client.get(API_ENDPOINTS.ENDPOINT);

// Navigate programmatically
const router = useRouter();
router.push(ROUTES.DESTINATION);
router.refresh(); // Refresh server components

// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const client = new ApiClient();
  await client.post(API_ENDPOINTS.ENDPOINT, formData);
};
```

---

**Maintained by**: Development Team  
**Repository**: `priam-publishing-client`

