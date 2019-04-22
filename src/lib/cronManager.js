'use strict'

const schedule = require('node-schedule')

var JOBS = []

/**
 * Schedule and add jobs.
 * @param {*} jobs Single object or array of objects of type `Job`.
 */
const scheduleAndAddCRONJobs = function (jobs) {
  if (!Array.isArray(jobs)) {
    if (!(jobs instanceof Job)) throw new Error('Not a valid job')
    if (0 < JOBS.filter(item => item.name === jobs.name).length) throw new Error('Job with that name already exists')

    JOBS.push(jobs.schedule())
    console.log(`Scheduled and added job:`, jobs.name)
    return
  }

  if (0 === jobs.length) return

  jobs.forEach((jobItem) => {
    if (!(jobItem instanceof Job)) throw new Error('Not a valid job')
    if (0 < JOBS.filter(item => item.name === jobItem.name).length) throw new Error('Job with that name already exists')    

    JOBS.push(jobItem.schedule())
    console.log(`Scheduled and added job:`, jobItem.name)
  })


}

/**
 * Cancel and remove jobs.
 * @param {*} jobNames Single string or array of strings.
 */
const cancelAndRemoveCRONJobs = function (jobNames) {
  if (!Array.isArray(jobNames)) {
    if (typeof jobNames !== 'string') throw new Error('Not a valid string')

    let j = JOBS.filter(item => item.name === jobNames)[0]
    if (j) {
      j.cancel()
      JOBS.splice(JOBS.indexOf(j), 1)
      console.log(`Cancelled and removed job:`, jobNames)
    }
    return
  }

  if (0 === jobNames.length) return

  jobNames.forEach((name) => {
    if (typeof name !== 'string') throw new Error('Not a valid string')

    let j = JOBS.filter(item => item.name === name)[0]
    if (j) {
      j.cancel()
      JOBS.splice(JOBS.indexOf(j), 1)
      console.log(`Cancelled and removed job:`, name)
    }
  })


}

/**
 * Reschedule jobs.
 * @param {*} jobNames Single string or array of strings.
 */
const rescheduleCRONJobs = function (jobNames) {
  if (!Array.isArray(jobNames)) {
    if (typeof jobNames !== 'string') throw new Error('Not a valid string')

    let j = JOBS.filter(item => item.name === jobNames)[0]
    if (j) {
      j.reschedule("*/2 * * * * *")
      console.log(`Rescheduled job:`, jobNames)
    }
    return
  }

  if (0 === jobNames.length) return

  jobNames.forEach((name) => {
    if (typeof name !== 'string') throw new Error('Not a valid string')

    let j = JOBS.filter(item => item.name === name)[0]
    if (j) {
      j.reschedule("*/2 * * * * *")
      console.log(`Rescheduled job:`, name)
    }
  })


}

/**
 * Cancel all jobs.
 */
const cancelAllCRONJobs = function () {
  JOBS.forEach((item, i) => {
    item.cancel()
    console.log(`Cancelled job[${i}]:`, item.name)
  })
}

/**
 * List all jobs.
 */
const listCRONJobs = function () {
  JOBS.forEach((item, i) => {
    console.log(`Job[${i}] name:`, item.name)
  })
}

/**
 * Cancel and remove all jobs.
 */
const cancelAndRemoveAllCRONJobs = function () {
  JOBS.forEach((item) => {
    cancelAndRemoveCRONJobs(item.name)
  })
}

/**
 * Job data structure.
 * @param {*} name Name of the job.
 * @param {*} cron Scheduling rule.
 * @param {*} executor Executor function.
 */
const Job = function (name, cron, executor) {
  if (typeof name !== 'string' || typeof executor !== 'function') throw err

  this.name = name
  this.cron = cron
  this.executor = executor
  this.schedule = function () {
    return schedule.scheduleJob(this.name, this.cron, this.executor)
  }
}

const initJobs = function () {
  const dawg = new Job('dawg', "*/2 * * * * *", () => {
    console.log('woof!', new Date())
  })
  
  const cat = new Job('cat', "*/3 * * * * *", () => {
    console.log('meow!', new Date())
  })
  
  const catLover = new Job('catLover', "*/10 * * * * *", () => {
    let j = JOBS.filter(item => item.name === 'dawg')[0]
    if (j) {
      console.log('SHUSH', new Date())
      j.cancel()
    }
  })
  
  const stubbornness = new Job('stubbornness', "*/15 * * * * *", () => {
    let j = JOBS.filter(item => item.name === 'dawg')[0]
    if (j) {
      j.reschedule("*/2 * * * * *")
    }
  })

  scheduleAndAddCRONJobs([dawg, cat, catLover, stubbornness])
}

initJobs()

listCRONJobs()

module.exports = {
  scheduleAndAddCRONJobs: scheduleAndAddCRONJobs,
  cancelAndRemoveCRONJobs: cancelAndRemoveCRONJobs,
  rescheduleCRONJobs: rescheduleCRONJobs,
  cancelAllCRONJobs: cancelAllCRONJobs,
  listCRONJobs: listCRONJobs,
  cancelAndRemoveAllCRONJobs: cancelAndRemoveAllCRONJobs,
  Job: Job
}
