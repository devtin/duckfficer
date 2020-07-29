import test from 'ava'
import { Schema } from '../../../.'

test('Map', t => {
  /**
   * Validates [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) values
   */

  const MapSchema = new Schema({
    type: Map,
    autoCast: false
  })

  const error = t.throws(() => MapSchema.parse({ hello: true }))
  t.is(error.message, 'Invalid map')
})

test('autoCast (default `true`)', t => {
  const MapSchema = new Schema({
    type: Map
  })

  const parsed = MapSchema.parse({ hello: true })
  t.true(parsed instanceof Map)
  t.true(parsed.get('hello'))
  t.false(Object.hasOwnProperty.call(parsed, 'hello'))
})
