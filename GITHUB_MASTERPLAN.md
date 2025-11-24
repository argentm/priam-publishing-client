# GitHub Masterplan - Priam Publishing

## Repository Structure

This project is organized into **two separate repositories** to maintain clear separation of concerns:

### 1. Client Repository
**URL**: `git@github.com:argentm/priam-publishing-client.git`  
**Technology**: Next.js 14+ (App Router), React, TypeScript  
**Purpose**: Frontend application and user interface

### 2. Server Repository
**URL**: `git@github.com:argentm/priam-publishing-server.git`  
**Technology**: Express.js, TypeScript, Node.js  
**Purpose**: Backend API and business logic

---

## Project Overview

**Priam Publishing** is a SaaS platform for managing music publishing workflows, including:
- User and account management
- Works, Tracks, and Contracts management
- Payees and royalty management
- Admin dashboard for system administration

---

## Repository Details

### Client Repository (`priam-publishing-client`)

#### Structure
```
client/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # User dashboard routes
│   └── admin/             # Admin panel routes
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Shadcn UI components
├── lib/                   # Utilities and helpers
│   ├── api/               # API client
│   ├── constants/         # App constants
│   ├── features/          # Feature-specific code
│   ├── supabase/          # Supabase client setup
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── middleware.ts          # Next.js middleware
└── package.json           # Dependencies

```

#### Key Features
- **Authentication**: Login/signup with Supabase Auth
- **Dashboard**: User account and workspace management
- **Admin Panel**: System administration (Users, Accounts, Works, Tracks, Contracts)
- **UI Components**: Shadcn UI component library
- **Type Safety**: Full TypeScript coverage

#### Current Version
- **v0.2.0** - Admin tables implementation

#### Main Branch
- `main` - Production-ready code

---

### Server Repository (`priam-publishing-server`)

#### Structure
```
server/
├── src/                   # TypeScript source code
│   ├── routes/           # API route handlers
│   │   ├── admin.ts      # Admin routes
│   │   ├── auth.ts       # Authentication routes
│   │   ├── contracts.ts  # Contract management
│   │   ├── dashboard.ts  # Dashboard data
│   │   ├── payees.ts     # Payee management
│   │   ├── tracks.ts     # Track management
│   │   └── works.ts      # Work management
│   ├── middleware/       # Express middleware
│   │   └── auth.ts       # Authentication middleware
│   ├── config/           # Configuration files
│   │   └── supabase.ts   # Supabase client
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Application entry point
├── __tests__/            # Test files
│   ├── admin.test.ts     # Admin route tests
│   ├── api.test.ts       # API integration tests
│   └── health.test.ts    # Health check tests
├── migrations/           # Database migrations
├── lib/                  # Utility libraries
│   ├── csv-export.js     # CSV export functionality
│   ├── csv-import.js     # CSV import functionality
│   └── curve-mapper.js   # Curve mapping utilities
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

#### Key Features
- **RESTful API**: Express.js API server
- **Authentication**: JWT-based auth with Supabase
- **Admin Routes**: System administration endpoints
- **Database**: PostgreSQL via Supabase
- **Testing**: Jest test suite
- **Type Safety**: Full TypeScript coverage

#### Current Version
- **v1.1.0** - Admin tables implementation

#### Main Branch
- `main` - Production-ready code

---

## Development Workflow

### Branch Strategy

Both repositories follow a similar branching strategy:

```
main                    # Production branch (protected)
├── develop             # Development branch (optional)
└── feature/*           # Feature branches
```

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style changes (formatting, etc.)
refactor: Code refactoring
test:     Test additions/changes
chore:    Build process or auxiliary tool changes
```

**Examples**:
- `feat: Add Spotify OAuth signup`
- `fix: Admin redirect after login`
- `docs: Update API documentation`
- `refactor: Simplify authentication middleware`

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/spotify-oauth
   ```

2. **Make Changes and Commit**
   ```bash
   git add .
   git commit -m "feat: Add Spotify OAuth signup"
   ```

3. **Push to Remote**
   ```bash
   git push origin feature/spotify-oauth
   ```

4. **Create Pull Request**
   - Use GitHub web interface
   - Add description of changes
   - Request review
   - Link related issues

5. **Review and Merge**
   - Address review comments
   - Ensure tests pass
   - Merge to `main` after approval

---

## Setup Instructions

### Client Setup

```bash
# Clone repository
git clone git@github.com:argentm/priam-publishing-client.git
cd priam-publishing-client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - API server URL (default: http://localhost:3001)

### Server Setup

```bash
# Clone repository
git clone git@github.com:argentm/priam-publishing-server.git
cd priam-publishing-server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations (if needed)
# Migrations are handled by Supabase

# Run development server
npm run dev

# Run tests
npm test
```

**Environment Variables**:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

---

## CI/CD Strategy

### Recommended Setup

#### Client Repository
- **Build**: Next.js build verification
- **Lint**: ESLint checks
- **Type Check**: TypeScript compilation
- **Deploy**: Vercel/Netlify (recommended for Next.js)

#### Server Repository
- **Build**: TypeScript compilation
- **Test**: Jest test suite
- **Lint**: ESLint checks
- **Deploy**: Railway/Render/DigitalOcean (Node.js hosting)

### GitHub Actions (Recommended)

Create `.github/workflows/ci.yml` in each repository:

**Client**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

**Server**:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
```

---

## Versioning Strategy

### Semantic Versioning

Both repositories follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Version Sync

- **Client**: Currently v0.2.0
- **Server**: Currently v1.1.0

Versions don't need to match, but major changes should be coordinated.

---

## Documentation

### Client Documentation
- `README.md` - Setup and usage
- `docs/` - Additional documentation (if needed)

### Server Documentation
- `README.md` - Setup and usage
- `docs/TESTING.md` - Testing guide
- `docs/admin-tables-implementation.md` - Feature documentation
- `CHANGELOG.md` - Version history

### Shared Documentation
- `docs/GITHUB_MASTERPLAN.md` - This document
- `docs/Project_Plan.md` - Overall project plan
- `docs/TODO.md` - Task tracking

---

## Security Best Practices

### Repository Security

1. **Branch Protection**
   - Protect `main` branch
   - Require pull request reviews
   - Require status checks to pass
   - Require up-to-date branches

2. **Secrets Management**
   - Never commit `.env` files
   - Use GitHub Secrets for CI/CD
   - Rotate API keys regularly
   - Use environment-specific credentials

3. **Dependencies**
   - Regularly update dependencies
   - Use `npm audit` to check vulnerabilities
   - Enable Dependabot alerts

### Code Security

1. **Authentication**
   - Always verify JWT tokens
   - Use HTTP-only cookies for tokens
   - Implement proper session management

2. **Authorization**
   - Check admin privileges server-side
   - Validate user permissions
   - Use middleware for route protection

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before database queries
   - Use parameterized queries

---

## Issue Tracking

### Issue Labels

Recommended labels for both repositories:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `question` - Further information needed
- `help wanted` - Extra attention needed
- `good first issue` - Good for newcomers
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

### Issue Templates

Create `.github/ISSUE_TEMPLATE/` in each repository:

**bug_report.md**:
```markdown
## Bug Description
## Steps to Reproduce
## Expected Behavior
## Actual Behavior
## Environment
## Additional Context
```

**feature_request.md**:
```markdown
## Feature Description
## Use Case
## Proposed Solution
## Alternatives Considered
## Additional Context
```

---

## Release Process

### Creating a Release

1. **Update Version**
   ```bash
   # Update package.json version
   npm version patch|minor|major
   ```

2. **Update CHANGELOG.md**
   - Document all changes
   - Group by type (Added, Changed, Fixed)

3. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.0
   ```

4. **Create Pull Request**
   - Review changes
   - Run tests
   - Merge to `main`

5. **Create GitHub Release**
   - Tag the release: `v1.2.0`
   - Add release notes from CHANGELOG
   - Attach any relevant artifacts

---

## Collaboration Guidelines

### Code Review

- **Be Constructive**: Provide helpful feedback
- **Be Respectful**: Maintain professional tone
- **Be Thorough**: Check logic, tests, and documentation
- **Be Responsive**: Respond to reviews promptly

### Communication

- Use GitHub Issues for bug reports
- Use GitHub Discussions for questions
- Use Pull Requests for code changes
- Keep commit messages clear and descriptive

---

## Current Status

### Completed ✅
- Admin tables implementation (Works, Tracks, Contracts)
- TypeScript error fixes
- Admin redirect fix
- Initial repository setup
- Documentation structure

### In Progress 🟡
- Spotify OAuth integration (pending)
- Runtime test fixes (pending)
- Old test file cleanup (pending)

### Planned 📋
- Enhanced admin features
- UI improvements
- Advanced filtering
- Export functionality

---

## Quick Reference

### Repository URLs
- **Client**: `git@github.com:argentm/priam-publishing-client.git`
- **Server**: `git@github.com:argentm/priam-publishing-server.git`

### Key Commands

**Client**:
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

**Server**:
```bash
npm run dev      # Start dev server
npm test         # Run tests
npm run build    # Build TypeScript
```

### Important Files
- `.gitignore` - Git ignore rules
- `package.json` - Dependencies and scripts
- `README.md` - Setup instructions
- `CHANGELOG.md` - Version history

---

## Support

For questions or issues:
1. Check existing documentation
2. Search GitHub Issues
3. Create a new Issue with details
4. Tag relevant team members

---

**Last Updated**: 2024-12-XX  
**Maintained by**: Development Team

