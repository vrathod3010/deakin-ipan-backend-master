yaml = require('js-yaml')
fs   = require('fs')

var config, walk = {}, defaults = {}, automaticActivation = {}
var file = 'config.yml'
// Get document, or throw exception on error
try {
  config = yaml.safeLoad(fs.readFileSync(file, 'utf8'))

  walk.isEnabled = function () {
    return config.walk.enabled
  }
  walk.getMode = function () {
    return config.walk.mode
  }
  
  walk.getTrigger = function () {
    return config.walk.trigger
  }

  defaults.programsStatus = function () {
    return config.defaults.programs
  }

  defaults.modulesStatus = function () {
    return config.defaults.modules
  }

  defaults.tasksStatus = function () {
    return config.defaults.tasks
  }

  defaults.activitiesStatus = function () {
    return config.defaults.activities
  }

  automaticActivation.programs = function () {
    return config.automatic_activation.programs
  }

  automaticActivation.modules = function () {
    return config.automatic_activation.modules
  }

  automaticActivation.tasks = function () {
    return config.automatic_activation.tasks
  }

  automaticActivation.activities = function () {
    return config.automatic_activation.activities
  }

} catch (e) {
  console.log(`Faulty file: "${file}"`)
  throw e
}

module.exports = {
  walk: walk,
  defaults: defaults,
  automaticActivation: automaticActivation
}
 // TODO: Add logic for conditional exporting of config file to run tests on different configurations
