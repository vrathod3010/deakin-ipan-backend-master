'use strict'

const debug = require('debug')('app:forestWalk')
const GenericDBService = require('../genricDBService')
const UserService = new GenericDBService("User")
const ModuleService = new GenericDBService("Module")
const config = require('../../yamlObjects')
const walkConfig = config.walk
const automaticActivationConfig = config.automaticActivation

const PARENT = {
  module: 'program',
  activity: 'module',
  task: 'module'
}

function unlockOrActivateModule(userId, programId, moduleId, cb) {
  // console.log('activateModule()')
  const criteria = { id: userId }
  const dataToPut = { "$set": { "profile.programsData.$[p].modules.$[m].status": automaticActivationConfig.modules() ? "ACTIVE" : "UNLOCKED" } }
  const options = { "arrayFilters": [{ "p.programId": programId }, { "m.moduleId": moduleId }] }

  UserService.updateRecord(criteria, dataToPut, options, function (err, data) {
    // console.log('rawUpdateRecord()')
    if (err) {
      // console.log(err)
      return cb(false)
    }
    
    if (data.profile.programsData.find(p => p.programId === programId).modules.find(m => m.moduleId === moduleId).status !== (automaticActivationConfig.modules() ? "ACTIVE" : "UNLOCKED"))  return cb(false)

    // console.log('Step:', 4)
    
    let projection = { id: 1, title: 1, shortDescription: 1, _id: 0 }
    ModuleService.getRecord({ id: moduleId }, projection, {}, (err, data) => {
      if (err) return cb(false)

      cb(true, data[0])
    })
  })

}

// In case of modules, a parent could have multiple maps, named activityMap and taskMap. If one of the maps is completed, we need to check if the other map is completed as well.
function checkIfParentisUnlockable(userData, params, resourceType, k, cb) {
  // console.log('checkIfParentCompleted()')
  if (!PARENT.hasOwnProperty(resourceType)) throw new Error(`${resourceType} is not valid`)
  if (PARENT[resourceType] === 'program') {

    if (1 === k.value.length) return unlockOrActivateModule(userData.id, params.programId, k.key, cb)

    var modules = userData.profile.programsData
      .find((program) => params.programId === program.programId).modules
    var modulesArr = modules.map((mod) => mod.moduleId)

    var completedModules = modules.filter((mod) => mod.status === 'COMPLETE')
    var completedModulesArr = completedModules.map((mod) => mod.moduleId)
    const intersection = intersect(k.value, modulesArr)
    const isIntersectionIncludedInCompletedModulesArr = arrayContainsAnotherArray(intersection, completedModulesArr)

    if (!isIntersectionIncludedInCompletedModulesArr) return cb(false)

    unlockOrActivateModule(userData.id, params.programId, k.key, cb)

  } else {
    // TODO: Check for taskMap and activityMap
    throw new Error(`${resourceType} support is not implemented yet`)
  }
}

function intersect(a, b) {
  var setB = new Set(b)
  return [...new Set(a)].filter(x => setB.has(x))
}

function getResourceRelevantData(userData, params, resourceType, cb) {
  if (!PARENT.hasOwnProperty(resourceType)) throw new Error(`${resourceType} is not valid`)
  if (PARENT[resourceType] === 'program') {
    const relevantData = userData.profile.programsData
      .find((program) => params.programId === program.programId).modules
    cb(null, relevantData, params.id)
  } else {

  }
}

function pcb(processedCount, length, cb, data) {
  // console.log('PROCESSED:', data)
  // processedCount++
  // console.log(`processedCount: ${processedCount}, map.length: ${length}`)
  if (length === processedCount) cb()
}

function arrayContainsAnotherArray(needle, haystack) {
  for (var i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) === -1)
      return false;
  }
  return true;
}

const Walks = function () {

  /**
   * Fired when R is marked as COMPLETED
   * @param {*} map Contains the mapping information for the immediate children. Key-value pair. Value should be an array of pre-required resources. Both keys and values are of type integer, representing IDs of @param resourceType resources.
   * @param {*} relevantUserData Relevant user data that includes data of the parent resource. 
   * @param {*} resourceID of the resource of type @param resourceType that has been just marked complete using API.
   * @param {*} resourceType Type of the M/A/T resource. String value.
   * @param {*} cb Callback.
   */
  this.defaultMode = function (map, userData, params, resourceType, cb) {
    var processedCount = 0, length = map.length
    // // console.log(map, userData, params, resourceType)
    if (!map || map === null || map.length === 0) {
      ++processedCount
      return pcb(processedCount, length, cb, "Map is empty")
    }

    getResourceRelevantData(userData, params, resourceType, (err, allRelevantResources, resourceID) => {
      if (err) throw err
      var completedResources = allRelevantResources.filter((r) => r.status === 'COMPLETE').map(r => r[resourceType + 'Id'])
      var unlockedParents = []

      map.forEach((item) => {
        // console.log('Step:', 1)
        // console.log('PROCESSING:', item.key, item.value)
        if (!item.value.includes(resourceID)) {
          ++processedCount
          return pcb(processedCount, length, cb, `${item.key} doesn't have ${resourceID}`)
        }

        const rss = allRelevantResources.find(r => r[resourceType + 'Id'] === item.key)
        if (!rss) {
          ++processedCount
          return pcb(processedCount, length, cb, `User ${userData.id} doesn't have a resource ${resourceType} with key ID ${item.key}`)
        }

        const allRelevantResourcesArr = allRelevantResources.map((r) => r[resourceType + 'Id'])

        const intersection = intersect(item.value, allRelevantResourcesArr)
        const isIntersectionIncludedInCompletedResources = arrayContainsAnotherArray(intersection, completedResources)

        // console.log('Step:', 2)
        // if (item.key === '4') { // TODO: Remove this if condition and comment console.logs
        // console.log('allRelevantResources', allRelevantResources)
        // console.log('item.value', item.value)
        // // console.log('rss', rss)
        // console.log('intersection', intersection)
        // console.log('completedResources', completedResources)
        // console.log('\n\n\n\nintersection.length > 0 ===', intersection.length > 0)
        // console.log('completedResources.includes(intersection) ===', isIntersectionIncludedInCompletedResources)
        // console.log(...intersection)
        // }



        if (item.value.length > 1 && (intersection.length > 0 && !isIntersectionIncludedInCompletedResources)) {
          ++processedCount
          return pcb(processedCount, length, cb, `${item.key} is messed up`)
        }

        // console.log('Step:', 3)
        checkIfParentisUnlockable(userData, params, resourceType, item, (flag, unlockedResource) => {
          // console.log('Step:', 5, `for key: ${item.key}`)
          if (flag) unlockedParents.push(unlockedResource)
          // return ++processedCount || pcb(processedCount, length, cb, `Flag: ${flag} for key: ${item.key}, value: ${item.value}`)
          if (length === processedCount + 1 && unlockedParents.length > 0) return cb(null, unlockedParents)

          ++processedCount
          pcb(processedCount, length, cb, `${item.key} ${item.value} Flag: ${flag}`)
        })

      })
    })

  }
}

var wInstance = new Walks()

const walk = function (map, relevantUserData, resourceID, resourceType, cb) {
  const mode = walkConfig.getMode()

  if (!mode || mode === 'default') return wInstance.defaultMode(map, relevantUserData, resourceID, resourceType, cb)
  if (!wInstance[mode]) return cb("That mode doesn't exist")

  return wInstance[mode](map, relevantUserData, resourceID, resourceType, cb)

}

module.exports = walk
