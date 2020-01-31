const { Schema } = require('./')

// defining the schema
const User = new Schema({
  name: String,
  address: {
    state: {
      type: String,
      default: 'Florida'
    },
    zip: Number,
    street: String
  },
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin',
  address: {
    zip: 33129,
    street: 'Brickell Av'
  }
})

console.log(Martin.hasOwnProperty('name')) // => true
console.log(Martin.hasOwnProperty('address')) // => true
console.log(Martin.hasOwnProperty('created')) // => true
console.log(Martin.name) // => Martin
console.log(Martin.address.state) // => Florida
console.log(Martin.address.zip) // => 33129
console.log(Martin.address.street) // => Brickell Av
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Martin Rafael Gonzalez'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 2
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => Property address.zip is required
  console.log(err.errors[0].field.fullPath) // => address.zip
  console.log(err.errors[1].message) // => Property address.street is required
  console.log(err.errors[1].field.fullPath) // => address.street
}
