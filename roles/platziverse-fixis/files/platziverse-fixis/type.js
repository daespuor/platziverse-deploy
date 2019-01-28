'use strict'

let single = {
  id: 1,
  value: 'cpu',
  description: '',
  createdAt: new Date(),
  updatedAt: new Date()
}

function extend (object, values) {
  let obj = Object.assign({}, object)
  return Object.assign(obj, values)
}

let newType = extend(single, {id: 4, value: 'memory'})

let types = [single,
  extend(single, {id: 2, value: 'cache'}, {id: 3, value: 'bandwidth'})]

module.exports = {
  single,
  all: types,
  findById: id => types.filter(t => t.id === id),
  findByValue: val => types.filter(t => t.value === val),
  newType
}
