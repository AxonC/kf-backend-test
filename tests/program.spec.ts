import * as api from '../src/api';
import { BACKOFF_ATTEMPTS, runOperation } from '../src';
import { SITE_NOT_FOUND, UNKNOWN_ERROR } from '../src/errors';

const relevantOutageId = '002b28fc-283c-47ec-9af2-ea287336dc1b';
const outages: API.Outage[] = [
  {
    id: 'f8c2f613-8ec8-47bd-8e81-98ae84a3dc69',
    begin: '2021-07-26T17:09:31.036Z',
    end: '2021-08-29T00:37:42.253Z',
  },
  {
    id: relevantOutageId,
    begin: '2022-05-23T12:21:27.377Z',
    end: '2022-11-13T02:16:38.905Z',
  },
];

const devices: API.Device[] = [
  {
    id: relevantOutageId,
    name: 'Device 1',
  },
  {
    id: 'e5cdae21-f9fa-493a-974d-c7817eaa7b78',
    name: 'Device 2',
  },
];

const MOCK_SITE_ID = 'norwich-pear-tree';
const siteInformation: API.SiteInformation = {
  id: '61774fed-571a-4627-a99e-1c41c23a589f',
  name: 'norwich-pear-tree',
  devices,
};

// create a mock for the function which creates the outages
// this is done so we can check what is being passed into the function
// for submission to the API
jest.mock('../src/api', () => {
  return {
    __esModule: true,
    getOutages: jest.fn(),
    createOutages: jest.fn(),
    getSiteInformation: jest.fn(),
  };
});

describe('overall program test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    (api.getOutages as jest.Mock).mockResolvedValue(outages);
    (api.getSiteInformation as jest.Mock).mockResolvedValue(siteInformation);
  });

  it('should take outage data, remove before specified date, remove those without devices and submit to api', async () => {
    expect.assertions(1);

    // expect that the relevant outage is included alongside the
    // name of the device the outage is mapped too.
    const expectedRequestBody = [
      {
        ...outages[1],
        name: devices[0].name,
      },
    ];

    await runOperation(MOCK_SITE_ID, '2022-01-01T00:00:00.000Z');

    expect(api.createOutages).toHaveBeenCalledWith(
      MOCK_SITE_ID,
      expectedRequestBody,
    );
  });

  it('should attempt to retry request when failure is detected', async () => {
    expect.assertions(1);

    // first API call fails, second succeeds.
    (api.createOutages as jest.Mock)
      .mockRejectedValueOnce(new Error(UNKNOWN_ERROR))
      .mockResolvedValue({});

    await runOperation(MOCK_SITE_ID, '2022-01-01T00:00:00.000Z');

    expect(api.createOutages).toHaveBeenCalledTimes(2);
  });

  it('should not attempt to retry when an known error code occurs such as 404', async () => {
    expect.assertions(2);

    const expectedError = new Error(SITE_NOT_FOUND);

    // first API call fails, second succeeds.
    (api.getSiteInformation as jest.Mock).mockRejectedValue(
      new Error(SITE_NOT_FOUND),
    );

    try {
      await runOperation(MOCK_SITE_ID, '2022-01-01T00:00:00.000Z');
    } catch (e) {
      expect(e).toEqual(expectedError);
    }

    expect(api.getSiteInformation).toHaveBeenCalledTimes(1);
  });

  it('should throw error from function when the maximum number of retries has been reached for creating outages', async () => {
    expect.assertions(2);

    // mock all calls to the API failing
    (api.createOutages as jest.Mock).mockRejectedValue(
      new Error(UNKNOWN_ERROR),
    );

    try {
      await runOperation(MOCK_SITE_ID, '2022-01-01T00:00:00.000Z');
    } catch (e) {
      expect(e).toEqual(new Error(UNKNOWN_ERROR));
    }

    // test called the maximum number of retries were called.
    expect(api.createOutages).toBeCalledTimes(BACKOFF_ATTEMPTS);
  });
});
