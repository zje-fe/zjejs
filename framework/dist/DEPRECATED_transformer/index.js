"use strict";

var _dec, _class;

const is = require('is-type-of');

const {
  Inject
} = require('../decorators');

let Transformer = (_dec = Inject('config'), _dec(_class = class Transformer {
  constructor(config, data) {
    this.data = data;
    this.config = config;
  }
  /**
   * 转换单个资源
   * 子类继承实现
   * @param {mixed} data
   */


  toJSON(data) {
    return data;
  }
  /**
   * 转换单个资源
   * @param {object} data
   */


  item(data) {
    if (!is.object(data)) return data;
    return this.toJSON(data);
  }
  /**
   * 转换多个资源
   * @param {array} data
   */


  collection(data) {
    if (!is.array(data)) return data;
    return data.map(r => this.toJSON(r)) || [];
  }
  /**
   * 自动输出数据
   */


  output() {
    // 数组类型使用 collection 方法调用
    if (is.array(this.data)) {
      return this.collection(this.data);
    } // 对象类型使用 item 方法调用


    if (is.object(this.data)) {
      return this.item(this.data);
    } // 默认直接返回


    return this.data;
  }

}) || _class); // const transformerProxy = new Proxy(Transformer, {
//   construct(Target, args, extended) {
//     const instance = Reflect.construct(Target, args, extended)
//     return new Proxy(instance, {
//       get(t, prop) {
//         if (prop === 'collection') {
//           if (is.array(t.data)) {
//             return data => data.map(r => t.toJSON(r))
//           }
//         }
//         if (prop === 'item') {
//           if (is.object(t.data)) {
//             return data => t.toJSON(data)
//           }
//         }
//         return t[prop]
//       },
//     })
//   },
// })

module.exports = Transformer;