'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function create (uuid, metric) {
    let agent = await AgentModel.findOne({
      where: {
        uuid
      }
    })
    if (agent) {
      const single = await MetricModel.create(Object.assign(metric, {agentId: agent.id}))
      return single.toJSON()
    }
  }
  function findByAgentUuid (uuid) {
    return MetricModel.findAll({
      attributes: ['typeId'],
      group: ['typeId'],
      include: [{
        model: AgentModel,
        attributes: [],
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  function findByTypeAgentUuid (typeId, uuid) {
    return MetricModel.findAll({
      attributes: ['id', 'typeId', 'value', 'createdAt', 'updatedAt'],
      include: [{
        model: AgentModel,
        attributes: [],
        where: {
          uuid
        }
      }],
      where: {
        typeId
      },
      raw: true
    })
  }
  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
