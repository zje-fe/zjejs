"use strict";

var _dec, _class;

const EventEmitter = require('events');

const cluster = require('cluster');

const {
  getAlivedWorkers
} = require('./helpers');

const {
  Inject
} = require('../decorators');

const MESSENGER = 'daze-messenger';
let Messenger = (_dec = Inject('config'), _dec(_class = class Messenger extends EventEmitter {
  constructor(config) {
    super();
    this.events = config.get('messenger', () => {});
    this.run();
    this.parseEvents();
  } // 解析用户配置事件


  parseEvents() {
    this.events(this);
  } // 生成进程间通信（IPC）内置通信数据格式


  getMessage(channel, data, type = 'broadcast') {
    return {
      action: MESSENGER,
      channel,
      data,
      type
    };
  } // 广播给所有工作进程，包括当前进程


  broadcast(channel, data) {
    const message = this.getMessage(channel, data, false);
    process.send(message);
  }

  run() {
    if (cluster.isMaster) {
      // 主进程
      // 主进程监听工作进程发送的消息事件
      cluster.on('message', (worker, message) => {
        // 不处理 Messenger 以外的通信数据
        if (!message || message.action !== MESSENGER) return;

        if (message.type === 'broadcast') {
          // 获取所有存活的工作进程
          const workers = getAlivedWorkers(); // 给所有工作进程发送消息

          workers.forEach(_worker => _worker.send(message));
        }
      });
    } else {
      // 工作进程
      // 工作进程监听主进程发送的消息事件
      process.on('message', message => {
        // 不处理 Messenger 以外的通信数据
        if (!message || message.action !== MESSENGER) return;
        this.emit(message.channel, message.data);
      });
    }
  }

}) || _class);
module.exports = Messenger;