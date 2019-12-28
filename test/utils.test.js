import test from 'ava'
import { Schema, Utils } from '../'


test(`Return schema paths`, t => {
  const schema = new Schema({
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
  t.deepEqual(schema.paths, ['title', 'body', 'published'])
})

test(`Converts object into indexed dot array`, t => {
  t.deepEqual(Utils.obj2dot({
    name: 'Martin',
    address: {
      city: 'Miami',
      zip: 33129,
      line1: 'Brickell ave'
    }
  }), ['name', 'address.city', 'address.zip', 'address.line1'])
})

test(`Finds in an object by path`, t => {
  t.is(Utils.find({
    address: {
      line1: 'Brickell Ave'
    }
  }, 'address.line1'), 'Brickell Ave')
})

test(`Renders handlebars kind-of templates`, t => {
  t.is(Utils.render(`My address: { address.line1 }`, {
    address: {
      line1: 'Brickell Ave'
    }
  }), 'My address: Brickell Ave')
})
