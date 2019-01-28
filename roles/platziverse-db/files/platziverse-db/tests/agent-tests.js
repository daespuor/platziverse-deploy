'use strict'

const sinon = require('sinon')
const test = require('ava')
const proxyquire = require('proxyquire')
const fixtures = require('platziverse-fixis')
const agentFixiture = fixtures.getAgentFixtures()

let AgentStub = null
let MetricStub = {
  belongsTo: sinon.spy()
}
let TypeStub = {
  hasOne: sinon.spy()
}
let sandbox = null
let db = null
let config = {
  logging: function () {}
}
let id = 1
let single = Object.assign({}, agentFixiture.single)
let all = Object.assign([], agentFixiture.all)
let connected = Object.assign([], agentFixiture.connected)
let aUsername = Object.assign([], agentFixiture.platzi)
let newAgent = Object.assign({}, agentFixiture.newAgent)
let uuid = single.uuid
let username = 'platzi'
let condExist = {
  where: {
    uuid
  }
}
let condNew = {
  where: {
    uuid: newAgent.uuid
  }
}
let condConn = {
  where: {
    connected: true
  }
}
let condUsername = {
  where: {
    username,
    connected: true
  }
}

test.beforeEach(async t => {
  sandbox = sinon.createSandbox({})
  AgentStub = {
    hasMany: sandbox.spy(),
    findById: sandbox.stub(),
    findOne: sandbox.stub(),
    findAll: sandbox.stub(),
    update: sandbox.stub(),
    create: sandbox.stub()
  }
  // AgentModel
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixiture.findById(id)))
  AgentStub.findOne.withArgs(condExist).returns(Promise.resolve(agentFixiture.findByUuid(uuid)))
  AgentStub.findOne.withArgs(condNew).returns(Promise.resolve(undefined))
  AgentStub.findAll.withArgs().returns(Promise.resolve(all))
  AgentStub.findAll.withArgs(condConn).returns(Promise.resolve(connected))
  AgentStub.findAll.withArgs(condUsername).returns(Promise.resolve(aUsername))
  AgentStub.update.withArgs(single, condExist).returns(Promise.resolve(single))
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON: () => newAgent
  }))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub,
    './models/metric_type': () => TypeStub
  })
  db = await setupDatabase.init(config)
})

test.afterEach(() => {
  if (sandbox) sandbox.restore()
})

test('Agent exist?', t => {
  t.truthy(db.Agent, 'Agent service should exist!')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'HasMany should be called')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'HasMany should be called with MetricStub')
  t.true(MetricStub.belongsTo.called, 'BelongsTo should be called')
  t.true(TypeStub.hasOne.calledOnce, 'HasOne should be called once')
  t.true(TypeStub.hasOne.calledWith(MetricStub), 'HasOne should be called with Metric')
})

test.serial('Agent#findById', async t => {
  let agentDb = await db.Agent.findById(id)
  t.deepEqual(agentDb, agentFixiture.findById(id), 'Should be the same')
  t.true(AgentStub.findById.called, 'FindById should be called')
  t.true(AgentStub.findById.calledOnce, 'FindById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'FindById should be called with id')
})

test.serial('Agent#createOrUpdate - exist', async t => {
  let agentDb = await db.Agent.createOrUpdate(single)
  t.true(AgentStub.update.called, 'Update should be called')
  t.true(AgentStub.update.calledWith(single, condExist), 'Update should be called with single')
  t.true(AgentStub.findOne.calledTwice, 'FindById should be called twice')
  t.deepEqual(agentDb, agentFixiture.single, 'Objects should be the same')
})

test.serial('Agent#createOrUpdate - new', async t => {
  let agentDb = await db.Agent.createOrUpdate(newAgent)
  t.true(AgentStub.create.called, 'Create should be called')
  t.true(AgentStub.create.calledWith(newAgent), 'Create should be called with newAgent')
  t.true(AgentStub.findOne.calledOnce, 'FindById should be called once')
  t.deepEqual(agentDb, agentFixiture.newAgent, 'Objects should be the same')
})

test.serial('Agent#findByUuid', async t => {
  let agentDB = await db.Agent.findByUuid(uuid)
  t.true(AgentStub.findOne.called, 'FindOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'FindOne should be called once')
  t.true(AgentStub.findOne.calledWith(condExist), 'Update should be called with condExist')
  t.deepEqual(agentDB, agentFixiture.findByUuid(uuid), 'Objects should be the same')
})

test.serial('Agent#All', async t => {
  let agentsDB = await db.Agent.findAll()
  t.true(AgentStub.findAll.called, 'FindOne should be called')
  t.true(AgentStub.findAll.calledOnce, 'FindOne should be called once')
  t.is(agentsDB.length, agentFixiture.all.length, 'Objects should be the same length')
  t.deepEqual(agentsDB, agentFixiture.all, 'Objects should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agentsDB = await db.Agent.findConnected()
  t.true(AgentStub.findAll.called, 'FindOne should be called')
  t.true(AgentStub.findAll.calledOnce, 'FindOne should be called once')
  t.true(AgentStub.findAll.calledWith(condConn), 'FindAll should be called with connected')
  t.is(agentsDB.length, agentFixiture.connected.length, 'Objects should be the same length')
  t.deepEqual(agentsDB, agentFixiture.connected, 'Objects should be the same')
})

test.serial('Agent#findByUsername', async t => {
  let agentsDB = await db.Agent.findByUsername(username)
  t.true(AgentStub.findAll.called, 'FindOne should be called')
  t.true(AgentStub.findAll.calledOnce, 'FindOne should be called once')
  t.true(AgentStub.findAll.calledWith(condUsername), 'FindAll should be called with username')
  t.is(agentsDB.length, agentFixiture.platzi.length, 'Objects should be the same length')
  t.deepEqual(agentsDB, agentFixiture.platzi, 'Objects should be the same')
})
