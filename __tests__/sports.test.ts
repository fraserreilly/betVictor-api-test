import request from 'supertest';
import app from '../src/app';
import { fetchData } from '../src/fetchData';
import sampleData from '../__mocks__/sampleData.json';

jest.mock('../src/fetchData');

describe('/api/v1/sports', () => {
  describe('GET', () => {
    test('should return sports data for all languages when API call succeeds', async () => {
      (fetchData as jest.Mock).mockResolvedValueOnce(sampleData);

      const response = await request(app).get('/api/v1/sports');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        result: {
          sports: {
            'en-gb': ['Football'],
            'de-de': ['Basketball'],
            'zh-cn': ['乒乓球'],
          },
        },
      });
    });

    test('should return an error when API call fails', async () => {
      const errorMessage = 'Something went wrong';
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: errorMessage,
        errorCode: 500,
      });

      const response = await request(app).get('/api/v1/sports');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
    });

    test('should return an error when unexpected error occurs', async () => {
      (fetchData as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      const response = await request(app).get('/api/v1/sports');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
