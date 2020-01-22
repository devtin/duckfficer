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
