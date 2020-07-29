const { Schema } = require('../../../')

const objectParser = new Schema({
  type: Object
})

try {
  objectParser.parse({ hi: 'hello' })
} catch (err) {
  console.log(err.message) // => v is not defined
}
