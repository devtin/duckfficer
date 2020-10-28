const { Schema } = require('./')

const number = new Schema({ type: Number, autoCast: true, required: false })

number
  .parse(undefined)
  .then(v => {
    console.log({ v })
  })
