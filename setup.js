const fs = require('fs');
const { COPYFILE_EXCL } = fs.constants
require('dotenv').config();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const db = require('./src/config/database')(process.env.NODE_ENV)
const async = require('async')
const mongoose = require('mongoose')

if (!(db.database || db.username || db.password || db.host || db.port)) {
  console.error('Error: .env file does not exist or is not configured! Make sure it is.')
  console.error("(MacOS/Linux) Run `cp .env.example .env` to initialise the file if it hasn't been already.")
  process.exit(0)
}

const conn = new mongoose.mongo.MongoClient(`mongodb://${db.host}:${db.port}/${db.database}`)

var connectedDB
async.series([
  function (cb) {
    const CONFIG_FILE = 'newUserSkeleton.json'

    fs.access(`./${CONFIG_FILE}`, fs.constants.F_OK | fs.constants.R_OK, (err) => {
      if (err) {
        console.log(`./${CONFIG_FILE} ${err.code === 'ENOENT' ? 'does not exist' : 'is not readable'}`)

        // By using COPYFILE_EXCL, the operation will fail if destination file exists.
        fs.copyFile(`./${CONFIG_FILE}.example`, `./${CONFIG_FILE}`, COPYFILE_EXCL, (err) => {
          if (err) throw err;
          console.log(`./${CONFIG_FILE}.example was copied as ./${CONFIG_FILE}`)
        })
      }
      else console.log(`./${CONFIG_FILE} exists, and it is readable`)

      cb()
    })
  },
  function (cb) {
    const CONFIG_FILE = 'config.yml'

    fs.access(`./${CONFIG_FILE}`, fs.constants.F_OK | fs.constants.R_OK, (err) => {
      if (err) {
        console.log(`./${CONFIG_FILE} ${err.code === 'ENOENT' ? 'does not exist' : 'is not readable'}`)

        // By using COPYFILE_EXCL, the operation will fail if destination file exists.
        fs.copyFile(`./${CONFIG_FILE}.example`, `./${CONFIG_FILE}`, COPYFILE_EXCL, (err) => {
          if (err) throw err;
          console.log(`./${CONFIG_FILE}.example was copied as ./${CONFIG_FILE}`)
        })
      }
      else console.log(`./${CONFIG_FILE} exists, and it is readable`)

      cb()
    })
  },
  function (cb) {
    conn.connect((err, res) => {
      if (err) return cb(err)
      console.log('DB connected.')
      connectedDB = res
      cb()
    })
  },
  function (cb) {
    connectedDB.db(db.database).command({ createUser: db.username, pwd: db.password, roles: ["readWrite"] }, (err, res) => {
      if (err) return cb(err)
      cb()
    })

  }
],
  function (err) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`User ${db.username} created for ${db.host}:${db.port}/${db.database}.`)
    console.log("If you run setup script again without dropping the user, you will receive an error, saying that the user exists.")
    console.log("If you run `show dbs` command in Mongo shell, the create database will not appear since it doesn't have any collections yet, even though the user has been added.")
    process.exit(0)
  }
)
