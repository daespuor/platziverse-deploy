'use strict'

const express = require('express')
const config = require('./config')
const request = require('request-promise-native')
const asyncify = require('express-asyncify')
let api = asyncify(express.Router())

api.get('/agents', async (req, res, next) => {
  let options = {
    'method': 'GET',
    'url': `${config.endPoint}/api/agents`,
    'headers': {
      'Authorization': `Bearer ${config.AuthToken}`
    },
    'json': true
  }

  let response
  try {
    response = await request(options)
  } catch (err) {
    next(err)
  }

  res.send(response)
})

api.get('/agents/:uuid', async (req, res, next) => {
  let options = {
    'method': 'GET',
    'url': `${config.endPoint}/api/agents/${req.params.uuid}`,
    'headers': {
      'Authorization': `Bearer ${config.AuthToken}`
    },
    'json': true
  }

  let response
  try {
    response = await request(options)
  } catch (err) {
    next(err)
  }

  res.send(response)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  let options = {
    'method': 'GET',
    'url': `${config.endPoint}/api/metrics/${req.params.uuid}`,
    'headers': {
      'Authorization': `Bearer ${config.AuthToken}`
    },
    'json': true
  }

  let response
  try {
    response = await request(options)
  } catch (err) {
    next(err)
  }

  res.send(response)
})
api.get('/metrics/:uuid/:type', async (req, res, next) => {
  let options = {
    'method': 'GET',
    'url': `${config.endPoint}/api/metrics/${req.params.uuid}/${req.params.type}`,
    'headers': {
      'Authorization': `Bearer ${config.AuthToken}`
    },
    'json': true
  }

  let response
  try {
    response = await request(options)
  } catch (err) {
    next(err)
  }

  res.send(response)
})


module.exports=api