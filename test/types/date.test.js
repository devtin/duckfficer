import test from 'ava'
import { Schema } from '../../'

test(`Parses dates`, t => {
  const dateValidator = new Schema({
    type: Date
  })

  try {
    dateValidator.parse('Some invalid date')
    t.fail(`Invalid date was resolved`)
  } catch (err) {
    t.is(err.message, 'Invalid date')
  }
})

test(`Date type throws an error given an invalid date`, t => {
  const dateValidator = new Schema({
    type: Date
  })

  try {
    dateValidator.parse('Some invalid date')
    t.fail(`Invalid date was resolved`)
  } catch (err) {
    t.is(err.message, 'Invalid date')
  }
})
