const { Schema } = require('../../../')
const Log = new Schema({
  user: String,
  lastAccess: {
    type: Array,
    arraySchema: {
      type: Date,
      autoCast: true
    }
  }
})

const tinLog = Log.parse({
  user: 'tin',
  lastAccess: ['6/11/2019', 'Sat Jan 11 2020 17:06:31 GMT-0500 (Eastern Standard Time)']
})

console.log(Array.isArray(tinLog.lastAccess)) // => true
console.log(tinLog.lastAccess.length) // => 2
console.log(tinLog.lastAccess[0] instanceof Date) // => true
console.log(tinLog.lastAccess[1] instanceof Date) // => true

try {
  Log.parse({
    user: 'tin',
    lastAccess: ['6/11/1983', 'What is love?']
  })
} catch (err) {
  console.log(err.message) // => Data is not valid
  console.log(err.errors[0].message) // => Invalid date
  console.log(err.errors[0].field.path) // => lastAccess
  console.log(err.errors[0].index) // => 1
}
