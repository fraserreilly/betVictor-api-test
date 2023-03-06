// url: https://partners.betvictor.mobi/en-gb/in-play/1/events

import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const app = express();
const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache for 1 hour

/*
interface Data {
  id: string;
  name: string;
  description: string;
}
*/

async function fetchData(
  lang: string
): Promise<{ data?: any; error?: string; errorCode?: number }> {
  const cachedData = cache.get(lang);
  const supportedLanguages = ['en-gb', 'de-de', 'zh-cn'];
  const url = `https://partners.betvictor.mobi/${lang}/in-play/1/events`;

  if (cachedData) {
    return { data: cachedData };
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    switch (true) {
      case !data:
        return { error: 'No data available', errorCode: 404 };
      case !supportedLanguages.includes(lang):
        return { error: 'Unsupported language', errorCode: 400 };
      default:
        cache.set(lang, data);
        return { data };
    }
  } catch (error) {
    return { error: (error as Error).message, errorCode: 500 };
  }
}

app.get('/api/v1/:lang/data', async (req: Request, res: Response) => {
  const lang = req.params.lang;
  const { data, error, errorCode } = await fetchData(lang);

  if (error) {
    return res.status(errorCode || 500).send({ error });
  }

  return res.send(data);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
