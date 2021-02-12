const { Schema } = require('duckfficer')

// lets create a schema first
const User = new Schema({
  firstName: String,
  lastName: String,
  get fullName () {
    return this.firstName + ' ' + this.lastName
  },
  dob: Date,
  contact: {
    phoneNumber: {
      type: Number,
      autoCast: true // transforms String that look like a number into a Number
    },
    emails: {
      default () {
        return []
      },
      type: Array,
      arraySchema: {
        type: String,
        regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
      }
    }
  }
})

User.parse({
  firstName: 'Fulano de Tal',
  contact: {
    emails: ['fulanito']
  }
})
  .catch(err => {
    console.log(err.message) // => Data is not valid
    console.log(err.errors.length) // => 4
    console.log(err.errors[0].message) // => Property lastName is required
    console.log(err.errors[0].field.fullPath) // => lastName
    console.log(err.errors[1].message) // => Property dob is required
    console.log(err.errors[1].field.fullPath) // => dob
    console.log(err.errors[2].message) // => Property contact.phoneNumber is required
    console.log(err.errors[2].field.fullPath) // => contact.phoneNumber
    console.log(err.errors[3].message) // => fulanito is not a valid e-mail address
    console.log(err.errors[3].field.fullPath) // => contact.emails.0
  })

User.parse({
  firstName: 'Fulano',
  lastName: 'de Tal',
  dob: '1/1/2020',
  contact: {
    phoneNumber: '3051234567',
    emails: [
      'personal@email.com',
      'work@email.com'
    ]
  }
})
  .then(obj => {
    console.log(obj.dob instanceof Date) // => true
    console.log(typeof obj.contact.phoneNumber) // => number
    console.log(obj) // =>
    /*
      {
        firstName: 'Fulano',
        lastName: 'de Tal',
        dob: 2020-01-01T05:00:00.000Z,
        contact: {
          phoneNumber: 3051234567,
          emails: [ 'personal@email.com', 'work@email.com' ]
        }
      }
    */
  })
