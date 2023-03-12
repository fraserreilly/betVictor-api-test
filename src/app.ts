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

// Endpoint to fetch data for param language
app.get('/api/v1/:lang/data', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    // Call the fetchData function to get the data for param lang
    const { result, ...error } = await fetchData(lang);

    // Handle any errors returned by the fetchData function
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }
    // Send the data as the response
    return res.send({ result });
  } catch (error: any) {
    // Handle any unexpected errors
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

// Endpoint to fetch sports data for param langauge
app.get('/api/v1/:lang/sports', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    // Call the fetchData function to get the data for param lang
    const { result, ...error } = await fetchData(lang);
    // Handle any errors returned by the fetchData function
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }
    // Extract sports data for each language from the fetched result
    const sports = result[lang].result.sports.map((sport: any) => sport.desc);
    // Send the extracted sports data as the response
    return res.send({ result: { sports } });
  } catch (error: any) {
    // Handle any unexpected errors
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

// Endpoint to fetch specific event data for param language
app.get('/api/v1/:lang/event', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    // Call the fetchData function to get the data for param lang
    const { result, ...error } = await fetchData(lang);
    // Handle any errors returned by the fetchData function
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }

    // If event query parameter is not provided, return 400 error
    const eventQuery = req.query.event?.toString();

    if (!eventQuery) {
      return res.status(400).send({ error: 'Event parameter is required' });
    }

    // Get the requested events from the query parameter
    const requestedEvents = new Set(eventQuery.toLowerCase().split(/,/));
    // Filter the events data for the requested events
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
    // If no events are found, return 404 error
    if (filteredEventsData.length === 0) {
      return res.status(404).send({ error: 'No events found' });
    }
    // Send the filtered events data as the response
    return res.send({ result: { events: filteredEventsData } });
  } catch (error: any) {
    // Handle any unexpected errors
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

// Endpoint to fetch event data for param language
app.get('/api/v1/:lang/events', async (req: Request, res: Response) => {
  try {
    const { lang } = req.params;
    // Call the fetchData function to get the data for param lang
    const { result, ...error } = await fetchData(lang);

    // Handle any errors returned by the fetchData function
    if (error.error) {
      return res.status(error.errorCode || 500).send({ error: error.error });
    }

    const data = result[lang].result.sports;
    // Get query parameter for sports
    const requestedSports: string[] =
      req.query.sports?.toString()?.toLowerCase().split(/,/) || [];
    // Get avaialble sports from data
    const sportsAvailable: Set<string> = new Set(
      data.flatMap((sport: any) => [
        sport.desc.toLowerCase(),
        sport.id.toString(),
      ])
    );
    // Check for unknown sports, if any, return error with unknown sports
    const unknownSports: string[] = requestedSports.filter(
      (requestedSport: string) => !sportsAvailable.has(requestedSport)
    );

    if (unknownSports.length) {
      return res
        .status(400)
        .send({ error: `Unknown sport(s): ${unknownSports.join(', ')}` });
    }
    // Filter events data by sports
    const filteredEventsData: any[] = data
      .flatMap((sport: any) => sport.comp.flatMap((comp: any) => comp.events))
      .sort((eventA: any, eventB: any) => eventA.pos - eventB.pos);
    // If requested sports are present, filter the events data by requested sports
    if (requestedSports.length) {
      const filteredSportsData = data.filter(
        (sport: any) =>
          requestedSports.includes(sport.desc.toLowerCase()) ||
          requestedSports.includes(sport.id.toString())
      );
      // Flatten the filtered sports data to get the events data
      const filteredEventsDataBySports: any[] = filteredSportsData
        .flatMap((sport: any) => sport.comp.flatMap((comp: any) => comp.events))
        .sort((eventA: any, eventB: any) => eventA.pos - eventB.pos);
      // Send the filtered events data as the response
      return res.send({ result: { events: filteredEventsDataBySports } });
    }
    // Send the filtered events data as the response
    return res.send({ result: { events: filteredEventsData } });
  } catch (error: any) {
    // Handle any unexpected errors
    const errorCode = error?.response?.status || 500;
    return res.status(errorCode).send({ error: 'Internal server error' });
  }
});

// Handle any non existing routes
app.use((req: Request, res: Response) => {
  res.status(404).send({ error: '404 Not Found' });
});

export default app;
