# InvestX Demo

Real estate investment platform built with Next.js 15, TypeScript, and MongoDB.

## Development

### Starting the Development Server

```bash
npm run dev
```

### Cache Management

If you encounter build cache corruption issues (like "Cannot find module" errors), use these commands:

#### Quick Cache Clear
```bash
npm run dev:clean
```
Clears the `.next` cache and starts the dev server.

#### Full Cache Clear
```bash
npm run clean:full
```
Clears all caches including build outputs and node_modules cache.

#### Manual Cache Clearing
```bash
# Remove Next.js build cache
rm -rf .next

# Or on Windows PowerShell
Remove-Item -Recurse -Force .next

# Clear npm cache (if needed)
npm cache clean --force
```

### Common Issues

#### Build Cache Corruption
**Symptoms:** `Cannot find module './common-_ssr_components_ui_*'`
**Solution:** Run `npm run dev:clean` or manually delete `.next` folder

#### Port Already in Use
**Symptoms:** Port 3000 is in use
**Solution:** Server automatically switches to port 3001

#### MongoDB Connection Issues
**Symptoms:** Database connection errors
**Solution:** Check `.env.local` for correct MongoDB URI

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure MongoDB connection string
3. Set JWT secrets
4. Configure Cloudinary (optional)

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:clean` - Start dev server with fresh cache
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Clear build cache
- `npm run clean:full` - Clear all caches
- `npm run seed` - Seed database with test data
- `npm run create-admin` - Create admin user

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **UI:** Tailwind CSS + Shadcn/ui
- **State Management:** React Hooks