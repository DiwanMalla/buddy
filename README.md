# Buddy - Collaborative Room Platform

A real-time collaboration platform built with **Next.js 15**, **Convex**, and **Clerk**. Create password-protected rooms, chat in real-time, organize with channels, and share files with your team.

## Features

- **Password-Protected Rooms** — Create rooms with invite codes and passwords
- **Real-Time Group Chat** — Instant messaging powered by Convex
- **Direct Messages** — Private conversations between members
- **Channels** — Organize discussions by topic
- **File Sharing** — Upload and share documents, images, and more
- **Admin Controls** — Promote members to admin, manage roles
- **Clerk Organizations** — Each room maps to a Clerk Organization with RBAC

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **Convex** (Real-time database, file storage, serverless functions)
- **Clerk** (Authentication, Organizations, RBAC)
- **Tailwind CSS** + **shadcn/ui** (Styling)
- **bcryptjs** (Password hashing)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Clerk](https://clerk.com) account with Organizations enabled
- A [Convex](https://convex.dev) account

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Clerk

1. Create a Clerk application at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Enable **Organizations** in Clerk Dashboard → Organizations → Settings
3. Copy your keys to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Configure Convex

1. Run `npx convex dev` and follow the prompts to create a Convex project
2. This will set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
3. In the [Convex Dashboard](https://dashboard.convex.dev), add an environment variable:
   - `CLERK_JWT_ISSUER_DOMAIN` = `https://your-clerk-app.clerk.accounts.dev`

### 4. Set up Clerk Webhook (for user sync)

1. In Clerk Dashboard → Webhooks, add a new endpoint:
   - URL: `https://your-convex-deployment.convex.site/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`

### 5. Run the development servers

```bash
npm run dev
```

This starts both Next.js and Convex dev servers in parallel.

### Environment Variables Summary

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=dev:xxx

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex Environment Variable (set in Convex Dashboard)
# CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

## Project Structure

```
app/
  page.tsx                          # Landing page
  sign-in/, sign-up/                # Clerk auth pages
  (protected)/
    create-room/page.tsx            # Create room form
    join-room/page.tsx              # Join room form
    room/[roomId]/
      page.tsx                      # Group chat
      channel/[channelId]/page.tsx  # Channel chat + files
      dm/[userId]/page.tsx          # Direct messages
  api/join-room/route.ts            # Server API for org membership

components/
  landing/   # Navbar, Hero, Features, CTA, Footer
  room/      # RoomSidebar, CreateChannelDialog, AdminPanel
  chat/      # MessageList, MessageInput, DMMessageList, DMInput, FileList

convex/
  schema.ts          # Database schema
  rooms.ts           # Room mutations/queries
  messages.ts        # Chat messages
  directMessages.ts  # DM messages
  channels.ts        # Channel CRUD
  files.ts           # File queries
  users.ts           # User sync
  http.ts            # Clerk webhook handler
  auth.config.ts     # Clerk JWT config
```
