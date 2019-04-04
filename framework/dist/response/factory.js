"use strict";

const {
  HTTP_CODE,
  TRANSFORM,
  CONTEXTS
} = require('../symbol');

const Response = require('./');

module.exports = async function (app, ctx, instance, methodName, args) {
  const code = instance[methodName][HTTP_CODE] || null;
  const transform = instance[methodName][TRANSFORM] || null;
  const controllerResult = await instance[methodName](...args); // console.log(controllerResult, 'controllerResult')

  if (controllerResult instanceof Response) {
    return controllerResult.code(code).transform(transform);
  }

  const response = ctx[CONTEXTS].get('response', [ctx]);
  return response.data(controllerResult).code(code).transform(transform);
};