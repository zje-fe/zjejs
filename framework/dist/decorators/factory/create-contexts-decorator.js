"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const patchControllerDecorator = require('./patch-controller-decorator');

function injectClass(target, params, type) {
  patchControllerDecorator(target.prototype, type, params);
  return target;
}

function injectdMethod(target, name, descriptor, params, type) {
  patchControllerDecorator(target[name], type, params);
  return descriptor;
}

function handle(args, params, type) {
  if (args.length === 1) {
    return injectClass(...args, params, type);
  } else {
    return injectdMethod(...args, params, type);
  }
}

module.exports = function (type) {
  return (...args) => (...argsClass) => {
    return handle(argsClass, args, type);
  };
};