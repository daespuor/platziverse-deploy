require('babel-polyfill')
const connected=require('./connected')
const io= require('socket.io-client')
const request= require('request-promise-native')
const template= require('./template')
const socket= io()
const Chart= require('chart.js')
const moment= require('moment')
const limit=10
const empty= require('empty-element')
const color= require('randomcolor')
const {serverHost} = require('../config')
init()
async function init(){
    
    let agents= await requestAgents()
    if(agents){
        for(let a of agents){
            await showTemplate(a.uuid)
        }
        
    }
    socket.on('agent/connected',async(payload)=>{

            await showTemplate(payload.agent.uuid) 
        
    })
}

function options(){
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, {});  
}

async function showTemplate(uuid){

    const main= document.getElementById('agents')
    let agent=await requestAgent(uuid)
    let metrics= await requestMetricsByUuid(uuid)
    main.appendChild(template(agent,metrics))
    for(let metric of metrics){
        await showMetrics(uuid,metric.type)
    }
    options()
}


async function requestAgents(){
    const options={
        'method':'GET',
        'url':`${serverHost}/agents`,
        'json':true
    }
    let result
    try{
        result= await request(options)
    }catch(err){
        return console.log(err.error)
    }

    return result
}
async function requestAgent(uuid){
    const options={
        'method':'GET',
        'url':`${serverHost}/agents/${uuid}`,
        'json':true
    }

    let result
    try{
        result=await request(options)

    }catch(err){
        return console.log(err.error)
    }

    return result
}

async function requestMetricsByUuid(uuid){
    const options={
        'method':'GET',
        'url':`${serverHost}/metrics/${uuid}`,
        'json':true
    }
    let result
    try{
        result=await request(options)

    }catch(err){
        return console.log(err.error)
    }

    return result
}

async function showMetrics(uuid,type){
    let labels=[]
    let data=[]
    const options={
        'method':'GET',
        'url':`${serverHost}/metrics/${uuid}/${type}`,
        'json':true
    }
    let result
    try{
        result= await request(options)
    }catch(err){
    return  console.log(err.error)
    }

    if(Array.isArray(result)){
        result.forEach(m=>{
            labels.push(moment(m.createdAt).format('HH:mm:ss'))
            data.push(m.value)
        })
    }
    const elementid=uuid+type
    const ctx= document.getElementById(elementid)
    let chart=new Chart(ctx,{
        type:'line',
        data:{
            labels,
            datasets:[{
                label:type,
                data,
                backgroundColor:color()
            }]
        }
        
    })
    startRealtime(chart,uuid,type)
}
function startRealtime(chart,uuid,type){
  
    socket.on('agent/message',(payload)=>{
        if(payload.agent.uuid===uuid){
           
            let metric= payload.metrics.find(m=>{
               return m.type.value===type
            })
            let labels=chart.data.labels
            let data=chart.data.datasets[0].data
            
            
            if(metric){
                if(labels.length>=limit || data.length>=limit){
                    labels.shift()
                    data.shift()
                }
                labels.push(moment(metric.createdAt).format('HH:mm:ss'))
                data.push(metric.value)

                chart.data.labels=labels
                chart.data.datasets[0].data=data
                chart.update()
            }
            
           

        }
    })
    
    socket.on('agent/disconnected',(payload)=>{
        const str=`connected${payload.agent.uuid}`
        const conn= document.getElementById(str)
        
        empty(conn).appendChild(connected())
    })
}






