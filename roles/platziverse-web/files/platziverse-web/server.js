'use strict'

const http = require('http')
const express = require('express')
const debug = require('debug')('platziverse:web')
const chalk = require('chalk')
const PlatziverseAgent = require('platziverse-agent')
const {mqttHost} = require('./config')
const agent = new PlatziverseAgent({
  mqtt:{
    server:mqttHost
  }
})
const path = require('path')
const utils = require('platziverse-utils')
const socketio = require('socket.io')
const asyncify = require('express-asyncify')
const app = asyncify(express())
const port = process.env.PORT || '9191'
const api = require('./proxy')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', api)

app.use((err, req, res, next) => {
  debug('Error message!')
  res.status(err.error.code).send({error: {name: err.error.name, message: err.error.message}})
})
const server = http.createServer(app)
let io = socketio(server)

io.on('connection', socket => {
  debug(`Connection with client ${socket.id}`)

  utils.pipe(agent, socket)
})
agent.connect()
server.listen(port, () => {
  console.log(`${chalk.green('[platziverse-web]')} Listening on port ${port}`)
})

process.on('unhandledRejection', handleFatalError)
process.on('uncaughtException', handleFatalError)
function handleFatalError (err) {
  console.log(`${chalk.red('[fatal error]')} - ${err.message}`)
  console.log(err.stack)
  process.exit(1)
}
