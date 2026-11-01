# Nemu examples

Two small Next.js apps that sign a user in with Nemu and call the API on their behalf. They do the
same thing and differ only in who owns the session.

| Example | What it shows |
| --- | --- |
| [`oauth-sdk-nextjs`](./oauth-sdk-nextjs) | The OAuth flow run yourself with `NemuOAuth` from `@nemu-ai/sdk`, the session in an encrypted cookie you own, and token refresh in `proxy.ts`. |
| [`next-auth-sdk-nextjs`](./next-auth-sdk-nextjs) | Nemu as a custom Auth.js v5 provider: Auth.js owns the session, the cookies and the refresh. |

Each folder is a standalone app with its own README: create an application in the Nemu console,
copy `.env.example` to `.env`, fill in the values, then `bun install` and `bun run dev`.

The full walkthroughs are at https://docs.nemu.cc/examples, and the OAuth reference at
https://docs.nemu.cc/oauth.
