"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const {
  INJECTOR_CONETXT,
  CONTEXTS
} = require('../../symbol');

module.exports = function (app, ctx, next) {
  // runtime container
  const dazeContext = ctx[CONTEXTS];
  return {
    /**
     * Inject Koa ctx
     */
    get [`${INJECTOR_CONETXT.CTX}`]() {
      return ctx;
    },

    /**
     * Inject Koa next
     */
    get [`${INJECTOR_CONETXT.NEXT}`]() {
      return next;
    },

    /**
     * Inject Request
     */
    get [`${INJECTOR_CONETXT.REQUEST}`]() {
      return dazeContext.get('request', [ctx]);
    },

    /**
     * Inject ctx.session
     */
    get [`${INJECTOR_CONETXT.SESSION}`]() {
      return ctx.session;
    },

    set [`${INJECTOR_CONETXT.SESSION}`](val) {
      ctx.session = val;
    },

    /**
     * Inject ctx.cookies
     */
    get [`${INJECTOR_CONETXT.COOKIE}`]() {
      return ctx.cookies;
    },

    set [`${INJECTOR_CONETXT.COOKIE}`](val) {
      ctx.cookies = val;
    },

    /**
     * Inject Response
     */
    get [`${INJECTOR_CONETXT.RESPONSE}`]() {
      return dazeContext.get('response', [ctx]);
    },

    /**
     * Inject View
     */
    get [`${INJECTOR_CONETXT.VIEW}`]() {
      return dazeContext.get('view', [ctx]);
    },

    /**
     * Inject Redirect
     */
    get [`${INJECTOR_CONETXT.REDIRECT}`]() {
      return dazeContext.get('redirect', [ctx]);
    },

    /**
     * Inject ctx.request.body
     */
    get [`${INJECTOR_CONETXT.BODY}`]() {
      const request = dazeContext.get('request', [ctx]);
      return request.body;
    },

    /**
     * Inject ctx.params
     */
    get [`${INJECTOR_CONETXT.PARAMS}`]() {
      return ctx.params;
    },

    /**
     * Inject ctx.request.query
     */
    get [`${INJECTOR_CONETXT.QUERY}`]() {
      const request = dazeContext.get('request', [ctx]);
      return request.query;
    },

    /**
     * Inject ctx.request.headers
     */
    get [`${INJECTOR_CONETXT.HEADERS}`]() {
      const request = dazeContext.get('request', [ctx]);
      return request.headers;
    },

    /**
     * Inject Config
     */
    get [`${INJECTOR_CONETXT.CONFIG}`]() {
      return app.get('config');
    },

    /**
     * Inject App
     */
    get [`${INJECTOR_CONETXT.APP}`]() {
      return app;
    },

    /**
     * Inject Messenger
     */
    get [`${INJECTOR_CONETXT.MESSENGER}`]() {
      return app.get('messenger');
    },

    get [`${INJECTOR_CONETXT.AXIOS}`]() {
      return ctx.$http || null;
    },

    get [INJECTOR_CONETXT.SERVICE]() {
      return {
        app,
        ctx
      };
    }

  };
};