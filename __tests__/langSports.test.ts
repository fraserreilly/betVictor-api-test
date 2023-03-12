import request from 'supertest';
import app from '../src/app';
import { fetchData } from '../src/fetchData';
import sampleData from '../__mocks__/sampleData.json';

jest.mock('../src/fetchData');

describe('/api/v1/:lang/sports', () => {
  describe('GET', () => {
    test('should return sports data when API call succeeds', async () => {
      const lang = 'en-gb';
      (fetchData as jest.Mock).mockResolvedValueOnce(sampleData);

      const response = await request(app).get(`/api/v1/${lang}/sports`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        result: { sports: ['Football'] },
      });
    });

    test('should return an error when API call fails', async () => {
      const lang = 'en-gb';
      const errorMessage = 'Something went wrong';
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: errorMessage,
        errorCode: 500,
      });

      const response = await request(app).get(`/api/v1/${lang}/sports`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: errorMessage });
    });

    test('should return an error when unsupported language is requested', async () => {
      const lang = 'fr-fr';
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: 'Unsupported language',
        errorCode: 400,
        result: undefined,
      });

      const response = await request(app).get(`/api/v1/${lang}/sports`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Unsupported language' });
    });
  });
});
