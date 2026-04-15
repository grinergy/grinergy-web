# Grinergy Project Overview

Grinergy is a Next.js 14 based web application focusing on environmental and energy innovation. It features a public-facing website and an administrative dashboard for managing content such as news and notices.

## Core Technologies

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Prisma ORM
- **Authentication:** Custom JWT-based authentication for the admin panel
- **Styling:** Tailwind CSS with custom local fonts (Noto Sans KR, Univers LT Pro)
- **Internationalization:** `next-intl` (supports English and Korean)
- **Storage:** Cloudflare R2 (via AWS SDK S3 client)
- **State/Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion
- **Monitoring:** Vercel Analytics

## Project Structure

- `src/app`: Application routes and logic.
  - `(client)`: Publicly accessible pages including Home, About, Product, Investors, News, and Notice.
  - `(admin)`: Restricted administrative dashboard for managing content.
- `src/components`: Reusable UI components used throughout the application.
- `src/libs`: Core logic and utilities.
  - `db-actions`: Server actions for database operations (News, Notice, Files).
  - `db.ts`: Prisma client initialization.
  - `s3-client.ts`: S3 client configuration for Cloudflare R2.
- `prisma/schema.prisma`: Defines the data models for News, Notice, File, and OperationLog.
- `messages/`: JSON files for English (`en.json`) and Korean (`ko.json`) translations.
- `public/`: Static assets including fonts, images, and videos.

## Key Workflows

### Internationalization
The application uses `next-intl`. The locale is determined by a cookie named `lan` (defaults to `en`). The `RootLayout` sets the `lang` attribute and appropriate font class based on this locale.

### Administrative Authentication
Admin access is controlled via a password check in `src/app/(admin)/admin/login/actions.ts`. Upon successful login, a JWT `token` is set as an `httpOnly` cookie.

### Data Caching
Extensive use of Next.js `unstable_cache` is applied to database queries in `src/libs/db-actions/` to minimize database load. Cache tags like `notice`, `news`, and their respective counts are used for targeted revalidation.

### File Management
Files (mainly for Notices) are uploaded to and deleted from Cloudflare R2. The database maintains a `File` model linked to `Notice` for metadata.

## Development Commands

- `yarn dev`: Starts the development server.
- `yarn build`: Synchronizes Prisma schema with the production database and builds the application.
- `yarn start`: Runs the built production application.
- `yarn lint`: Runs ESLint for code quality checks.
- `yarn push:dev`: Pushes the Prisma schema to the development database.
- `yarn studio:dev`: Opens Prisma Studio to browse the development database.

## Conventions

- **Server Actions:** All database mutations and sensitive operations should be implemented as Server Actions in `src/libs/db-actions` or local `actions.ts` files within route directories.
- **Validation:** Use Zod schemas for validating form data and API inputs.
- **Styling:** Use Tailwind CSS utility classes. For complex conditional classes, use `clsx` and `tailwind-merge`.
- **Error Handling:** Utilize the custom exception classes in `src/exceptions` and the error handler in `src/libs/error-handler.ts`.
