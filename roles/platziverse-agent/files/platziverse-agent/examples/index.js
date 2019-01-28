'use strict'

const PlatziverseAgent= require('../')
const debug = require('debug')('platziverse:agent-other')
const agent = new PlatziverseAgent({
    username: 'myapp',
    name :'platzi',
    interval:2000
    })

agent.addMetric('rss','Memoria usada por proceso',function getRss(){
    return process.memoryUsage().rss
})

agent.addMetric('promisemetric','Metrica obtenida por promesa',function getPromiseMetric(){
    return Promise.resolve(Math.random())
})

agent.addMetric('callbackmetric','Metrica obtenida por callback',function getCallbackMetric(callback){
    setTimeout(()=>{
        callback(null,(Math.random()* 10)+1)
    },3000)
})

agent.connect()

//My message
agent.on('connected',handler)
agent.on('disconnected',handler)
agent.on('message',handler)

//Other message
agent.on('agent/disconnected',handlerOther)
agent.on('agent/connected',handlerOther)
agent.on('agent/message',handlerOther)

function handler(payload){
    console.log(payload)
}
function handlerOther(payload){
    debug(payload)
}
setTimeout(()=>agent.disconnect(),120000)

