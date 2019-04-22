'use strict'

const assert = require('chai').assert
const server = require('../../../src/server')

const sanitizedUrl = function (str) {
  str = str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str
  return 'http://localhost:8000/api' + str
}

const authorisedRequest = function (obj) {
  obj.url = sanitizedUrl(obj.url)
  obj.headers = {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjMWIwZGFhOTFmOWUwZDZlNjMxODE4NSIsImlhdCI6MTU0NTI3NzQzOH0._vVO8c-IRnUzHoXr1XNqceMpKrhl1egcgkdth8gqFtA"
  }
  return obj
}

server.register([{
  register: require('inject-then')
}], (err) => {
  if (err) {
    console.log('Error while loading plugins: ' + err)
  } else {
    console.log('Plugins Loaded')
  }
})

function assertResponse(request, key, furtherAssert, statusCode) {
  return server.injectThen(request).then(
    function (response) {
      assert.equal(response.statusCode, (statusCode || 200))

      let data = JSON.parse(response.payload).data
      if (typeof key === 'string' && key !== '') assert.isDefined(data[key])

      return data
    }).then(furtherAssert).then(
      () => { if (typeof key === 'string' && key !== '') console.log(`A valid key '${key}' exists`) },
      (err) => { throw new Error(err) }
    )
}

describe('Connection', function () {
  /** This is done to ensure that the actual tests wait for server to be ready */
  this.timeout(10000)

  var SKIP_RESET = false

  before(server.isSeedReady)

  after(() => {
    console.log('Stopping HAPI server..')
    return server.stop()
  })

  afterEach((done) => {
    if (!SKIP_RESET) {
      server.resetDB(done)
      console.log('=====================================================')
    } else {
      SKIP_RESET = false
      done()
    }
  })

  describe('User', function () {

    describe('#post()', function () {

      it('Should log in user.', function () {
        let request = {
          method: 'POST',
          url: sanitizedUrl('/user/login'),
          payload: {
            "emailId": "mobilemary@wohoo.com",
            "password": "password"
          }
        }

        return assertResponse(request)
      })

      it('Should make a valid submission for user program 1 module 1 task 1.', function () {

        SKIP_RESET = true

        let answers = [{
          questionId: 1,
          answeredOptionId: 0
        },
        {
          questionId: 2,
          answeredOptionId: 0
        },
        {
          questionId: 3,
          answeredOptionId: 1
        }]

        let request = authorisedRequest({
          method: 'POST',
          url: '/user/programs/1/modules/1/tasks/1/submit',
          payload: { data: JSON.stringify(answers) }
        })

        return assertResponse(request, 'message', data => {
          assert.equal(data.message, "ANSWERS SUBMITTED SUCCESSFULLY")
        })

      })

      it('Should make an invalid submission for user program 1 module 1 task 1.', function () {

        let answers = [{
          questionId: 1,
          answeredOptionId: 1
        },
        {
          questionId: 3,
          answeredOptionId: 1
        }]

        let request = authorisedRequest({
          method: 'POST',
          url: '/user/programs/1/modules/1/tasks/1/submit',
          payload: { data: JSON.stringify(answers) }
        })

        return assertResponse(request, null, null, 400)

      })

    })

    describe('#get()', function () {

      it('Should get all valid user programs.', function () {

        let request = authorisedRequest({
          method: 'GET',
          url: '/user/programs'
        })

        let keys = [
          'id', 'title', 'description', 'coverPhoto', 'sections', 'status', 'progress', 'total'
        ]

        return assertResponse(request, 'programs', (data) => {
          data.programs.forEach((program) => {
            assert.containsAllKeys(program, keys)
          })
        })

      })

      it('Should get a valid user program.', function () {

        let request = authorisedRequest({
          method: 'GET',
          url: '/user/programs/1'
        })

        let keys = [
          'id', 'title', 'description', 'coverPhoto', 'sections', 'modules'
        ]

        return assertResponse(request, 'programs', (data) => {
          assert.containsAllKeys(data['programs'], keys)
          assert.notEqual(data.programs.modules.length, 0)
          /**
           * TODO: Add assertions for module statuses. 
           * 1 should be active by default.
           * 3 should stay complete.
           * 7, 8, 10 shouldn't exist.
           * 2, 4, 5, 6 should be INACTIVE.
           * */ 
          
        })

      })

      it('Should get a valid user program module.', function () {

        let request = authorisedRequest({
          method: 'GET',
          url: '/user/programs/1/modules/1'
        })

        let keys = [
          'id', 'title', 'shortDescription', 'status', 'favouriteStatus'
        ]

        return assertResponse(request, 'module', (data) => {
          assert.containsAllKeys(data['module'], keys)
        })

      })

      it('Should get a valid user program module task.', function () {

        let request = authorisedRequest({
          method: 'GET',
          url: '/user/programs/1/modules/1/tasks/1'
        })

        let keys = [
          'id', 'type', 'title', 'shortDescription', 'status', 'favouriteStatus', 'data', 'submissions'
        ]

        let deep_keys = [
          'questionType', 'answerType'
        ]

        return assertResponse(request, 'task', (data) => {
          assert.containsAllKeys(data['task'], keys)
          assert.containsAllKeys(data.task.data, deep_keys)
        })

      })

    })

  })

  describe('#put()', function () {

    it('Should activate user program 1 module 1.', function () {

      SKIP_RESET = true

      let request = authorisedRequest({
        method: 'PUT',
        url: '/user/programs/1/modules/1/activate'
      })

      return assertResponse(request, '', (data) => {
        assert.equal(data.message, 'MODULE ACTIVATED')
      })

    })

    it('Should mark user program 1 module 1 as completed.', function () {

      SKIP_RESET = true

      let request = authorisedRequest({
        method: 'PUT',
        url: '/user/programs/1/modules/1/complete'
      })

      return assertResponse(request, '', (data) => {
        assert.equal(data.message, 'MODULE COMPLETED')
        assert.isArray(data.unlockedModules)
        assert.equal(data.unlockedModules.length, 3)

        let arr = data.unlockedModules.map(m => m.id)
        assert.isTrue([2, 4, 5].every(i => arr.includes(i)))
      })

    })

    it('Should activate user program 1 module 5.', function () {

      SKIP_RESET = true

      let request = authorisedRequest({
        method: 'PUT',
        url: '/user/programs/1/modules/5/activate'
      })

      return assertResponse(request, '', (data) => {
        assert.equal(data.message, 'MODULE ACTIVATED')
      })

    })

    it('Should mark user program 1 module 5 as completed.', function () {

      SKIP_RESET = true

      let request = authorisedRequest({
        method: 'PUT',
        url: '/user/programs/1/modules/5/complete'
      })

      return assertResponse(request, '', (data) => {
        assert.equal(data.message, 'MODULE COMPLETED')
        assert.isTrue(data.hasOwnProperty('unlockedModules'))
        assert.isArray(data.unlockedModules)
        assert.equal(data.unlockedModules.length, 1)
        
        assert.isTrue(data.unlockedModules[0].id === 6)
      })

    })

    it('Should return program 1 with modules 2, 4 and 6 as UNLOCKED, 1, 3 and 5 as COMPLETE.', function () {

      SKIP_RESET = true

      let request = authorisedRequest({
        method: 'GET',
        url: '/user/programs/1'
      })

      return assertResponse(request, 'programs', (data) => {
        assert.equal(data.programs.modules.length, 6)
        data.programs.modules.forEach((mod) => {
          console.log(`Module ID: ${mod.id}, status: ${mod.status}${ mod.id === 3 ? ' // Status defaulted to COMPLETE in users.json' : '' }`)
          switch (mod.id) {
            case 1:
            case 3:
            case 5:
              return assert.equal(mod.status, 'COMPLETE')
            case 2:
            case 4:
            case 6:
              return assert.equal(mod.status, 'UNLOCKED')
            default:
              return assert.equal(mod.status, 'LOCKED')
          }

        })
      })

    })


  })

})
