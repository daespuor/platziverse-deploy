'user strict'

const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('platziverse:api:route')
const errors = require('./errors')
const db = require('platziverse-db')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const config = require('./config')
const guard = require('express-jwt-permissions')()
let services, Agent, Metric, MetricType
const api = asyncify(express.Router())


api.use('*', async (req, res, next) => {
  if (!services) {
    try {
      services = await db.init(db.setupConfig())
    } catch (err) {
      next(new errors.ConnectionError(err.message))
    }
    Agent = services.Agent
    Metric = services.Metric
    MetricType = services.MetricType
  }

  next()
})

api.get('/agents', auth(config.auth), guard.check(['agents:read']), async (req, res, next) => {
  debug('Get request in /agents')
  let agents = []
  const {user} = req
  if (!user.username || !user) {
    return next(new errors.NotAuthorized())
  }
  try {
    if (user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(user.username)
    }
  } catch (err) {
    next(err)
  }
  res.send(agents)
})

api.get('/agents/:uuid', auth(config.auth), guard.check(['agents:read']), async (req, res, next) => {
  let uuid = req.params.uuid
  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (err) {
    next(err)
  }
  if (!agent) {
    return next(new errors.AgentNotFound(uuid))
  }

  console.log(`${chalk.green('[platziverse-agent]')} ${uuid}`)
  res.send(agent)
})

api.get('/metrics/:uuid', auth(config.auth), guard.check(['metrics:read']), async (req, res, next) => {
  let uuid = req.params.uuid
  let metrics
  let newMetrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
    for (let metric of metrics) {
      let type = await MetricType.findById(metric.typeId)
      newMetrics.push({type: type.value})
    }
  } catch (err) {
    next(err)
  }
  if (!newMetrics || newMetrics.length === 0) {
    return next(new errors.MetricNotFound(uuid))
  }
  console.log(`${chalk.green('[platziverse-agent]')} ${uuid}`)
  res.send(newMetrics)
})

api.get('/metrics/:uuid/:type', auth(config.auth), guard.check(['metrics:read']), async (req, res, next) => {
  let {uuid, type} = req.params
  let metrics
  let newMetrics = []
  let newType
  try {
    newType = await MetricType.findByValue(type)
    if (newType) {
      metrics = await Metric.findByTypeAgentUuid(newType.id, uuid)
      for (let metric of metrics) {
        let t = await MetricType.findById(metric.typeId)
        newMetrics.push({
          id: metric.id,
          type: t.value,
          value: metric.value,
          createdAt: metric.createdAt,
          updatedAt: metric.updatedAt
        })
      }
    }
  } catch (err) {
    next(err)
  }
  if (!newMetrics || newMetrics.length === 0) {
    return next(new errors.MetricNotFound(uuid, type))
  }
  console.log(`${chalk.green('[platziverse-agent]')} uuid ${uuid} and type ${type}`)
  res.send(newMetrics)
})

module.exports = api
