"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const {
  INJECTOR_CONETXT
} = require('../../symbol');

const {
  getRequest,
  getService
} = require('./helpers');
/**
 * Inject the object according to the parameter transformation
 * @param {object} injectorContext injector context
 * @param {array} controllerInjector controller injector: [index, args]
 * @param {string} type inject type
 */


module.exports = function (injectorContext, controllerInjector, type) {
  const injector = injectorContext[type] || null;
  const args = controllerInjector[1];

  switch (type) {
    case INJECTOR_CONETXT.REQUEST:
      return getRequest(injector, args, injectorContext);

    case INJECTOR_CONETXT.SERVICE:
      return getService(injector, args, injectorContext);

    default:
      return injector;
  }
};