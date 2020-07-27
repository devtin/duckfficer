<p align="center"><img align="center" width="480" src="https://repository-images.githubusercontent.com/228456718/f4767e00-61e6-11ea-964a-7b02d8dcb48f"/></p>

<div align="center"><h1 align="center">@devtin/schema-validator</h1></div>

<p align="center">
<a href="https://www.npmjs.com/package/@devtin/schema-validator" target="_blank"><img src="https://img.shields.io/npm/v/@devtin/schema-validator.svg" alt="Version"></a>
<a href="https://htmlpreview.github.io/?https://github.com/devtin/schema-validator/blob/master/coverage/lcov-report/index.html"><img src="https://img.shields.io/badge/coverage-100%25-green" alt="Coverage 100%"></a>
<a href="/test/features"><img src="https://github.com/devtin/schema-validator/workflows/test/badge.svg"></a>
<a href="https://gitter.im/schema-validator/community"><img src="https://badges.gitter.im/schema-validator/community.svg"></a>
<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>

<p align="center">
Zero-dependencies, light-weight library (~3.9KB minified + gzipped)<br>
for validating & sanitizing JavaScript data schemas.
</p>

## Installation

```sh
$ npm i @devtin/schema-validator
# or
$ yarn add @devtin/schema-validator
```

## At-a-glance

```js
const { Schema } = require('@devtin/schema-validator')

// defining the schema
const User = new Schema({
  name: String,
  email: {
    type: String,
    regex: [/[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}/, `'{ value }' is not a valid e-mail address`]
  },
  created: {
    type: Date,
    default: Date.now
  }
})

const Martin = User.parse({
  name: 'Martin Rafael',
  email: 'tin@devtin.io'
})

console.log(Martin.name) // => Martin Rafael
console.log(Martin.email) // => tin@devtin.io
console.log(Martin.created instanceof Date) // => true

try {
  User.parse({
    name: 'Sandy Papo',
    email: '@huelepega'
  })
} catch (err) {
  console.log(err instanceof Error) // => true
  console.log(err.message) // => Data is not valid
  console.log(err.errors.length) // => 1
  console.log(err.errors[0] instanceof Error) // => true
  console.log(err.errors[0].message) // => '@huelepega' is not a valid e-mail address
  console.log(err.errors[0].field.fullPath) // => email
}

```

Have a look at this <a href="https://codepen.io/tin_r/pen/PoqwLMb?editors=0011" target="_blank">codepen playground</a>.

## About

Tired of performing duck-type validation while sharing data-schema across different endpoints of my beloved
JavaScript ecosystem, I took some inspiration from the [mongoose](https://mongoosejs.com)'s validation syntax and created
this light-weight library (~3.9KB minified + gzipped) for validating & sanitizing JavaScript data schemas.

## Content

- **Schema**
  - [Creating a schema](#creating-a-schema)
  - [Validating and sanitizing arbitrary objects](#validating-and-sanitizing-arbitrary-objects)
  - [Error-handling and LifeCycle](#error-handling-and-life-cycle)
  - [Required and optional values](#required-and-optional-values)
  - [Default values](#default-values)
  - [Null values](#null-values)
  - [Nesting schemas](#nesting-schemas)
  - [Multiple types](#multiple-types)
  - [Auto-casting](#auto-casting)
  - [Virtuals (getters / setters)](#virtuals-getters-setters)
  - [Loaders](#loaders)
  - [Overriding initial settings](#overriding-initial-settings)
- **Validation**
  - [Built-in validation (provided by types or transformers)](#built-in-validation-provided-by-types-or-transformers)
  - [Custom property validation hook (provided at schema-setting level)](#custom-property-validation-hook-provided-at-schema-setting-level)
  - [Custom value validation hook (provided at schema level)](#custom-value-validation-hook-provided-at-schema-level)
- **Casting (sanitation)**
  - [Built-in cast (provided by types or transformers)](#built-in-cast-provided-by-types-or-transformers)
  - [Custom property-cast hook (provided at schema-setting level)](#custom-property-cast-hook-provided-at-schema-setting-level)
  - [Custom value cast hook (provided at schema level)](#custom-value-cast-hook-provided-at-schema-level)
- **Types (transformers)**
  - [Array](#array)
  - [BigInt](#big-int)
  - [Boolean](#boolean)
  - [Date](#date)
  - [Function](#function)
  - [Map](#map)
  - [Number](#number)
  - [Object](#object)
  - [Promise](#promise)
  - [Set](#set)
  - [String](#string)
  - [Custom](#custom)
- [API](/DOCS.md)
- [License](#license) (MIT)


<a name="creating-a-schema"></a>

<h2>Creating a schema</h2>



In order to check the data integrity of an object, a schema defining the expected structure of the desired object
needs to be created.

```js
const UserSchema = new Schema({
  // advanced type definition
  name: {
    // defining the type
    type: String,
    // we could add additional settings here
  },
  // short-hand type definition
  birthday: Date, // => { type: Date }
  description: Array
})
```

The instance of the created schema has a method called `parse`. We use this method in order to perform structure
validation, casting and type-validation of arbitrary objects. The method `parse` receives as the first
argument an arbitrary object that will be casted and validated against the defined schema. The parse function will
return a newly created schema-compliant object.

See the [Schema](/DOCS.md#Schema) class docs for more information.

```js
t.true(typeof UserSchema.parse === 'function')

const arbitraryObject = {
  name: `Martin Rafael`,
  birthday: new Date('11/11/1999'),
  description: ['monkey', 'developer', 'arepa lover']
}

let safeObject
t.notThrows(() => {
  safeObject = UserSchema.parse(arbitraryObject)
})

t.truthy(safeObject)
t.deepEqual(safeObject, arbitraryObject)
t.true(safeObject !== arbitraryObject)
```

Returned object-properties can now be safely accessed since the object was validated to be schema-compliant.

```js
t.truthy(safeObject)
t.is(safeObject.name, `Martin Rafael`)
t.true(safeObject.birthday instanceof Date)
t.is(safeObject.birthday.getFullYear(), 1999)
t.is(safeObject.description.length, 3)
```

<a name="validating-and-sanitizing-arbitrary-objects"></a>

<h2>Validating and sanitizing arbitrary objects</h2>



Using the same `UserSchema` example above:

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  description: Array
})
```

Think of an *arbitrary object* as one coming from an unreliable source, i.e. passed in an http request;
or maybe retrieved by a manual input from a terminal application.

```js
const arbitraryObject = {
  firstName: 'Martin',
  lastName: 'Rafael',
  birthday: `11/11/1999`,
  address: {
    zip: 305
  },
  description: ['monkey', 'developer', 'arepa lover']
}
```

Above's object `arbitraryObject` contains properties that do not exist in the schema: `firstName`,
`middleName` and `lastName`, are not defined in the schema.

Following validation will result in an error since the arbitrary object does not match the schema: it contains
these 3 unknown properties. The schema validator will first perform a structure validation making sure the payload
structure matches the provided schema structure, prior performing any type validation / further logic.

Even when the property `name` (expected by the defined schema) is also missing, it won't be reported since the
payload's schema structure doest not match the provided one.

```js
let error = t.throws(() => UserSchema.parse(arbitraryObject))

t.true(error instanceof ValidationError)
t.true(error instanceof Error)
t.is(error.message, `Invalid object schema`)
t.is(error.errors.length, 3)
t.is(error.errors[0].message, `Unknown property firstName`)
t.is(error.errors[1].message, `Unknown property lastName`)
t.is(error.errors[2].message, `Unknown property address.zip`)
```

When the payload's structure matches the schema (all of the payload properties are defined in the schema) it will
then proceed with further validations...

```js
error = t.throws(() => UserSchema.parse({
  birthday: `11/11/1999`,
  description: ['monkey', 'developer', 'arepa lover']
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors.length, 1)
t.is(error.errors[0].message, `Property name is required`)
```

A custom `state` can be passed to extend the validation process.

```js
const AnotherUserSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: false
  },
  level: {
    type: String,
    validate (v, { state }) {
      if (v === 'admin' && !state?.user) {
        this.throwError(`Only authenticated users can set the level to admin`)
      }
    }
  }
}, {
  validate (v, { state }) {
    if (state.user.level !== 'root' && v.level === 'admin' && !v.email) {
      this.throwError(`Admin users require an email`)
    }
  }
})

error = t.throws(() => AnotherUserSchema.parse({
  name: `Martin Rafael`,
  level: 'admin'
}))
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Only authenticated users can set the level to admin')
t.is(error.errors[0].field.fullPath, 'level')

error = t.throws(() => AnotherUserSchema.parse({
  name: `Martin Rafael`,
  level: 'admin'
}, {
  state: {
    user: {
      name: 'system',
      level: 'admin'
    }
  }
}))

t.is(error.message, 'Admin users require an email')

t.notThrows(() => {
  return AnotherUserSchema.parse({
    name: `Martin Rafael`,
    level: 'admin'
  }, {
    state: {
      user: {
        name: 'system',
        level: 'root'
      }
    }
  })
})
```

<a name="error-handling-and-life-cycle"></a>

<h2>Error-handling and LifeCycle</h2>



Below we are gonna dive into the schema-validation life-cycle for a better understanding of the tool.

```js
const lifeCycle = []

let arbitraryObject
let passedState = { someStateProp: true }
let error

const hook = ({ levelName, hookName }) => {
  return function (value, { state }) {
    t.is(state, passedState)

    let label = `${ levelName }-level`

    if (this.fullPath) {
      label = `->${ this.fullPath }(${ label })`
    }

    lifeCycle.push(`${ label } ${ hookName } hook`)
    return value
  }
}

const cast = hook({ levelName: 'property', hookName: 'cast' })
const validate = hook({ levelName: 'property', hookName: 'validate' })
```

The schema below will trace most of the library's flow life-cycle.

```js
const UserSchema = new Schema({
  name: {
    type: String,
    // property-level cast hook (optional)
    cast,
    // property-level validation hook (optional)
    validate
  },
  birthday: {
    type: 'Birthday',
    cast,
    validate
  },
  phoneNumber: {
    type: Number,
    cast,
    validate
  }
}, {
  // schema-level cast hook (optional)
  cast: hook({ levelName: 'schema', hookName: 'cast' }),
  // schema-level validate hook (optional)
  validate: hook({ levelName: 'schema', hookName: 'validate' })
})

arbitraryObject = {
  somePropertyNotDefinedInTheSchema: ':)',
  birthday: '11/11/1999',
  phoneNumber: '123'
}

error = t.throws(() => UserSchema.parse(arbitraryObject, { state: passedState }))

t.is(error.message, `Invalid object schema`)
t.is(error.errors.length, 1)
t.is(error.errors[0].message, 'Unknown property somePropertyNotDefinedInTheSchema')
```

Throws an error when the given `arbitraryObject` structure does not comply with the given schema structure.

```js
t.is(error.errors[0].message, `Unknown property somePropertyNotDefinedInTheSchema`)
t.is(error.errors[0].field, undefined) // the field does not exists in our schema

lifeCycle.length = 0
```

Throws an error when missing required values.

```js
error = t.throws(() => UserSchema.parse({
  // name: 'Martin',
  birthday: '11/11/1999',
  phoneNumber: '123'
}, { state: passedState }))

t.is(error.errors[0].message, `Property name is required`)
t.is(error.errors[0].field.fullPath, 'name')
```

Throws an error if defined type is not registered.

```js
t.is(error.errors[1].message, `Don't know how to resolve Birthday in property birthday`)
t.is(error.errors[1].field.fullPath, `birthday`)
```

Also throws an error when types don't match.

```js
t.is(error.errors[2].message, `Invalid number`)
t.is(error.errors[2].field.fullPath, `phoneNumber`)

t.deepEqual(lifeCycle, [
  'schema-level cast hook',
  '->phoneNumber(property-level) cast hook'
])
```

Let's register a transformer named Birthday and try again with valid data!

```js
Transformers.Birthday = {
  settings: {
    autoCast: true
  },
  loaders: [{ type: Date, autoCast: true }],
  // will trace all of the type-level hooks!
  cast: hook({ levelName: 'type', hookName: 'cast' }),
  validate: hook({ levelName: 'type', hookName: 'validate' }),
  parse: hook({ levelName: 'type', hookName: 'parse' })
}

arbitraryObject = {
  name: 'Martin',
  birthday: '11/11/1999',
  phoneNumber: 123
}

// resetting lifecycle trace
lifeCycle.length = 0

t.notThrows(() => UserSchema.parse(arbitraryObject, { state: passedState }))
```

Below we can clearly see the life-cycle of the validation process.

```js
t.deepEqual(lifeCycle, [
  'schema-level cast hook',
  '->name(property-level) cast hook',
  '->name(property-level) validate hook',
  '->birthday(property-level) cast hook',
  '->birthday(type-level) cast hook',
  '->birthday(type-level) validate hook',
  '->birthday(property-level) validate hook',
  '->birthday(type-level) parse hook',
  '->phoneNumber(property-level) cast hook',
  '->phoneNumber(property-level) validate hook',
  'schema-level validate hook'
])
```

<a name="required-and-optional-values"></a>

<h2>Required and optional values</h2>



All properties in a Schema are required by default.

```js
const ProductSchema = new Schema({
  name: String,
  stock: Number,
  category: Array
})
```

Whenever a required property is missing, an error is thrown.

```js
let error = t.throws(() => ProductSchema.parse({
  name: 'Kombucha',
  stock: 11
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 1)
t.is(error.errors[0].message, `Property category is required`)
```

In order to make a property optional we must pass the flag `required` set to `false`

```js
const ContactSchema = new Schema({
  name: String,
  email: String,
  age: {
    type: Number,
    required: false // property `age` is optional
  }
})
```

Arbitrary objects can now be validated missing the property `age` as long as they match the rest of the schema.

```js
let contact
t.notThrows(() => {
  contact = ContactSchema.parse({
    name: 'Martin',
    email: 'tin@devtin.io'
  })
})

t.notThrows(() => {
  contact = ContactSchema.parse({
    name: 'Martin',
    email: 'tin@devtin.io',
    age: undefined
  })
})
```

Whenever `age` is present, the validation will ensure it is a `Number`, though.

```js
let contact2
error = t.throws(() => {
  contact2 = ContactSchema.parse({
    name: 'Papo',
    email: 'sandy@papo.com',
    age: `I don't know.`
  })
})

t.is(error.message, `Data is not valid`)
t.is(error.errors.length, 1)
t.is(error.errors[0].message, `Invalid number`)
t.is(error.errors[0].field.fullPath, `age`)

t.notThrows(() => {
  contact2 = ContactSchema.parse({
    name: 'Papo',
    email: 'sandy@papo.com',
    age: 36
  })
})

t.deepEqual(contact2, {
  name: 'Papo',
  email: 'sandy@papo.com',
  age: 36
})
```

<a name="default-values"></a>

<h2>Default values</h2>



Default values are meant to be used whenever an arbitrary object misses the value of the property in subject.

```js
const ContactSchema = new Schema({
  name: String,
  country: {
    type: String,
    default: 'United States'
  }
})
```

When a property is assigned with a `default` value, it is implicitly treated as an optional property (`required`
equaled to `false`). See [Required and optional values](#required-and-optional-values) for more information.

```js
const error = t.throws(() => new Schema({
  name: String,
  state: {
    type: String,
    required: true,
    default: 'Florida'
  }
}))

t.is(error.message, 'Remove either the \'required\' or the \'default\' option for property state.')

let sanitized
t.notThrows(() => {
  sanitized = ContactSchema.parse({
    name: 'Martin'
  })
})

t.deepEqual(sanitized, {
  name: 'Martin',
  country: 'United States'
})
```

A default value could also be a function. Refer to the [SchemaSettings](/DOCS.md#schemaschemasettings--object) docs
for more information. The function will receive a object with optionally the state passed during parse.

```js
const UserSchema = new Schema({
  name: String,
  registered: {
    type: Date,
    default: Date.now
  }
})

let Martin
t.notThrows(() => {
  Martin = UserSchema.parse({
    name: 'Martin'
  })
})

t.deepEqual(Object.keys(Martin), ['name', 'registered'])
t.true(Martin.registered instanceof Date)
```

Another useful way of passing default values is on the schema level using the option `defaultValues`.

```js
const defaultValues = {
  address: {
    state: 'Florida',
    zip: 33129
  },
  subscribe: true
}
const SomeSchema = new Schema({
  name: String,
  address: {
    state: String,
    zip: Number,
    street: String
  },
  phoneNumber: Number,
  subscribe: Boolean
}, { defaultValues })

const parsed = SomeSchema.parse({
  name: 'Martin',
  address: {
    street: 'Brickell ave'
  },
  phoneNumber: 3051234567
})

t.is(parsed.address.state, 'Florida')
t.is(parsed.address.zip, 33129)
t.is(parsed.subscribe, true)
```

<a name="null-values"></a>

<h2>Null values</h2>



Sometimes it is useful to allow a property to accept null values no matter what type it has.
Property-setting `allowNull` allows you to do so.

```js
const RegularSchema = new Schema({
  type: String
})
const error = t.throws(() => RegularSchema.parse(null))
t.is(error.message, 'Invalid string')

const NullSchema = new Schema({
  type: String,
  // allowing null values!
  allowNull: true
})
t.is(NullSchema.parse(null), null)
```

<a name="nesting-schemas"></a>

<h2>Nesting schemas</h2>



We can use a previously defined schema in order to extend the validation of other schemas.

```js
const AddressSchema = new Schema({
  line1: String,
  line2: {
    type: String,
    required: false,
  },
  zip: {
    type: Number,
    required: false
  }
}, {
  name: 'AddressSchema',
  settings: {
    required: false
  }
})

const UserSchema = new Schema({
  name: String,
  birthday: Date,
  // using an already defined schema in another schema's property
  address: AddressSchema
})

const user = UserSchema.parse({
  name: 'Martin',
  birthday: '11/11/1999'
})

t.truthy(user)

const error1 = t.throws(() => UserSchema.parse({
  name: 'Martin',
  birthday: '11/11/1999',
  address: null
}))

t.is(error1.errors[0].message, 'Property address.line1 is required')
t.is(error1.errors[0].field.fullPath, 'address.line1')

const error2 = t.throws(() => UserSchema.parse({
  name: 'Martin',
  birthday: '11/11/1999',
  address: {
    zip: 33129
  }
}))

t.is(error2.errors[0].message, 'Property address.line1 is required')
t.is(error2.errors[0].field.fullPath, 'address.line1')

t.deepEqual(UserSchema.paths, ['name', 'birthday', 'address', 'address.line1', 'address.line2', 'address.zip'])

t.notThrows(() => UserSchema.parse({
  name: 'Martin',
  birthday: '11/11/1999',
  address: {
    line1: 'Brickell Ave',
    zip: 33129
  }
}))
```

<a name="multiple-types"></a>

<h2>Multiple types</h2>

```js
let error
const FnSchema = new Schema([Function, Promise])

t.notThrows(() => FnSchema.parse(() => {}))
t.notThrows(() => FnSchema.parse(new Promise(resolve => resolve(`this`))))

error = t.throws(() => FnSchema.parse(`some pic` ))
t.is(error.message, `Could not resolve given value type. Allowed types are Function and Promise`)

const UserSchema = new Schema({
  name: String,
  age: [String, Number]
})

const martin = UserSchema.parse({
  name: 'Martin',
  age: '12'
})

t.is(martin.age, '12')

const olivia = UserSchema.parse({
  name: 'Olivia',
  age: 0.9
})

t.is(olivia.age, 0.9)

error = t.throws(() => UserSchema.parse({
  name: 'Ana',
  age: new Date('6/18/2020')
}))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Could not resolve given value type in property age. Allowed types are String and Number`)
```

<a name="auto-casting"></a>

<h2>Auto-casting</h2>



Most transformers provide an option for auto-casting. When property-setting `autoCast` equals `true`
(depending on the transformer) it may try to resolve given arbitrary value into the expected one.

For example, the [Date](#date) transformer will try to cast values given as `String`'s into a proper `Date`, if possible.
The [Number](#number) transformer as well: will try to resolve those `String`'s that look like a number and convert them into
a proper `Number`.

```js
const UserSchema = new Schema({
  name: String,
  birthday: Date,
  kids: {
    type: Number,
    autoCast: true
  }
})

let Olivia

t.notThrows(() => {
  Olivia = UserSchema.parse({
    name: 'Olivia',
    birthday: '8/31/2019',
    kids: '0'
  })
})

t.true(Olivia.birthday instanceof Date)
t.is(typeof Olivia.kids, 'number')
```

**Turning off auto-casting**

Now, when a strict validation is required, this feature can be turned off.

```js
const StrictUserSchema = new Schema({
  name: String,
  birthday: {
    type: Date,
    autoCast: false
  },
  kids: {
    type: Number,
    autoCast: false
  }
})

const error = t.throws(() => StrictUserSchema.parse({
  name: 'Martin',
  birthday: '11/11/1999',
  kids: '1'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 2)
t.is(error.errors[0].message, `Invalid date`)
t.is(error.errors[0].field.fullPath, `birthday`)
t.is(error.errors[1].message, `Invalid number`)
t.is(error.errors[1].field.fullPath, `kids`)
```

<a name="virtuals-getters-setters"></a>

<h2>Virtuals (getters / setters)</h2>

```js
const User = new Schema({
  firstName: String,
  lastName: String,
  get fullName () {
    return this.firstName + ' ' + this.lastName
  },
  set fullName (v) {
    const [firstName, lastName] = v.split(/\s+/)
    this.firstName = firstName
    this.lastName = lastName
  },
  address: {
    line1: String,
    line2: String,
    zip: Number,
    get fullAddress () {
      return  `${this.line1} / ${this.line2} / ${this.zip}`
    }
  }
})

const me = User.parse({
  firstName: 'Martin',
  lastName: 'Rafael',
  address: {
    line1: 'Brickell',
    line2: 'Ave',
    zip: 33129
  }
})

t.is(me.fullName, 'Martin Rafael')
t.is(me.address.fullAddress, 'Brickell / Ave / 33129')

me.fullName = 'Pedro Perez'

t.is(me.firstName, 'Pedro')
t.is(me.lastName, 'Perez')
```

<a name="loaders"></a>

<h2>Loaders</h2>



Loaders can be seen as a way of piping transformers.

```js
const User = new Schema({
  id: {
    type: String,
    loaders: [Number],
    cast (aNumber) {
      return `#${ aNumber }`
    }
  },
  name: String
})

const error = t.throws(() => User.parse({
  id: '123',
  name: 'Kombucha'
}))
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')

let product
t.notThrows(() => {
  product = User.parse({
    id: 123,
    name: 'Kombucha'
  })
})
t.truthy(product)
t.is(product.id, '#123')
```

<a name="overriding-initial-settings"></a>

<h2>Overriding initial settings</h2>

```js
const SomeSchema = new Schema({
  name: String
})

const error1 = t.throws(() => SomeSchema.parse(undefined))
t.is(error1.message, `Data is not valid`)
t.is(error1.errors[0].message, `Property name is required`)
```

We can override the initial settings of our schema

```js
const SomeOptionalSchema = new Schema({
    name: String
  },
  {
    settings: {
      required: false
    }
  })

t.notThrows(() => SomeOptionalSchema.parse(undefined))
const error2 = t.throws(() => SomeOptionalSchema.parse({}))
t.is(error2.message, `Data is not valid`)
t.is(error2.errors[0].message, `Property name is required`)
```

<a name="built-in-validation-provided-by-types-or-transformers"></a>

<h2>Built-in validation (provided by types or transformers)</h2>



A wide variety of type-validators are provided built-in many of them with extra-helpers to enhance the validation
logic. Refer to the [Types](#types) section below for available type validators and helpers.

```js
t.deepEqual(Object.keys(Transformers), [
  'Array',
  'BigInt',
  'Boolean',
  'Date',
  'Function',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Set',
  'String'
])
```

<a name="custom-property-validation-hook-provided-at-schema-setting-level"></a>

<h2>Custom property validation hook (provided at schema-setting level)</h2>



The [validate](/DOCS.md#Caster) hook can be use within a [SchemaSetting](/DOCS.md#Schema..SchemaSettings) to provide
extra validation logic.

```js
const ProductSchema = new Schema({
  id: Number,
  created: {
    type: Date,
    validate (date, { state }) {
      t.is(state, givenState)
      if (Date.parse(date) < Date.parse('2019/1/1')) {
        this.throwError(`Orders prior 2019 have been archived`)
      }
    }
  },
  name: String
})

const givenState = { someState: true }

t.notThrows(() => ProductSchema.parse({
  id: 123,
  created: '2020/2/1',
  name: 'Kombucha'
}, { state: givenState }))

const error = t.throws(() => ProductSchema.parse({
  id: 123,
  created: '2018/12/1',
  name: 'Kombucha'
}, { state: givenState }))
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Orders prior 2019 have been archived')
t.is(error.errors[0].field.fullPath, 'created')
```

<a name="custom-value-validation-hook-provided-at-schema-level"></a>

<h2>Custom value validation hook (provided at schema level)</h2>

```js
const ProductSchema = new Schema({
    id: Number,
    name: String,
    price: Number
  },
  {
    validate (v, { state }) {
      t.is(state, givenState)
      if (v.id < 200) {
        this.throwError(`Product deprecated`)
      }
    }
  })

const givenState = { someState: true }

const error = t.throws(() => ProductSchema.parse({
  id: 123,
  name: 'Kombucha Green',
  price: 3
}, {
  state: givenState
}))

t.is(error.message, `Product deprecated`)
```

<a name="built-in-cast-provided-by-types-or-transformers"></a>

<h2>Built-in cast (provided by types or transformers)</h2>



Many transformers provide a casting logic available when setting `autoCast` equaled to `true`.

```js
t.deepEqual(Object.keys(Transformers).filter(transformerName => {
  return typeof Transformers[transformerName].cast === 'function' && Transformers[transformerName].settings.hasOwnProperty('autoCast')
}), [
  'BigInt',
  'Boolean',
  'Date',
  'Map',
  'Number',
  'Promise',
  'Set',
  'String'
])
```

<a name="custom-property-cast-hook-provided-at-schema-setting-level"></a>

<h2>Custom property-cast hook (provided at schema-setting level)</h2>



The [cast](/DOCS.md#Caster) hook can be use within a [SchemaSetting](/DOCS.md#Schema..SchemaSettings) to provide
extra casting logic.

```js
const ProductSchema = new Schema({
  id: {
    type: Number,
    cast (v, { state }) {
      t.is(state, givenState)
      if (typeof v === 'string' && /^#/.test(v)) {
        return parseInt(v.replace(/^#/, ''))
      }
    }
  },
  name: String
})

const givenState = { someState: true }

const error = t.throws(() => {
  return ProductSchema.parse({
    id: '123',
    name: 'Kombucha'
  }, {
    state: givenState
  })
})
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')

let product
t.notThrows(() => {
  product = ProductSchema.parse({
    id: '#123',
    name: 'Kombucha'
  }, {
    state: givenState
  })
})
t.is(product.id, 123)
```

<a name="custom-value-cast-hook-provided-at-schema-level"></a>

<h2>Custom value cast hook (provided at schema level)</h2>



We can cast (transform) whatever value passed to the parse method prior proceeding with any further logic by using
the schema-level cast hook.

```js
const ProductSchema = new Schema({
    id: Number,
    name: String,
    price: Number
  },
  {
    // schema-level cast hook
    cast (v, { state }) {
      t.is(state, givenState)
      /*
      const month = new Date().getMonth() + 1
      */
      if (/avocado/i.test(v.name)/* && !(month >= 5 && month <= 8)*/) {
        v.price += 2 // 2$ extra avocado out of season
      }

      return v
    }
  })

const givenState = { someState: true }
let product
t.notThrows(() => {
  product = ProductSchema.parse({
    id: 321,
    name: 'Hass Avocados',
    price: 3.99
  }, {
    state: givenState
  })
})

t.truthy(product)
t.is(product.price, 5.99)
```

## Types

<a name="array"></a>

<h2>Array</h2>



Initializes `Array` types

```js
const ProductType = new Schema({
  name: String,
  category: Array
})

const product = ProductType.parse({
  name: 'Kombucha',
  category: ['Beverages', 'Tea', 'Health']
})

t.true(Array.isArray(product.category))
t.is(product.category.length, 3)
t.is(product.category[1], 'Tea')
```

Given an invalid `Array` it will throw a `ValidationError`

```js
const error = t.throws(() => ProductType.parse({
  name: 'Kombucha',
  category: 'none' // < not an array
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid array')
t.is(error.errors[0].field.fullPath, 'category')
```

<a name="array-schema"></a>

<h3>arraySchema</h3>



The Array transformer can initialize the items in the array by passing them through the transformer specified in
the `arraySchema` setting.

```js
const Log = new Schema({
  user: String,
  lastAccess: {
    type: Array,
    arraySchema: {
      type: Date,
      autoCast: true
    }
  }
})

const tinLog = Log.parse({
  user: 'tin',
  lastAccess: ['6/10/2019', 'Sat Jan 11 2020 17:06:31 GMT-0500 (Eastern Standard Time)']
})

t.true(Array.isArray(tinLog.lastAccess))
t.is(tinLog.lastAccess.length, 2)
t.true(tinLog.lastAccess[0] instanceof Date)
t.true(tinLog.lastAccess[1] instanceof Date)

const error = t.throws(() => Log.parse({
  user: 'tin',
  lastAccess: ['11/11/1999', 'What is love?']
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid date')
t.is(error.errors[0].field.fullPath, 'lastAccess.1')
```

You can also use custom schemas

```js
const Email = new Schema({
  type: String,
  regex: [/^[a-z0-9._]+@[a-z0-9-.]+\.[a-z]{2,}$/i, 'Invalid e-mail address { value }']
})

const Contact = new Schema({
  name: String,
  emails: {
    type: Array,
    arraySchema: {
      type: Email
    }
  }
})

const error2 = t.throws(() => Contact.parse({
  name: 'Martin',
  emails: ['tin@devtin.io', 'gmail.com']
}))

t.is(error2.message, 'Data is not valid')
t.is(error2.errors[0].message, 'Invalid e-mail address gmail.com')
t.is(error2.errors[0].field.fullPath, `emails.1`)

t.notThrows(() => Contact.parse({
  name: 'Martin',
  emails: ['tin@devtin.io', 'martin@gmail.com']
}))
```

<a name="big-int"></a>

<h2>BigInt</h2>



Validates `BigInt`s.

```js
const UserSchema = new Schema({
  user: String,
  id: BigInt
})

const error = t.throws(() => UserSchema.parse({
  user: 'tin',
  id: 1
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid bigint')
t.is(error.errors[0].field.fullPath, 'id')

let contact
t.notThrows(() => {
  contact = UserSchema.parse({
    user: 'tin',
    id: 1n
  })
})

t.is(contact.user, 'tin')
t.is(contact.id, 1n)
```

<a name="auto-cast-default-false"></a>

<h3>autoCast (default `false`)</h3>



[BigInt](/DOCS.md#Transformers.BigInt) transformer has a built-in auto-casting function that would convert any numeric
representation of a `String` or a `Number` into a proper `BigInt`. This feature is disabled by default.

```js
const UserSchema = new Schema({
  user: String,
  id: BigInt
})

t.throws(() => UserSchema.parse({
  user: 'tin',
  id: '1'
}))
```

To enable it, just pass the setting `autoCast` equaled to `true`

```js
const UserSchema2 = new Schema({
  user: String,
  id: {
    type: BigInt,
    autoCast: true
  }
})

let contact
t.notThrows(() => {
  contact = UserSchema2.parse({
    user: 'tin',
    id: '1' // < numeric string
  })
})

t.is(contact.user, 'tin')
t.is(contact.id, 1n)

const error = t.throws(() => UserSchema2.parse({
  user: 'tin',
  id: 'some huge integer'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid bigint')
t.is(error.errors[0].field.fullPath, 'id')
```

<a name="boolean"></a>

<h2>Boolean</h2>



Validates `Boolean`s.

```js
const ProductSchema = new Schema({
  name: String,
  active: {
    type: Boolean,
    default: false,
  }
})

const error = t.throws(() => ProductSchema.parse({
  name: 'Kombucha',
  active: 'no'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid boolean')

let product1
t.notThrows(() => {
  product1 = ProductSchema.parse({
    name: 'Kombucha',
    active: true
  })
})

t.truthy(product1)
t.true(product1.active)

let product2
t.notThrows(() => {
  product2 = ProductSchema.parse({
    name: 'tin'
  })
})

t.truthy(product2)
t.false(product2.active)
```

<a name="auto-cast-default-false"></a>

<h3>autoCast (default `false`)</h3>



`Boolean`'s have a built-in auto-casting function that would transform any truthy value into `true`,
falsy values into `false`, when enabled. This setting is `false` by default.

```js
const ProductType = new Schema({
  name: String,
  active: {
    type: Boolean,
    default: false,
    autoCast: true, // has to be enabled
    cast (v) {
      if (typeof v === 'string' && /no/i.test(v)) {
        return false
      }
      return v
    }
  }
})

let product
t.notThrows(() => {
  product = ProductType.parse({
    name: 'Kombucha',
    active: 'sure!'
  })
})

t.true(product.active)

t.false(ProductType.parse({ name: 'kombucha', active: 'no' }).active)
```

<a name="date"></a>

<h2>Date</h2>



Validates `Date`'s

```js
const dateValidator = new Schema({
  name: String,
  birthday: Date
})

let contact
t.notThrows(() => {
  contact = dateValidator.parse({
    name: 'Martin',
    birthday: new Date('11/11/1999')
  })
})

const error = t.throws(() => dateValidator.parse({
  name: 'Martin',
  birthday: `Somewhere in the 80s`
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid date')
```

<a name="auto-cast-default-true"></a>

<h3>autoCast (default `true`)</h3>



Date transformer has a built-in cast function that transforms proper `String`-dates into `Date`'s.

```js
const dateValidator = new Schema({
  name: String,
  birthday: Date
})

let contact
t.notThrows(() => {
  contact = dateValidator.parse({
    name: 'Martin',
    birthday: '11/11/1999' // this is a string originally
  })
})

t.true(contact.birthday instanceof Date)
```

`String`'s that can not be guessed as `Date`'s would result in an error.

```js
const error = t.throws(() => dateValidator.parse({
  name: 'Martin',
  birthday: `Somewhere in the 80s`
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid date')
t.is(error.errors[0].field.fullPath, 'birthday')
```

**Turning off autoCast**

```js
const dateValidator2 = new Schema({
  name: String,
  birthday: {
    type: Date,
    autoCast: false
  }
})
const error2 = t.throws(() => dateValidator2.parse({
  name: 'Martin',
  birthday: '11/11/1999'
}))

t.is(error2.message, 'Data is not valid')
t.is(error2.errors[0].message, 'Invalid date')
t.is(error2.errors[0].field.fullPath, 'birthday')
```

<a name="function"></a>

<h2>Function</h2>

```js
const ProductType = new Schema({
  user: String,
  save: Function
})

let product = ProductType.parse({
  user: 'tin',
  save () {
    return 'yeah!'
  }
})

t.true(typeof product.save === 'function')
t.is(product.save(), 'yeah!')

const error = t.throws(() => ProductType.parse({
  user: 'tin',
  save: false
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors.length, 1)
t.is(error.errors[0].message, 'Invalid function')
```

<a name="map"></a>

<h2>Map</h2>



Validates [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) values

```js
const MapSchema = new Schema({
  type: Map,
  autoCast: false
})

const error = t.throws(() => MapSchema.parse({ hello: true }))
t.is(error.message, 'Invalid map')
```

<a name="auto-cast-default-true"></a>

<h3>autoCast (default `true`)</h3>

```js
const MapSchema = new Schema({
  type: Map
})

const parsed = MapSchema.parse({ hello: true })
t.true(parsed instanceof Map)
t.true(parsed.get('hello'))
t.false(Object.hasOwnProperty.call(parsed, 'hello'))
```

<a name="number"></a>

<h2>Number</h2>



Validates `Number`s.

```js
const ProductType = new Schema({
  user: String,
  age: Number
})

const error = t.throws(() => ProductType.parse({
  user: 'tin',
  age: '36'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')
t.is(error.errors[0].field.fullPath, 'age')

let contact
t.notThrows(() => {
  contact = ProductType.parse({
    user: 'tin',
    age: 36
  })
})

t.is(contact.user, 'tin')
t.is(contact.age, 36)
```

<a name="min-minimum-value"></a>

<h3>min (minimum value)</h3>

```js
const NewNumber = new Schema({
  type: Number,
  min: 0
})

const err = t.throws(() => NewNumber.parse(-0.1))
t.is(err.message, 'minimum accepted value is 0')

t.is(NewNumber.parse(0), 0)
```

<a name="max-maximum-value"></a>

<h3>max (maximum value)</h3>

```js
const NewNumber = new Schema({
  type: Number,
  max: 100
})

const err = t.throws(() => NewNumber.parse(100.1))
t.is(err.message, 'maximum accepted value is 100')
t.is(NewNumber.parse(100), 100)
```

<a name="decimal-places-maximum-number-of-decimal-places"></a>

<h3>decimalPlaces (maximum number of decimal places)</h3>

```js
const NewNumber = new Schema({
  type: Number,
  decimalPlaces: 2
})

t.is(NewNumber.parse(11.123), 11.12)
t.is(NewNumber.parse(12.345), 12.35)
```

<a name="integer-accepts-only-integers"></a>

<h3>integer (accepts only integers)</h3>

```js
const NewNumber = new Schema({
  type: Number,
  integer: true
})

const error = t.throws(() => NewNumber.parse(11.123))
t.is(error.message, 'Invalid integer')

t.is(NewNumber.parse(11), 11)
```

<a name="auto-cast-default-false"></a>

<h3>autoCast (default `false`)</h3>



`Number` transformer has a built-in auto-casting function that would convert any numeric representation
`String` into a proper `Number`. This feature is disabled by default.

```js
const UserSchema = new Schema({
  user: String,
  age: Number
})

t.throws(() => UserSchema.parse({
  user: 'tin',
  age: '36'
}))
```

To enable it, just pass the setting `autoCast` equaled to `true`

```js
const UserSchema2 = new Schema({
  user: String,
  age: {
    type: Number,
    autoCast: true
  }
})

let contact
t.notThrows(() => {
  contact = UserSchema2.parse({
    user: 'tin',
    age: '36' // < numeric string
  })
})

t.is(contact.user, 'tin')
t.is(contact.age, 36)

const error = t.throws(() => UserSchema2.parse({
  user: 'tin',
  age: 'thirty six'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid number')
t.is(error.errors[0].field.fullPath, 'age')
```

<a name="object"></a>

<h2>Object</h2>

```js
const Transaction = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  payload: Object // this object could be anything with any props
})

const payload = {
  the: {
    object: {
      can: {
        have: {
          anything: true
        }
      }
    }
  }
}

const product = Transaction.parse({
  payload
})

t.is(product.payload, payload) // remains untouched

const error = t.throws(() => Transaction.parse({
  payload: 'none'
}))

t.is(error.message, `Data is not valid`) // => Data is not valid
t.is(error.errors[0].message, 'Invalid object') // => Invalid date
t.is(error.errors[0].field.fullPath, 'payload')
```

<a name="map-schema"></a>

<h3>mapSchema</h3>



We can optionally define the schema of the properties of an object.

```js
const ObjectWith = new Schema({
  type: Object,
  mapSchema: Number
})

const error = t.throws(() => ObjectWith.parse({
  papo: 123,
  papilla: '123'
}))
t.is(error.message, 'Invalid number')
t.is(error.value, '123')
t.is(error.field.fullPath, 'papilla')
```

You can also use custom schemas

```js
const Email = new Schema({
  type: String,
  regex: [/^[a-z0-9._]+@[a-z0-9-.]+\.[a-z]{2,}$/i, 'Invalid e-mail address']
})

const Contact = new Schema({
  name: String,
  email: {
    type: Object,
    mapSchema: {
      type: Email
    }
  }
})

const error2 = t.throws(() => Contact.parse({
  name: 'Martin',
  email: {
    work: 'tin@devtin.io',
    home: '@gmail.com'
  }
}))

t.is(error2.message, 'Data is not valid')
t.is(error2.errors[0].message, 'Invalid e-mail address')
t.is(error2.errors[0].field.fullPath, 'email.home')

t.notThrows(() => Contact.parse({
  name: 'Martin',
  email: {
    work: 'tin@devtin.io',
    home: 'martin@gmail.com'
  }
}))
```

<a name="promise"></a>

<h2>Promise</h2>

```js
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
```

<a name="auto-cast-default-false"></a>

<h3>autoCast (default `false`)</h3>

```js
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
```

<a name="set"></a>

<h2>Set</h2>

```js
const ProductType = new Schema({
  name: String,
  category: Set
})

const product = ProductType.parse({
  name: 'Kombucha',
  category: ['Beverages', 'Health', 'Tea', 'Health']
})

t.false(Array.isArray(product.category))
t.is(product.category.size, 3)
t.true(product.category.has('Health'))

const error = t.throws(() => ProductType.parse({
  name: 'Kombucha',
  category: 'none'
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid set')
t.is(error.errors[0].field.fullPath, 'category')
```

<a name="auto-cast-default-true"></a>

<h3>autoCast (default `true`)</h3>

```js
const ProductType = new Schema({
  name: String,
  category: {
    type: Set,
    autoCast: false
  }
})

const product = ProductType.parse({
  name: 'Kombucha',
  category: new Set(['Beverages', 'Health', 'Tea', 'Health'])
})

t.false(Array.isArray(product.category))
t.is(product.category.size, 3)
t.true(product.category.has('Health'))

const error = t.throws(() => ProductType.parse({
  name: 'Kombucha',
  category: ['Beverages', 'Health', 'Tea', 'Health']
}))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid set')
t.is(error.errors[0].field.fullPath, 'category')
```

<a name="string"></a>

<h2>String</h2>



Validates `String`'s.

```js
const stringSchema = new Schema({
  name: String
})

const error = t.throws(() => stringSchema.parse({ name: 123 }))
t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid string')
t.is(error.errors[0].field.fullPath, 'name')
```

<a name="auto-cast-default-false"></a>

<h3>autoCast (default `false`)</h3>



String transformer would call the method `toString` of any given object when `autoCast` equals `true` and would assign
returned value as long as it is different than `[object Object]`

```js
const nameSchema = new Schema({
  name: {
    type: String,
    autoCast: true
  }
})

const user = nameSchema.parse({
  name: {
    toString () {
      return `Some name`
    }
  }
})
t.is(user.name, 'Some name')
```

<a name="minlength"></a>

<h3>minlength</h3>



Setting `minlength` validates given `String` has a minimum length.

```js
const nameSchema = new Schema({
  name: {
    type: String,
    minlength: 6
    // minlength: [6, 'Looking for a custom error message?']
  }
})

const error = t.throws(() => nameSchema.parse({ name: 'Tin' }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Invalid minlength`)
// t.is(error.errors[0].message, `Looking for a custom error message?`)
t.is(error.errors[0].field.fullPath, `name`)

t.notThrows(() => nameSchema.parse({ name: 'Martin' }), `Martin`)
```

<a name="maxlength"></a>

<h3>maxlength</h3>



Setting `maxlength` validates given `String` has a maximum length of...

```js
const lastNameSchema = new Schema({
  lastName: {
    type: String,
    maxlength: 13
    // maxlength: [13, 'Looking for a custom error message?']
  }
})

const error = t.throws(() => lastNameSchema.parse({ lastName: 'Schwarzenegger' }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Invalid maxlength`)
// t.is(error.errors[0].message, `Looking for a custom error message?`)

t.notThrows(() => lastNameSchema.parse({ lastName: 'Rafael' }))
```

<a name="regex"></a>

<h3>regex</h3>



Setting `regex` provides a validation via regular expression against given values.

```js
const nameSchema = new Schema({
  name: {
    type: String,
    regex: /^[a-z]+$/i
  }
})

const error = t.throws(() => nameSchema.parse({ name: 'Tin Rafael' }))
t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Invalid regex`)

t.notThrows(() => nameSchema.parse({ name: 'Martin' }))
```

Custom error

```js
const nameSchema2 = new Schema({
  name: {
    type: String,
    regex: [/^[a-z]+$/i, 'lowercase only']
  }
})

const error2 = t.throws(() => nameSchema2.parse({ name: 'Tin Rafael' }))
t.is(error2.message, `Data is not valid`)
t.is(error2.errors[0].message, `lowercase only`)
```

<a name="enum"></a>

<h3>enum</h3>

```js
const mySchema = new Schema({
  topping: {
    type: String,
    enum: ['cheese', 'ham', 'tomatoes']
  }
})
const error = t.throws(() => mySchema.parse({ topping: 'potatoes' }))
t.is(error.errors[0].message, 'Unknown enum option potatoes')
t.notThrows(() => mySchema.parse({ topping: 'ham' }))
```

<a name="lowercase"></a>

<h3>lowercase</h3>



Optionally transforms input string into lowercase

```js
const mySchema = new Schema({
  type: String,
  lowercase: true
})
t.is(mySchema.parse('ADMIN'), 'admin')
```

<a name="uppercase"></a>

<h3>uppercase</h3>



Optionally transforms input string into uppercase

```js
const mySchema = new Schema({
  type: String,
  uppercase: true
})
t.is(mySchema.parse('en'), 'EN')
```

<a name="custom"></a>

<h2>Custom</h2>



Custom transformers are great to implement custom logic that may be required by multiple entities of the ecosystem.

```js
const customTransformer = new Schema({
  name: {
    type: String,
    required: false
  },
  email: {
    type: 'Email',
    onlyGmail: true
  },
})

let error = t.throws(() => customTransformer.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, `Don't know how to resolve Email in property email`)
```

Creating a custom transformer is as simple as appending the logic into the Transformers object
found in `const { Transformers } = require('@devtin/schema-validator')`.

Have a look at the [Transformer](/DOCS.md#Transformer) object in the docs.

```js
Transformers.Email = {
  loaders: [
    {
      type: String,
      regex: [/^[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,}$/, `Invalid e-mail address { value } for field { field.name }`]
    }
  ], // pre-processes the value using this known-registered types
  validate (v) {
    t.true(this instanceof Schema)
    if (this.settings.onlyGmail && !/@gmail\.com$/.test(v)) {
      return this.throwError(`Only gmail accounts`)
    }
  }
}

error = t.throws(() => customTransformer.parse({
  name: 'Martin',
  email: 123
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid string') // From the String transformer

error = t.throws(() => customTransformer.parse({
  name: 'Martin',
  email: 'martin'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid e-mail address martin for field email')

error = t.throws(() => customTransformer.parse({
  name: 'Martin',
  email: 'tin@devtin.io'
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Only gmail accounts')

t.notThrows(() => customTransformer.parse({
  name: 'Martin',
  email: 'marting.dc@gmail.com'
}))
```

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
