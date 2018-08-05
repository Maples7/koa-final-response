const http = require('http');
const path = require('path');
const test = require('ava');
const Boom = require('boom');
const Koa = require('koa');
const request = require('supertest');
const mountRoutes = require('koa-mount-routes');
const finalResp = require('./index');

function makeApp() {
  const app = new Koa();
  app.use(finalResp());
  mountRoutes(app, path.join(__dirname, 'controllers'), {
    allowedMethods: {
      throw: true,
      notImplemented: () => {
        throw Boom.notImplemented(
          'HTTP method for this API is not implemented'
        );
      },
      methodNotAllowed: () => {
        throw Boom.methodNotAllowed('HTTP method for this API is not allowed');
      }
    }
  });
  return http.createServer(app.callback());
}

function makeApp2() {
  const app = new Koa();
  app.context.log = console;
  app.use(finalResp({ env: 'development' }));
  mountRoutes(app, path.join(__dirname, 'controllers'), {
    allowedMethods: {
      throw: true,
      notImplemented: () => {
        throw Boom.notImplemented(
          'HTTP method for this API is not implemented'
        );
      },
      methodNotAllowed: () => {
        throw Boom.methodNotAllowed('HTTP method for this API is not allowed');
      }
    }
  });
  return http.createServer(app.callback());
}

test('GET /tests/1', async t => {
  t.plan(2);

  const res = await request(makeApp()).get('/tests/1');

  t.is(res.status, 200);
  t.is(res.body.data, 'A normal response');
});

test('COPY /tests/1', async t => {
  t.plan(3);

  const res = await request(makeApp()).copy('/tests/1');

  t.is(res.status, 501);
  t.is(res.body.error, 'Not Implemented');
  t.is(res.body.message, 'HTTP method for this API is not implemented');
});

test('POST /tests/1', async t => {
  t.plan(3);

  const res = await request(makeApp()).post('/tests/1');

  t.is(res.status, 405);
  t.is(res.body.error, 'Method Not Allowed');
  t.is(res.body.message, 'HTTP method for this API is not allowed');
});

test('GET /tests/2 in production', async t => {
  t.plan(2);

  const res = await request(makeApp()).get('/tests/2');

  t.is(res.status, 500);
  t.is(res.body.message, 'An internal server error occurred');
});

test('GET /tests/2 in development', async t => {
  t.plan(2);

  const res = await request(makeApp2()).get('/tests/2');

  t.is(res.status, 500);
  t.is(res.body.message, 'throw an original error');
});

test('GET /tests/3', async t => {
  t.plan(3);

  const res = await request(makeApp()).get('/tests/3');

  t.is(res.status, 403);
  t.is(res.body.error, 'Forbidden');
  t.is(res.body.message, 'throw a self-defined error');
});

test('GET /tests/4', async t => {
  t.plan(3);

  const res = await request(makeApp()).get('/tests/4');

  t.is(res.status, 501);
  t.is(res.type, 'application/json');
  t.is(res.body.message, 'throw a Boom error');
});

test('GET /tests/5', async t => {
  t.plan(3);

  const res = await request(makeApp()).get('/tests/5');

  t.is(res.status, 201);
  t.is(res.type, 'application/json');
  t.is(res.body.data, 'A normal response with another status');
});

test('GET /tests/6', async t => {
  t.plan(3);

  const res = await request(makeApp()).get('/tests/6');

  t.is(res.status, 418);
  t.is(res.body.error, "I'm a teapot");
  t.is(res.body.message, 'throw a teapot');
});

test('GET /tests/7', async t => {
  t.plan(2);

  const res = await request(makeApp()).get('/tests/7');

  t.is(res.status, 204);
  t.is(res.headers['content-length'], undefined);
});

test('GET /tests/100', async t => {
  t.plan(3);

  const res = await request(makeApp()).get('/tests/100');

  t.is(res.status, 404);
  t.is(res.body.error, 'Not Found');
  t.is(res.body.message, 'API Not Found');
});
