"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const toIdentifier = require('toidentifier');

const statuses = require('statuses');

const is = require('is-type-of');

const path = require('path');

const Container = require('../container');

const Resource = require('../resource');

const ResourceFactory = require('../resource/factory'); // const Redirect = require('./Redirect')


const POPULATE_ERROR_CODE_METHODS = Symbol('Response#populateErrorCodeMethods');
const CODE = Symbol('Response#code');
const DATA = Symbol('Response#data');
const HEADER = Symbol('Response#header');

class Response {
  constructor(ctx) {
    this.app = Container.get('app');
    this.ctx = ctx;
    /** @type {number} this[CODE] http status code */

    this[CODE] = 200;
    /** @type {mixed} this[DATA] returns data */

    this[DATA] = null;
    /** @type {array} this[HEADER] http header */

    this[HEADER] = {};
    this[POPULATE_ERROR_CODE_METHODS]();
  }
  /**
   * populate error code methods
   *
   * 400 BadRequest
   * 401 Unauthorized
   * 402 PaymentRequired
   * 403 Forbidden
   * 404 NotFound
   * 405 MethodNotAllowed
   * 406 NotAcceptable
   * 407 ProxyAuthenticationRequired
   * 408 RequestTimeout
   * 409 Conflict
   * 410 Gone
   * 411 LengthRequired
   * 412 PreconditionFailed
   * 413 PayloadTooLarge
   * 414 URITooLong
   * 415 UnsupportedMediaType
   * 416 RangeNotSatisfiable
   * 417 ExpectationFailed
   * 418 ImATeapot
   * 421 MisdirectedRequest
   * 422 UnprocessableEntity
   * 423 Locked
   * 424 FailedDependency
   * 425 UnorderedCollection
   * 426 UpgradeRequired
   * 428 PreconditionRequired
   * 429 TooManyRequests
   * 431 RequestHeaderFieldsTooLarge
   * 451 UnavailableForLegalReasons
   * 500 InternalServerError
   * 501 NotImplemented
   * 502 BadGateway
   * 503 ServiceUnavailable
   * 504 GatewayTimeout
   * 505 HTTPVersionNotSupported
   * 506 VariantAlsoNegotiates
   * 507 InsufficientStorage
   * 508 LoopDetected
   * 509 BandwidthLimitExceeded
   * 510 NotExtended
   * 511 NetworkAuthenticationRequired
   */


  [POPULATE_ERROR_CODE_METHODS]() {
    const {
      codes
    } = statuses;
    codes.forEach(code => {
      const name = toIdentifier(statuses[code]);

      if (code >= 400) {
        this[name] = message => {
          return this.error(message || statuses[code], code);
        };
      } else {
        this[name] = message => {
          return this.success(message || statuses[code], code);
        };
      }
    });
  }
  /**
   * Set response header
   * The original response headers are merged when the name is passed in as object
   *
   * @param {object|string} name Response header parameter name
   * @param {mixed} value Response header parameter value
   * @returns {this}
   */


  header(name, value) {
    if (is.object(name)) {
      this[HEADER] = Object.assign(this[HEADER], name);
    } else {
      this[HEADER][name] = value;
    }

    return this;
  }
  /**
   * Set the returned data
   * @param {mixed} data Returned data
   * @returns {this}
   */


  data(data) {
    if (data) this[DATA] = data;
    return this;
  }
  /**
   * Set http status code
   * @param {number} code http status code
   * @returns {this}
   */


  code(code) {
    if (code) this[CODE] = code;
    return this;
  }

  handleResource() {
    if (this[DATA] && this[DATA] instanceof Resource) {
      return new ResourceFactory(this[DATA]).output();
    }

    return this[DATA];
  }

  transform(transform) {
    if (transform && this[CODE] < 400) {
      const transformerFilePath = path.resolve(this.app.transformerPath, `${transform}.js`);

      if (require.resolve(transformerFilePath)) {
        const TransformerClass = require(transformerFilePath);

        if (!this.app.has(TransformerClass)) {
          this.app.bind(TransformerClass, TransformerClass, false);
        }

        const transformer = this.app.get(TransformerClass, [this[DATA]]);
        this.data(transformer.output());
      }
    }

    return this;
  }
  /**
   * throw http exception with code and message
   * @param {string} message exception message
   * @param {number} code exception code
   */


  error(message, code) {
    this.ctx.throw(code, message); // throw new HttpException(code, message)
  }
  /**
   * set success data in ctx.body
   * @param {mixed} data data
   */


  success(data, code = 200) {
    this[CODE] = code;
    this[DATA] = data;
    return this;
  }
  /**
   * get http code
   */


  getCode() {
    return this[CODE];
  }
  /**
   * get return data
   */


  getData() {
    return this[DATA];
  }
  /**
   * get http header
   */


  getHeader() {
    return this[HEADER];
  }
  /**
   * 将 Content-Disposition 设置为 “附件” 以指示客户端提示下载。(可选)指定下载的 filename。
   * @param {string} filename
   */


  attachment(filename = null) {
    this.ctx.attachment(filename);
    return this;
  }
  /**
   * attachment 别名
   * @param {string} filename
   */


  download(data, filename = null) {
    return this.data(data).attachment(filename);
  }
  /**
   * send data
   * @param {*} ctx
   * @public
   */


  async send(ctx) {
    ctx.set(this.getHeader());
    ctx.status = this.getCode();
    ctx.body = this.handleResource();
  }

}

module.exports = Response;