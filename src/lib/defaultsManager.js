const async = require('async')
const SERVICES = require('../services.js')
const ProgramService = SERVICES.ProgramService
const config = require('../../yamlObjects')
const defaultsConfig = config.defaults
const walksConfig = config.walk

const processDefaultActivePrograms = function (userData, cb) {
  // If default status is unlocked, it should be handled in the user model
  if (defaultsConfig.programsStatus() === 'unlocked') return cb()

}

const processDefaultActiveModules = function (userData, callback) {
  /**
   * For each programId P in doc, if program doesn't have a modulesMap, return.
   * For each moduleId in P that exists in modulesMap, see if the module has a dependency.
   * If it doesn't, mark the moduleId as unlocked.
   *
   */

  // If default status is unlocked, it should be handled in the user model
  if (defaultsConfig.modulesStatus() === 'unlocked') return cb()

  if (userData.profile && userData.profile.programsData && userData.profile.programsData.length > 0) {
    let programsData = userData.profile.programsData
    let userProgramsArr = [], userProgramsData = [], eligibleUserProgramsArr = [], programDBData = []

    programsData.forEach((program) => {
      if (!program.modules || program.modules.length === 0) return

      userProgramsArr.push(program.programId)
      userProgramsData.push(program)
    })

    async.series([
      function (cb) {
        let criteria = { id: { $in: userProgramsArr } }
        let projection = { _id: 0, id: 1, modulesMap: 1 }

        ProgramService.getRecord(criteria, projection, {}, (err, data) => {
          if (err) return cb(err)

          data.forEach((program) => {
            if (!userProgramsArr.includes(program.id)) return

            programDBData.push(program)
            eligibleUserProgramsArr.push(program.id)
          })

          cb()

        })
      },
    ],
      function (err) {
        if (err) throw err

        userData.profile.programsData = userProgramsData.map((userProgram) => {
          let dbProgram = programDBData.find(program => program.id === userProgram.programId)

          /**
           * Here.. check if in the config the activation mode is timed. 
           * If it is, then only set the first module as unlocked.
           * Since the JSON array is ordered list, this won't be a problem.
           * TODO: Add default activated resources feature.
           */

          if (walksConfig.getTrigger() === "CRON") {
            userProgram.modules[0].status = 'UNLOCKED'
            return userProgram
          }
          /**
           * Check if a program doesn't have a modulesMap or the map is empty.
           */
          if (!dbProgram.modulesMap || dbProgram.modulesMap.length === 0) {
            userProgram.modules = userProgram.modules.map((m) => {
              m.status = 'UNLOCKED'
              return m
            })

            return userProgram
          }

          userProgram.modules = userProgram.modules.map((m) => {
            // If module's status is not LOCKED     || we find that a dependency for that module in modulesMap
            // then return that module untouched
            if ((m.status && m.status !== 'LOCKED') ||
              dbProgram.modulesMap.find(item => item.key === m.moduleId && item.value && (item.value.length > 0)
              )) return m

            m.status = 'UNLOCKED'
            return m
          })

          return userProgram

        })

        callback(null, userData)

      }
    )
  }
}

const processDefaultActiveActivities = function (userData, cb) {
  // If default status is unlocked, it should be handled in the user model
  if (defaultsConfig.activitiesStatus() === 'unlocked') return cb()

}

const processDefaultActiveTasks = function (userData, cb) {
  // If default status is unlocked, it should be handled in the user model
  if (defaultsConfig.tasksStatus() === 'unlocked') return cb()

}

const processDefaults = function (parentResource, childResource, userData, cb) {
  if (parentResource !== 'programs' || childResource !== 'modules') return cb("Anything apart from programs and modules isn't supported yet")  

  if (!Array.isArray(userData)) return processDefaultActiveModules(userData, cb)
  if (userData.length === 1) return processDefaultActiveModules(userData[0], cb)

  processDefaultActiveModules(userData[0], () => {  
    userData.splice(0, 1)
    return processDefaults(parentResource, childResource, userData, cb)
  })

}

module.exports = {
  processDefaults: processDefaults
}
