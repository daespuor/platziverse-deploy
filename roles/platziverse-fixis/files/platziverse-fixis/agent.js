'user strict'

let agent = {
  id: 1,
  uuid: 'yyy-yyyy-yyyy',
  username: 'platzi',
  name: 'platzi',
  hostname: 'localhost',
  pid: 1234,
  connected: true,
  createdAt: '01/12/2017',
  updatedAt: '01/12/2017'
}

let agents = [
  agent,
  extend(agent, {id: 2, uuid: 'yyy-yyyy-yyyw', name: 'test', pid: 2234}),
  extend(agent, {id: 3, uuid: 'yyy-yyyy-yww', name: 'test2', username: 'test2', connected: false}),
  extend(agent, {id: 4, uuid: 'yyy-yyyy-www', username: 'platzi2', connected: false})
]

let newAgent = extend(agent, {id: 5, uuid: 'yyy-yyy-xxx', name: 'test3', connected: true})
let notFoundAgent= (uuid)=> {
  let uuidMessage=`Agent with uuid ${uuid} not found!`
  return {error:{
    name:'AgentNotFound',
    message:uuidMessage
  }}
}

let notAuthorized={
  error:{
    name:'NotAuthorized',
    message:`No Authorized token was found`
  }
}

let forbidden={
  error:{
    name:'ForbiddenError',
    message:'Forbidden'
  }
}

function extend (obj, values) {
  let clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected === true),
  findById: id => agents.filter(a => a.id === id).shift(),
  findByUuid: uuid => agents.filter(a => a.uuid === uuid).shift(),
  platzi: agents.filter(a => a.username === 'platzi' && a.connected),
  findByUsername: username => agents.filter(a=>a.username===username),
  newAgent,
  notFoundAgent,
  notAuthorized,
  forbidden
}
