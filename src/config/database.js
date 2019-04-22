var config = {
  development: {
    adapter: process.env.DB_ADAPTER,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  test: {
    adapter: process.env.DB_ADAPTER,
    database: process.env.TEST_DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  staging: {
    adapter: process.env.DB_ADAPTER,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },
  production: {
    adapter: process.env.DB_ADAPTER,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  }
}

// module.exports = config[process.env.NODE_ENV || 'development'];
module.exports = (env) => { return config[env] }
