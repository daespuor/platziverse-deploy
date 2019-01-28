'use strict'
const lowercase = require('lower-case')
module.exports = function metricTypeServices (TypeModel) {
  async function createOrUpdate (newtype) {
    let cond = {
      where: {
        value: lowercase(newtype.value)
      }
    }
    let type = await TypeModel.findOne(cond)
    if (type) {
      let up = await TypeModel.update(newtype, cond)
      return up ? TypeModel.findOne(cond) : type
    }

    let created = await TypeModel.create(newtype)
    return created.toJSON()
  }
  function findById (id) {
    return TypeModel.findOne({
      where: {
        id
      }
    })
  }
  function findByValue (value) {
    return TypeModel.findOne({
      where: {
        value
      }
    })
  }
  return {
    createOrUpdate,
    findById,
    findByValue
  }
}
