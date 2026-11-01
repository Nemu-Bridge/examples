<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


<!-- BEGIN:nemu-oauth-sdk -->

# You might not know how to implement nemu's sdk.

`@nemu-ai/sdk` is the typed client for the Nemu management API at `app.nemu.cc`. It is not a React library. It ships no components, no hooks and no provider, and there is nothing to render. It runs on the server only because it holds the `client_secret`, which is a security boundary and not a runtime one: it has no Node specific imports and uses the standard Web Crypto API, so route handlers, `proxy.ts`, server actions, server components and the Edge runtime all work. Importing it from a file carrying `"use client"` breaks the build. Data reaches the browser as plain props from a server component, which is what `app/dashboard/page.tsx` does.

There are two clients and choosing the wrong one is the usual mistake. `Nemu` uses client credentials and acts as **your own** account, so it is for backends with no end users. `NemuOAuth` runs the authorization code flow and acts as **the user who signed in**. This app uses `NemuOAuth`. Only a client-credentials client can call `workspace.gateway_key()`.

Build scopes with `build_scopes` rather than typing strings. It validates as it builds, so a wrong name throws immediately instead of surfacing as a `403` on an unrelated request much later. The names do not all match the resource they guard: it is `profile:read` and not `user:read`, `mapping:` and not `mappings:`, and there is no `metrics:` scope because `usage:read` covers it. `profile` and `usage` are read-only. `models:read` is also what grants access to workflows.

**Refresh tokens rotate, and using one revokes it immediately.** If a refresh happens somewhere the new token cannot be persisted, the session is dead on the next request. A server component cannot write cookies in Next.js, so it must never be the thing that triggers a refresh. That is the entire reason `proxy.ts` exists here: it refreshes before the page renders and writes the rotated token onto the response. `get_client()` returns `null` rather than let a stale token reach the SDK. Do not "simplify" this by moving the refresh into the page.

The API has sharp edges the types cannot express. Reads are workspace scoped through a `workspace_id` query parameter, but writes are not: a create always lands in the account's default workspace whatever you scoped it through. `update()` sends a full replacement because the API validates the same schema on `PATCH` as on `POST`, so pass every required field and not only the ones you changed. Most responses wrap data in `data`, but indexes and the workspace budget return bare values and metrics nests its paging under `pagination`.

Never send an access token, a refresh token or the client secret to the browser. They belong in the encrypted cookie written by `lib/session.ts` and nowhere else.

Read from: `node_modules/@nemu-ai/sdk/README.md` and for the documentation: https://docs.nemu.cc/oauth

<!-- END:nemu-oauth-sdk -->
