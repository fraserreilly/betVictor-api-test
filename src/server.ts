import express, { Request, Response } from 'express';
import { fetchData } from '../src/fetchData';

const app = express();

// Define an endpoint for GET requests to /api/v1/data
app.get('/api/v1/data', async (req: Request, res: Response) => {
  try {
    // Fetch data from the API using the fetchData function
    const { lang, result, ...error } = await fetchData();

    // Check if an error occurred during the API request
    if (error.error) {
      // Return the error message and status code as a JSON response
      return res.status(error.errorCode || 500).send({ error: error.error });
    }

    // Return the language and result as a JSON response
    return res.send({ lang, result });
  } catch (error: any) {
    // If an unexpected error occurred, handle it and return an error response
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

app.get('/api/v1/sports', async (req: Request, res: Response) => {
  try {
    const { result, ...error } = await fetchData();
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }
    const sports: Record<string, string[]> = {};
    for (const lang in result) {
      const data = result[lang].result;
      sports[lang] = data.sports.map((sport: any) => sport.desc);
    }
    return res.send({ result: { sports } });
  } catch (error: any) {
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;
