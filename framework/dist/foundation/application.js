"use strict";

/**
 * Copyright (c) 2018 zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const path = require('path');

const pathToRegexp = require('path-to-regexp');

const is = require('is-type-of');

const cluster = require('cluster');

const koaBody = require('koa-body');

const Router = require('koa-router');

const cors = require('koa2-cors');

const session = require('koa-session');

const serve = require('koa-static');

const mount = require('koa-mount');

const nunjucks = require('nunjucks');

const Keygrip = require('keygrip');

const Container = require('../container');

const Context = require('../context');

const Daze = require('../daze');

const {
  Master,
  Worker
} = require('../cluster');

const createErrorMiddleware = require('./exception-handler');

const {
  CONTEXTS,
  ROUTES,
  PREFIX,
  ISROUTE,
  MIDDLEWARES,
  SESSION_FLASHS,
  SESSION_FLASHED
} = require('../symbol');

const {
  getModuleControllers,
  getModuleModules,
  getModuleMiddlewares
} = require('../utils');

const injectorContextFactory = require('./injector/context-factory');

const responseFactory = require('../response/factory');

const injectorFactory = require('./injector/factory');

const VERSION = '0.1.18';
const DEFAULT_PORT = 9000;

class Application extends Container {
  constructor(rootPath, paths = {}) {
    super();
    if (!rootPath) throw new Error('must pass the runPath parameter when you apply the instantiation!');
    this.paths = paths; // application version

    this.version = VERSION; // application run path

    this.rootPath = rootPath; // koa instance

    this.koaApplication = this.make('koa'); // config instance

    this.config = this.make('config', [this.configPath]); // application run port

    this.port = this.config.get('app.port', DEFAULT_PORT); // 调试模式

    this.debug = this.config.get('app.debug', false);
  }
  /**
   * getter for Configuration debug
   */


  get isDebug() {
    return this.debug;
  }
  /**
   * getter for Configuration cluster.enabled
   */


  get isCluster() {
    return this.config.get('app.cluster.enabled');
  }

  get appPath() {
    return path.resolve(this.rootPath, this.paths.app || 'app');
  }
  /**
   * getter for Configuration file path getter
   */


  get configPath() {
    return path.resolve(this.rootPath, this.paths.config || 'config');
  }
  /**
   *  getter for View file path
   */


  get viewsPath() {
    return path.resolve(this.rootPath, this.paths.views || '../views');
  }
  /**
   *  getter for public path
   */


  get publicPath() {
    return path.resolve(this.rootPath, this.paths.public || '../public');
  }
  /**
   *  getter for Controller file path
   */


  get controllerPath() {
    return path.resolve(this.rootPath, this.appPath, this.paths.controller || 'controller');
  }
  /**
   *  getter for Middleware file path
   */


  get middlewarePath() {
    return path.resolve(this.rootPath, this.appPath, this.paths.middleware || 'middleware');
  }
  /**
   *  getter for Middleware file path
   */


  get servicePath() {
    return path.resolve(this.rootPath, this.appPath, this.paths.service || 'service');
  }
  /**
   *  getter for Middleware file path
   */


  get transformerPath() {
    return path.resolve(this.rootPath, this.appPath, this.paths.transformer || 'transformer');
  }
  /**
   *  getter for log file path
   */


  get getLogPath() {
    return path.resolve(this.rootPath, this.paths.log || '../logs');
  } // 获取集群主进程实例


  get clusterMaterInstance() {
    const clusterConfig = this.config.get('app.cluster');
    return new Master({
      port: this.port,
      workers: clusterConfig.workers || 0,
      sticky: clusterConfig.sticky || false
    });
  } // 获取集群工作进程实例


  get clusterWorkerInstance() {
    const clusterConfig = this.config.get('app.cluster');
    return new Worker({
      port: this.port,
      sticky: clusterConfig.sticky || false,
      createServer: (...args) => {
        return this.startServer(...args);
      }
    });
  }
  /**
   * applicationModule getter
   */


  get rootModule() {
    const applicationModulePath = path.resolve(this.appPath, 'application.js');

    if (require.resolve(applicationModulePath)) {
      return this.craft(applicationModulePath);
    }

    return null;
  }

  loadProviders() {
    const providers = this.config.get('provider', []);
    this.setBinds(providers);
  }
  /**
   * 注册密钥
   */


  registerSecretKey() {
    const keys = this.config.get('app.keys', []);
    const algorithm = this.config.get('app.algorithm', 'sha1');
    const encoding = this.config.get('app.encoding', 'base64');
    this.koaApplication.keys = new Keygrip(keys, algorithm, encoding);
  }
  /**
   * 注册请求时间
   */


  registerRequestTime() {
    this.koaApplication.use(async (ctx, next) => {
      ctx.requestTime = new Date();
      await next();
    });
  }
  /**
   * 注册异常处理机制
   */


  registerErrorHandler() {
    this.koaApplication.use(createErrorMiddleware(this));
  }
  /**
   * 注册 Cors
   */


  registerCors() {
    this.koaApplication.use(cors(this.config.get('app.cors', {})));
  }
  /**
   * 注册静态资源服务
   */


  registerStaticServer() {
    if (this.config.get('app.public') === true) {
      const publicPrefix = this.config.get('app.public_prefix', '/');
      this.koaApplication.use(mount(publicPrefix, serve(this.publicPath, {
        setHeaders(res) {
          res.setHeader('Access-Control-Allow-Origin', '*');
        }

      })));
    }
  }
  /**
   * 注册 session
   */


  registerSession() {
    this.koaApplication.use(session(this.config.get('session'), this.koaApplication));
  }
  /**
   * 注册 request.body
   */


  registerRequestBody() {
    const bodyLimit = this.config.get('app.body_limit', '5mb');
    this.koaApplication.use(koaBody({
      multipart: true,
      stict: false,
      formLimit: bodyLimit,
      jsonLimit: bodyLimit,
      textLimit: bodyLimit,
      formidable: {
        maxFileSize: this.config.get('app.form.max_file_size', 1024 * 2014 * 2)
      }
    }));
  }
  /**
   * 注册框架上下文
   */


  registerContext() {
    this.koaApplication.use(async (ctx, next) => {
      ctx[CONTEXTS] = new Context(ctx);
      ctx.injectorContext = injectorContextFactory(this, ctx, next);
      await next();
    });
  }
  /**
   * 注册全局中间件
   */


  registerGlobalMiddlewares() {
    const middlewares = this.config.get('middleware', []);

    for (const mid of middlewares) {
      // 用户中间件目录存在中间件
      const userMiddlewarePath = path.join(this.middlewarePath, mid); // 确认模块可加载

      if (require.resolve(userMiddlewarePath)) {
        const currentMiddleware = require(userMiddlewarePath);

        if (is.class(currentMiddleware)) {
          this.koaApplication.use((ctx, next) => {
            const injectedMiddleware = injectorFactory(currentMiddleware, ctx.injectorContext);
            return injectedMiddleware.handle(ctx, next);
          });
        } else {
          this.koaApplication.use(currentMiddleware);
        }
      }
    }
  }
  /**
   * 注册模板引擎
   */


  registerTemplate() {
    const templateEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(this.viewsPath, {
      noCache: this.isDebug,
      watch: this.isDebug
    }));
    this.singleton('template', templateEnv);
  }
  /**
   * Register Services
   */


  registerServices() {
    // register the application key
    this.registerSecretKey(); // register application request time

    this.registerRequestTime(); // register the exception handling mechanism

    this.registerErrorHandler(); // register Cors

    this.registerCors(); // register static resource services

    this.registerStaticServer(); // register session

    this.registerSession(); // register request.body

    this.registerRequestBody(); // register Application context

    this.registerContext(); // register global middleware

    this.registerGlobalMiddlewares(); // register template engine

    this.registerTemplate();
  }
  /**
   * load all modules
   */


  loadModules() {
    // Load all the controllers of the root module
    this.loadModuleProperties(this.rootModule);
  }
  /**
   * Load all sub-modules
   * @param {object} ModuleInstance
   */


  loadSubModules(ModuleInstance) {
    const modules = getModuleModules(this, ModuleInstance);

    for (const _module of modules) {
      if (!this.has(_module)) {
        this.bind(_module, _module);
      } // 加载当前子模块的所有控制器


      this.loadModuleProperties(this.get(_module));
    }
  }
  /**
   * Load the controller according to the module
   * 根据模块加载控制器
   * @param {object} ModuleInstance module instance
   */


  loadModuleProperties(ModuleInstance) {
    const controllers = getModuleControllers(this, ModuleInstance);
    const middlewares = getModuleMiddlewares(this, ModuleInstance);
    this.loadControllers(controllers, middlewares);
    this.loadSubModules(ModuleInstance);
  }
  /**
   * Load the controllers
   * 加载控制器
   */


  loadControllers(controllers, middlewares) {
    for (const _controller of controllers) {
      this.loadControllerMethods(_controller, middlewares);
    }
  }
  /**
   * create middleware adapter
   * @param {*} middleware
   */


  getRouterControllerMiddlewares(middleware) {
    if (is.class(middleware)) {
      return (ctx, next) => {
        const injectedMiddleware = injectorFactory(middleware, ctx.injectorContext);
        return injectedMiddleware.handle(ctx, next);
      };
    } else {
      return middleware;
    }
  }
  /**
   * parse middlewares
   * @param {*} middlewares
   */


  parseMiddlewares(middlewares = []) {
    return middlewares.map(middleware => {
      if (typeof middleware === 'string') {
        return require(path.resolve(this.middlewarePath, middleware));
      } else if (typeof middleware === 'function') {
        return middleware;
      }

      return null;
    }).filter(n => n);
  }
  /**
   * Load the controller method
   * 加载控制器方法
   * @param {object} controller controller instance
   */


  loadControllerMethods(Controller, moduleMiddlewares) {
    const isRoute = Controller.prototype[ISROUTE] || false;
    const prefix = Controller.prototype[PREFIX] || '';
    const routes = Controller.prototype[ROUTES] || [];
    const middlewares = Controller.prototype[MIDDLEWARES] || []; // console.log(prefix, routes)
    // const isRoute = Reflect.getMetadata(ISROUTE, Controller.prototype) || false
    // const prefix = Reflect.getMetadata(PREFIX, Controller.prototype) || ''
    // const routes = Reflect.getMetadata(ROUTES, Controller.prototype) || []
    // const middlewares = Reflect.getMetadata(MIDDLEWARES, Controller.prototype) || []

    const parsedControllerMiddlewares = this.parseMiddlewares(middlewares);
    const parsedModuleMiddlewares = this.parseMiddlewares(moduleMiddlewares);
    const combinedMidllewares = [].concat(parsedModuleMiddlewares, parsedControllerMiddlewares).filter(m => !m); // console.log(controllerMiddlewares)

    if (isRoute === true) {
      const router = new Router({
        prefix
      });
      const methods = Object.keys(routes);

      for (const action of methods) {
        router[routes[action].method](routes[action].uri, ...combinedMidllewares.map(m => this.getRouterControllerMiddlewares(m)), this.handleControllerMethod(Controller, action));
      } // this.get('router').use(router.routes(), router.allowedMethods())


      this.get('router').use(router.routes());
    }
  }
  /**
   * handle Controller s methods
   *
   * @param {object} controller controller instance
   * @param {string} action controller method name
   */


  handleControllerMethod(Controller, action) {
    const self = this;
    return async function (ctx) {
      const injectorControllerInstance = injectorFactory(Controller, ctx.injectorContext);

      if (is.function(injectorControllerInstance[action])) {
        const keys = self.sortMatchedRoute(ctx._matchedRoute);
        const args = keys.map(n => ctx.params[`${n.name}`]);
        const res = await responseFactory(self, ctx, injectorControllerInstance, action, [...args]);
        return res.send(ctx);
      }
    };
  }
  /**
   * Sort routing parameter
   * 排序路由参数
   * @param {arr} _matchedRoute _matchedRoute
   */


  sortMatchedRoute(_matchedRoute) {
    const keys = [];
    pathToRegexp(_matchedRoute, keys);
    return keys;
  }
  /**
   * Load global variable
   * 加载全局变量
   */


  setGlobals() {
    const daze = new Daze();
    global.daze = global.DAZE = daze;
  }
  /**
   * load koa application router module
   * 加载路由模块
   */


  loadRoutes() {
    this.koaApplication.use(this.get('router').routes());
  }
  /**
   * Load the underlying container
   * 加载底层容器
   */


  loadContainer() {
    Container.setInstance(this);
    this.bind('app', this);
  }
  /**
   * 自动配置框架运行环境
   */


  loadEnv() {
    const nodeEnv = process.env.NODE_ENV;
    const dazeEnv = process.env.DAZE_ENV;

    if (!nodeEnv) {
      switch (dazeEnv) {
        case 'dev':
          process.env.NODE_ENV = 'development';
          break;

        case 'test':
          process.env.NODE_ENV = 'test';
          break;

        default:
          process.env.NODE_ENV = 'production';
          break;
      }
    }
  }
  /**
   * 清理一次性 session
   */


  flushSession() {
    this.koaApplication.use(async (ctx, next) => {
      if (ctx.session[SESSION_FLASHED] === true && is.array(ctx.session[SESSION_FLASHS])) {
        for (const flash of ctx.session[SESSION_FLASHS]) {
          delete ctx.session[flash];
        }

        delete ctx.session[SESSION_FLASHS];
      }

      if (ctx.session[SESSION_FLASHED] === false) {
        ctx.session[SESSION_FLASHED] = true;
      }

      await next();
    });
  }
  /**
   * Initialization application
   */


  initialize() {
    // 加载运行环境
    this.loadEnv(); // 注册容器

    this.loadContainer();
    const clusterConfig = this.config.get('app.cluster'); // 在集群模式下，主进程不运行业务代码

    if (!clusterConfig.enabled || !cluster.isMaster) {
      // 注册全局变量
      this.setGlobals(); // 注册自定义服务

      this.loadProviders(); // 注册 koa 服务

      this.registerServices(); // // 注册控制器模块

      this.loadModules(); // 清理一次性session

      this.flushSession(); // 注册路由

      this.loadRoutes();
    }
  }
  /**
   * Start the application
   */


  run() {
    // Initialization application
    this.initialize(); // check app.cluster.enabled

    if (this.config.get('app.cluster.enabled')) {
      // 以集群工作方式运行应用
      if (cluster.isMaster) {
        this.clusterMaterInstance.run();
      } else {
        this.clusterWorkerInstance.run();
      }

      this.make('messenger');
    } else {
      // 以单线程工作方式运行应用
      this.startServer(this.port);
    }

    return this;
  }
  /**
   * Start the HTTP service
   */


  startServer(...args) {
    return this.koaApplication.listen(...args);
  }
  /**
   * Gets the binding dependency from the container
   * @param {mixed} abstract Dependent identification
   * @param {array} args Depends on instantiated parameters
   */


  get(abstract, args = [], newInstance = false) {
    return this.make(abstract, args, newInstance);
  }
  /**
   * Bind dependencies to the container
   * @param {mixed} abstract Dependent identification
   * @param {mixed} concrete Dependent
   * @param {*} shared singleton or multiton
   */


  bind(abstract, concrete = null, shared = true) {
    return shared ? this.singleton(abstract, concrete) : this.multiton(abstract, concrete);
  }
  /**
   * Check that the dependency id is bound to the container
   * @param {mixed} abstract Dependent identification
   */


  has(abstract) {
    return this.bound(abstract);
  }
  /**
   * bind and get file path
   * @param {string} abstractFilePath file path
   */


  craft(abstractFilePath, shared = true) {
    if (require.resolve(abstractFilePath)) {
      const Res = require(abstractFilePath);

      if (!this.has(Res)) {
        this.bind(Res, Res, shared);
      }

      return this.get(Res);
    }
  }

}

module.exports = Application;