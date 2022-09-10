import { SITE_NOT_FOUND, UNAUTHORIZED, UNKNOWN_ERROR } from './errors';

const createAuthHeaders = () => ({ 'x-api-key': process.env?.API_KEY || '' });

export async function getOutages(): Promise<API.Outage[]> {
  const response = await fetch(`${process.env.API_URL}/outages`, {
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    switch (response.status) {
      case 403:
        throw new Error(UNAUTHORIZED);
      default:
        throw new Error(UNKNOWN_ERROR);
    }
  }

  return (await response.json());
}

export async function getSiteInformation(
  siteId: string,
): Promise<API.SiteInformation> {
  const response = await fetch(`${process.env.API_URL}/site-info/${siteId}`, {
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    switch (response.status) {
      case 403:
        throw new Error(UNAUTHORIZED);
      case 404:
        throw new Error(SITE_NOT_FOUND);
      default:
        throw new Error(UNKNOWN_ERROR);
    }
  }

  return (await response.json());
}

export async function createOutages(
  siteId: string,
  outages: API.OutageDetailed[],
): Promise<void> {
  const response = await fetch(
    `${process.env.API_URL}/site-outages/${siteId}`,
    {
      method: 'POST',
      body: JSON.stringify(outages),
      headers: { ...createAuthHeaders(), 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    switch (response.status) {
      case 403:
        throw new Error(UNAUTHORIZED);
      case 404:
        throw new Error(SITE_NOT_FOUND);
      default:
        throw new Error(UNKNOWN_ERROR);
    }
  }
}
