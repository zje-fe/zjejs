"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const path = require('path');

const _ = require('lodash');
/**
 * getService
 * @param {object} injector app
 * @param {array} args services
 */


exports.getService = function (injector, args, injectorContext) {
  if (args.length === 0) return null;

  if (args.length === 1) {
    const serviceFilePath = path.join(injector.app.servicePath, `${args[0]}.js`);

    if (require.resolve(serviceFilePath)) {
      const ServiceClass = require(serviceFilePath);

      return require('../injector/factory')(ServiceClass, injectorContext);
    }
  } else {
    const res = {};

    for (const serviceName of args) {
      const serviceFilePath = path.join(injector.app.servicePath, `${serviceName}.js`);

      if (require.resolve(serviceFilePath)) {
        const ServiceClass = require(serviceFilePath);

        require('../injector/factory')(ServiceClass, injectorContext, serviceInstance => {
          _.set(res, serviceName.split('/').join('.'), serviceInstance);
        });
      }
    }

    return res;
  }
};
/**
 * getRequest
 * @param {*} injector Request
 * @param {array} args request args
 */


exports.getRequest = function (injector, args) {
  return args.length > 0 ? injector.param(...args) : injector;
};