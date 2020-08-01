import test from 'ava'
import crypto from 'crypto'
import { Schema, Transformers } from '../../'

test('Methods & Events', t => {
  /**
   * Methods are applied to the returned data-model. When triggered, they are called using a
   * [this keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) object that contains
   * two properties: `$emit` being a function to emit events and `$field` which is the actual validated value.
   *
   * Below we are gonna illustrate the use of methods and events. To do so, we are gonna use an example where we have
   * `User` model that is meant to validate and log user authentication.
   */

  Transformers.Password = {
    loaders: [String],
    parse (v) {
      return crypto.createHash('sha256')
        .update(v)
        .digest('hex')
    }
  }

  /**
   * In the `Logs` schema below, we are gonna add a method called `addLog`. This method takes a `String` as
   * argument and is only meant to trigger a `newLog` event with a payload matching the schema specified.
   */

  const Logs = new Schema({
    type: Array,
    default () {
      return []
    }
  }, {
    methods: {
      addLog: {
        events: {
          newLog: {
            date: Date,
            message: String
          }
        },
        // this is the schema expected at the handler payload (undefined to accept anything)
        input: String,
        // output: 'SomeSchema', // the schema expected at the handler output (undefined to accept anything)
        handler (message) {
          const newLog = { date: new Date(), message }
          this.$field.push(newLog)
          this.$emit('newLog', newLog)
        }
      }
    }
  })

  /**
   * In the `User` schema below, we are adding a method called `isValidPassword which will check whether given password
   * matched the one provided in the model or not. This method expects a `String` as a argument, can dispatch a
   * `passwordValidated` event and is meant to return a `Boolean`.
   */

  const User = new Schema({
    email: String,
    password: 'Password',
    logs: Logs
  }, {
    methods: {
      isValidPassword: {
        events: {
          passwordValidated: String
        },
        input: String,
        // this is the schema expected at the handler output
        output: Boolean,
        handler (givenPassword) {
          if (givenPassword === 'not-boolean') {
            // will raise an error since the output is meant to be boolean
            return '1'
          }

          const succeed = Transformers.Password.parse(givenPassword) === this.$field.password
          this.$field.logs.addLog(`validation attempt ${succeed ? 'succeed' : 'failed'}`)

          if (givenPassword === 'undefined-event') {
            // will raise an error since 'undefined-event' is not a registered event
            this.$emit('undefined-event')
          }

          if (givenPassword === 'invalid-event-payload') {
            // will raise an error since 'passwordValidated' expects a String payload
            this.$emit('passwordValidated', 1)
          }

          if (succeed) {
            this.$emit('passwordValidated', givenPassword)
          }

          return succeed
        }
      }
    }
  })

  const me = User.parse({
    email: 'tin@devtin.io',
    password: '123'
  })

  const logsReceived = []

  me.logs.$on('newLog', (log) => {
    logsReceived.push(log)
  })

  t.truthy(me.password)
  t.not(me.password, '123')
  t.false(me.isValidPassword('456'))
  t.true(me.isValidPassword('123'))

  t.is(me.logs.length, 2)
  t.is(me.logs[0].message, 'validation attempt failed')
  t.is(me.logs[1].message, 'validation attempt succeed')

  t.deepEqual(logsReceived, me.logs)

  let error

  error = t.throws(() => me.logs.addLog(123))

  t.is(error.message, 'Invalid input at method addLog')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid string')

  error = t.throws(() => me.isValidPassword('not-boolean'))

  t.is(error.message, 'Invalid output at method isValidPassword')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid boolean')

  error = t.throws(() => me.isValidPassword('undefined-event'))
  t.is(error.message, 'Unknown event undefined-event')

  error = t.throws(() => me.isValidPassword('invalid-event-payload'))
  t.is(error.message, 'Invalid payload for event passwordValidated')
  t.is(error.errors[0].message, 'Invalid string')

  t.notThrows(() => User.parse(me))
})
