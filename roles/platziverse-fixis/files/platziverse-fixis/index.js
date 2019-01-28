'use strict'

const agentFixtures = require('./agent')
const metricFixtures = require('./metric')
const typeFixtures = require('./type')

module.exports = {
  getAgentFixtures: function () {
    return agentFixtures
  },
  getMetricFixtures: function () {
    return metricFixtures
  },
  getTypeFixtures: function () {
    return typeFixtures
  }
}
