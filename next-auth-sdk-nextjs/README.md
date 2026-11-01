# Nemu with Auth.js, Next.js

Signs a user in with Nemu through a **custom Auth.js v5 provider**, then calls the management
API as that user. Auth.js owns the session and the token refresh. The SDK is used only to build
the scope string and to call the API.

Runs on port **9999**.

If you would rather run the OAuth flow yourself, with no Auth.js, see
`../oauth-sdk-nextjs`.

## Setup

### 1. Register an application

In the console, open Settings, then Applications, and create an application.

Auth.js derives the callback path from the provider `id`, which is `nemu` here, so the redirect
URI is:

```
http://localhost:9999/api/auth/callback/nemu
```

<!-- prettier-ignore -->
> Note the trailing `/nemu`. This is a different URI from the plain SDK example, which uses
> `/api/auth/callback`. If you want to run both apps against one application, register both.

Select `profile:read`, `workspaces:read`, `models:read` and `usage:read`.

### 2. Configure

```bash
cp .env.example .env
```

```bash
AUTH_SECRET=
AUTH_NEMU_ID=
AUTH_NEMU_SECRET=
NEMU_ORIGIN=https://app.nemu.cc
```

Generate the Auth.js secret:

```bash
npx auth secret
```

`AUTH_NEMU_ID` and `AUTH_NEMU_SECRET` follow the Auth.js convention of `AUTH_<PROVIDER>_ID` and
`AUTH_<PROVIDER>_SECRET`, uppercased from the provider `id` with hyphens turned into
underscores. Auth.js can infer them without any `process.env` in your config. This example
still passes them explicitly, because a reader should be able to see where they come from.

### 3. Run

```bash
bun install
bun run dev
```

Open http://localhost:9999.

## The provider

`lib/provider.ts` is the whole integration. Three of its fields exist to override an Auth.js
default that is wrong for a non-OIDC provider.

| Field | Why it is written that way |
| --- | --- |
| `checks: ["pkce", "state"]` | The default is `["pkce"]` alone. Auth.js does not send `state` unless asked |
| `authorization: { url, params: { scope } }` | Given a bare URL string, Auth.js appends `scope=openid profile email`, which Nemu does not have |
| `userinfo` | Required even for `type: "oauth"`. Auth.js always fetches a profile |
| `profile()` | Nemu returns `{ "data": { ... } }`, so the callback unwraps `data` |
| `client.token_endpoint_auth_method` | Nemu accepts both HTTP Basic and body credentials. Auth.js defaults to Basic today, and the maintainers have flagged that default as likely to change, so it is pinned |

## Token refresh

Refresh happens in the `jwt` callback in `auth.ts`, which is the only correct place: Auth.js
re-issues the session cookie on the same response, so the rotated token is actually persisted.

This matters more than usual here, because **Nemu rotates refresh tokens and revokes the old one
immediately**. A refresh whose result is not saved leaves you holding a dead token.

<!-- prettier-ignore -->
> There is a known race in this pattern, acknowledged in the Auth.js docs. Two concurrent
> requests that both see an expired token will both refresh, and the second one is left with a
> revoked token. This example refreshes two minutes early to shrink the window, and sets
> `session.error = "RefreshTokenError"` so a page can send the user back through sign in rather
> than failing silently. A shared lock, or a database session with a single writer, is the real
> fix.

## Which parts are the SDK

Deliberately small:

- `format_scopes(...)` builds the `scope` string, so the scope names are validated at build
  time rather than typed by hand.
- `create_oauth().from_tokens({ access_token })` builds a client for the API calls in
  `app/dashboard/page.tsx`. No refresh token is passed, because refreshing is Auth.js's job.
- `.refresh()` performs the rotation inside the `jwt` callback.

## Layout

```
auth.ts                        NextAuth config, jwt and session callbacks, module augmentation
proxy.ts                       exports auth as proxy, protects /dashboard
lib/provider.ts                the custom Nemu OAuth provider
lib/oauth.ts                   the NemuOAuth client used for refresh and API calls
lib/client.ts                  an authenticated Nemu client for the request
app/api/auth/[...nextauth]/    the Auth.js route handlers
app/page.tsx                   sign in, through a server action
app/dashboard/                 calls the API and renders the result
```

## The SDK

`@nemu-ai/sdk` comes from npm, pinned in `package.json`. To move to a newer version, run
`bun add @nemu-ai/sdk@latest`.

## Conventions

Follows `services/platform`: no comments, snake_case identifiers in `.ts`, camelCase in `.tsx`,
PascalCase for types and props, `page.tsx` as a route entry with the interface in `content.tsx`,
one word filenames, and colours only from the tokens in `app/globals.css`. Auth.js config keys
such as `clientId` and `checks` are the library's, not ours, so they stay as the library
defines them.
