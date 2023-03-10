import NodeCache from 'node-cache';
import { fetchData } from '../src/fetchData';

describe('fetchData', () => {
  let cache: NodeCache;

  beforeEach(() => {
    cache = new NodeCache({ stdTTL: 60 * 60 });
  });

  afterEach(() => {
    cache.flushAll();
  });

  it('returns data for all supported languages if no language is specified', async () => {
    const result = await fetchData();
    expect(Object.keys(result.result)).toEqual(['en-gb', 'de-de', 'zh-cn']);
  });

  it('returns data for the specified language', async () => {
    const result = await fetchData('en-gb');
    expect(Object.keys(result.result)).toEqual(['en-gb']);
  });

  it('returns an error if an unsupported language is specified', async () => {
    const result = await fetchData('fr-fr');
    expect(result.error).toEqual('Unsupported language');
    expect(result.errorCode).toEqual(400);
    expect(result.result).toBeUndefined();
  });

  it('returns an error if no data is available', async () => {
    // Mock the fetch function to return an empty response
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(null),
    } as any);

    const result = await fetchData();
    expect(result.error).toEqual('No data available');
    expect(result.errorCode).toEqual(404);
    expect(result.result).toBeUndefined();
  });

  it('returns an error if the API request fails', async () => {
    // Mock the fetch function to throw an error
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchData();
    expect(result.error).toEqual('Network error');
    expect(result.errorCode).toEqual(500);
    expect(result.result).toBeUndefined();
  });

  it('caches the fetched data for subsequent requests', async () => {
    // Mock the fetch function to return some data
    const responseData = { data: true };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(responseData),
    } as any);

    // Make the first request to fetch the data and cache it
    const result1 = await fetchData();
    expect(result1.result['en-gb']).toEqual(responseData);

    // Make a second request to confirm that the cached data is used
    const result2 = await fetchData();
    expect(result2.result['en-gb']).toEqual(responseData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
