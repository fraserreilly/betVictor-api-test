// url: https://partners.betvictor.mobi/en-gb/in-play/1/events

import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const app = express();
const cache = new NodeCache({ stdTTL: 60 * 60 });

async function fetchData(
  lang?: string
): Promise<{ [lang: string]: any } & { error?: string; errorCode?: number }> {
  const supportedLanguages = ['en-gb', 'de-de', 'zh-cn'];
  const languages = lang ? [lang] : supportedLanguages;

  const data: any = {};

  for (const language of languages) {
    const cachedData = cache.get(language);
    const url = `https://partners.betvictor.mobi/${language}/in-play/1/events`;

    if (cachedData) {
      data[language] = cachedData;
    } else {
      try {
        const response = await fetch(url);
        const responseData = await response.json();
        switch (true) {
          case !responseData:
            return { error: 'No data available', errorCode: 404 };
          case !supportedLanguages.includes(language):
            return { error: 'Unsupported language', errorCode: 400 };
          default:
            cache.set(language, responseData);
            data[language] = responseData;
        }
      } catch (error) {
        return { error: (error as Error).message, errorCode: 500 };
      }
    }
  }
  return { data };
}

app.get('/api/v1/:lang/data', async (req: Request, res: Response) => {
  try {
    const lang = req.params.lang;
    const { status, data } = (await fetchData(lang)).data[lang];
    res.send({ status, data });
  } catch (error: any) {
    const errorCode = error?.response?.status || 500;
    res.status(errorCode).send({ error: error?.message });
  }
});

app.get('/api/v1/data', async (res: Response) => {
  try {
    const { lang, sport, data } = await fetchData();

    return res.send({ lang, sport, data });
  } catch (error: any) {
    const errorCode = error.status || 500;
    const errorMessage = error.message || 'Internal server error';

    return res.status(errorCode).send({ error: errorMessage });
  }
});

app.get('/api/v1/:lang/sports', async (req: Request, res: Response) => {
  try {
    const lang = req.params.lang;
    const { data } = await fetchData(lang);

    const sports = data[lang].result.sports.map((sport: any) => sport.desc);

    return res.send({ result: { sports } });
  } catch (error: any) {
    const errorCode = error.response ? error.response.status : 500;
    return res.status(errorCode).send({ error: error.message });
  }
});

app.get('/api/v1/sports', async (req: Request, res: Response) => {
  try {
    const { data } = await fetchData();

    const sports: Record<string, string[]> = {};
    for (const lang in data) {
      const langData = data[lang].result;
      sports[lang] = langData.sports.map((sport: any) => sport.desc);
    }

    res.send({ result: { sports } });
  } catch (error: any) {
    const errorCode = error.response?.status || 500;
    res.status(errorCode).send({ error: error.message });
  }
});

app.get('/api/v1/:lang/event', async (req: Request, res: Response) => {
  const { lang } = req.params;

  try {
    const { data } = await fetchData(lang);
    const eventQuery = req.query.event?.toString();

    if (!eventQuery) {
      return res.status(400).send({ error: 'Event parameter is required' });
    }

    const requestedEvents = new Set(eventQuery.toLowerCase().split(/,/));

    const filteredEventsData = data[lang].result.sports
      .flatMap((sport: any) =>
        sport.comp.flatMap((comp: any) =>
          comp.events.filter(
            (event: any) =>
              requestedEvents.size === 0 ||
              requestedEvents.has(event.desc.toLowerCase()) ||
              requestedEvents.has(event.id.toString())
          )
        )
      )

      .sort((eventA: any, eventB: any) => eventA.pos - eventB.pos);

    if (filteredEventsData.length === 0) {
      return res.status(404).send({ error: 'No events found' });
    }

    return res.send({ result: { events: filteredEventsData } });
  } catch (error: any) {
    const errorCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;
    return res.status(errorCode).send({ error: errorMessage });
  }
});

app.get('/api/v1/:lang/events', async (req: Request, res: Response) => {
  const { lang } = req.params;
  const { data, error, errorCode } = await fetchData(lang);

  if (error) {
    const statusCode = errorCode || 500;
    return res.status(statusCode).send({ error });
  }

  const sportsData = data[lang].result.sports;
  const requestedSports: string[] =
    req.query.sports?.toString()?.toLowerCase().split(/,/) || [];
  const sportsAvailable: Set<string> = new Set(
    sportsData.flatMap((sport: any) => [
      sport.desc.toLowerCase(),
      sport.id.toString(),
    ])
  );

  const unknownSports: string[] = requestedSports.filter(
    (requestedSport: string) => !sportsAvailable.has(requestedSport)
  );

  if (unknownSports.length) {
    return res
      .status(400)
      .send({ error: `Unknown sport(s): ${unknownSports.join(', ')}` });
  }

  const filteredEventsData: any[] = sportsData
    .flatMap((sport: any) => sport.comp.flatMap((comp: any) => comp.events))
    .sort((eventA: any, eventB: any) => eventA.pos - eventB.pos);

  if (requestedSports.length) {
    const filteredSportsData = sportsData.filter(
      (sport: any) =>
        requestedSports.includes(sport.desc.toLowerCase()) ||
        requestedSports.includes(sport.id.toString())
    );
    const filteredEventsDataBySports: any[] = filteredSportsData
      .flatMap((sport: any) => sport.comp.flatMap((comp: any) => comp.events))
      .sort((eventA: any, eventB: any) => eventA.pos - eventB.pos);

    return res.send({ result: { events: filteredEventsDataBySports } });
  }

  return res.send({ result: { events: filteredEventsData } });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
