"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const path = require('path');

const Inject = require('./inject');

const Container = require('../container');

exports.Inject = Inject;

exports.Transformer = function (...transformerNames) {
  const app = Container.get('app');
  const injectNames = [];

  for (const transformerName of transformerNames) {
    const tansformerFilePath = path.join(app.transformerPath, `${transformerName}.js`);

    if (require.resolve(tansformerFilePath)) {
      const TransformerClass = require(tansformerFilePath);

      if (!app.has(TransformerClass)) {
        app.bind(TransformerClass, TransformerClass);
      }

      injectNames.push(TransformerClass);
    } else {
      throw new Error(`service: ${transformerName} does not exist!`);
    }
  }

  return Inject(...injectNames);
};