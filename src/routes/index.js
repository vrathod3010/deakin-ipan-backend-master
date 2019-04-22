'use strict'

const UserRoutes = require('./userRoutes')
const UserProfileRoutes = require('./userProfileRoutes')
const UserNotificationsRoutes = require('./userNotificationsRoutes')
const UserProfileProgramRoutes = require('./userProfileProgramRoutes')
const UserProfileFavouriteRoutes = require('./userProfileFavouriteRoutes')
const UserProfileProgramTaskRoutes = require('./userProfileProgramTaskRoutes')

const ProgramRoutes = require('./programRoutes')

const APIs = [].concat(UserRoutes, UserProfileRoutes, UserNotificationsRoutes, UserProfileProgramRoutes, UserProfileFavouriteRoutes, UserProfileProgramTaskRoutes, ProgramRoutes)

module.exports = APIs
