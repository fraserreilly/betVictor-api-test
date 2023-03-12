import request from 'supertest';
import app from '../src/app';
import { fetchData } from '../src/fetchData';
import sampleData from '../__mocks__/sampleData.json';

jest.mock('../src/fetchData');

describe('/api/v1/data', () => {
  describe('GET', () => {
    test('should return data when API call succeeds', async () => {
      (fetchData as jest.Mock).mockResolvedValueOnce(sampleData);

      const response = await request(app).get('/api/v1/data');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(sampleData);
    });

    test('should return an error when API call fails', async () => {
      const errorMessage = 'Something went wrong';
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: errorMessage,
        errorCode: 500,
      });

      const response = await request(app).get('/api/v1/data');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
    });

    test('should return an error when API call returns no data', async () => {
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: 'No data available',
        errorCode: 404,
        result: undefined,
      });

      const response = await request(app).get('/api/v1/data');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'No data available' });
    });
  });
});
