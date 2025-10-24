# Development Workflow Guide

This guide explains how to work with this project effectively across different development machines.

## Initial Setup

1. **Prerequisites:**
   - Node.js 20+
   - PostgreSQL 16+
   - Git
   - VS Code (recommended)
   - Cloudflare Workers CLI (wrangler)

2. **VS Code Extensions:**
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense

## Local Development Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/OmniversalMediaLLC/reincarnated2resist.git
   cd reincarnated2resist
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   ```bash
   # Create database
   createdb hawkeye_site

   # Import sample data
   psql hawkeye_site < database-export.sql
   ```

4. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Update credentials for your local environment
   - Never commit `.env` file

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Before Starting Work:**
   ```bash
   git checkout main
   git pull origin main
   npm install # If dependencies changed
   npm run db:push # If schema changed
   ```

2. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **During Development:**
   - Run `npm run dev` for local server
   - Check TypeScript errors: `npm run check`
   - Test database changes: `npm run db:push`

4. **Committing Changes:**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request:**
   - Go to GitHub repository
   - Create PR from your branch to main
   - Wait for CI checks to pass
   - Request review

## Database Changes

1. **Making Schema Changes:**
   - Edit `shared/schema.ts`
   - Run `npm run db:push`
   - Commit changes to Git

2. **Data Migration:**
   - Create migration in `migrations/`
   - Test locally
   - Include in PR

## Testing

1. **Local Testing:**
   - TypeScript: `npm run check`
   - Database: Test schema changes locally first
   - API: Use Postman/curl to test endpoints

2. **CI/CD Pipeline:**
   - Runs automatically on PR
   - Checks TypeScript
   - Tests database migrations
   - Builds project

## Deployment

1. **Automatic (via GitHub):**
   - Merge PR to main
   - CI/CD deploys to Cloudflare

2. **Manual:**
   ```bash
   npm run build
   npx wrangler deploy
   ```

## Troubleshooting

### Database Issues
1. Check connection string in `.env`
2. Verify PostgreSQL is running
3. Try `npm run db:push` to sync schema

### Build Issues
1. Clear node_modules: `rm -rf node_modules`
2. Clear build: `rm -rf dist`
3. Reinstall: `npm install`

### Runtime Issues
1. Check logs: `npm run dev`
2. Verify environment variables
3. Check Cloudflare Worker logs

## Best Practices

1. **Code Style:**
   - Follow existing patterns
   - Use TypeScript strictly
   - Document complex functions

2. **Git:**
   - Write clear commit messages
   - Keep PRs focused
   - Rebase before merging

3. **Testing:**
   - Test locally before pushing
   - Include test cases in PRs
   - Document API changes

4. **Security:**
   - Never commit credentials
   - Use environment variables
   - Follow security best practices

## Resources

- [Project Documentation](./docs/)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Deployment Guide](./docs/deployment.md)