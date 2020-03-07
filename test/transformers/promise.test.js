import test from 'ava'
import { Schema } from '../../'

test(`Promise`, t => {
  const UserType = new Schema({
    user: String,
    picture: Promise
  })

  t.notThrows(() => UserType.parse({
    user: 'tin',
    picture: new Promise((resolve) => {
      setTimeout(() => resolve(`that`), 3000)
    })
  }))

  const error = t.throws(() => UserType.parse({
    user: 'tin',
    async picture () {
      return new Promise((resolve) => {
        setTimeout(() => resolve(`nah`), 3000)
      })
    }
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 1)
  t.is(error.errors[0].message, 'Invalid Promise')
  t.is(error.errors[0].field.fullPath, 'picture')
})

test(`autoCast (default \`false\`)`, t => {
  const UserType = new Schema({
    user: String,
    picture: {
      type: Promise,
      autoCast: true
    }
  })

  t.notThrows(() => UserType.parse({
    user: 'tin',
    async picture () {
      return `Something`
    }
  }))

  t.notThrows(() => UserType.parse({
    user: 'tin',
    picture () {
      return `Something`
    }
  }))

  t.notThrows(() => UserType.parse({
    user: 'tin',
    picture: `Something`
  }))

  t.notThrows(() => UserType.parse({
    user: 'tin',
    picture: new Promise(resolve => {
      resolve(`Something`)
    })
  }))
})
