import { backOff } from 'exponential-backoff';

import {
  filterNonRelevantDeviceOutages,
  filterOutageStartBefore,
  formatOutageListWithDeviceName,
} from './outages';

import { getOutages, getSiteInformation, createOutages } from './api';
import { UNKNOWN_ERROR } from './errors';

require('dotenv').config();

export const BACKOFF_ATTEMPTS = 3;

// any known errors such as 404, 403 are not intermittent issues
// and therefore should not be retried.
const backoffRetryFunction = (e: Error) => e.message === UNKNOWN_ERROR;

export async function runOperation(
  siteId: string,
  removeOutagesBefore: string,
) {
  let outages = [];
  try {
    outages = await backOff(async () => await getOutages(), {
      numOfAttempts: BACKOFF_ATTEMPTS,
      retry: backoffRetryFunction,
    });
  } catch (e) {
    // catch explicitly to stop any unresolved promises.
    throw e;
  }

  let siteInformation: API.SiteInformation;
  try {
    siteInformation = await backOff(
      async () => await getSiteInformation(siteId),
      { numOfAttempts: BACKOFF_ATTEMPTS, retry: backoffRetryFunction },
    );
  } catch (e) {
    throw e;
  }

  const devices = siteInformation.devices;

  const validOutages = filterOutageStartBefore(outages, removeOutagesBefore);

  const validOutagesForDeviceList = filterNonRelevantDeviceOutages(
    validOutages,
    devices,
  );

  const formattedOutages = formatOutageListWithDeviceName(
    validOutagesForDeviceList,
    devices,
  );

  try {
    await backOff(async () => await createOutages(siteId, formattedOutages), {
      numOfAttempts: BACKOFF_ATTEMPTS,
      retry: backoffRetryFunction,
    });
  } catch (e) {
    throw e;
  }
}

if (require.main === module) {
  runOperation('norwich-pear-tree', '2022-01-01T00:00:00.000Z');
}
