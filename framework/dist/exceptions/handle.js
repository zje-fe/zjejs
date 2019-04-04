"use strict";

const statuses = require('statuses');

const fs = require('fs');

const path = require('path');

const nunjucks = require('nunjucks');

const tracePage = require('koa-trace-page'); // const HttpException = require('./HttpException')


class Handle {
  constructor(app) {
    this.app = app;
  }

  render(err, ctx) {
    this.ctx = ctx;
    return this.exceptionResponse(err);
  }

  renderTrance(err, ctx) {
    return tracePage(err, ctx, {
      logo: `${fs.readFileSync(path.resolve(__dirname, './templates/assets/logo.svg'))}<span style="vertical-align: top;line-height: 50px;margin-left: 10px;">Daze.js</span>`
    });
  }

  exceptionResponse(err) {
    // let httpCode = 500
    let type = 'text'; // if (err instanceof HttpException) {
    //   httpCode = err.statusCode
    // }

    this.ctx.status = err.status;
    type = this.ctx.accepts('html', 'text', 'json');
    type = type || 'text';
    this.ctx.type = type;
    return this[type](err);
  }

  text(err) {
    this.ctx.body = err.message || statuses[+err.statusCode];
  }

  json(err) {
    const message = err.message || statuses[+err.statusCode];
    const data = {
      message
    };

    if (this.app.isDebug) {
      if (err.statusCode >= 500) {
        data.stack = err.stack;
      }
    }

    this.ctx.body = data; // this.app.emit('error', e, this)
  }

  html(err) {
    // check application is debug mode
    if (this.app.isDebug) {
      // check http status code is >= 500
      return this.renderTrance(err, this.ctx);
    } else {
      // prod mode
      const config = this.app.get('config');
      const env = new nunjucks.Environment(new nunjucks.FileSystemLoader([this.app.viewsPath, path.resolve(__dirname, 'templates')]), {
        noCache: this.app.isDebug
      }); // get http_exception_template object

      const httpExceptionTemplate = config.get('app.http_exception_template'); // check user config s status page

      if (Reflect.has(httpExceptionTemplate, this.ctx.status)) {
        this.ctx.body = env.render(httpExceptionTemplate[this.ctx.status] || 'error.html', {
          err,
          app: this.app,
          config: this.app.get('config'),
          session: this.ctx.session,

          old(name, defValue = '') {
            const sessionOld = this.ctx.session.old;
            return sessionOld && sessionOld[name] ? sessionOld[name] : defValue;
          }

        });
      } else if (Reflect.has(httpExceptionTemplate, 'error')) {
        this.ctx.body = env.render(httpExceptionTemplate.error || 'error.html', {
          err,
          app: this.app,
          config: this.app.get('config'),
          session: this.ctx.session,

          old(name, defValue = '') {
            const sessionOld = this.ctx.session.old;
            return sessionOld && sessionOld[name] ? sessionOld[name] : defValue;
          }

        });
      } else {
        this.ctx.body = env.render('error.html', {
          err
        });
      }
    }
  }

}

module.exports = Handle;