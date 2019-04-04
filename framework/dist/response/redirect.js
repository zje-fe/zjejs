"use strict";

const is = require('is-type-of');

const Response = require('./');

const {
  SESSION_FLASHS,
  SESSION_FLASHED
} = require('../symbol');

const SET_FLASH = Symbol('Redirect#setFlash');

class Redirect extends Response {
  /**
   * 设置重定向地址
   * @param {string} url
   * @param {number} code
   */
  url(url, code = 302) {
    this.data(url).code(code).header('Location', this.getUrl());
    return this;
  }
  /**
   * 设置重定向地址
   * @param {string} alt
   * @param {number} code
   */


  back(alt, code = 302) {
    const url = this.ctx.get('Referrer') || alt || '/';
    this.code(code).header('Location', url);
    return this;
  }
  /**
   * 获取跳转地址
   */


  getUrl() {
    const data = this.getData();
    return data;
  }

  withInput() {
    const old = this.ctx.params;
    this[SET_FLASH]('old', old);
    return this;
  }
  /**
   * 保存 session 并设置一次性标识
   */


  [SET_FLASH](name, value) {
    if (!name || !value) return this;
    this.ctx.session[name] = value;

    if (!this.ctx.session[SESSION_FLASHS]) {
      this.ctx.session[SESSION_FLASHS] = [];
    }

    this.ctx.session[SESSION_FLASHS].push(name);
    this.ctx.session[SESSION_FLASHED] = false;
  }
  /**
   * 保存一次性 session
   * @param {object|string} name
   * @param {mixed} value
   */


  with(name, value) {
    if (!name || !value) return this;

    if (is.object(name)) {
      Object.keys(name).forEach(key => {
        this[SET_FLASH](key, name[key]);
      });
    } else {
      this[SET_FLASH](name, value);
    }

    return this;
  }

}

module.exports = Redirect;