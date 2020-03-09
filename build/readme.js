const { parseAvaFile, avaTestsToMd, avaTestToMd } = require('@pleasure-js/docs')
const path = require('path')
const mustache = require('mustache')
const fs = require('fs')
const _ = require('lodash')
const Promise = require('bluebird')
const CoverageShield = require('./lib/coverage-shield.js')
const { Transformers: TheTransformers } = require('../')

const mdOptions = { headingLevel: 2 }

parseAvaFile(path.join(__dirname, '../test/features/schema.test.js'))
  .then(async tests => {
    const locateTest = (...paths) => {
      return path.join(__dirname, `../test`, ...paths)
    }

    const parseTransformer = async name => {
      return (await Promise.map(await parseAvaFile(locateTest(`transformers/${ name }.test.js`)), async (test, index) => {
        return avaTestToMd(test, { headingLevel: index === 0 ? mdOptions.headingLevel : mdOptions.headingLevel + 1 })
      })).join(`\n\n`)
    }

    const Transformers = {}
    await Promise.each(Object.keys(TheTransformers), async name => {
      Transformers[name] = await parseTransformer(name.toLowerCase())
    })
    Transformers.Custom = await parseTransformer('custom')

    const index = []

    tests = tests
      .filter(t => {
        return t.flag !== 'todo'
      })

    tests
      .forEach(({ title }) => {
        index.push(`- [${ title }](/guide/README.md#${ _.kebabCase(title) })`)
      })

    const transformersIndex = Object.keys(Transformers).map(t => `- [${ t }](/guide/TRANSFORMERS.md#${ _.kebabCase(t) })`)
    const additionalIndex = [`- [Life-cycle](/guide/README.md#life-cycle)`, `- [Transformers](/guide/TRANSFORMERS.md)`, `- [Hooks](/guide/README.md#hooks)`, `- [Loaders](/guide/README.md#loaders)`]

    const indexWithTransformers = index.slice()

    index.push(...additionalIndex)
    indexWithTransformers.push(...additionalIndex.slice(0, 2))
    indexWithTransformers.push(...transformersIndex.slice().map(link => `  ${ link }`))
    indexWithTransformers.push(...additionalIndex.slice(2))

    const guide = await avaTestsToMd(tests, mdOptions)

    // const hooks = avaTestsToMd(await parseAvaFile('array'))
    const hooks = await avaTestsToMd(await parseAvaFile(locateTest(`features/hooks.test.js`)), { headingLevel: mdOptions.headingLevel + 1 })
    const loaders = await avaTestsToMd(await parseAvaFile(locateTest(`features/loaders.test.js`)), mdOptions)
    const transformers = []

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
        '<a href="https://www.npmjs.com/package/@devtin/schema-validator" target="_blank"><img src="https://img.shields.io/npm/v/@devtin/schema-validator.svg" alt="Version"></a>',
        CoverageShield.getShield(), // test coverage
        `<a href="/test/features"><img src="https://github.com/devtin/schema-validator/workflows/tests/badge.svg"></a>`,
        '<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>', // MIT
      ],
      'advanced-usage': fs.readFileSync(path.join(__dirname, '../advanced-usage.js')).toString().replace(`require('./')`, `require('@devtin/schema-validator')`),
      'at-a-glance': fs.readFileSync(path.join(__dirname, '../at-a-glance.js')).toString().replace(`require('./')`, `require('@devtin/schema-validator')`),
      index,
      indexWithTransformers
    }

    fs.writeFileSync(path.join(__dirname, '../README.md'), mustache.render(readmeTemplate, payload))
    console.log(`Readme created!`)
    fs.writeFileSync(path.join(__dirname, '../guide/README.md'), mustache.render(guideTemplate, payload))
    console.log(`Guide created!`)
    fs.writeFileSync(path.join(__dirname, '../guide/TRANSFORMERS.md'), mustache.render(transformersTemplate, payload))
    console.log(`Transformers created!`)
  })
