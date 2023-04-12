# Brewica... a work in progress

This app will eventually help users refine their coffee brews to get the best cup possible.

This repo contains 3 apps within the packages folder - auth, server and client. This monorepo workspace was generated with [NX]<https://nx.dev/>.

##packages/auth
My focus so far has been on creating an auth server with TypeScript, Node.js, ExpressJS, MongoDB and Redis with testing handled by Jest.

At present the auth server operates a system based on JSON Web Tokens and has been built to [OWASP guidelines]<https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html>. I have also considered the recommendations made by [Curity]<https://curity.io/resources/learn/jwt-best-practices/> and [Hasura]<https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#silent-refresh>.
