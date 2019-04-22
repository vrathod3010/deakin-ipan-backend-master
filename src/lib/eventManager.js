'use strict'

const debug = require('debug')('app:eventManager')

const Handlers = function () {
  this.createProgramHandler = function () {}
  this.readProgramHandler = function () {}
  this.updateProgramHandler = function () {}
  this.deleteProgramHandler = function () {}
  
  this.createModuleHandler = function () {}
  this.readModuleHandler = function () {}
  this.updateModuleHandler = function () {}
  this.deleteModuleHandler = function () {}
  
  this.createActivityHandler = function () {}
  this.readActivityHandler = function () {}
  this.updateActivityHandler = function () {}
  this.deleteActivityHandler = function () {}
  
  this.createTaskHandler = function () {}
  this.readTaskHandler = function () {}
  this.updateTaskHandler = function () {}
  this.deleteTaskHandler = function () {}

  this.createUserHandler = function () {}
  this.readUserHandler = function () {}
  this.updateUserHandler = function () {}
  this.deleteUserHandler = function () {}

  this.createCalendarItemHandler = function () {}
  this.readCalendarItemHandler = function () {}
  this.updateCalendarItemHandler = function () {}
  this.deleteCalendarItemHandler = function () {}
}

var handlerInstance = new Handlers()

const triggerManager = new function(eventName, eventData, cb) {
  if (!handlerInstance[eventName + 'Handler']) return qFail(eventName)

  handlerInstance[eventName + 'Handler'](eventData, cb)
  qSuccess(eventName)
}

function qSuccess (eventName) {
  debug("SUCCESS=", eventName)
}

function qFail (eventName) {
  debug("FAILED=", eventName)
}

module.exports = {
  triggerManager: triggerManager
}
