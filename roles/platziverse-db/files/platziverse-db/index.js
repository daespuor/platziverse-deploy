'use strict'

const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupMetricType = require('./models/metric_type')
const agentServices = require('./lib/agent')
const metricServices = require('./lib/metric')
const typeServices = require('./lib/type')
const defaults = require('defaults')
const setupConfig = require('./lib/config')

async function init (config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    },
    operatorsAliases: false
  })
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)
  const TypeModel = setupMetricType(config)

  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)
  TypeModel.hasOne(MetricModel)

  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({force: true})
  }
  const Agent = agentServices(AgentModel)
  const Metric = metricServices(MetricModel, AgentModel)
  const MetricType = typeServices(TypeModel)

  return {
    Agent,
    Metric,
    MetricType
  }
}

module.exports = {
  init,
  setupConfig
}
