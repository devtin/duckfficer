# Virtuals (getters / setters)

```js
const Address = new Schema({
  line1: String,
  line2: String,
  zip: Number,
  get fullAddress () {
    return `${this.line1} / ${this.line2} / ${this.zip}`
  }
})

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
    type: Address,
    required: false
  }
})

const me = await User.parse({
  firstName: 'Martin',
  lastName: 'Rafael',
  address: {
    line1: 'Brickell',
    line2: 'Ave',
    zip: 305
  }
})

t.is(me.fullName, 'Martin Rafael')
t.is(me.address.fullAddress, 'Brickell / Ave / 305')

me.fullName = 'Pedro Perez'

t.is(me.firstName, 'Pedro')
t.is(me.lastName, 'Perez')

const error = t.throws(() => {
  me.address.fullAddress = '123'
})

t.is(error.message, 'Cannot set property fullAddress of #<Object> which has only a getter')
t.deepEqual(Object.keys(me), ['firstName', 'lastName', 'address'])
```

Once parsed, virtuals are non-enumerable by default. You can use `parse(payload, { virtualsEnumerable = true` })`
to change this behavior.

```js
const she = await User.parse({
  firstName: 'Olivia',
  lastName: 'Isabel'
}, {
  virtualsEnumerable: true
})

t.deepEqual(Object.keys(she), ['firstName', 'lastName', 'fullName'])
```