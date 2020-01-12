const { Schema, ValidationError } = require('../../../')

const numberType = new Schema({
  type: Number
})

try {
  numberType.parse('no')
}
catch (err) {
  console.log(err instanceof ValidationError) // => false
}
