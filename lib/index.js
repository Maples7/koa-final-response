const Boom = require('boom');

function isFunction(func) {
  return typeof func === 'function';
}

module.exports = ({
  env = 'production',
  errStatusCodePropertie = ['statusCode', 'status', 'code'],
  logger = null
} = {}) => async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      throw Boom.notFound('API Not Found');
    }
    const response = ctx.body;
    if (response) {
      ctx.body = {
        success: true,
        data: response
      };
    }
  } catch (err) {
    if (logger !== false) {
      logger = logger || ctx.log;
      if (logger && isFunction(logger.error)) {
        logger.error(err);
      }
    }

    if (!Boom.isBoom(err)) {
      let statusCode = 500;
      for (let property of errStatusCodePropertie) {
        if (Number.isInteger(err[property])) {
          statusCode = ~~err[property];
        }
      }
      err = Boom.boomify(err, {
        statusCode: statusCode
      });
    }

    const payload = err.output.payload;
    ctx.status = payload.statusCode;
    ctx.body = {
      success: false,
      error: payload.error,
      message:
        (env !== 'production' ? err.message : payload.message) ||
        payload.message
    };
  }
};
