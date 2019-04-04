"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
// 容器实例多例标识
exports.MULTITON = Symbol('DAZE#multiton'); // Koa运行时的框架上下文标识

exports.CONTEXTS = Symbol('DAZE#contexts'); // 标识控制器方法是否路由方法
// exports.ISROUTE = Symbol('DAZE#ControllerIsRoute')
// exports.ROUTES = Symbol('DAZE#ControllerRoutes')
// exports.PREFIX = Symbol('DAZE#ControllerPrefix')
// exports.MIDDLEWARES = Symbol('DAZE#ControllerMiddlewares')

exports.ISROUTE = '__DAZE_CONTROLLER_ISROUTE__';
exports.ROUTES = '__DAZE_CONTROLLER_ROUTES__';
exports.PREFIX = '__DAZE_CONTROLLER_PREFIX__';
exports.MIDDLEWARES = '__DAZE_CONTROLLER_MIDDLEWARES__'; // 标识需要注入的
// exports.HTTP_CODE = Symbol('DAZE#httpCode')
// exports.HTTP_HEADER = Symbol('DAZE#httpHeader')
// exports.TRANSFORM = Symbol('DAZE#tansform')

exports.MODULE_INJECTORS = '__DAZE_MODULE_INJECTORS__';
exports.HTTP_CODE = '__DAZE_HTTP_CODE__';
exports.HTTP_HEADER = '__DAZE_HTTP_HEADER__';
exports.TRANSFORM = '__DAZE_TRANSFORM__'; // flash session
// 需要闪存的 Session 数组

exports.SESSION_FLASHS = 'DAZE_SESSION_FLASHS'; // 标记闪存 Session 是否已经使用

exports.SESSION_FLASHED = 'DAZE_SESSION_FLASHED'; // 控制器需要注入的上下文标识

exports.INJECTOR_CONETXT = {
  REQUEST: '__DAZE_INJECTOR_REQUEST__',
  RESPONSE: '__DAZE_INJECTOR_RESPONSE__',
  COOKIE: '__DAZE_INJECTOR_COOKIE__',
  SESSION: '__DAZE_INJECTOR_SESSION__',
  CTX: '__DAZE_INJECTOR_CTX__',
  NEXT: '__DAZE_INJECTOR_NEXT__',
  REDIRECT: '__DAZE_INJECTOR_REDIRECT__',
  VIEW: '__DAZE_INJECTOR_VIEW__',
  BODY: '__DAZE_INJECTOR_BODY__',
  PARAMS: '__DAZE_INJECTOR_PARAMS__',
  QUERY: '__DAZE_INJECTOR_QUERY__',
  HEADERS: '__DAZE_INJECTOR_HEADERS__',
  CONFIG: '__DAZE_INJECTOR_CONFIG__',
  APP: '__DAZE_INJECTOR_APP__',
  MESSENGER: '__DAZE_INJECTOR_MESSENGER__',
  SERVICE: '__DAZE_INJECTOR_SERVICE__',
  AXIOS: '__DAZE_INJECTOR_AXIOS__'
};
exports.MODULE_PARENT_MIDDLEWARES = Symbol('Module#parentMiddleware');