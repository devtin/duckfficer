const { Schema } = require('../../../')
const dateValidator = new Schema({
  type: Date
})

console.log(dateValidator.parse('Some invalid date')) // => Invalid Date
