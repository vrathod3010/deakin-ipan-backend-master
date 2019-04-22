const GenericDBService = require('./genricDBService')
const UserService = new GenericDBService("User")
const UserNotificationService = new GenericDBService("UserNotification")
const ProgramService = new GenericDBService("Program")
const ModuleService = new GenericDBService("Module")
const ActivityService = new GenericDBService("Activity")
const TaskService = new GenericDBService("Task")

module.exports = {
  UserService: UserService,
  UserNotificationService: UserNotificationService,
  ProgramService: ProgramService,
  ModuleService: ModuleService,
  ActivityService: ActivityService,
  TaskService: TaskService
}
