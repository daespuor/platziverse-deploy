'use strict'

const db = require('../')
const chalk = require('chalk')

async function run () {
  let {Agent, Metric, MetricType} = await db.init(db.setupConfig({setup: true})).catch(handleError)
  let newAgent = await Agent.createOrUpdate({
    uuid: 'xxx',
    username: 'Test',
    name: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleError)
  let newType = await MetricType.createOrUpdate({
    value: 'memory',
    description: ''
  }).catch(handleError)
  let newType2 = await MetricType.createOrUpdate({
    value: 'cpu',
    description: ''
  }).catch(handleError)
  let type1 = await MetricType.findByValue('memory')
  let newMetric = await Metric.create(newAgent.uuid, {
    typeId: type1.id,
    value: '15%'
  }).catch(handleError)
  let type2 = await MetricType.findByValue('cpu')
  let newMetric2 = await Metric.create(newAgent.uuid, {
    typeId: type2.id,
    value: '30%'
  }).catch(handleError)

  let agents = await Agent.findAll().catch(handleError)
  let metrics = await Metric.findByTypeAgentUuid(type1.id, newAgent.uuid).catch(handleError)

  console.log(newAgent)
  console.log(newMetric)
  console.log(newMetric2)
  console.log(newType)
  console.log(newType2)
  console.log(type1)
  console.log(type2)
  console.log(agents)
  console.log(metrics)

  process.exit(0)
}

function handleError (error) {
  console.error(`${chalk.red('[fatal]')}- ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

run()
