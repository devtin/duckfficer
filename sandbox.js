const { Schema } = require('./')

// defining the schema
const User = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: [true, 'An e-mail must be entered'],
    regex: [/^[a-z0-9._+]+@[a-z0-9-]+\.[a-z]{2,}$/, 'Please enter a valid e-mail']
  },
  birthday: Date,
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin',
  email: 'tin@devtin.io',
  birthday: '6/11/1983'
})

console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('email')) // => true
console.log(Martin.birthday instanceof Date) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Olivia',
    birthday: '8/31/2019'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 1
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => An e-mail must be entered
  console.log(err.errors[0].field.name) // => email
}
