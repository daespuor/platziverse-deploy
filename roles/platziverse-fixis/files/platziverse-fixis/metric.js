'use strict'

let single = {
  id: 1,
  agentId: 1,
  typeId: 1,
  value: '70%',
  createdAt: '2018-06-13T04:19:23.815Z',
  updatedAt: '2018-06-13T04:19:23.815Z'
}
function extend (obj, values) {
  let m = Object.assign({}, obj)
  return Object.assign(m, values)
}
let newMetric = {
  id: 5,
  typeId: 2,
  value: '25%',
  createdAt: new Date(),
  updatedAt: new Date()
}
let metrics = [
  single,
  extend(single, {id: 2, agentId: 2, typeId: 3, value: '30%'}),
  extend(single, {id: 3, agentId: 2, value: '30%'}),
  extend(single, {id: 4, agentId: 3, typeId: 2, value: '50%'})
]
let notFoundMetricUuid=(uuid)=>{
  return{
    error:{
      name:'MetricNotFound',
      message:`Metrics  for Agent with uuid ${uuid} not found!`
    }
  }
}
let notFoundMetricTypeUuid=(type,uuid)=>{
  return{
    error:{
      name:'MetricNotFound',
      message:`Metrics with type ${type} for Agent with uuid ${uuid} not found!`
    }
  }
}
module.exports = {
  single,
  all: metrics,
  newMetric,
  findByAgentId: a => metrics.filter(m => m.agentId === a),
  findByTypeAgentId: (tid, id) => metrics.filter(m => m.agentId === id && m.typeId === tid),
  notFoundMetricUuid,
  notFoundMetricTypeUuid
}
