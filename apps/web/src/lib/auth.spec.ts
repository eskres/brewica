import { afterEach, describe, expect, it, vi } from 'vitest';
import { getConfig } from './auth';
import * as client from 'openid-client';

beforeEach(() => {
  vi.mocked(client.discovery).mockResolvedValue({
    serverMetadata: () => ({
      issuer: 'https://brewica.com',
      authorization_endpoint: 'https://brewica.com/authorize',
      token_endpoint: 'https://brewica.com/token',
    }),
  } as client.Configuration);
})

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

vi.mock('openid-client', () => ({
    discovery: vi.fn()
}));

describe('getConfig', () => {
  it('Throws an error if client ID is missing', async () => {
    vi.stubEnv('AUTH_CLIENT_ID', undefined);
    vi.stubEnv('AUTH_CLIENT_SECRET', 'test');
    await expect(getConfig()).rejects.toThrow(
      new Error('Client ID is missing'),
    )
  });
  it('Throws an error if client secret is missing', async () => {
    vi.stubEnv('AUTH_CLIENT_ID', 'test');
    vi.stubEnv('AUTH_CLIENT_SECRET', undefined);
    await expect(getConfig()).rejects.toThrow(
      new Error('Client secret is missing'),
    )
  });
  it('Returns a valid config', async () => {
    vi.stubEnv('AUTH_CLIENT_ID', 'test');
    vi.stubEnv('AUTH_CLIENT_SECRET', 'test');
    await expect(getConfig()).resolves.toHaveProperty('serverMetadata')
  });
  it('Only calls client.discovery once', async () => {
    vi.resetModules();
    const { getConfig } = await import('./auth');
    vi.stubEnv('AUTH_CLIENT_ID', 'test');
    vi.stubEnv('AUTH_CLIENT_SECRET', 'test');
    await getConfig();
    await getConfig();
    expect(client.discovery).toHaveBeenCalledTimes(1)
  });
});
