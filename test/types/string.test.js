import test from 'ava'
import { Schema } from '../../'

test(`String type throws an error given an invalid String`, t => {
  const stringValidator = new Schema({
    type: String
  })

  try {
    stringValidator.parse({})
    t.fail(`Invalid string was resolved`)
  } catch (err) {
    t.is(err.message, 'Invalid string')
  }
})

test(`minlength`, async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    minlength: 6
  })

  const error = t.throws(() => firstNameValidator.parse('Tin'))
  t.is(error.message, `Invalid minlength`)

  t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
})

test(`maxlength`, async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    maxlength: 13
  })

  const error = t.throws(() => firstNameValidator.parse('Schwarzenegger'))
  t.is(error.message, `Invalid maxlength`)

  t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
})

test('regex', async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    regex: /^[a-z]+$/i
  })

  const error = t.throws(() => firstNameValidator.parse('Tin Rafael'))
  t.is(error.message, `Invalid regex`)

  t.notThrows(() => firstNameValidator.parse('Martin'))
})
