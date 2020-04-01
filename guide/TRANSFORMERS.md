## Guide » Transformers

Transformers are the ones validating, casting and parsing all property-types defined in the schema.
Read the [Transformers section in the API documentation](../DOCS.md#Transformer) for more information.

- [Array](/guide/TRANSFORMERS.md#array)
- [BigInt](/guide/TRANSFORMERS.md#big-int)
- [Boolean](/guide/TRANSFORMERS.md#boolean)
- [Date](/guide/TRANSFORMERS.md#date)
- [Function](/guide/TRANSFORMERS.md#function)
- [Number](/guide/TRANSFORMERS.md#number)
- [Object](/guide/TRANSFORMERS.md#object)
- [Promise](/guide/TRANSFORMERS.md#promise)
- [Set](/guide/TRANSFORMERS.md#set)
- [String](/guide/TRANSFORMERS.md#string)
- [Custom](/guide/TRANSFORMERS.md#custom)
- [Back to guide](./README.md)

## Array



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

### arraySchema



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
  lastAccess: ['6/11/2019', 'Sat Jan 11 2020 17:06:31 GMT-0500 (Eastern Standard Time)']
})

t.true(Array.isArray(tinLog.lastAccess))
t.is(tinLog.lastAccess.length, 2)
t.true(tinLog.lastAccess[0] instanceof Date)
t.true(tinLog.lastAccess[1] instanceof Date)

const error = t.throws(() => Log.parse({
  user: 'tin',
  lastAccess: ['6/11/1983', 'What is love?']
}))

t.is(error.message, `Data is not valid`)
t.is(error.errors[0].message, 'Invalid date')
t.is(error.errors[0].field.fullPath, 'lastAccess.1')
```
## BigInt



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

### autoCast (default `false`)



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
## Boolean



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

### autoCast (default `false`)



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
## Date



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
    birthday: new Date('6/11/1983')
  })
})

const error = t.throws(() => dateValidator.parse({
  name: 'Martin',
  birthday: `Somewhere in the 80s`
}))

t.is(error.message, 'Data is not valid')
t.is(error.errors[0].message, 'Invalid date')
```

### autoCast (default `true`)



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
    birthday: '6/11/1983' // this is a string originally
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
  birthday: '6/11/1983'
}))

t.is(error2.message, 'Data is not valid')
t.is(error2.errors[0].message, 'Invalid date')
t.is(error2.errors[0].field.fullPath, 'birthday')
```
## Function

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
## Number



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

### autoCast (default `false`)



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
## Object

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
## Promise

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

### autoCast (default `false`)

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
## Set

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

### autoCast (default `true`)

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
## String



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

### autoCast (default `false`)



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

### minlength



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

### maxlength



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

t.notThrows(() => lastNameSchema.parse({ lastName: 'Gonzalez' }))
```

### regex



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

### enum

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
## Custom



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

### License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2019-2020 Martin Rafael <tin@devtin.io>
