const UsersController = require('./usersController')
const UserProfileController = require('./userProfileController')
const UserProfileProgramsController = require('./userProfileProgramsController')
const UserProfileFavouritesController = require('./userProfileFavouritesController')
const UserProfileProgramsTasksController = require('./userProfileProgramsTasksController')
const UserNotificationsController = require('./userNotificationsController')

module.exports = Object.assign(UsersController, UserProfileController, UserProfileProgramsController, UserProfileFavouritesController, UserProfileProgramsTasksController,UserNotificationsController)
