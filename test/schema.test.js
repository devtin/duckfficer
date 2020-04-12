import test from 'ava'
import { Schema, Utils, Transformers, ValidationError } from '../'

/**
 * Checks the integrity of an object by ensuring it contains only the expected properties and that
 * these properties are of the expected type. To do so, we need to create a schema:
 */

test(`Validates schemas`, async t => {
  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  const Martin = UserSchema.parse({
    name: `Martin Rafael Gonzalez`,
    birthday: new Date('6/11/1983'),
    description: ['monkey', 'developer', 'arepa lover']
  })

  t.is(Martin.name, `Martin Rafael Gonzalez`)
  t.is(Martin.birthday.getFullYear(), 1983)
  t.is(Martin.description.length, 3)

  const error = t.throws(() => UserSchema.parse({
    name: 123,
    birthday: `Don't know...`,
    description: 'I like bananas'
  }))

  t.true(error instanceof ValidationError)
  t.is(error.message, `Data is not valid`)
  t.is(error.errors.length, 3)
  t.is(error.errors[0].message, `Invalid string`)
  t.is(error.errors[0].field.fullPath, `name`)
  t.is(error.errors[1].message, `Invalid date`)
  t.is(error.errors[1].field.fullPath, `birthday`)
  t.is(error.errors[2].message, `Invalid array`)
  t.is(error.errors[2].field.fullPath, `description`)
})

test('Default value helper', async t => {
  const quantityValidator = new Schema({
    name: 'quantity',
    type: Number,
    default: 1
  })

  t.is(quantityValidator.parse(), 1)
})

test('Default value helper (function)', t => {
  const quantityValidator = new Schema({
    name: 'date',
    type: Date,
    default: Date.now
  })

  t.true(quantityValidator.parse() instanceof Date)

  /**
   * You can also access the state passed via the `parse` method through the default function
   */

  const user = new Schema({
    username: String,
    level: {
      type: String,
      default ({ state }) {
        return state?.user?.level || 'user'
      }
    }
  })

  t.is(user.parse({
    username: 'devtin'
  }).level, 'user')

  t.is(user.parse({
    username: 'devtin'
  }, {
    state: {
      user: {
        level: 'admin'
      }
    }
  }).level, 'admin')
})

/**
 * Each transformer provides its own custom message
 */

test(`Custom error messages with optional rendering`, t => {
  const Title = new Schema({
    name: 'title',
    type: String,
    required: [true, 'A post requires a title']
  })

  let error = t.throws(() => Title.parse())
  t.is(error.message, 'A post requires a title')

  const Email = new Schema({
    name: 'title',
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
  })

  error = t.throws(() => Email.parse('martin'))
  t.is(error.message, 'martin is not a valid e-mail address')
})

/**
 * `autoCasting` is a cool feature to have since it prevents you from doing extra casting.
 */

test(`autoCasting`, t => {
  const DOB = new Schema({
    name: 'title',
    type: Date
  })

  t.true(DOB.parse('6/11/1983') instanceof Date)

  const qtty = new Schema({
    name: 'quantity',
    type: Number,
    autoCast: true
  })

  // Auto-casting is nice
  t.true(Number.isInteger(qtty.parse('20')))

  // Though sometimes may be required for proper validation
  // as mentioned [here](https://github.com/devtin/schema-validator/issues/6)

  let BooleanSchema = new Schema({
    type: Boolean,
    autoCast: false
  })

  let error = t.throws(() => BooleanSchema.parse(5))
  t.is(error.message, `Invalid boolean`) // => Invalid boolean

  const DateSchema = new Schema({
    type: Date,
    autoCast: false
  })

  t.notThrows(() => DateSchema.parse(new Date('6/11/1983 23:11 GMT-0400')))

  error = t.throws(() => DateSchema.parse('6/11/1983'))
  t.is(error.message, `Invalid date`)
})

test(`Validates an object schema in terms of contained properties`, t => {
  const user = {
    name: 'Martin Rafael',
    email: 'tin@devtin.io',
    address: {
      city: 'Miami, Fl',
      zip: 33129,
      line1: 'Brickell Ave',
      metadata: {
        houseColor: 'yellow'
      }
    }
  }

  t.false(Utils.propertiesRestricted('', ['name'])) // => false
  t.false(Utils.propertiesRestricted(user, ['name'])) // => false
  t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address'])) // => true
  t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2', 'address.metadata.houseColor'])) // => true
  t.false(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.metadata', 'address.papanata'], { strict: true })) // => true
  t.true(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.metadata'], { strict: true })) // => true
  t.false(Utils.propertiesRestricted(user, ['name', 'email', 'address.city', 'address.zip', 'address.line1', 'address.line2'], { strict: true })) // => false
})

test(`Validates and sanitizes schemas`, t => {
  const PostValidator = new Schema({
    title: {
      type: String,
      required: [true, 'A post requires a title']
    },
    body: String,
    published: {
      type: Date,
      default: Date.now
    }
  })

  const error = t.throws(() => PostValidator.parse({
    title: 'Beware while selling your stuffs online',
    body: 'Do never share your phone number',
    category: 'shopping'
  })) // since there is no `category` field in the schema

  t.is(error.message, `Data is not valid`)

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
    name: String,
    email: {
      type: String,
      regex: /^[a-z0-9_.]+@[a-z-0-9.]+\.[a-z]{2,}$/
    },
    birthday: {
      type: Date,
      required: false
    },
    address: {
      city: String,
      zip: Number,
      line1: String,
      line2: {
        type: String,
        required: false
      }
    }
  })

  const err = t.throws(() => UserValidator.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com',
  }))

  t.is(err.message, 'Data is not valid')
  t.is(err.errors.length, 3)
  t.is(err.errors[0].message, 'Property address.city is required')
  t.is(err.errors[1].message, 'Property address.zip is required')
  t.is(err.errors[2].message, 'Property address.line1 is required')

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
    name: {
      type: String,
      required: false
    },
    email: {
      type: 'Email',
      onlyGmail: true
    },
  })

  let error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }))

  t.is(error.message, `Data is not valid`)
  t.is(error.errors[0].message, `Don't know how to resolve Email in property email`)

  // Registers a new custom type
  Transformers.Email = {
    loaders: [String], // pre-processes the value using this known-registered types
    parse (v) {
      t.true(this instanceof Schema)
      if (!/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/.test(v)) {
        return this.throwError(`Invalid e-mail address { value } for field { field.name }`, { value: v })
      }
      if (this.settings.onlyGmail && !/@gmail\.com$/.test(v)) {
        return this.throwError(`Only gmail accounts`)
      }
      return v
    }
  }

  error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 123
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid string')

  error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 'martin'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid e-mail address martin for field email')

  error = t.throws(() => customType.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Only gmail accounts')

  t.notThrows(() => customType.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com'
  }))
})
