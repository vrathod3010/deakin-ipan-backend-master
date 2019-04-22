# IPAN backend
This Node.js app uses [Hapi Framework](https://hapijs.com).

# Installation and setup

## Clone the project

```
git clone git@github.com:deakin-launchpad/deakin-ipan-backend.git
```

## Install node modules

```
cd deakin-ipan-backend
```

```
npm i
```

## Setup project environment

 Copy configuration files:

```

cp .env.example .env
cp config.yml.example config.yml

```

**Edit these files!**

## Install MongoDB **(macOS/linux)**

```
# macOS
brew install mongodb

# Windows and linux- Help by contributing to this guide!
```

Create mongo data directory:

```
mkdir -p /data/db
```

Run mongo daemon using:

```
mongod
```

### Create test and development database and respective user role

Open another terminal/shell

```
NODE_ENV=test npm run setup
npm run setup
```

## Install Redis

```
# macOS
brew install redis

# Windows and linux- Help by contributing to this guide!
```

## Run redis server

```
redis-server
```

Ensure that you always run `mongod` & `redis-server` command everytime before you run backend server.

## Seed data using JSON files

**Note:** All seed data must follow their respective model.

### Default accounts

Default accounts must be created for **`test` environment** by creating a `.seed_data/users.json` file and populating it with data as:

```json
[
  {
    "emailId": "marywho@wohoo.com",
    "_id": "5c1b0daa91f9e0d6e6318185"
  },
  {
    "emailId": "mobilemary@wohoo.com",
    "password": "plainpassword",
    "_id": "5c1b0daa91f9e0d6e6318186"
  }
]
```

Default accounts need to have a unique `emailId` only. `_id` field along with `accessToken` is used to hardcode an accessToken for `test` environment only, which is where the database is seeded with `seed.js`.
Default password for each account created is `password`.

### Other json data

Inside `.seed_data` directory, you can create other files, such as:

1. `programs.json`
2. `modules.json`
3. `tasks.json`
4. `activities.json`

## Steps for gaining .seed_data access on Dropbox

1. Contact Akash using Slack for dropbox access to seed data.
2. Install Dropbox client on your machine. 
3. Fire up a terminal and navigate to the IPAN backend project folder.
4. Once you get the Dropbox access, add a linker pointing to the `.seed_data` folder in the backend folder (Ubuntu and mac) like so:

```
ln -s /home/<YOUR_USER_DIRECTORY>/Dropbox/deakin-launchpad/ipan-backend/.seed_data/ .seed_data
```

**Please make sure that the path to Dropbox needs to be absolute! Using `~` for home directory location may not work correctly.**

## Start backend server in test environment

```
NODE_ENV=test DEBUG=app:*,-app:nDispatcher:REMOVED npm start
```

`DEBUG=app:*,-app:nDispatcher:REMOVED` flags reduce a lot of logging information which are normally not required. More flags can be added or removed as per requirements. Generally, each file has it's own logger. If it doesn't and is logging something, consider sending a PR.

## Test driven development

If you want to automatically run tests everytime you make changes, use:
```
npm run autotest test/tests/api/users.js

```
