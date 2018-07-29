const Boom = require('boom');

module.exports = {
  '/1': ctx => {
    ctx.body = 'A normal response';
  },
  '/2': ctx => {
    throw new Error('throw an original error');
  },
  '/3': ctx => {
    const err = new Error('throw a self-defined error');
    err.status = 403;
    throw err;
  },
  '/4': ctx => {
    throw Boom.notImplemented('throw a Boom error');
  },
  '/5': ctx => {
    ctx.status = 201;
    ctx.body = 'A normal response with another status';
  },
  '/6': ctx => {
    throw Boom.teapot('throw a teapot');
  }
};
