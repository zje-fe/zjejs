"use strict";

const {
  INJECTOR_CONETXT
} = require('../symbol');

const createContextsDecorator = require('./factory/create-contexts-decorator');

exports.Request = exports.Req = createContextsDecorator(INJECTOR_CONETXT.REQUEST);
exports.Response = exports.Res = createContextsDecorator(INJECTOR_CONETXT.RESPONSE);
exports.Cookie = createContextsDecorator(INJECTOR_CONETXT.COOKIE);
exports.Ctx = createContextsDecorator(INJECTOR_CONETXT.CTX);
exports.Next = createContextsDecorator(INJECTOR_CONETXT.NEXT);
exports.Session = createContextsDecorator(INJECTOR_CONETXT.SESSION);
exports.Redirect = createContextsDecorator(INJECTOR_CONETXT.REDIRECT);
exports.View = createContextsDecorator(INJECTOR_CONETXT.VIEW);
exports.Body = createContextsDecorator(INJECTOR_CONETXT.BODY);
exports.Params = createContextsDecorator(INJECTOR_CONETXT.PARAMS);
exports.Query = createContextsDecorator(INJECTOR_CONETXT.QUERY);
exports.Headers = createContextsDecorator(INJECTOR_CONETXT.HEADERS);
exports.Config = createContextsDecorator(INJECTOR_CONETXT.CONFIG);
exports.App = createContextsDecorator(INJECTOR_CONETXT.APP);
exports.Messenger = createContextsDecorator(INJECTOR_CONETXT.MESSENGER);
exports.Service = createContextsDecorator(INJECTOR_CONETXT.SERVICE);
exports.Axios = createContextsDecorator(INJECTOR_CONETXT.AXIOS);