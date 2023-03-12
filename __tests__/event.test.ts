import request from 'supertest';
import app from '../src/app';
import { fetchData } from '../src/fetchData';
import sampleData from '../__mocks__/sampleData.json';

jest.mock('../src/fetchData');

describe('/api/v1/:lang/event', () => {
  describe('GET', () => {
    test('should return event when API call succeeds', async () => {
      const lang = 'en-gb';
      const eventId = 1889014500;
      (fetchData as jest.Mock).mockResolvedValueOnce(sampleData);

      const response = await request(app).get(
        `/api/v1/${lang}/event?event=${eventId}`
      );
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        result: {
          events: [
            {
              id: 1889014500,
              event_type: 'GAME_EVENT',
              event_path_id: 27616210,
              sport_id: 100,
              desc: 'Newcastle United v Wolves',
              oppADesc: 'Newcastle United',
              oppAId: 2436600,
              oppBDesc: 'Wolves',
              oppBId: 2842600,
              american: null,
              inPlay: true,
              time: 1678638600000,
              pos: 12,
              markets: [
                {
                  id: 11689922330,
                  st: 1,
                  pltNP: 1,
                  ca: true,
                  next: false,
                  ew: false,
                  o: [
                    {
                      rcNum: 0,
                      pr: 1.154,
                      price: {
                        oid: 121099878000,
                        prid: 537227590070,
                        pr: '2/13',
                        prd: 1.154,
                        fdp: '1.154',
                        h: false,
                        ms: 1,
                        os: 1,
                        timestamp: 1678640643284,
                      },
                      id: 121099878000,
                      des: 'Newcastle United',
                      hidden: false,
                      prId: 537227590070,
                      lineId: 2,
                      shD: '1',
                      wdrn: false,
                      prF: '2/13',
                      op: 1,
                    },
                    {
                      rcNum: 0,
                      pr: 7,
                      price: {
                        oid: 121099878200,
                        prid: 537227590066,
                        pr: '6/1',
                        prd: 7,
                        fdp: '7',
                        h: false,
                        ms: 1,
                        os: 1,
                        timestamp: 1678640643284,
                      },
                      id: 121099878200,
                      des: 'Draw',
                      hidden: false,
                      prId: 537227590066,
                      lineId: 2,
                      shD: 'X',
                      wdrn: false,
                      prF: '6/1',
                      op: 2,
                    },
                    {
                      rcNum: 0,
                      pr: 19,
                      price: {
                        oid: 121099878100,
                        prid: 537227590068,
                        pr: '18/1',
                        prd: 19,
                        fdp: '19',
                        h: false,
                        ms: 1,
                        os: 1,
                        timestamp: 1678640643284,
                      },
                      id: 121099878100,
                      des: 'Wolves',
                      hidden: false,
                      prId: 537227590068,
                      lineId: 2,
                      shD: '2',
                      wdrn: false,
                      prF: '18/1',
                      op: 3,
                    },
                  ],
                  status: 1,
                  current: true,
                  des: 'Match Betting',
                  mbl: 99071333,
                  mtId: 1,
                  mtid: 1,
                  eId: 1889014500,
                  pId: 100,
                  pid: 100,
                  prdDsc: '90 Mins',
                  pltD: 1,
                  pltDes: 'Win only',
                  mtDimension: 'match-betting',
                  p: '90 Mins',
                },
              ],
              eventPathTree: { table: {} },
              metadata: { badges: ['BET_BOOST', 'CORNERS', 'PIU'] },
              has_stream: false,
              scoreboard: {
                addresses: {
                  comment: '/scoreboard/board/1889014500/comments/en_GB',
                  essentialScoreboard: '/essentialscoreboard/100/1889014500',
                  essentialScoreboardCallback:
                    '/c/essentialscoreboard/100/1889014500/en_GB',
                  stats: '/scoreboard/board/1889014500/stats',
                  timeline: '/scoreboard/board/1889014500/timeline',
                  overviewComment:
                    '/scoreboard/board/1889014500/overview/comments/en_GB',
                },
                clockInSeconds: 1,
                validAt: 1678638695309,
                reversedClock: false,
                periodKey: 'H1',
                clockStatus: 'STARTED',
                marketSuspensionReason: '',
                inPlay: true,
                externalScoreboardConfiguration: {
                  provider: 'BET_RADAR',
                  eventId: 1889014500,
                  sportId: 100,
                  providerEventId: 34152219,
                  providerDescription:
                    'Newcastle United vs Wolverhampton Wanderers',
                  cdnUrl:
                    'https://widgets.sir.sportradar.com/6b003e4e80e158964cfca39bf6195fe9/widgetloader',
                },
                redCardA: 0,
                redCardB: 0,
                stoppageTime: '',
                matchLength: 90,
                eId: 1889014500,
                sId: 100,
                clk: '32:28',
                run: true,
                dsc: '1H',
                code: 234,
                sTs: 1678638600000,
                cal: true,
                act: 2436600,
                oaId: 2436600,
                obId: 2842600,
                scr: '1-0',
                scrA: 1,
                scrB: 0,
                pId: 10,
              },
            },
          ],
        },
      });
    });

    test('should return an error when API call fails', async () => {
      const lang = 'en-gb';
      const errorMessage = 'Something went wrong';
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: errorMessage,
        errorCode: 500,
      });

      const response = await request(app).get(`/api/v1/${lang}/event`);

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

      const response = await request(app).get(`/api/v1/${lang}/event`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Unsupported language' });
    });

    test('should return an error when no parameter is passed', async () => {
      const lang = 'en-gb';
      (fetchData as jest.Mock).mockResolvedValueOnce({
        error: 'Event parameter is required',
        errorCode: 400,
        result: undefined,
      });

      const response = await request(app).get(`/api/v1/${lang}/event`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Event parameter is required' });
    });
  });
});
