"use strict";

var _dec, _class;

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const {
  Inject
} = require('../decorators');

const FINAL_VARS = Symbol('View#finalVars');
const TEMPLATE = Symbol('View#template');
const VARS = Symbol('View#vars');
let View = (_dec = Inject('app'), _dec(_class = class View {
  constructor(app, ctx) {
    this.app = app;
    this.ctx = ctx;
    this[VARS] = {
      app: this.app,
      config: this.app.get('config'),
      session: ctx.session,

      old(name, defValue = '') {
        const sessionOld = ctx.session.old;
        return sessionOld && sessionOld[name] ? sessionOld[name] : defValue;
      }

    };
    this[TEMPLATE] = '';
  }

  set template(template) {
    this[TEMPLATE] = template;
  }

  set vars(vars) {
    this[VARS] = this[FINAL_VARS](vars);
  }
  /**
   * Generate template variables
   */


  [FINAL_VARS](vars = {}) {
    return Object.assign({}, this[VARS], vars);
  }
  /**
   * Pass the variable to the template
   * @param {string|object} name variable object or variable name
   * @param {mixed} value variable value
   */


  assign(name, value) {
    if (Object.prototype.toString.call(name) === '[object Object]') {
      this.assigns = Object.assign(this[VARS], name);
    } else if (typeof name === 'string') {
      this[VARS][name] = value;
    }

    return this;
  }
  /**
   * render the template
   * @param {string} template template path and name
   * @param {object} vars template variables
   */


  render(template = '', vars = null) {
    // When parsing the controller, return it if you take this parameter
    // 解析控制器时，如果带此参数则直接 return 出去
    if (Object.prototype.toString.call(template) === '[object Object]') {
      vars = template;
      template = null;
    }

    if (template) this[TEMPLATE] = template;
    if (vars) this[VARS] = this[FINAL_VARS](vars);
    return this.app.get('template').render(this.getTemplate(), this.getVars());
  }
  /**
   *
   * @param {*} str
   * @param {*} vars
   */


  renderString(str = '', vars = null) {
    if (vars) this[VARS] = this[FINAL_VARS](vars);
    return this.app.get('template').renderString(str, this.getVars());
  }

  getTemplate() {
    return this[TEMPLATE];
  }

  getVars() {
    return this[VARS];
  }

}) || _class);
module.exports = View;