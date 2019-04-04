"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const is = require('is-type-of');

const {
  nope
} = require('../../utils');

const injectorArgsFactory = require('./args-factory');

function createInjector(Klass, injectorContext, callback = nope) {
  const KlassProxy = new Proxy(Klass, {
    construct(target, args, ext) {
      const instance = Reflect.construct(target, [...injectorArgsFactory(target, injectorContext), ...args], ext);
      const instanceProxy = new Proxy(instance, {
        get(t, name) {
          if (name !== 'constructor' && is.function(t[name])) {
            return new Proxy(t[name], {
              apply(tar, thisBinding, instanceArgs) {
                return Reflect.apply(tar, thisBinding, [...injectorArgsFactory(t[name], injectorContext), ...instanceArgs]);
              }

            });
          }

          return t[name];
        }

      });
      return instanceProxy;
    }

  });
  const instance = new KlassProxy(injectorContext);
  callback(instance);
  return instance;
}

module.exports = createInjector;