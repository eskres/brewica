import * as client from 'openid-client';

const server: URL = new URL('https://auth.brewica.com/application/o/brewica/');

const checkClientEnv = () => {
  const id = process.env.AUTH_CLIENT_ID;
  const secret = process.env.AUTH_CLIENT_SECRET;
  if (!id) {
    throw new Error('Client ID is missing');
  }
  if (!secret) {
    throw new Error('Client secret is missing');
  }
  const clientId: string = id;
  const clientSecret: string = secret;
  return {clientSecret, clientId};
}

let configPromise: Promise<client.Configuration> | null = null;

export async function getConfig() {
  const {clientId, clientSecret} = checkClientEnv();
  if (!configPromise) {
    configPromise = client.discovery(
      server,
      clientId,
      clientSecret
    ).catch((err) => {
      configPromise = null;
      throw err;
    })
  }
  return configPromise
}
