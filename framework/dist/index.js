"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// require('reflect-metadata')
const Container = require('./container');

const Controller = require('./base/controller');

const Service = require('./base/service');

const Decorators = require('./decorators');

const Resource = require('./resource');

const Middlewares = require('./foundation/middlewares');

const Middleware = require('./base/middleware');

module.exports = {
  Container,
  Controller,
  Service,
  Decorators,
  Resource,
  Middleware,
  Middlewares
};