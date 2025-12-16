import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(http.get('http://localhost/todo', () => HttpResponse.json(['Buy eggs'])));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('given an URL', () => {
  let url: string;

  beforeEach(() => {
    url = 'http://localhost/todo';
  });

  describe('when fetched', () => {
    let res: Response;

    beforeEach(async () => {
      res = await fetch(url);
    });

    it('then response should return ok', () => expect(res.ok).toBe(true));
    it('and content type should be "application/json"', () =>
      expect(res.headers.get('content-type')).toBe('application/json'));

    describe('when body is parsed as JSON', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any;

      beforeEach(async () => {
        body = await res.json();
      });

      it('then it should contains 1 item', () => expect(body).toHaveLength(1));
      it('then the first item should be "Buy eggs"', () => expect(body[0]).toEqual('Buy eggs'));
    });

    describe('when body is parsed as text', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any;

      beforeEach(async () => {
        body = await res.text();
      });

      it('it should be the JSON string', () => expect(body).toBe('["Buy eggs"]'));
    });
  });
});
