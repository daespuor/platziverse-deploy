import {html, render} from '../node_modules/lit-html/lit-html.js'
const Chart= require('chart.js')
const moment= require('moment')
const request= require('request-promise-native')
const type='callbackmetric'
const uuid='2be206e7-ed65-434a-ae28-27dba87741af'
let labels=[]
let data=[]
const main= document.getElementById('main-container')
let chart=null
const limit=10
module.exports=function init(socket){

    function renderHtml(){
        return html `<canvas id="metrics" ></canvas>`
    }
    async function showMetrics(){
        const options={
            'method':'GET',
            'url':`http://localhost:9191/metrics/${uuid}/${type}`,
            'json':true
        }
        let result
        try{
            result= await request(options)
        }catch(err){
        return  console.log(err)
        }

        if(Array.isArray(result)){
            result.forEach(m=>{
                labels.push(moment(m.createdAt).format('HH:mm:ss'))
                data.push(m.value)
            })
        }

        const ctx= document.getElementById('metrics')
        chart=new Chart(ctx,{
            type:'line',
            data:{
                labels,
                datasets:[{
                    label:type,
                    data
                }]
            }
            
        })
        startRealtime()
    }
    function startRealtime(){
        socket.on('agent/message',(payload)=>{
            if(payload.agent.uuid===uuid){
               
                let metric= payload.metrics.find(m=>{
                   return m.type.value===type
                })
                labels=chart.data.labels
                data=chart.data.datasets[0].data
                
                
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
    }

    render(renderHtml(),main)
    showMetrics()
}