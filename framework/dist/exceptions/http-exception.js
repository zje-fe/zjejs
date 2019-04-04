"use strict";

class HttpException extends Error {
  constructor(statusCode = 500, message = null, errors = []) {
    super(message);
    this.status = statusCode;
    this.errors = errors;
  }

  get statusCode() {
    return this.status;
  }

}

module.exports = HttpException;