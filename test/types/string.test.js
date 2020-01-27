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

  t.throws(() => firstNameValidator.parse('Tin'), `Invalid minlength`)
  t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
})

test(`maxlength`, async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    maxlength: 13
  })

  t.throws(() => firstNameValidator.parse('Schwarzenegger'), `Invalid maxlength`)
  t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
})

test('regex', async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    regex: /^[a-z]+$/i
  })

  t.throws(() => firstNameValidator.parse('Tin Rafael'), `Invalid regex`)
  t.notThrows(() => firstNameValidator.parse('Martin'))
})
