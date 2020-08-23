const { Schema } = require('duckfficer')

const User = new Schema({
  firstName: String,
  lastName: String,
  get fullName () {
    return this.firstName + ' ' + this.lastName
  },
  email: {
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value} is not a valid e-mail address']
  },
  dob: Date
})

module.exports = { User }
