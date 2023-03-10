import request from 'supertest';
import app from '../src/server';
import { fetchData } from '../src/fetchData';

jest.mock('./fetchData');

describe('/api/v1/data', () => {
  describe('GET', () => {
    test('should return data when API call succeeds', async () => {
      const data = { en: { foo: 'bar' }, de: { baz: 'qux' } };
      (fetchData as jest.Mock).mockResolvedValueOnce({ result: data });

      const response = await request(app).get('/api/v1/data');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ lang: undefined, result: data });
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

    test('should return an error when unsupported language is requested', async () => {
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: 'Unsupported language',
        errorCode: 400,
        result: undefined,
      });

      const response = await request(app).get('/api/v1/data?lang=fr');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Unsupported language' });
    });
  });
});
