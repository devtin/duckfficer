const { Schema } = require('../../../')
const dateValidator = new Schema({
  type: Date
})

try {
  dateValidator.parse('Some invalid date')
} catch (err) {
  console.log(err.message) // => Invalid date
}
