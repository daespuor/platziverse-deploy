'use strict'

const EventEmitter = require('events')
const utils = require('platziverse-utils')
const defaults = require('defaults')
const mqtt = require('mqtt')
const uuid = require('uuid')
const util = require('util')
const os = require('os')
let options = {
  username: 'untitled',
  name: 'platzi',
  interval: 5000,
  mqtt: {
    server: 'mqtt://localhost'
  }
}
class PlatziverseEmitter extends EventEmitter {
  constructor (opts) {
    super()
    this._options = defaults(opts, options)
    this._started = false
    this._timer = false
    this._client = null
    this._agentId = null
    this._metrics = new Map()
  }

  addMetric (type, description, fn) {
    this._metrics.set(type, {
      description,
      fn
    })
  }

  removeMetric (type) {
    this._metrics.delete(type)
  }

  connect () {
    if (!this._started) {
      const opt = this._options
      this._started = true
      this._client = mqtt.connect(opt.mqtt.server)
      this._client.subscribe('agent/connected')
      this._client.subscribe('agent/disconnected')
      this._client.subscribe('agent/message')

      this._client.on('connect', () => {
        this._agentId = uuid.v4()
     
        this._timer = setInterval(async () => {
          if (this._metrics.size > 0) {
            let message = {
              agent: {
                uuid: this._agentId,
                username: opt.username,
                name: opt.name,
                hostname: os.hostname() || 'localhost',
                pid: process.pid
              },
              metrics: [],
              timestamp: new Date().getTime()
            }
            for (let [metric, obj] of this._metrics) {
              if (obj.fn.length === 1) {
                obj.fn = util.promisify(obj.fn)
              }

              message.metrics.push({
                type: {
                  value: metric,
                  description: obj.description
                },
                value: await Promise.resolve(obj.fn())
              })
            }
            this.emit('connected', JSON.stringify(message))
            this._client.publish('agent/message', JSON.stringify(message))
          }
        }, opt.interval)
      })

      this._client.on('error', () => { this.disconnect() })
      this._client.on('message', (topic, payload) => {
        payload = utils.parsePayload(payload)
        let broadcast = false
        switch (topic) {
          case 'agent/connected':
          case 'agent/disconnected':
          case 'agent/message':
            if (payload && payload.agent && payload.agent.uuid !== this._agentId) {
              broadcast = true
            }
            break
        }

        if (broadcast) {
          this.emit(topic, payload)
        }
      })
    }
  }

  disconnect () {
    clearInterval(this._timer)
    this._started = false
    this.emit('disconnected', this._agentId)
    this._client.end()
  }
}

module.exports = PlatziverseEmitter
