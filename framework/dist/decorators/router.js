"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const {
  PREFIX,
  ISROUTE
} = require('../symbol');

function injectClass(target, prefix) {
  let _prefix = prefix.slice(0, 1) === '/' ? prefix : `/${prefix}`;

  _prefix = _prefix.slice(-1) === '/' ? _prefix.slice(0, _prefix.length - 1) : _prefix;
  target.prototype[ISROUTE] = true;
  target.prototype[PREFIX] = _prefix; // Reflect.defineMetadata(ISROUTE, true, target.prototype)
  // Reflect.defineMetadata(PREFIX, _prefix, target.prototype)

  return target;
}

function handle(args, prefix) {
  if (args.length === 1) {
    return injectClass(...args, prefix);
  }
}

module.exports = function Router(prefix = '') {
  return function (...argsClass) {
    return handle(argsClass, prefix);
  };
};