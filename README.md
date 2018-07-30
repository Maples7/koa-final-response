# koa-final-response

[![Build Status](https://travis-ci.org/Maples7/koa-final-response.svg?branch=master)](https://travis-ci.org/Maples7/koa-final-response)
[![Coverage Status](https://coveralls.io/repos/github/Maples7/koa-final-response/badge.svg?branch=master)](https://coveralls.io/github/Maples7/koa-final-response?branch=master)
[![npm version](https://badge.fury.io/js/koa-final-response.svg)](https://badge.fury.io/js/koa-final-response)

[![NPM](https://nodei.co/npm/koa-final-response.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/koa-final-response/)

The very outer middleware of Koa to handle every response of every request.

## Usage

### Installation

`yarn add koa-final-response` or `npm install koa-final-response --save`

### Example

```js
const path = require('path');
// Error object, see https://github.com/hapijs/boom
// We recommand to use Boom as the standard object for error responses
const Boom = require('boom');
const Koa = require('koa');
const mountRoutes = require('koa-mount-routes');
const finalResp = require('koa-final-response');

const app = new Koa();
// this middleware should be added before router works
app.use(finalResp({ env: process.env.NODE_ENV || 'development' }));
// mount routes, see https://github.com/Maples7/koa-mount-routes
mountRoutes(app, path.join(__dirname, 'controllers'), {
  allowedMethods: {
    throw: true,
    notImplemented: () => {
      throw Boom.notImplemented('HTTP method for this API is not implemented');
    },
    methodNotAllowed: () => {
      throw Boom.methodNotAllowed('HTTP method for this API is not allowed');
    }
  }
});
app.listen(3000);
```

### How to return results

1. For normal responses, you can pass your result data to `ctx.body` directly just following the standard Koa way;

2. For error responses, we recommend you use [Boom](https://github.com/hapijs/boom) to pass those expected errors like `throw Boom.unauthorized('invalid password')`. Besides, any unexpected errors and non-Boom errors thrown by yourself will also be catched and handled well as you want.

### Responses

- Normal response

  ```json
  {
    "success": true,
    "data": ....  // what you assign to `ctx.body`
  }
  ```

- Error response

  ```json
  {
    "success": false,
    "error": "Method Not Allowed", // HTTP error correlated to HTTP statusCode
    "message": "HTTP method for this API is not allowed" // error message
  }
  ```

- 404 response

  ```json
  {
    "success": false,
    "error": "Not Found",
    "message": "API Not Found"
  }
  ```

### API

```js
app.use(
  finalResp({
    env, // String. you can pass environmental variable such as NODE_ENV to it. if it is `production`, we will not return error details to user but a vague error messege like `An internal server error occurred`. Default value: 'production'.
    errStatusCodePropertie // Array. it is about where to find HTTP Status Code of response while an error is thrown. We will search a valid number from property of Error Object in order. Default value: ['statusCode', 'status', 'code']. And the default HTTP Status Code for error response is 500.
  })
);
```

You are welcomed to review _test.js_ and _controllers_ dir in this project for more information of usage.

## Relatives

- [koa-mount-routes](https://github.com/Maples7/koa-mount-routes)
- [express-mount-routes](https://github.com/Maples7/express-mount-routes)
- [express-final-response](https://github.com/Maples7/express-final-response)

## LICENSE

[MIT](LICENSE)
