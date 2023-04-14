# Brewica... a work in progress

This app will eventually help users refine their coffee brews to get the best cup possible.

This repo contains 3 apps within the packages folder - auth, server and client. The monorepo workspace was generated with [NX](https://nx.dev/).

## /packages/auth

My focus so far has been on creating an auth server with TypeScript, Node.js, ExpressJS, MongoDB and Redis with testing handled by Jest.

At present the auth server operates a system based on JSON Web Tokens and has been built to the relevant [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) recommendations. I have also considered the recommendations made by [Port Swigger](https://portswigger.net/web-security/jwt) [Curity](https://curity.io/resources/learn/jwt-best-practices/) and [Hasura](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/).

The steps taken to bolster security are as follows:
- Tokens are signed using EdDSA (Ed25519)
- To reduce exposure to token sidejacking and xss attacks, tokens contain a SHA256 hash of a V4 UUID, the raw value of which is sent to the client as a hardened cookie. On token verification the raw value is retrieved from the cookie and is hashed. The two hashed values must match in order for the token to be accepted.
- Token revocation is handled through the use of short lived access tokens and longer lived refresh tokens. Refresh tokens are stored as a hardened cookie and when the user signs out the cookies are cleared and the refresh token is blacklisted via a SHA256 hash of the token stored in Redis. Access tokens will be stored in the client side in session storage and will be cleared when the browser is closed or by the client.
- Thorough token verification i.e. the algorithm, expiry, issuer and audience are always checked.
