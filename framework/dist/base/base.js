"use strict";

const {
  INJECTOR_CONETXT
} = require('../symbol'); // const Container = require('../Container')
// const CTX = Symbol('Base#ctx')


class Base {
  constructor(context) {
    if (!context) {
      throw new Error('Controller or Service constructor must param context!');
    } // console.log(ctx, 'ctx')


    this.dazeContext = context;
  }

  get app() {
    return this.dazeContext[INJECTOR_CONETXT.APP];
  }

  get config() {
    return this.dazeContext[INJECTOR_CONETXT.CONFIG];
  }

  get messenger() {
    return this.dazeContext[INJECTOR_CONETXT.MESSENGER];
  }

  get request() {
    return this.dazeContext[INJECTOR_CONETXT.REQUEST];
  }

  get ctx() {
    return this.dazeContext[INJECTOR_CONETXT.CTX];
  }

  get response() {
    return this.dazeContext[INJECTOR_CONETXT.RESPONSE];
  }

  get redirect() {
    return this.dazeContext[INJECTOR_CONETXT.REDIRECT];
  }

  get cookies() {
    return this.dazeContext[INJECTOR_CONETXT.COOKIE];
  }

  get session() {
    return this.dazeContext[INJECTOR_CONETXT.SESSION];
  }

  set cookies(val) {
    this.dazeContext[INJECTOR_CONETXT.COOKIE] = val;
  }

  set session(val) {
    this.dazeContext[INJECTOR_CONETXT.SESSION] = val;
  }

  get view() {
    return this.dazeContext[INJECTOR_CONETXT.VIEW];
  }

  get body() {
    return this.dazeContext[INJECTOR_CONETXT.BODY];
  }

  get params() {
    return this.dazeContext[INJECTOR_CONETXT.PARAMS];
  }

  get query() {
    return this.dazeContext[INJECTOR_CONETXT.QUERY];
  }

  get headers() {
    return this.dazeContext[INJECTOR_CONETXT.HEADERS];
  } // get axios() {
  //   return this.dazeContext[INJECTOR_CONETXT.AXIOS]
  // }


  get $http() {
    return this.dazeContext[INJECTOR_CONETXT.AXIOS];
  }

}

module.exports = Base;