import * as client from 'openid-client';

const server: URL = new URL('https://auth.brewica.com/application/o/brewica/');
const id = process.env.AUTH_CLIENT_ID;
const secret = process.env.AUTH_CLIENT_SECRET;

if (!id || !secret) {
  throw new Error('OPENID_CLIENT_ID and OPENID_CLIENT_SECRET must be set');
}

const clientId: string = id;
const clientSecret: string = secret;

let configPromise: Promise<client.Configuration> | null = null;

export function getConfig() {
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
};
