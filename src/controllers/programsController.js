'use strict';

var GenericDBService = require('../genricDBService');
var ProgramService = new GenericDBService("Program");
var ModuleService = new GenericDBService("Module");
var HELPER = require('../utils/helper');
var APP_CONSTANTS = require('../config/appConstants');
var async = require('async');
var ERROR = APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require('underscore');

// GET /programs
// Get all programs
var getPrograms = function (callback) {
  var fetchData;
  async.series([
    function (cb) {
      ProgramService.getRecord({}, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("NO PROGRAMS EXIST")

        data.forEach((program) => HELPER.deleteUnnecessaryUserData(program))
        fetchData = data
        cb()
      })
    }
  ],
    function (err) {
      if (err) callback(err)
      else callback(null, { programs: fetchData })
    }
  )
};

/**
 * We want to show all the relevant modules data in the program so that the user gets an overview 
 * about how the program is going to be like.
 * 
 * @param {*} mod Mmodule to strip data from
 * @return the modified module data object
 */
var stripProgramModuleData = function (mod) {
  if (mod.notifications) delete mod.notifications;
  if (mod.pills) delete mod.pills;
  if (mod.refreshers) delete mod.refreshers;
  if (mod.activities) delete mod.activities;
  if (mod.tasks) delete mod.tasks;
  if (mod.sections) delete mod.sections;

  return mod;
}

/**
 * GET /programs/:id
 * Get a specific user program's data, which includes information about the modules as well.
 * @param {*} userData User auth data
 * @param {*} params Query parameters
 * @param {*} callback Callback function to call
 */
var getProgram = function (params, callback) {
  var fetchData;
  async.series([
    function (cb) {
      var criteria = { id: params.id }
      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")

        fetchData = HELPER.deleteUnnecessaryUserData(data[0])
        cb()
      })
    },
    function (cb) {
      var criteria = { id: { $in: fetchData.modules } }
      ModuleService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        fetchData.modules = []
        data.forEach((mod) => fetchData.modules.push(stripProgramModuleData(HELPER.deleteUnnecessaryUserData(mod))))
        cb()
      })
    }
  ],
    function (err) {
      if (err) callback(err)
      else callback(null, { programs: HELPER.deleteUnnecessaryUserData(fetchData) })
    }
  )
}

// GET /programs/:p_id/modules/:id
// Get a specific module of a specific program
var getModule = function (params, callback) {
  var fetchData;
  async.series([
    function (cb) {
      var criteria = { id: params.programId }
      ProgramService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("PROGRAM NOT FOUND")
        // check if the program contains the given module id or not
        if (undefined === data[0].modules.find((mod) => params.id === mod)) return cb("This program doesn't have that module")
        cb()
      })
    },
    function (cb) {

      var criteria = { id: params.id }
      ModuleService.getRecord(criteria, {}, {}, function (err, data) {
        if (err) return cb(err)
        if (0 === data.length) return cb("MODULE NOT FOUND")

        fetchData = HELPER.deleteUnnecessaryUserData(stripProgramModuleData(data[0]))
        cb()
      })
    }
  ],
    function (err) {
      if (err) callback(err)
      else callback(null, { module: HELPER.deleteUnnecessaryUserData(fetchData) })
    }
  )
};

// GET /programs/:p_id/modules/:id/resources
// Get a specific resources of a specific module of a specific program
var getResources = function (userData, callback) {

};

// GET /programs/:p_id/modules/:m_id/activities/:id
// Get a specific activity of a specific module of a specific program
var getActivity = function (userData, callback) {

};

// GET /programs/:p_id/modules/:m_id/tasks/:id
// Get a specific task of a specific module of a specific program
var getTask = function (userData, callback) {

};

module.exports = {
  getPrograms: getPrograms,
  getProgram: getProgram,
  getModule: getModule,
  getResources: getResources,
  getActivity: getActivity,
  getTask: getTask
};
