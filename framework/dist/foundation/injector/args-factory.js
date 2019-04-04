"use strict";

const is = require('is-type-of');

const {
  MODULE_INJECTORS
} = require('../../symbol');

const injectorAdapter = require('../adapter/injector-adapter');
/**
 * 控制器注入的参数
 * @param {object} instance 需要注入的实例
 * @param {string} methodName 注入到实例的方法的方法名
 * @param {object} injectorContext 所有可注入对象
 */


module.exports = function (target, injectorContext) {
  const args = [];
  let injectors = {};

  if (is.class(target)) {
    // 注入到类
    injectors = target.prototype[MODULE_INJECTORS] || {};
  } else {
    // 注入到类方法
    injectors = target[MODULE_INJECTORS] || {};
  }

  for (const [key, value] of Object.entries(injectors)) {
    const index = value[0];
    args.push([index, injectorAdapter(injectorContext, value, key)]);
  }

  return args.sort((a, b) => a[0] - b[0]).map(arg => arg[1]);
};