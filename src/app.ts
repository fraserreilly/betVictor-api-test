import express, { Request, Response } from 'express';
import { fetchData } from '../src/fetchData';

const app = express();

// Endpoint to fetch data for all languages
app.get('/api/v1/data', async (req: Request, res: Response) => {
  try {
    // Call the fetchData function to get the data for all languages
    const { lang, result, ...error } = await fetchData();

    // Handle any errors returned by the fetchData function
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }

    // Send the data as the response
    return res.send({ lang, result });
  } catch (error: any) {
    // Handle any unexpected errors
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

// Endpoint to fetch sports data for all languages
app.get('/api/v1/sports', async (req: Request, res: Response) => {
  try {
    // Call the fetchData function to get the data for all languages
    const { result, ...error } = await fetchData();

    // Handle any errors returned by the fetchData function
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }

    // Extract sports data for each language from the fetched result
    const sports: Record<string, string[]> = {};
    for (const lang in result) {
      const data = result[lang].result;
      sports[lang] = data.sports.map((sport: any) => sport.desc);
    }

    // Send the extracted sports data as the response
    return res.send({ result: { sports } });
  } catch (error: any) {
    // Handle any unexpected errors
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

app.get('/api/v1/:lang/data', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    const { result, ...error } = await fetchData(lang);
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }
    return res.send({ result });
  } catch (error: any) {
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

app.get('/api/v1/:lang/sports', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    const { result, ...error } = await fetchData(lang);
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }
    const sports = result[lang].result.sports.map((sport: any) => sport.desc);
    return res.send({ result: { sports } });
  } catch (error: any) {
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

app.get('/api/v1/:lang/event', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    const { result, ...error } = await fetchData(lang);
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }
    const eventQuery = req.query.event?.toString();

    if (!eventQuery) {
      return res.status(400).send({ error: 'Event parameter is required' });
    }

    const requestedEvents = new Set(eventQuery.toLowerCase().split(/,/));

    const filteredEventsData = result[lang].result.sports
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
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

app.get('/api/v1/:lang/events', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    const { result, ...error } = await fetchData(lang);

    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }

    const data = result[lang].result.sports;
    const requestedSports: string[] =
      req.query.sports?.toString()?.toLowerCase().split(/,/) || [];
    const sportsAvailable: Set<string> = new Set(
      data.flatMap((sport: any) => [
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

    const filteredEventsData: any[] = data
      .flatMap((sport: any) => sport.comp.flatMap((comp: any) => comp.events))
      .sort((eventA: any, eventB: any) => eventA.pos - eventB.pos);

    if (requestedSports.length) {
      const filteredSportsData = data.filter(
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
  } catch (error: any) {
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).send({ error: '404 Not Found' });
});

export default app;
