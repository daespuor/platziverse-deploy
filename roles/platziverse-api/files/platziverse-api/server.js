'use strict'

const http = require('http')
const express = require('express')
const chalk = require('chalk')
const port = process.env.PORT || 9090
const api = require('./api')
const debug = require('debug')('platziverse:api:server')
const asyncify = require('express-asyncify')
const app = asyncify(express())
const errors = require('./errors')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use('/api', api)
app.use((err, req, res, next) => {
  debug('Error message!')
  debug(`Error code ${err.code} - Error name ${err.name}`)

  if (err.code === 'permission_denied') {
    let error = new errors.ForbiddenError()
    return res.status(error.code).send({name: error.name, code:error.code, message: error.message})
  }
  if (err.name === 'UnauthorizedError') {
    let error = new errors.NotAuthorized()
    return res.status(error.code).send({name: error.name, code:error.code, message: error.message})
  }

  res.status(err.code).send({name: err.name, code:err.code, message: err.message})
})

const server = http.createServer(app)

if (!module.parent) {
  server.listen(port, () => {
    console.log(`${chalk.green('[platzigram-api]')} server listening on port ${port}`)
  })

  process.on('unhandledRejection', handleFatalError)
  process.on('uncaughtException', handleFatalError)
}

function handleFatalError (err) {
  console.log(`${chalk.red('[fatal error]')} - ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}

module.exports = server
