import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 });

// Fetch data from an API with caching support
export async function fetchData(
  lang?: string
): Promise<{ [lang: string]: any } & { error?: string; errorCode?: number }> {
  const supportedLanguages = ['en-gb', 'de-de', 'zh-cn'];
  const languages = lang ? [lang] : supportedLanguages;
  const result: any = {};

  for (const language of languages) {
    const cachedData = cache.get(language); // Check if data is cached for the language
    const url = `https://partners.betvictor.mobi/${language}/in-play/1/events`;

    if (!supportedLanguages.includes(language)) {
      // Return an error if language is not supported
      return {
        error: 'Unsupported language',
        errorCode: 400,
        result: undefined,
      };
    }

    if (cachedData) {
      // Use cached data if available
      result[language] = cachedData;
    } else {
      // Otherwise fetch data from API
      try {
        const response = await fetch(url);
        const responseData = await response.json();

        switch (true) {
          case !responseData:
            return {
              // Return an error if no data is available
              error: 'No data available',
              errorCode: 404,
              result: undefined,
            };
          default: // Cache the data
            cache.set(language, responseData);
            result[language] = responseData; // Use fetched data
        }
      } catch (error: any) {
        // Catch any errors during the request
        return {
          error: (error as Error).message,
          errorCode: 500,
          result: undefined,
        };
      }
    }
  }
  return { result: result };
}
