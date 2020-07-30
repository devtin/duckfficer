const { Schema } = require('./')

const s = new Schema({
  name: String,
  address: {
    line1: String,
    zip: Number
  }
})

/*
console.log(s.parse({
  name: 'Martin',
  papo: [],
  address: {
    line1: '2451',
    zip: 305,
  }
}))

console.log(s.parse({
  name: 'Martin',
  papo: {},
  address: {
    line1: '2451',
    zip: 305,
  }
}))

console.log(s.parse({
  name: 'Martin',
  papo: 0,
  address: {
    line1: '2451',
    zip: 305,
  }
}))

console.log(s.parse({
  name: 'Martin',
  papo: undefined,
  address: {
    line1: '2451',
    zip: 305,
  }
}))
*/
