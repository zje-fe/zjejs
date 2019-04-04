"use strict";

const {
  MODULE_INJECTORS
} = require('../../symbol');

module.exports = function (target, type, args) {
  if (!target[MODULE_INJECTORS]) {
    target[MODULE_INJECTORS] = {};
  }

  const keys = Object.keys(target[MODULE_INJECTORS]);
  target[MODULE_INJECTORS][type] = [keys.length + 1, args];
  return target;
};