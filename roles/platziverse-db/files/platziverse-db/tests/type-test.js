'use strict'

const sinon = require('sinon')
const proxyquire = require('proxyquire')
const fixtures = require('platziverse-fixis')
const typeFixiture = fixtures.getTypeFixtures()
const test = require('ava')
let db = null
let AgentStub = null
let MetricStub = null
let TypeStub = null
let sandbox = null
let config = {
  logging: () => {}
}
let type = typeFixiture.single
let newType = typeFixiture.newType
let condExist = {
  where: {
    value: type.value
  }
}
let condNew = {
  where: {
    value: newType.value
  }
}
let condId = {
  where: {
    id: type.id
  }
}
let condValue = {
  where: {
    value: type.value
  }
}
test.beforeEach(async (t) => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy()
  }
  MetricStub = {
    belongsTo: sandbox.spy()
  }
  TypeStub = {
    hasOne: sandbox.spy(),
    findOne: sandbox.stub(),
    update: sandbox.stub(),
    create: sandbox.stub()
  }

  TypeStub.findOne.withArgs(condExist).returns(Promise.resolve(type))
  TypeStub.findOne.withArgs(condNew).returns(Promise.resolve(undefined))
  TypeStub.findOne.withArgs(condId).returns(Promise.resolve(typeFixiture.findById(type.id)))
  TypeStub.findOne.withArgs(condValue).returns(Promise.resolve(typeFixiture.findByValue(type.value)))
  TypeStub.update.withArgs(type, condExist).returns(Promise.resolve(typeFixiture.findByValue(type.value)))
  TypeStub.create.withArgs(newType).returns(Promise.resolve({
    toJSON: () => newType
  }))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub,
    './models/metric_type': () => TypeStub
  })
  db = await setupDatabase.init(config)
})

test.afterEach(t => {
  if (!sandbox) {
    sandbox.restore()
  }
})

test('Type#setup', t => {
  t.true(AgentStub.hasMany.calledOnce, 'HasMany should be called Once')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'HasMany should be called with Metrics')
  t.true(MetricStub.belongsTo.calledOnce, 'BelongsTo should be called once')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'BelongsTo should be called with Agent')
  t.true(TypeStub.hasOne.calledOnce, 'HasOne should be called once')
  t.true(TypeStub.hasOne.calledWith(MetricStub), 'HasOne should be called with Metric')

  t.truthy(db.MetricType, 'Object should be exist!')
})

test.serial('Type#createOrUpdate exist', async t => {
  let typeDB = await db.MetricType.createOrUpdate(type)
  t.true(TypeStub.findOne.calledTwice, 'FindOne should be called twice')
  t.true(TypeStub.findOne.calledWith(condExist), 'FindOne should be called with condExist')
  t.true(TypeStub.update.calledOnce, 'Update should be called once')
  t.true(TypeStub.update.calledWith(type, condExist), 'Update should be called with type and condExist')
  t.deepEqual(typeDB, typeFixiture.findByValue(type.value), 'Objects should be the same')
})

test.serial('Type#createOrUpdate new', async t => {
  let typeDB = await db.MetricType.createOrUpdate(newType)
  t.true(TypeStub.findOne.calledOnce, 'FindOne should be called once')
  t.true(TypeStub.findOne.calledWith(condNew), 'FindOne should be called with condNew')
  t.true(TypeStub.create.calledOnce, 'Create should be called once')
  t.true(TypeStub.create.calledWith(newType), 'Create should be called with newtype')
  t.deepEqual(typeDB, newType, 'Objects should be the same')
})

test.serial('Type#findById', async t => {
  let typeDB = await db.MetricType.findById(type.id)
  t.true(TypeStub.findOne.calledOnce, 'FindOne should be called once')
  t.true(TypeStub.findOne.calledWith(condId), 'FindOne should be called with condId')
  t.deepEqual(typeDB, typeFixiture.findById(type.id), 'Objects should be the same')
})

test.serial('Type#findByValue', async t => {
  let typeDB = await db.MetricType.findByValue(type.value)
  t.true(TypeStub.findOne.calledOnce, 'FindOne should be called once')
  t.true(TypeStub.findOne.calledWith(condValue), 'FindOne should be called with condValue')
  t.deepEqual(typeDB, typeFixiture.findByValue(type.value), 'Objects should be the same')
})
