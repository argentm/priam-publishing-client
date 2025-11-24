# Priam Publishing Client

Clean, simple Next.js 16 client application built with shadcn/ui.

## Structure

```
client/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx            # Dashboard layout wrapper
│   │   └── dashboard/page.tsx
│   ├── auth/signout/route.ts
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (redirects)
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   │   ├── dashboard-layout.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   └── shared/                   # Shared components
│
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts
│   │   └── server-client.ts
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── features/dashboard/       # Feature queries
│   │   └── queries.ts
│   ├── types/index.ts            # TypeScript types
│   ├── constants/index.ts        # Routes & constants
│   ├── utils.ts                  # cn() utility
│   └── utils/roles.ts            # Role utilities
│
└── middleware.ts                 # Next.js middleware
```

## Features

- ✅ Next.js 16 with App Router
- ✅ TypeScript
- ✅ shadcn/ui components
- ✅ Tailwind CSS v4
- ✅ Supabase authentication
- ✅ Clean, simple structure
- ✅ Type-safe API client
- ✅ Route groups for organization

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (defaults to http://localhost:3002)

3. Run development server:
```bash
npm run dev
```

## Adding Components

Use shadcn/ui CLI:
```bash
npx shadcn@latest add [component-name]
```

## Usage

### API Client (Server)
```tsx
import { createServerApiClient } from '@/lib/api/server-client';
const client = await createServerApiClient();
const data = await client.get('/api/dashboard');
```

### Constants
```tsx
import { ROUTES } from '@/lib/constants';
<Link href={ROUTES.WORKSPACE(id)}>Workspace</Link>
```

### Types
```tsx
import type { User, Workspace } from '@/lib/types';
```

