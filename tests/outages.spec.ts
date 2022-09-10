import { DEVICE_OUTAGE_NOT_FOUND } from '../src/errors';
import {
  filterNonRelevantDeviceOutages,
  filterOutageStartBefore,
  formatOutageListWithDeviceName,
} from '../src/outages';

describe('outages', () => {
  describe('filterOutageStartBefore', () => {
    it('should remove outages from return value before given date string', () => {
      // first outage is expected to be removed
      const outages: API.Outage[] = [
        {
          id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
          begin: '2021-07-26T17:09:31.036Z',
          end: '2021-08-29T00:37:42.253Z',
        },
        {
          id: '36f1c57b-1201-402c-9a12-43a4a1400045',
          begin: '2022-05-23T12:21:27.377Z',
          end: '2022-11-13T02:16:38.905Z',
        },
      ];
      const dateLookup = '2022-01-01T00:00:00.000Z';

      const result = filterOutageStartBefore(outages, dateLookup);

      // check that the outage, uniquely identified by its ID
      // is not found inside the resultant array of outages.
      expect(
        result.find((outage) => outage.id == outages[0].id),
      ).toBeUndefined();
      // check that the intended result IS found
      expect(
        result.find((outage) => outage.id === outages[1].id),
      ).not.toBeUndefined();
    });
  });

  it('should return an empty array when all outages are before the date', () => {
    const outages: API.Outage[] = [
      {
        id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
        begin: '2021-07-26T17:09:31.036Z',
        end: '2021-08-29T00:37:42.253Z',
      },
      {
        id: '36f1c57b-1201-402c-9a12-43a4a1400045',
        begin: '2021-05-23T12:21:27.377Z',
        end: '2021-11-13T02:16:38.905Z',
      },
    ];
    const dateLookup = '2022-01-01T00:00:00.000Z';

    const result = filterOutageStartBefore(outages, dateLookup);

    expect(result.length).toEqual(0);
  });

  describe('filterNonRelevantDeviceOutages', () => {
    it('should return an empty array if no devices are specified', () => {
      const outages: API.Outage[] = [
        {
          id: '002b28fc-283c-47ec-9af2-ea287336dc1b',
          begin: '2021-07-26T17:09:31.036Z',
          end: '2021-08-29T00:37:42.253Z',
        },
        {
          id: '36f1c57b-1201-402c-9a12-43a4a1400045',
          begin: '2021-05-23T12:21:27.377Z',
          end: '2021-11-13T02:16:38.905Z',
        },
      ];

      const result = filterNonRelevantDeviceOutages(outages, []);

      expect(result.length).toEqual(0);
    });

    it('should return an empty array if no outages are specified', () => {
      const relevantDeviceId = '002b28fc-283c-47ec-9af2-ea287336dc1b';
      const devices: API.Device[] = [
        {
          id: relevantDeviceId,
          name: 'Device 1',
        },
        {
          id: 'e5cdae21-f9fa-493a-974d-c7817eaa7b78',
          name: 'Device 2',
        },
      ];

      const result = filterNonRelevantDeviceOutages([], devices);

      expect(result.length).toEqual(0);
    });

    it('should remove outages for devices which do not exist in device information of site', () => {
      const relevantDeviceId = '002b28fc-283c-47ec-9af2-ea287336dc1b';
      const devices: API.Device[] = [
        {
          id: relevantDeviceId,
          name: 'Device 1',
        },
        {
          id: 'e5cdae21-f9fa-493a-974d-c7817eaa7b78',
          name: 'Device 2',
        },
      ];

      // array contains one outage with relevance and one without.
      const outages: API.Outage[] = [
        {
          id: relevantDeviceId,
          begin: '2021-07-26T17:09:31.036Z',
          end: '2021-08-29T00:37:42.253Z',
        },
        {
          id: '36f1c57b-1201-402c-9a12-43a4a1400045',
          begin: '2021-05-23T12:21:27.377Z',
          end: '2021-11-13T02:16:38.905Z',
        },
      ];

      const result = filterNonRelevantDeviceOutages(outages, devices);

      // check the outage is found for a device which is listed.
      expect(
        result.find((outage) => outage.id === relevantDeviceId),
      ).not.toBeUndefined();
      // check that the outage for a device not listed is not found.
      expect(
        result.find((outage) => outage.id === outages[1].id),
      ).toBeUndefined();
    });
  });

  describe('formatOutageListWithDeviceName', () => {
    it('should append display name of outage when found', () => {
      const relevantDeviceId = '002b28fc-283c-47ec-9af2-ea287336dc1b';
      const relevantDeviceName = 'Device 1';
      const devices: API.Device[] = [
        {
          id: relevantDeviceId,
          name: relevantDeviceName,
        },
        {
          id: 'e5cdae21-f9fa-493a-974d-c7817eaa7b78',
          name: 'Device 2',
        },
      ];

      // array contains one outage with relevance and one without.
      const outages: API.Outage[] = [
        {
          id: relevantDeviceId,
          begin: '2021-07-26T17:09:31.036Z',
          end: '2021-08-29T00:37:42.253Z',
        },
      ];

      const result = formatOutageListWithDeviceName(outages, devices);

      // check the name property on the outage is as expected.
      expect(
        result.find((outage) => outage.id === relevantDeviceId)?.name,
      ).toEqual(relevantDeviceName);
    });

    it('should throw error when outage which does not have device specified is found', () => {
      const relevantDeviceId = '002b28fc-283c-47ec-9af2-ea287336dc1b';
      const devices: API.Device[] = [
        {
          id: relevantDeviceId,
          name: 'Device 1',
        },
      ];

      // array contains one outage with relevance and one without.
      const outages: API.Outage[] = [
        {
          id: relevantDeviceId,
          begin: '2021-07-26T17:09:31.036Z',
          end: '2021-08-29T00:37:42.253Z',
        },
        {
          id: '36f1c57b-1201-402c-9a12-43a4a1400045',
          begin: '2021-05-23T12:21:27.377Z',
          end: '2021-11-13T02:16:38.905Z',
        },
      ];

      expect(() => formatOutageListWithDeviceName(outages, devices)).toThrow(
        DEVICE_OUTAGE_NOT_FOUND,
      );
    });
  });
});
