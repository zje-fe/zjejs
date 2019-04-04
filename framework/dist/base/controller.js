"use strict";

const path = require('path');

const Base = require('./base');

const injectorFactory = require('../foundation/injector/factory');

class Controller extends Base {
  get render() {
    return this.view.render;
  }

  get assign() {
    return this.view.assign;
  }

  service(serviceName) {
    // console.log(this.app)
    if (!serviceName) return null;
    const serviceFilePath = path.join(this.app.servicePath, `${serviceName}.js`);

    if (require.resolve(serviceFilePath)) {
      const ServiceClass = require(serviceFilePath);

      return injectorFactory(ServiceClass, this.dazeContext);
    }
  }

}

module.exports = Controller;