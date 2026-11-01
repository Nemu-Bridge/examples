<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


<!-- BEGIN:nemu-oauth-sdk -->

# You might not know how to implement nemu's sdk.

This app signs users in with **Auth.js v5** (`next-auth@beta`) using Nemu as a custom OAuth 2.0 provider, defined in `lib/provider.ts`. `@nemu-ai/sdk` is used for two things only: building the scope string, and calling the API once Auth.js has a token. Auth.js owns the session; the SDK does not.

`@nemu-ai/sdk` is not a React library. It ships no components, no hooks and no provider. It runs on the server only because it holds the `client_secret`, which is a security boundary and not a runtime one: it has no Node specific imports and uses the standard Web Crypto API. Importing it from a file carrying `"use client"` breaks the build.

Four things about this provider are load-bearing, and three of them are Auth.js defaults that are wrong for Nemu.

**`checks` defaults to `["pkce"]`, not `["pkce", "state"]`.** Auth.js does not send `state` unless you ask. `lib/provider.ts` sets both. Do not shorten it.

**Auth.js injects `scope=openid profile email` into any authorization endpoint that has no `scope` parameter**, including plain `type: "oauth"` providers. That is why `authorization` is written as `{ url, params: { scope: SCOPE } }` and never as a bare URL string. Nemu is not an OIDC provider and those scopes do not exist, so the bare-string form fails at consent.

**`userinfo` is required even for OAuth2.** Auth.js always fetches a profile. Nemu returns `{ "data": { ... } }`, so the `profile()` callback unwraps `profile.data`. Without it every user gets an undefined id.

**The `import type { JWT } from "next-auth/jwt"` at the top of `auth.ts` looks unused and is not.** TypeScript cannot augment a module it has not resolved, so removing that import silently turns every augmented field on the token into `unknown` and the `jwt` callback stops type checking.

**Refresh tokens rotate, and using one revokes it immediately.** The `jwt` callback is the correct place to refresh because Auth.js re-issues the session cookie on the same response, so the rotated token is persisted. Do not move refreshing into a page or a server component, where nothing can be written back. Be aware this is still racy: two concurrent requests arriving on an expired token can both refresh, and the loser holds a revoked token. `auth.ts` refreshes two minutes early to shrink that window, and surfaces `session.error === "RefreshTokenError"` so a page can send the user back through sign in.

The session carries `access_token` so server code can call the API. This app has **no `SessionProvider`** and never calls `useSession`, so the session is never serialized to a client component. If you add client side session access, move the token out of the session first.

Read from: `node_modules/@nemu-ai/sdk/README.md` and for the documentation: https://docs.nemu.cc/oauth

<!-- END:nemu-oauth-sdk -->
