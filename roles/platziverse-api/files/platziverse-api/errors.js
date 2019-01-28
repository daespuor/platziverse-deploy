'use strict'

class AgentNotFound extends Error {
  constructor (uuid, ...params) {
    super(params)
    if (uuid) {
      this.message = `Agent with uuid ${uuid} not found!`
    } else {
      this.message = `Agents not found!`
    }
    this.code = 404
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFound)
    }
    this.name = this.constructor.name
  }
}

class MetricNotFound extends Error {
  constructor (uuid, type, ...params) {
    super(params)

    if (type) {
      this.message = `Metrics with type ${type} for Agent with uuid ${uuid} not found!`
    } else {
      this.message = `Metrics  for Agent with uuid ${uuid} not found!`
    }
    this.code = 404
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MetricNotFound)
    }
    this.name = this.constructor.name
  }
}

class NotAuthorized extends Error {
  constructor (uuid, ...params) {
    super(params)
    this.code = 401
    this.message = `No Authorized token was found`
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor.name)
    }
    this.name = this.constructor.name
  }
}

class ForbiddenError extends Error {
  constructor (...params) {
    super(params)
    this.code = 403
    this.message = 'Forbidden'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor.name)
    }
    this.name = this.constructor.name
  }
}

class ConnectionError extends Error {
  constructor (message, ...params) {
    super(params)
    this.message = `Error in the DB server connection: ${message}`
    this.code = 500
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor.name)
    }
    this.name = this.constructor.name
  }
}

module.exports = {
  NotAuthorized,
  ForbiddenError,
  AgentNotFound,
  MetricNotFound,
  ConnectionError
}
