#platziverse-agent

##usage

``` js
const PlatziverseAgent= require('platziverse-agent')
const agent = new PlatziverseAgent({
    username: 'myapp',
    user :'platzi',
    interval:2000
    })

agent.connect()

agent.addMetric('rss','Memoria usada por proceso',function getRss(){
    return process.memoryUsage().rss
})

agent.addMetric('promiseMetric','Métrica obtenida por promesa',function getPromiseMetric(){
    return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric','Métrica obtenida por callback',function getCallbackMetric(callback){
    setTimeout(()=>{
        callback(null,Math.random())
    },1000)
})

agent.on('connected',handler)
agent.on('disconnected',handler)
agent.on('message',handler)


agent.on('agent/disconnected',handler)
agent.on('agent/connected',handler)
agent.on('agent/message',handler)

function handler(payload){
    console.log(payload)
}
setTimeout(()=>agent.disconnect(),20000)
```
