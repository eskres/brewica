import { afterEach, describe, expect, it, vi } from 'vitest';
import { getConfig } from './auth';
import * as client from 'openid-client';

afterEach(() => {
  vi.unstubAllEnvs();
})
vi.mock('openid-client', () => ({
  client: {
    discovery: vi.fn()
  }
}));

describe('getConfig', () => {
  it('Throws an error if client ID is missing', async () => {
    vi.stubEnv('AUTH_CLIENT_ID', undefined);
    await expect(() => getConfig()).rejects.toThrow(
      new Error('Client ID is missing'),
    )
  });
  it('Throws an error if client secret is missing', async () => {
    vi.stubEnv('AUTH_CLIENT_SECRET', undefined);
    await expect(() => getConfig()).rejects.toThrow(
      new Error('Client secret is missing'),
    )
  });
  it('Returns a valid config', async () => {
    vi.mocked(client.discovery).mockResolvedValue({
      serverMetadata: () => ({
        issuer: 'https://brewica.com',
        authorization_endpoint: 'https://brewica.com/authorize',
        token_endpoint: 'https://brewica.com/token',
      }),
    } as client.Configuration);
    await expect(() => getConfig()).resolves.toHaveProperty('serverMetadata')
  });
  it('Only calls client.discovery once', async () => {
    vi.clearAllMocks();
    vi.mocked(client.discovery).mockResolvedValue({
      serverMetadata: () => ({
        issuer: 'https://brewica.com',
        authorization_endpoint: 'https://brewica.com/authorize',
        token_endpoint: 'https://brewica.com/token',
      }),
    } as client.Configuration);
    await getConfig();
    await getConfig();
    expect(client.discovery).toHaveBeenCalledTimes(1)
  });
});
