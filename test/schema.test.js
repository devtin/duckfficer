import test from 'ava'
import { Schema, Utils, Transformers } from '../'

test(`Schema validator validates value type in a Schema`, async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String
  })

  t.throws(() => firstNameValidator.parse(1), 'Invalid string')
  t.throws(() => firstNameValidator.parse({ name: 'Martin' }), 'Invalid string')
  t.throws(() => firstNameValidator.parse(() => 'Martin'), 'Invalid string')
  t.notThrows(() => firstNameValidator.parse('Martin'), 'Martin')

  const AllTypes = new Schema({
    name: String,
    category: Set,
    added: Date,
    approved: Boolean,
    quantity: Number
  })

  let sanitized
  t.notThrows(() => {
    sanitized = AllTypes.parse({
      name: 'Kombucha',
      category: ['health', 'drinks', 'tea', 'health'],
      added: '12/29/2019',
      approved: '1',
      quantity: '23'
    })
  })

  t.is(sanitized.name, 'Kombucha')
  t.true(sanitized.added instanceof Date)
  t.true(sanitized.category instanceof Set)
  t.is(sanitized.category.size, 3)
  t.true(sanitized.category.has('health'))
  t.true(typeof sanitized.approved === 'boolean')
  t.true(Number.isInteger(sanitized.quantity))
  t.is(sanitized.quantity, 23)
})

test(`Minlength helper for strings`, async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    minlength: 6
  })

  t.throws(() => firstNameValidator.parse('Tin'), `Invalid minlength`)
  t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
})

test(`Maxlength helper for strings`, async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    maxlength: 13
  })

  t.throws(() => firstNameValidator.parse('Schwarzenegger'), `Invalid maxlength`)
  t.notThrows(() => firstNameValidator.parse('Martin'), `Martin`)
})

test('Regex helper for strings', async t => {
  const firstNameValidator = new Schema({
    name: 'firstName',
    type: String,
    regex: /^[a-z]+$/i
  })

  t.throws(() => firstNameValidator.parse('Tin Rafael'), `Invalid regex`)
  t.notThrows(() => firstNameValidator.parse('Martin'))
})

test('Default value helper', async t => {
  const quantityValidator = new Schema({
    name: 'quantity',
    type: Number,
    default: 1
  })

  t.is(quantityValidator.parse(), 1)
})

test('Default value helper function', t => {
  const quantityValidator = new Schema({
    name: 'date',
    type: Date,
    default: Date.now
  })

  t.notThrows(() => quantityValidator.parse())
  t.is(Math.round(quantityValidator.parse().getTime() / 100), Math.round(Date.now() / 100))
})

test(`Custom error messages with optional rendering`, t => {
  const Title = new Schema({
    name: 'title',
    type: String,
    required: [true, 'A post requires a title']
  })

  t.throws(() => Title.parse(), 'A post requires a title')

  const Email = new Schema({
    name: 'title',
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
  })

  t.throws(() => Email.parse('martin'), 'martin is not a valid e-mail address')
})

test(`Type casting`, t => {
  const DOB = new Schema({
    name: 'title',
    type: Date
  })

  t.true(DOB.parse('6/11/1983') instanceof Date)

  const qtty = new Schema({
    name: 'quantity',
    type: Number
  })

  t.true(Number.isInteger(qtty.parse('20')))
})

test(`Validates an object schema in terms of contained properties`, t => {
  const user = {
    name: 'Martin Rafael',
    email: 'tin@devtin.io',
    address: {
      city: 'Miami, Fl',
      zip: 33129,
      line1: 'Brickell Ave'
    }
  }

  t.false(Utils.propertiesRestricted(user, ['name'])) // => false
  t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address'])) // => true
  t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'])) // => true
  t.false(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
})

test(`Validates and sanitizes schemas`, t => {
  const PostValidator = new Schema({
    title: {
      type: String,
      required: [true, 'A post requires a title']
    },
    body: {
      type: String,
      required: true
    },
    published: {
      type: Date,
      default: Date.now
    }
  })

  t.throws(() => PostValidator.parse({
    title: 'Beware while selling your stuffs online',
    body: 'Do never share your phone number',
    category: 'shopping'
  }), `Invalid object schema`) // since there is no `category` field in the schema

  let post
  t.notThrows(() => {
    post = PostValidator.parse({
      title: 'Beware while selling your stuffs online',
      body: 'Do never share your phone number'
    })
  })

  t.truthy(post)
  t.true(post.hasOwnProperty('title'))
  t.true(post.hasOwnProperty('body'))
  t.true(post.hasOwnProperty('published'))
  t.true(typeof post.title === 'string')
  t.true(typeof post.body === 'string')
  t.true(post.published instanceof Date)
})

test(`Validates full nested schemas`, t => {
  // console.log(`AddressValidator.paths`, AddressValidator.paths)
  const UserValidator = new Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      regex: /^[a-z0-9_.]+@[a-z-0-9.]+\.[a-z]{2,}$/
    },
    birthday: {
      type: Date,
      validate ({ value }) {
        const millenials = new Date('1/1/2000').getTime()
        if (value.getTime() >= millenials) {
          throw new Error(`Sorry. No millennials allowed!`)
        }
      }
    },
    address: {
      city: {
        type: String,
        required: true
      },
      zip: {
        type: Number,
        required: true
      },
      line1: {
        type: String,
        required: true
      },
      line2: String
    }
  })

  const err = t.throws(() => UserValidator.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com',
  }), 'Data is not valid')

  t.is(err.errors.length, 3)
  t.is(err.errors[0].message, 'Field address.city is required')
  t.is(err.errors[1].message, 'Field address.zip is required')
  t.is(err.errors[2].message, 'Field address.line1 is required')

  t.notThrows(() => UserValidator.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com',
    birthday: '6/11/1983',
    address: {
      city: 'Miami',
      zip: 33129,
      line1: '2451 Brickell Ave'
    }
  }))
})

test(`Handles custom data-types`, t => {
  const customType = new Schema({
    name: String,
    email: {
      type: 'Email',
      required: true
    },
  })

  let error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }), `Data is not valid`)
  t.is(error.errors[0].message, `Don't know how to resolve Email`)

  // Registers a new custom type
  Transformers.Email = {
    loaders: [String], // pre-processes the value using this known-registered types
    parse (v) {
      t.true(this instanceof Schema)
      if (!/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/.test(v)) {
        return this.throwError(`Invalid e-mail address { value } for field { field.name }`, { value: v })
      }
      return v
    }
  }

  error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 123
  }), 'Data is not valid')

  t.is(error.errors[0].message, 'Invalid string')

  error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 'martin'
  }), 'Data is not valid')

  t.is(error.errors[0].message, 'Invalid e-mail address martin for field email')

  t.notThrows(() => customType.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }))
})

