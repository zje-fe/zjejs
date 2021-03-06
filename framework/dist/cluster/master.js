"use strict";

/**
 * Copyright (c) 2018 Chan Zewail
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
const cluster = require('cluster');

const hash = require('string-hash');

const debug = require('debug')('daze-framework:cluster');

const net = require('net');

const {
  defer
} = require('../utils');

const {
  parseOpts,
  getAlivedWorkers
} = require('./helpers');

const {
  RELOAD_SIGNAL,
  WORKER_DYING,
  WORKER_DID_FORKED,
  WORKER_DISCONNECT
} = require('./const');

const defaultOptions = {
  port: 0,
  workers: 0,
  sticky: false
};
const FORK_WORKER = Symbol('Cluster#Master#forkWorker');
const FORK_WORKERS = Symbol('Cluster#Master#forkWorkers');
const CREATE_STICKY_SERVER = Symbol('Cluster#Master#cteateStickyServer');

class Master {
  constructor(opts) {
    this.options = Object.assign({}, defaultOptions, parseOpts(opts));
    this.connections = {};
  } // 工作进程的环境变量
  // 待定
  // Environment variables for the work process


  get env() {
    return {};
  }
  /**
   * Fork a work process
   */


  [FORK_WORKER](env = {}) {
    const worker = cluster.fork(env);
    debug(`worker is forked, use pid: ${worker.process.pid}`);
    const deferred = defer(); // Accepts the disconnection service signal sent by the work process, indicating that the work process is about to
    // stop the service and needs to be replaced by a new work process
    // 接受工作进程发送的断开服务信号，表示该工作进程即将停止服务，需要 fork 一个新的工作进程来替代

    worker.on('message', message => {
      if (worker[WORKER_DYING]) return;

      if (message === WORKER_DISCONNECT) {
        debug('refork worker, receive message \'daze-worker-disconnect\'');
        worker[WORKER_DYING] = true; // The signal that tells the worker process that it has fork after fork, and lets it end the service
        // fork 完毕后通知工作进程已 fork 的信号，让其结束服务

        this[FORK_WORKER](env).then(() => worker.send(WORKER_DID_FORKED));
      }
    }); // Emitted after the worker IPC channel has disconnected
    // Automatically fork a new work process after the IPC pipeline is detected to be disconnected

    worker.once('disconnect', () => {
      if (worker[WORKER_DYING]) return;
      debug(`worker disconnect: ${worker.process.pid}`);
      worker[WORKER_DYING] = true;
      this[FORK_WORKER](env);
    }); // The cluster module will trigger an 'exit' event when any worker process is closed

    worker.once('exit', (code, signal) => {
      if (worker[WORKER_DYING]) return;
      debug(`worker exit, code: ${code}, signal: ${signal}`);
      worker[WORKER_DYING] = true;
      this[FORK_WORKER](env);
    }); // listening event

    worker.once('listening', address => {
      deferred.resolve({
        worker,
        address
      });
    });
    return deferred.promise;
  }
  /**
   * Work processes corresponding to the fork, depending on the configuration or number of cpus
   * fork 对应的工作进程，取决于cpu的数量或配置参数
   */


  [FORK_WORKERS]() {
    const {
      workers
    } = this.options;
    const promises = [];
    const env = Object.assign({}, this.env);

    for (let i = 0; i < workers; i++) {
      promises.push(this[FORK_WORKER](env));
    }

    return Promise.all(promises);
  }
  /**
   * Create sticky sessions for websocket communication
   * 创建粘性会话，适用于 websocket 通信
   * reference https://github.com/uqee/sticky-cluster
   */


  [CREATE_STICKY_SERVER]() {
    const deferred = defer();
    const server = net.createServer({
      pauseOnConnect: true
    }, connection => {
      const signature = `${connection.remoteAddress}:${connection.remotePort}`;
      this.connections[signature] = connection;
      this.connection.on('close', () => {
        delete this.connections[signature];
      });
      const index = hash(connection.remoteAddress || '') % this.options.works;
      let current = -1;
      getAlivedWorkers().some(worker => {
        if (index === ++current) {
          worker.send('daze-sticky-connection', connection);
          return true;
        }

        return false;
      });
    });
    server.listen(this.options.port, () => {
      this[FORK_WORKERS]().then(data => {
        deferred.resolve(data);
      });
    });
    return deferred.promise;
  }
  /**
   * Send a reload signal to all work processes
   * 给所有工作进程发送 reload 信号
   */


  reloadWorkers() {
    for (const worker of getAlivedWorkers()) {
      worker.send(RELOAD_SIGNAL);
    }
  }
  /**
   * Capture all restart work process signals
   * 捕获所有重启工作进程的信号
   */


  catchSignalToReload() {
    // After the master process receives the reload signal
    // it traverses the surviving worker processes and sends the reload instruction to each worker process
    // 主进程接收到 reload 信号后，遍历存活的工作进程，给每个工作进程发送 reload 指令
    process.on(RELOAD_SIGNAL, () => {
      this.reloadWorkers();
    }); // Receives the daze-restart restart instruction
    // sent by the work process to restart all the work processes
    // 接收工作进程发送的 daze-restart 重启指令，重启所有工作进程

    cluster.on('message', (worker, message) => {
      if (message !== 'daze-restart') return;
      this.reloadWorkers();
    });
  }
  /**
   * Start the service
   * 启动服务
   */


  run() {
    const serverPromise = this.options.sticky ? this[CREATE_STICKY_SERVER]() : this[FORK_WORKERS]();
    return serverPromise.then(res => {
      // do something
      return res;
    });
  }

}

module.exports = Master;