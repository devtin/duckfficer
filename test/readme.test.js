import test from 'ava'
import fs from 'fs'
import path from 'path'

const { getJsBlocks } = require('./utils/test-readme.js')

test(`Parses js block codes from markdown`, t => {
  const jsBlocks = getJsBlocks(fs.readFileSync(path.join(__dirname, './benchmark/js-code.md')).toString())
  t.true(Array.isArray(jsBlocks))
  t.is(jsBlocks.length, 3)
  t.is(jsBlocks[2], `console.log(message()) // => Vamos a la playa, a mi me gusta bailar`)

})

test(`Grabs global scope (initializers)`, t => {
  const jsBlocks = getJsBlocks(fs.readFileSync(path.join(__dirname, './benchmark/js-code.md')).toString(), { scope: 'global' })
  t.true(Array.isArray(jsBlocks))
  t.is(jsBlocks.length, 1)
})
