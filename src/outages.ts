import { isBefore, parseISO } from 'date-fns';
import { DEVICE_OUTAGE_NOT_FOUND } from './errors';

/**
 * For a given list of outages, filter out those which are due to
 * begin before a specified date.
 *
 * @param outages List of outages to filter
 * @param start ISO8601 date string used to filter outages.
 * @returns API.Outage[]
 */
export function filterOutageStartBefore(
  outages: API.Outage[],
  start: string,
): API.Outage[] {
  // create a copy to avoid mutating the original array of outages.
  return [...outages].filter(
    (outage) => !isBefore(parseISO(outage.begin), parseISO(start)),
  );
}

/**
 * Remove outages from the specified list which do not map to a device
 * specified in the list of devices.
 *
 * @param outages List of outages to filter
 * @param devices List of valid devices
 * @returns  API.Outage[] List of outages which map to a device given.
 */
export function filterNonRelevantDeviceOutages(
  outages: API.Outage[],
  devices: API.Device[],
): API.Outage[] {
  const relevantDeviceIds: string[] = devices.map((device) => device.id);

  return [...outages].filter((outage) => relevantDeviceIds.includes(outage.id));
}

/**
 * Given a list of outages and devices, map the outage to
 * a device and append the name to the respective outage.
 *
 * Does not accept outages without a device.
 *
 * @param outages List of outages to format.
 * @param devices List of devices to map to outages.
 * @returns  API.OutageDetailed[] - List of outages with device name annotated.
 */
export function formatOutageListWithDeviceName(
  outages: API.Outage[],
  devices: API.Device[],
): API.OutageDetailed[] {
  const getDeviceName = (deviceId: string) => devices.find((device) => device.id === deviceId)?.name;

  return outages.map((outage) => {
    const name = getDeviceName(outage.id);

    if (!name) {
      throw new Error(DEVICE_OUTAGE_NOT_FOUND);
    }

    return {
      ...outage,
      name,
    };
  });
}
