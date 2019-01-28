'use strict'

const db = require('./')
const inquirer = require('inquirer')
const chalk = require('chalk')
const config = require('./lib/config')
const prompt = inquirer.createPromptModule()
async function setup () {
  if (process.argv[2] !== '--yes') {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database ¿Are you sure?'
      }
    ])

    if (!answer.setup) {
      return console.log('Nothing happened :)!!')
    }
  }

  await db.init(config({setup: true})).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} - ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
