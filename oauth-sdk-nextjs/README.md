# Nemu OAuth example, Next.js

A complete Next.js app that signs a user in with Nemu, stores the tokens safely, and calls the
management API as that user. Nothing here is a stub.

Runs on port **9999**, because the redirect URI has to match a registered one exactly and 3000
is the port everything else on your machine already wants.

## What it shows

- The authorization code flow with PKCE, using `NemuOAuth`.
- `build_scopes` instead of hand written scope strings.
- Tokens sealed with AES-256-GCM into an httpOnly cookie, never exposed to the browser.
- Web Crypto throughout, with no Node specific imports, so it also runs on the Edge runtime.
- Token refresh handled in `proxy.ts`, which is the only place it is safe to do.
- Calling the API from a server component and passing plain data down.

## Setup

### 1. Register an application

In the console, open Settings, then Applications, and create an application.

Add this exact redirect URI:

```
http://localhost:9999/api/auth/callback
```

Select the scopes this app asks for: `profile:read`, `workspaces:read`, `models:read`,
`usage:read`. A token only ever carries the intersection of what the user approved and what the
application holds, so a scope missing here fails later even if the user said yes.

Copy the `client_id` and `client_secret`. The secret is shown once.

### 2. Configure

```bash
cp .env.example .env
```

Fill in `NEMU_CLIENT_ID` and `NEMU_CLIENT_SECRET`, then generate a session secret:

```bash
node -e "console.log(Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))"
```

Put that in `SESSION_SECRET`. It encrypts the cookie, so changing it signs everyone out.

### 3. Run

```bash
bun install
bun run dev
```

Open http://localhost:9999.

## The SDK

`@nemu-ai/sdk` comes from npm, pinned in `package.json`. To move to a newer version, run
`bun add @nemu-ai/sdk@latest`.

## Layout

```
app/
  page.tsx                     route entry, redirects if already signed in
  content.tsx                  sign in screen
  api/auth/login/route.ts      builds the authorize URL, stores PKCE state
  api/auth/callback/route.ts   verifies state, exchanges the code, writes the session
  api/auth/logout/route.ts     clears the session
  dashboard/
    page.tsx                   server component, calls the API
    content.tsx                interface
    components/                account, workspaces, scopes
lib/
  env.ts                       validated environment access
  oauth.ts                     the NemuOAuth client and the scopes
  session.ts                   sealed cookie read and write
  client.ts                    an authenticated Nemu client for the request
proxy.ts                       refreshes the token before the page renders
```

## The one thing worth reading twice

Refresh tokens rotate, and the moment one is used the old one is revoked. So a refresh that
happens somewhere its result cannot be saved leaves you holding a dead token.

A server component cannot write cookies in Next.js. If the SDK refreshed during a page render,
the rotated token would be lost and the next request would be signed out, with nothing in the
logs to explain it.

So the refresh lives in `proxy.ts`, which runs before the page and can write to the response.
`get_client()` refuses to build a client from a token that is close to expiry, returning `null`
instead, so a stale token can never reach the SDK and trigger a refresh in the wrong place.

If you move token handling around, keep that property.

## Conventions

This example follows `services/platform`, so the same rules apply here: no comments, snake_case
identifiers in `.ts` server files, camelCase in `.tsx`, PascalCase for types and props,
`page.tsx` as a route entry with the interface in `content.tsx`, one word filenames, and colours
only from the tokens in `app/globals.css`.
