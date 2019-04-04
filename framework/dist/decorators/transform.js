"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const {
  TRANSFORM
} = require('../symbol');

function injectdMethod(target, name, descriptor, transform) {
  target[name][TRANSFORM] = transform;
  return descriptor;
}

function handle(args, transform) {
  if (args.length === 3) {
    return injectdMethod(...args, transform);
  }
}

module.exports = function Inject(transform) {
  return function (...argsClass) {
    return handle(argsClass, transform);
  };
};