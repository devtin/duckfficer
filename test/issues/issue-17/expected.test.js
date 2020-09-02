import test from 'ava'
import { Schema } from '../../../'

test('Fixes #17', async t => {
  const objectParser = new Schema({
    type: Object
  })
  t.plan(2)
  await t.notThrowsAsync(async () => {
    t.is((await objectParser.parse({ hi: 'hello' })).hi, 'hello')
  })
})
