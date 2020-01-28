const { Schema } = require('./')

// defining the schema
const User = new Schema({
  name: String,
  email: {
    type: String,
    regex: [/^[a-z0-9.]+@[a-z0-9.]+\.[a-z]{2,}$/, `Invalid e-mail address`]
  },
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
})

console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('email')) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(Martin.name) // => Martin
console.log(Martin.email) // => tin@devtin.io
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Martin Rafael Gonzalez',
    email: 'none'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 1
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => Invalid e-mail address
  console.log(err.errors[0].field.name) // => email
}
