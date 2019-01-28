'use strict'
const debug = require('debug')('platziverse:db:setup')
module.exports = function config (newValues) {
  let c = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    dialect: 'postgres',
    logging: s => debug(s),
    host: process.env.DB_HOST || 'localhost',
    operatorsAliases: false
  }

  return Object.assign(c, newValues)
}
