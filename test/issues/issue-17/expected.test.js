import test from 'ava'
import { Schema } from '../../../'

test(`Fixes #17`, t => {
  const objectParser = new Schema({
    type: Object
  })
  t.plan(2)
  t.notThrows(() => {
    t.is(objectParser.parse({ hi: 'hello' }).hi, 'hello')
  })
})
