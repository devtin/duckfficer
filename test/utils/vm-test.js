function validateUser (possibleUser) {
  // making sure given data is an actual object
  if (typeof possibleUser !== 'object') {
    throw new Error(`Given user is not valid.`)
  }

  // duck-typing validation
  // https://en.wikipedia.org/wiki/Duck_typing
  if (
    !possibleUser.firstName
    || !possibleUser.lastName
    || !possibleUser.email
    || !possibleUser.address
    || typeof possibleUser.address !== 'object' // nested object
    || !possibleUser.address.city
    || !possibleUser.address.state
    || !possibleUser.address.zip
    || !possibleUser.address.line1
  ) {
    throw new Error(`Given user does not seem a valid user.`)
  }

  // schema validation...
  if (
    typeof possibleUser.firstName !== 'string'
    || possibleUser.firstName.length < 4
    || possibleUser.firstName.length > 20
  ) {
    throw new Error(`Invalid firstName`)
  }

  if (
    typeof possibleUser.lastName !== 'string'
    || possibleUser.lastName.length < 4
    || possibleUser.lastName.length > 20
  ) {
    throw new Error(`Invalid lastName`)
  }

  if (
    possibleUser.birthday
    && !(possibleUser.birthday instanceof Date)
  ) {
    if (!Date.parse(possibleUser.birthday)) {
      throw new Error(`Invalid birthday`)
    }
    possibleUser.birthday = new Date(possibleUser.birthday)
  }

  if (
    possibleUser.birthday
    || !couldBeALivingHuman(possibleUser.birthday)
  ) {
    throw new Error(`Does not seem a living human`)
  }

  if (typeof possibleUser.email !== 'string') {
    throw new Error(`email is not a string`)
  }

  if (!/[a-z.-+]+@[a-z0-9-.]\.[a-z]{2,}/.test(possibleUser.email)) {
    throw new Error(`email is not a valid e-mail`)
  }

  if (typeof possibleUser.address.city !== 'string') {
    throw new Error(`Invalid city`)
  }

  if (
    typeof possibleUser.address.state !== 'string'
    || /^(Florida|New York|California)$/.test(possibleUser.address.state)
  ) {
    throw new Error(`Invalid state`)
  }

  if (typeof possibleUser.address.zip !== 'number') {
    if (isNaN(Number(possibleUser.address.zip))) {
      throw new Error(`Invalid zip`)
    }
    possibleUser.address.zip = Number(possibleUser.address.zip)
  }

  // until here seems like 'possibleUser' could be a valid user & now its data is sanitized...
  // seems safe to proceed with further business logic...
}

/**
 * Validates that a given date of birth could belong to a living human
 * @param {Date} dob
 * @return {Boolean}
 */
function couldBeALivingHuman (dob) {
  // I know no humans living more than 100 years
  // but according to wikipedia, people do...
  // https://en.wikipedia.org/wiki/List_of_the_verified_oldest_people
  const from = new Date(`1/1/${ new Date().getFullYear() - 110 }`)

  // I also know zero humans from the future (yet)
  // wikipedia also agrees: https://en.wikipedia.org/wiki/Time_travel_claims_and_urban_legends
  const until = new Date()
  return from.getTime() <= dob.getTime() && until.getTime() > dob.getTime()
}

const { Schema } = require('/Users/tin/projects/schema-validator/')

const requiredStringWithRange = {
  type: String,
  required: true,
  minlength: [4, 'Invalid { field.fullPath }'],
  maxlength: [20, 'Invalid { field.fullPath }']
}

// schema definition
const User = new Schema({
  firstName: requiredStringWithRange,
  lastName: requiredStringWithRange,
  birthday: Date,
  email: {
    type: String,
    regex: /^[a-z0-9_.+]+@[a-z0-9.-]+\.[a-z]{2,}$/,
    required: true
  },
  address: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      regex: [/^(Florida|New York|California)$/, 'Invalid state']
    },
    zip: {
      type: Number,
      required: true,
      minlength: 4
    },
    line1: {
      type: String,
      required: true
    },
    line2: String
  }
})

// a possible 'user'
const userInput = {
  firstName: 'Martin',
  lastName: 'Gonzalez',
  email: 'tin@devtin.io',
  birthday: '6/11/1983',
  address: {
    city: 'Miami',
    state: 'Florida',
    zip: 33129,
    line1: 'Brickell Ave'
  }
}

const Martin = User.validate(userInput)

console.log(userInput === Martin) // => false
console.log(userInput.birthday instanceof Date) // => false
console.log(Martin.birthday instanceof Date) // => true

try {
  const Olivia = User.validate({
    firstName: 'Olivia Isabel',
    lastName: 'Gonzalez',
    email: 'olivia',
    birthday: new Date('8/31/2019')
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(Array.isArray(err.errors)) // => true
  console.log(err.errors.length) // => 5
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => Value olivia does not match required regex pattern
  console.log(err.errors[1].message) // => Property address.city is required
  console.log(err.errors[2].message) // => Property address.state is required
  console.log(err.errors[3].message) // => Property address.zip is required
  console.log(err.errors[4].message) // => Property address.line1 is required
}
