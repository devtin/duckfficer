const { parseAvaFile, avaTestsToMd, avaTestToMd } = require('@pleasure-js/docs')
const path = require('path')
const mustache = require('mustache')
const fs = require('fs')
const _ = require('lodash')
const Promise = require('bluebird')
const CoverageShield = require('./lib/coverage-shield.js')

const mdOptions = { headingLevel: 2 }

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

    const guide = await avaTestsToMd(tests, mdOptions)

    const locateTest = (...paths) => {
      return path.join(__dirname, `../test`, ...paths)
    }

    const parseTransformer = async name => {
      return (await Promise.map(await parseAvaFile(locateTest(`transformers/${ name }.test.js`)), async (test, index) => {
        return avaTestToMd(test, { headingLevel: index === 0 ? mdOptions.headingLevel : mdOptions.headingLevel + 1 })
      })).join(`\n\n`)
    }
    const Transformers = {
      Array: await parseTransformer('array'),
      Boolean: await parseTransformer('boolean'),
      BigInt: await parseTransformer('bigint'),
      Date: await parseTransformer('date'),
      Function: await parseTransformer('function'),
      Number: await parseTransformer('number'),
      Object: await parseTransformer('object'),
      Set: await parseTransformer('set'),
      String: await parseTransformer('string'),
      Custom: await parseTransformer('custom')
    }

    // const hooks = avaTestsToMd(await parseAvaFile('array'))
    const hooks = await avaTestsToMd(await parseAvaFile(locateTest(`features/hooks.test.js`)), { headingLevel: mdOptions.headingLevel + 1 })
    const loaders = await avaTestsToMd(await parseAvaFile(locateTest(`features/loaders.test.js`)), mdOptions)
    const transformers = []
    const transformersIndex = Object.keys(Transformers).map(t => `- [${ t }](#${ _.kebabCase(t) })`)

    Object.keys(Transformers).forEach(transformerName => {
      transformers.push(Transformers[transformerName])
    })
    const readmeTemplate = fs.readFileSync(path.join(__dirname, './template/README.md')).toString()
    const guideTemplate = fs.readFileSync(path.join(__dirname, './template/GUIDE.md')).toString()
    const transformersTemplate = fs.readFileSync(path.join(__dirname, './template/TRANSFORMERS.md')).toString()
    const payload = {
      guide,
      transformers,
      transformersIndex,
      hooks,
      loaders,
      libSize: `${ Math.round((fs.statSync(path.join(__dirname, '../dist/schema-validator.iife.js.gz')).size / 1024) * 10) / 10 }KB`,
      shields: [
        CoverageShield.getShield(), // test coverage
        '![](https://github.com/devtin/schema-validator/workflows/tests/badge.svg)',
        '[![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](http://opensource.org/licenses)', // MIT
      ],
      sandbox: fs.readFileSync(path.join(__dirname, '../sandbox.js')).toString().replace(`require('./')`, `require('@devtin/schema-validator')`),
      index
    }

    fs.writeFileSync(path.join(__dirname, '../README.md'), mustache.render(readmeTemplate, payload))
    console.log(`Readme created!`)
    fs.writeFileSync(path.join(__dirname, '../guide/README.md'), mustache.render(guideTemplate, payload))
    console.log(`Guide created!`)
    fs.writeFileSync(path.join(__dirname, '../guide/TRANSFORMERS.md'), mustache.render(transformersTemplate, payload))
    console.log(`Transformers created!`)
  })
