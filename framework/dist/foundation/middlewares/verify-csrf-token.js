"use strict";

const Tokens = require('csrf');

const pathToRegexp = require('path-to-regexp');

const HttpException = require('../../exceptions/http-exception');

const Middleware = require('../../base/middleware');

const readVerbs = ['HEAD', 'GET', 'OPTIONS'];

class VerifyCsrfToken extends Middleware {
  /**
   * The URIs that should be excluded from CSRF verification.
   * @type {array}
   */
  get except() {
    return [];
  }

  handle(ctx, next) {
    if (this.isReadVerb(ctx) || this.inExcept(ctx) || this.tokenValidity(ctx)) {
      if (!ctx.session.secret) {
        ctx.session.secret = Tokens.secretSync();
      }

      return next();
    } else {
      throw new HttpException(403, 'invalid token!');
    }
  }
  /**
   * Verify the token validity
   * @refer https://github.com/koajs/csrf/blob/master/src/index.js
   * @param {object} ctx
   * @returns {boolean}
   */


  tokenValidity(ctx) {
    const bodyToken = ctx.request.body && typeof ctx.request.body._token === 'string' ? ctx.request.body._token : false;
    const token = bodyToken || ctx.get('csrf-token') || ctx.get('xsrf-token') || ctx.get('x-csrf-token') || ctx.get('x-xsrf-token');

    if (!token) {
      return false;
    }

    if (!Tokens.verify(ctx.session.secret, token)) {
      return false;
    }

    return true;
  }
  /**
   * Check if the current request path requires validation
   * @param {object} ctx
   * @returns {boolean}
   */


  inExcept(ctx) {
    for (const except of this.except) {
      const re = pathToRegexp(except);

      if (re.exec(ctx.path)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Check if the current request type requires validation
   * @param {object} ctx
   * @returns {boolean}
   */


  isReadVerb(ctx) {
    return !!~readVerbs.indexOf(ctx.method);
  }

}

module.exports = VerifyCsrfToken;