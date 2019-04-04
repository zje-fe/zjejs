"use strict";

const is = require('is-type-of');

const BIND = Symbol('Conetxt#bind');

class Context {
  constructor(ctx) {
    this.ctx = ctx;
    this.binds = new Map([['request', require('../request')], ['view', require('../view')], ['redirect', require('../response/redirect')], ['response', require('../response')]]);
    this.instances = new Map();
  }

  [BIND](abstract, concrete = null) {
    if (!abstract || !concrete) return;

    if (typeof concrete === 'function') {
      // 首字母大写，则视为构造函数
      if (is.class(concrete) || /^[A-Z]+/.test(concrete.name)) {
        // If it's a constructor
        this.binds.set(abstract, concrete);
      } else {
        this.instances.set(abstract, concrete);
      }
    } else {
      // others
      this.instances.set(abstract, concrete);
    }

    return this;
  }

  make(abstract, args = []) {
    let obj = null;

    if (this.instances.has(abstract)) {
      return this.instances.get(abstract);
    }

    if (this.binds.has(abstract)) {
      obj = Reflect.construct(this.binds.get(abstract), args);
    }

    if (obj) {
      this.instances.set(abstract, obj);
    }

    return obj;
  }

  bind(abstract, concrete = null) {
    this[BIND](abstract, concrete);
  }

  get(abstract, args = []) {
    return this.make(abstract, args);
  }

}

module.exports = Context;