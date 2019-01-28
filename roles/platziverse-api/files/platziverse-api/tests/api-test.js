'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const fixtures = require('platziverse-fixis')
const auth = require('../auth')
const util = require('util')
const sign = util.promisify(auth.sign)
const config = require('../config')
const agentFixtures = fixtures.getAgentFixtures()
const metricFixtures = fixtures.getMetricFixtures()
const typeFixtures = fixtures.getTypeFixtures()
const uuid = agentFixtures.single.uuid
const uuidNotExist = 'ttt'
const agentId = agentFixtures.single.id
const username = agentFixtures.single.username
const typeId = typeFixtures.single.id
const type = typeFixtures.single.value
let sandbox = null
let server = null
let api = null
let DbStub = {}
let AgentStub = {}
let MetricStub = {}
let MetricTypeStub = {}
let token = null
let tokenNotAdmin = null
let tokenNotUsername = null
let tokenNotValid = null
let tokenForbidden = null
test.beforeEach(async t => {
  token = await sign({'admin': true, 'username': 'platzi', 'permissions': ['agents:read', 'metrics:read']}, config.auth.secret)
  tokenNotAdmin = await sign({'admin': false, 'username': username, 'permissions': ['agents:read', 'metrics:read']}, config.auth.secret)
  tokenNotUsername = await sign({'admin': false, 'permissions': ['agents:read']}, config.auth.secret)
  tokenNotValid = await sign({'admin': true, 'username': 'platzi', 'permissions': ['agents:read', 'metrics:read']}, 'test')
  tokenForbidden = await sign({'admin': false, 'username': username, 'permissions': []}, config.auth.secret)
  sandbox = sinon.createSandbox()
  DbStub = {
    init: sandbox.stub(),
    setupConfig: sandbox.stub()
  }
  AgentStub = {
    findConnected: sandbox.stub(),
    findByUuid: sandbox.stub(),
    findByUsername: sandbox.stub()
  }
  MetricStub = {
    findByAgentUuid: sandbox.stub(),
    findByTypeAgentUuid: sandbox.stub()
  }
  MetricTypeStub = {
    findById: sandbox.stub(),
    findByValue: sandbox.stub()
  }
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))
  AgentStub.findByUuid.withArgs(uuidNotExist).returns(Promise.resolve(undefined))
  AgentStub.findByUsername.withArgs(username).returns(Promise.resolve(agentFixtures.findByUsername(username)))
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(metricFixtures.findByAgentId(agentId)))
  MetricTypeStub.findById.withArgs(typeId).returns(Promise.resolve(typeFixtures.findById(typeId)[0]))
  MetricStub.findByAgentUuid.withArgs(uuidNotExist).returns(Promise.resolve([]))
  MetricTypeStub.findByValue.withArgs(type).returns(Promise.resolve(typeFixtures.findByValue(type)[0]))
  MetricStub.findByTypeAgentUuid.withArgs(typeId, uuid).returns(Promise.resolve(metricFixtures.findByTypeAgentId(typeId, agentId)))
  MetricStub.findByTypeAgentUuid.withArgs(typeId, uuidNotExist).returns(Promise.resolve([]))

  DbStub.init.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub,
    MetricType: MetricTypeStub
  }))
  api = proxyquire('../api', {
    'platziverse-db': DbStub
  })
  server = proxyquire('../server', {
    './api': api
  })
})
test.afterEach(t => {
  if (sandbox) {
    sandbox.restore()
  }
})
test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.true(AgentStub.findConnected.calledOnce, 'Find Connected should be called once')
      t.false(AgentStub.findByUsername.called, 'Find by username should not be called')
      t.deepEqual(body, agentFixtures.connected, 'Body object should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents - not user admin', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${tokenNotAdmin}`)
    .expect(200)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.false(AgentStub.findConnected.called, 'Find connected should not be called')
      t.true(AgentStub.findByUsername.calledOnce, 'Find by username should be called once')
      t.deepEqual(body, agentFixtures.findByUsername(username), 'Objects should be the same')
      t.end()
    })
})
test.serial.cb('/api/agents - not authorized', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${tokenNotUsername}`)
    .expect(401)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.false(AgentStub.findConnected.called, 'findConnected should not be called')
      t.false(AgentStub.findByUsername.called, 'FindByUsername should not be called')
      t.deepEqual(body, agentFixtures.notAuthorized, 'Body object should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents - forbidden', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${tokenForbidden}`)
    .expect(403)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, agentFixtures.forbidden, 'Body object should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents/:uuid', t => {
  request(server)
    .get(`/api/agents/${uuid}`)
    .expect(200)
    .set('Authorization', `Bearer ${token}`)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, agentFixtures.findByUuid(uuid), 'Body object should be the expected')
      t.end()
    })
})
test.serial.cb('/api/agents/:uuid - not found', t => {
  request(server)
    .get(`/api/agents/${uuidNotExist}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, agentFixtures.notFoundAgent(uuidNotExist), 'Body object should be the expected')
      t.end()
    })
})
test.serial.cb('/api/agents/:uuid - not authorized', t => {
  request(server)
    .get(`/api/agents/${uuid}`)
    .set('Authorization', `Bearer ${tokenNotValid}`)
    .expect(401)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      t.deepEqual(res.body, agentFixtures.notAuthorized, 'Body object should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agents/:uuid - forbidden', t => {
  request(server)
    .get(`/api/agents/${uuid}`)
    .set('Authorization', `Bearer ${tokenForbidden}`)
    .expect(403)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, agentFixtures.forbidden, 'Body object should be the expected')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid', (t) => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let newMetrics = []
      let body = res.body
      let metrics = metricFixtures.findByAgentId(agentId)
      for (let metric of metrics) {
        let newType = typeFixtures.findById(metric.typeId)
        newMetrics.push({type: newType[0].value})
      }
      t.deepEqual(body, newMetrics, 'Body object should be the expected')
      t.true(MetricTypeStub.findById.called, 'FindById should be called')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid - not found', (t) => {
  request(server)
    .get(`/api/metrics/${uuidNotExist}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, metricFixtures.notFoundMetricUuid(uuidNotExist), 'Body object should be the expected')
      t.false(MetricTypeStub.findById.called, 'FindById should not be called')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid - not authorized', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${tokenNotValid}`)
    .expect(401)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      t.deepEqual(res.body, agentFixtures.notAuthorized, 'Body object should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - forbidden', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${tokenForbidden}`)
    .expect(403)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, agentFixtures.forbidden, 'Body object should be the expected')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-type', /json/)
    .end((err, res) => {
      let newMetrics = []
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      let metrics = metricFixtures.findByTypeAgentId(typeId, agentId)
      for (let metric of metrics) {
        let m = typeFixtures.findById(metric.typeId)[0]
        newMetrics.push({
          id: metric.id,
          type: m.value,
          value: metric.value,
          createdAt: metric.createdAt,
          updatedAt: metric.updatedAt
        })
      }
      t.deepEqual(body, newMetrics, 'Body object should be the expected')
      t.true(MetricTypeStub.findById.called, 'FindById should be called')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotExist}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, metricFixtures.notFoundMetricTypeUuid(type, uuidNotExist), 'Body object should be the expected')
      t.false(MetricTypeStub.findById.called, 'FindById should not be called')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid/:type - not authorized', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${tokenNotValid}`)
    .expect(401)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      t.deepEqual(res.body, agentFixtures.notAuthorized, 'Body object should be the expected')
      t.end()
    })
})
test.serial.cb('/api/metrics/:uuid/:type - forbidden', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${tokenForbidden}`)
    .expect(403)
    .expect('Content-type', /json/)
    .end((err, res) => {
      t.falsy(err, 'Error should not be occur')
      let body = res.body
      t.deepEqual(body, agentFixtures.forbidden, 'Body object should be the expected')
      t.end()
    })
})
