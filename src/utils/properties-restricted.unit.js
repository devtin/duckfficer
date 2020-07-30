import { propertiesRestricted } from './properties-restricted.js'
import test from 'ava'

test('Properties restricted', t => {
  const user = {
    name: 'Martin Rafael',
    email: 'tin@devtin.io',
    address: {
      city: 'Miami, Fl',
      zip: 305,
      line1: 'Brickell Ave'
    }
  }
  t.false(propertiesRestricted(user, ['name'])) // => false
  t.true(propertiesRestricted(user, ['name', 'email', 'address'])) // => true
  t.true(propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'])) // => true
  t.false(propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
})
