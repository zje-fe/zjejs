"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const GET_MERGED_PARAMS = Symbol('Request#getMergedParams');

class Request {
  constructor(context) {
    this.context = context;
    this.request = this.context.request;
    this.mergedParams = this[GET_MERGED_PARAMS]();
  }
  /**
   * Gets the parameter value based on the parameter name
   * Returns the default value when the parameter does not exist
   * @param {string} name Parameter name
   * @param {mixed} defaultValue default parameter value
   */


  param(name, defaultValue = null) {
    if (name) {
      return this.has(name) ? this.mergedParams[name] : defaultValue;
    }

    return this.mergedParams;
  }
  /**
   * Filter parameters
   * @param {string} names An array of parameter names
   */


  only(...args) {
    const res = {};

    for (const arg of args) {
      if (typeof arg === 'string') {
        if (this.has(arg)) {
          res[arg] = this.param(arg);
        }
      } else if (Array.isArray(arg)) {
        for (const name of arg) {
          if (this.has(name)) {
            res[name] = this.param(name);
          }
        }
      }
    }

    return res;
  }
  /**
   * Filter parameters
   * @param {string} names An array of parameter names
   */


  except(...args) {
    let exceptKeys = [];
    let keys = Object.keys(this.param());

    for (const arg of args) {
      if (typeof arg === 'string') {
        exceptKeys.push(arg);
      } else if (Array.isArray(arg)) {
        exceptKeys = exceptKeys.concat(arg);
      }
    }

    keys = keys.filter(key => !~exceptKeys.indexOf(key));
    return this.only(keys);
  }
  /**
   * Determine whether the parameter exists
   * @param {string} name Parameter name
   */


  has(name) {
    return Reflect.has(this.mergedParams, name);
  }
  /**
   * Consolidation parameters
   */


  [GET_MERGED_PARAMS]() {
    return Object.assign(this.context.params || {}, this.request.query, this.request.body);
  }

}
/**
 * The agent Request class
 * Implement the attribute operator to get the parameter
 */


const requestProxy = new Proxy(Request, {
  construct(Target, args, extended) {
    const instance = Reflect.construct(Target, args, extended);
    return new Proxy(instance, {
      get(t, prop) {
        if (Reflect.has(t, prop) || typeof prop === 'symbol') {
          return t[prop];
        }

        if (Reflect.has(t.request, prop)) {
          return t.request[prop];
        }

        return t.param(prop);
      }

    });
  }

});
module.exports = requestProxy;