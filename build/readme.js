const { parseAvaFile, avaTestsToMd } = require('@pleasure-js/docs')
const path = require('path')
const mustache = require('mustache')
const fs = require('fs')
const _ = require('lodash')

const mdOptions = { headingLevel: 3 }

parseAvaFile(path.join(__dirname, '../test/features/schema.test.js'))
  .then(async tests => {
    const index = []

    tests = tests
      .filter(t => {
        return t.flag !== 'todo'
      })

    tests
      .forEach(({ title }) => {
        index.push(`- [${ title }](#${ _.kebabCase(title) })`)
      })

    const schema = await avaTestsToMd(tests, mdOptions)

    const template = fs.readFileSync(path.join(__dirname, './template/README.md')).toString()

    fs.writeFileSync(path.join(__dirname, '../README.md'), mustache.render(template, {
      schema,
      sandbox: fs.readFileSync(path.join(__dirname, '../sandbox.js')).toString().replace(`require('./')`, `require('@devtin/schema-validator')`),
      index: index.join(`\n`)
    }))
    console.log(`Readme created!`)
  })
