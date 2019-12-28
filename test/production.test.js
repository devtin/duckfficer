import test from 'ava'
import fs from 'fs'
import path from 'path'

const { checkMdJsCode } = require('./utils/test-readme.js')

test.skip(`Why runs good`, async t => {
  t.true(await checkMdJsCode(fs.readFileSync(path.join(__dirname, '../WHY.md')).toString()))
})
