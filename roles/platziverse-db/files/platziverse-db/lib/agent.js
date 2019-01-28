'use strict'

module.exports = function setupAgent (AgentModel) {
  async function createOrUpdate (single) {
    let cond = {
      where: {
        uuid: single.uuid
      }
    }
    let agentExist = await AgentModel.findOne(cond)

    if (agentExist) {
      let updated = await AgentModel.update(single, cond)
      return updated ? AgentModel.findOne(cond) : agentExist
    }

    let newAgent = await AgentModel.create(single)
    return newAgent.toJSON()
  }

  function findById (id) {
    return AgentModel.findById(id)
  }

  function findByUuid (uuid) {
    let cond = {
      where: {
        uuid
      }
    }
    return AgentModel.findOne(cond)
  }

  function findAll () {
    return AgentModel.findAll()
  }

  function findConnected () {
    let cond = {
      where: {
        connected: true
      }
    }
    return AgentModel.findAll(cond)
  }

  function findByUsername (username) {
    let cond = {
      where: {
        username,
        connected: true
      }
    }
    return AgentModel.findAll(cond)
  }
  return {
    findById,
    findByUuid,
    findAll,
    findConnected,
    findByUsername,
    createOrUpdate
  }
}
