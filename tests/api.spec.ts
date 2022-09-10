import { createOutages, getOutages, getSiteInformation } from '../src/api';
import { SITE_NOT_FOUND, UNAUTHORIZED, UNKNOWN_ERROR } from '../src/errors';

describe.each([
  [403, UNAUTHORIZED],
  [404, SITE_NOT_FOUND],
  [500, UNKNOWN_ERROR],
])(
  'getSiteInformation error handling - %i',
  (statusCode: number, error: string) => {
    test(`handles error code ${statusCode}`, async () => {
      expect.assertions(1);
      fetchMock.mockResponse('', { status: statusCode });

      try {
        await getSiteInformation('mock-site');
      } catch (e) {
        expect(e).toEqual(new Error(error));
      }
    });
  },
);

describe.each([
  [403, UNAUTHORIZED],
  [404, SITE_NOT_FOUND],
  [500, UNKNOWN_ERROR],
])('createOutages error handling - %i', (statusCode: number, error: string) => {
  test(`handles error code ${statusCode}`, async () => {
    expect.assertions(1);
    fetchMock.mockResponse('', { status: statusCode });

    try {
      await createOutages('mock-site', []);
    } catch (e) {
      expect(e).toEqual(new Error(error));
    }
  });
});
describe.each([
  [403, UNAUTHORIZED],
  [500, UNKNOWN_ERROR],
])('getOutages error handling - %i', (statusCode: number, error: string) => {
  test(`handles error code ${statusCode}`, async () => {
    expect.assertions(1);
    fetchMock.mockResponse('', { status: statusCode });

    try {
      await getOutages();
    } catch (e) {
      expect(e).toEqual(new Error(error));
    }
  });
});
