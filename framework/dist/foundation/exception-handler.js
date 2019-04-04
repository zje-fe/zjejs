"use strict";

const ExceptionHandler = require('../exceptions/handle');

module.exports = function (app) {
  const Exception = new ExceptionHandler(app);
  return async (ctx, next) => {
    try {
      await next();

      if (ctx.status === 404) {
        ctx.throw(404, ctx.body);
      }
    } catch (err) {
      return Exception.render(err, ctx);
    }
  };
};