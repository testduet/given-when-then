import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { scenario } from './givenWhenThen';

scenario('todo list API', bdd => {
  const branch = bdd
    .given(
      'msw instance',
      () => {
        const server = setupServer(http.get('http://localhost/todo', () => HttpResponse.json(['Buy eggs'])));

        server.listen();

        return server;
      },
      server => {
        server.close();
      }
    )
    .and('an URL', () => 'http://localhost/todo')

    .when('fetched', url => fetch(url))

    .then('response should return ok', (_, res) => expect(res.ok).toBe(true))
    .and('content type should be "application/json"', (_, res) =>
      expect(res.headers.get('content-type')).toBe('application/json')
    );

  branch
    .when('body is parsed as JSON', (_, res) => res.json())

    .then('it should contains 1 item', (_, body) => expect(body).toHaveLength(1))
    .and('the first item should be "Buy eggs"', (_, body) => expect(body[0]).toEqual('Buy eggs'));

  branch
    .when('body is parsed as text', (_, res) => res.text())

    .then('it should be the JSON string', (_, body) => expect(body).toBe('["Buy eggs"]'));
});
