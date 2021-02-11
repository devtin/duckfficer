import test from 'ava'
import { Schema, Utils, Transformers, ValidationError } from '../'

test('Validates the schema of the payload matches the defined schema', async t => {
  const address = new Schema({
    line1: String,
    zip: Number
  })

  const user = new Schema({
    name: String,
    address
  })

  const err = await t.throwsAsync(() => user.parse({
    name: 'Martin',
    address: {
      line2: 'unit #1111'
    }
  }))

  t.is(err.message, 'Invalid object schema')
  t.is(err.errors.length, 1)
  t.is(err.errors[0].message, 'Unknown property address.line2')
})

/**
 * Checks the integrity of an object by ensuring it contains only the expected properties and that
 * these properties are of the expected type. To do so, we need to create a schema:
 */

test('Validates the provided types against the defined schema', async t => {
  const UserSchema = new Schema({
    name: String,
    birthday: Date,
    description: Array
  })

  const Martin = await UserSchema.parse({
    name: 'Martin Rafael',
    birthday: new Date('11/11/1999'),
    description: ['monkey', 'developer', 'arepa lover']
  })

  t.is(Martin.name, 'Martin Rafael')
  t.is(Martin.birthday.getFullYear(), 1999)
  t.is(Martin.description.length, 3)

  const error = await t.throwsAsync(() => UserSchema.parse({
    name: 123,
    birthday: 'Don\'t know...',
    description: 'I like bananas'
  }))

  t.true(error instanceof ValidationError)
  t.is(error.message, 'Data is not valid')
  t.is(error.errors.length, 3)
  t.is(error.errors[0].message, 'Invalid string')
  t.is(error.errors[0].field.fullPath, 'name')
  t.is(error.errors[1].message, 'Invalid date')
  t.is(error.errors[1].field.fullPath, 'birthday')
  t.is(error.errors[2].message, 'Invalid array')
  t.is(error.errors[2].field.fullPath, 'description')
})

test('Default value helper', async t => {
  const quantityValidator = new Schema({
    name: 'quantity',
    type: Number,
    default: 1
  })

  t.is(await quantityValidator.parse(), 1)
})

test('Default value helper (function)', async t => {
  const quantityValidator = new Schema({
    name: 'date',
    type: Date,
    default: Date.now
  })

  t.true(await quantityValidator.parse() instanceof Date)

  /**
   * You can also access the state passed via the `parse` method through the default function
   */

  const user = new Schema({
    username: String,
    level: {
      type: String,
      default ({ state }) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(state?.user?.level || 'user'), 10)
        })
      }
    }
  })

  t.is((await user.parse({
    username: 'devtin'
  })).level, 'user')

  t.is((await user.parse({
    username: 'devtin'
  }, {
    state: {
      user: {
        level: 'admin'
      }
    }
  })).level, 'admin')
})

/**
 * Each transformer provides its own custom message
 */

test('Custom error messages with optional rendering', async t => {
  const Title = new Schema({
    name: 'title',
    type: String,
    required: [true, 'A post requires a title']
  })

  let error = await t.throwsAsync(() => Title.parse())
  t.is(error.message, 'A post requires a title')

  const Email = new Schema({
    name: 'title',
    type: String,
    regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, '{ value } is not a valid e-mail address']
  })

  error = await t.throwsAsync(() => Email.parse('martin'))
  t.is(error.message, 'martin is not a valid e-mail address')
})

/**
 * `autoCasting` is a cool feature to have since it prevents you from doing extra casting.
 */

test('autoCasting', async t => {
  const DOB = new Schema({
    name: 'title',
    type: Date
  })

  t.true(await DOB.parse('11/11/1999') instanceof Date)

  const qtty = new Schema({
    name: 'quantity',
    type: Number,
    autoCast: true
  })

  // Auto-casting is nice
  t.true(Number.isInteger(await qtty.parse('20')))

  // Though sometimes may be required for proper validation
  // as mentioned [here](https://github.com/devtin/duckfficer/issues/6)

  const BooleanSchema = new Schema({
    type: Boolean,
    autoCast: false
  })

  let error = await t.throwsAsync(() => BooleanSchema.parse(5))
  t.is(error.message, 'Invalid boolean') // => Invalid boolean

  const DateSchema = new Schema({
    type: Date,
    autoCast: false
  })

  await t.notThrowsAsync(() => DateSchema.parse(new Date('11/11/1999 23:11 GMT-0400')))

  error = await t.throwsAsync(() => DateSchema.parse('11/11/1999'))
  t.is(error.message, 'Invalid date')
})

test('Validates an object schema in terms of contained properties', t => {
  const user = {
    name: 'Martin Rafael',
    email: 'tin@devtin.io',
    address: {
      city: 'Miami, Fl',
      zip: 305,
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

test('Validates and sanitizes schemas', async t => {
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

  const error = await t.throwsAsync(() => PostValidator.parse({
    title: 'Beware while selling your stuffs online',
    body: 'Do never share your phone number',
    category: 'shopping'
  })) // since there is no `category` field in the schema

  t.is(error.message, 'Invalid object schema')

  let post
  await t.notThrowsAsync(async () => {
    post = await PostValidator.parse({
      title: 'Beware while selling your stuffs online',
      body: 'Do never share your phone number'
    })
  })

  t.truthy(post)
  t.true(typeof post === 'object')
  t.true(Object.hasOwnProperty.call(post, 'title'))
  t.true(Object.hasOwnProperty.call(post, 'body'))
  t.true(Object.hasOwnProperty.call(post, 'published'))
  t.true(typeof post.title === 'string')
  t.true(typeof post.body === 'string')
  t.true(post.published instanceof Date)
})

test('Validates full nested schemas', async t => {
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

  const err = await t.throwsAsync(() => UserValidator.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com'
  }))

  t.is(err.message, 'Data is not valid')
  t.is(err.errors.length, 3)
  t.is(err.errors[0].message, 'Property address.city is required')
  t.is(err.errors[1].message, 'Property address.zip is required')
  t.is(err.errors[2].message, 'Property address.line1 is required')

  await t.notThrowsAsync(() => UserValidator.parse({
    name: 'Martin',
    email: 'marting.dc@gmail.com',
    birthday: '11/11/1999',
    address: {
      city: 'Miami',
      zip: 305,
      line1: '2451 Brickell Ave'
    }
  }))
})

test('Handles custom data-types', async t => {
  const customType = new Schema({
    name: {
      type: String,
      required: false
    },
    email: {
      type: 'Email',
      onlyGmail: true
    }
  })

  let error = await t.throwsAsync(() => customType.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Don\'t know how to resolve Email in property email')

  // Registers a new custom type
  Transformers.Email = {
    loaders: [String], // pre-processes the value using this known-registered types
    parse (v) {
      t.true(this instanceof Schema)
      if (!/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/.test(v)) {
        return this.throwError('Invalid e-mail address { value } for field { field.name }', { value: v })
      }
      if (this.settings.onlyGmail && !/@gmail\.com$/.test(v)) {
        return this.throwError('Only gmail accounts')
      }
      return v
    }
  }

  error = await t.throwsAsync(() => customType.parse({
    name: 'Martin',
    email: 123
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid string')

  error = await t.throwsAsync(() => customType.parse({
    name: 'Martin',
    email: 'martin'
  }))

  t.is(error.message, 'Data is not valid')
  t.is(error.errors[0].message, 'Invalid e-mail address martin for field email')

  error = await t.throwsAsync(() => customType.parse({
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

test('Checks whether contains a field or not', t => {
  const SampleSchema = new Schema({
    anObj: {
      withSomeProp: Boolean
    },
    someProp: Boolean
  })

  t.true(SampleSchema.hasField('anObj.unExistentProp'))
  t.true(SampleSchema.hasField('anObj'))
  t.false(SampleSchema.hasField('anObj.unExistentProp', true))
})

test('parseProperty', async t => {
  const user = new Schema({
    type: 'String'
  })
  t.is(await user.parseProperty('String', 'Hello'), 'Hello')
})

test('error throwing deep path report', async t => {
  const myStringArray = new Schema({
    type: Array,
    arraySchema: String
  })

  const error = await t.throwsAsync(() => myStringArray.parse([1]), {
    message: 'Invalid string'
  })

  t.is(error.field.name, 0)
})

test('runChildren', async t => {
  t.deepEqual(await new Schema({
    type: 'String'
  }).runChildren('Hello'), {})

  t.deepEqual(await new Schema({
    type: 'String'
  }).runChildren('Hello', { method: 'unknown' }), {})
})

test('multiple types with only one item', async t => {
  const singleSchema = new Schema([String])
  t.is(await singleSchema.parse('Martin'), 'Martin')
})

test('performs fullCast of a schema with nested schemas', async t => {
  const address = new Schema({
    street: String,
    zip: {
      type: Number,
      required: false
    }
  }, {
    cast (v) {
      if (typeof v === 'string') {
        return {
          street: v
        }
      }
      return v
    }
  })
  const user = new Schema({
    name: String,
    address
  })
  t.deepEqual(await user.fullCast({
    name: 'Martin',
    address: 'Brickell ave'
  }, {}), {
    name: 'Martin',
    address: {
      street: 'Brickell ave'
    }
  })
})
