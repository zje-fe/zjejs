"use strict";

const axios = require('axios');

const Middleware = require('../../base/middleware');

const defaultOptions = {
  timeout: 3000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
};

function parseOptions(options = {}) {
  const res = options;

  if (options.headers) {
    res.headers = Object.assign({}, defaultOptions.headers, options.headers);
  }

  return Object.assign({}, defaultOptions, res);
}
/**
 * refer https://github.com/axios/axios
 */


class Axios extends Middleware {
  get options() {
    return {};
  }

  async handle(ctx, next) {
    const instance = axios.create(parseOptions(this.options));
    if (this.boot && typeof this.boot === 'function') this.boot(instance, ctx);
    ctx.$http = ctx.axios = instance;
    await next();
  }

}

module.exports = Axios;