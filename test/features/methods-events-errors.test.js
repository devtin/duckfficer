import test from 'ava'
import bcrypt from 'bcrypt'
import { Schema, Transformers } from '../../'

test('Methods, Events & Errors', async t => {
  /**
   * Methods are applied to the returned data-model. When triggered, they are called using a
   * [this keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) object that contains
   * three properties: `$emit` being a function to emit events, `$field` which is the actual validated value and `$throw`,
   * to throw an error.
   *
   * Below we are gonna illustrate the use of methods, events and errors. To do so, we are gonna use an example where we
   * have a `User` model that is meant to validate and log user authentication.
   */

  Transformers.Password = {
    loaders: [String],
    parse (v) {
      return bcrypt.hash(v, 10)
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
          return this.$emit('newLog', newLog)
        }
      }
    }
  })

  /**
   * In the `User` schema below, we are adding a method called `isValidPassword` which will check whether given password
   * matched the one provided in the model or not. This method expects a `String` as a argument, can dispatch a
   * `passwordValidated` event, can throw an `invalidPassword` error and is meant to return a `Boolean`.
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
        errors: {
          invalidPassword: String
        },
        input: String,
        // this is the schema expected at the handler output
        output: Boolean,
        async handler (givenPassword) {
          if (givenPassword === 'not-boolean') {
            // will raise an error since the output is meant to be boolean
            return '1'
          }

          if (givenPassword === 'throw-invalid-error') {
            // will raise an error since there is no 'some-unknown-error' defined
            return this.$throw('some-unknown-error')
          }

          if (givenPassword === 'throw-invalid-error-payload') {
            // will raise an error since there is no 'some-unknown-error' defined
            return this.$throw('invalidPassword', 1)
          }

          if (givenPassword === 'throw-error') {
            return this.$throw('invalidPassword', givenPassword)
          }

          const succeed = await bcrypt.compare(givenPassword, this.$field.password)
          await this.$field.logs.addLog(`validation attempt ${succeed ? 'succeed' : 'failed'}`)

          if (givenPassword === 'undefined-event') {
            // will raise an error since 'undefined-event' is not a registered event
            await this.$emit('undefined-event')
          }

          if (givenPassword === 'invalid-event-payload') {
            // will raise an error since 'passwordValidated' expects a String payload
            await this.$emit('passwordValidated', 1)
          }

          if (succeed) {
            await this.$emit('passwordValidated', givenPassword)
          }

          return succeed
        }
      }
    }
  })

  const me = await User.parse({
    email: 'tin@devtin.io',
    password: '123'
  })

  const logsReceived = []

  me.logs.$on('newLog', (log) => {
    logsReceived.push(log)
  })

  t.truthy(me.password)
  t.not(me.password, '123')
  t.false(await me.isValidPassword('456'))
  t.true(await me.isValidPassword('123'))

  t.is(me.logs.length, 2)
  t.is(me.logs[0].message, 'validation attempt failed')
  t.is(me.logs[1].message, 'validation attempt succeed')

  t.deepEqual(logsReceived, me.logs)

  let error

  error = await t.throwsAsync(() => me.logs.addLog(123))

  t.is(error.message, 'Invalid input at method addLog')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid string')

  error = await t.throwsAsync(() => me.isValidPassword('not-boolean'))

  t.is(error.message, 'Invalid output at method isValidPassword')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid boolean')

  error = await t.throwsAsync(() => me.isValidPassword('undefined-event'))
  t.is(error.message, 'Unknown event undefined-event')

  error = await t.throwsAsync(() => me.isValidPassword('invalid-event-payload'))
  t.is(error.message, 'Invalid payload for event passwordValidated')
  t.is(error.errors[0].message, 'Invalid string')

  error = await t.throwsAsync(() => me.isValidPassword('throw-invalid-error'))
  t.is(error.message, 'Unknown error some-unknown-error')

  error = await t.throwsAsync(() => me.isValidPassword('throw-invalid-error-payload'))
  t.is(error.message, 'Invalid payload for error invalidPassword')

  error = await t.throwsAsync(() => me.isValidPassword('throw-error'))
  t.is(error.message, 'invalidPassword')
  t.is(error.payload, 'throw-error')

  await t.notThrowsAsync(() => User.parse(me))
})
