const { parseAvaFile, avaTestsToMd, avaTestToMd } = require('@pleasure-js/docs')
const path = require('path')
const mustache = require('mustache')
const fs = require('fs')
const _ = require('lodash')
const Promise = require('bluebird')

const { Transformers: TheTransformers } = require('../')
const { shields } = require('./fixtures/shields.js')

const mdOptions = { headingLevel: 2, htmlTitle: true }
const fromFeatures = (...paths) => {
  return path.join(__dirname, '../test/features', ...paths)
}

parseAvaFile(fromFeatures('schema.test.js'))
  .then(async schema => {
    let casting = await parseAvaFile(fromFeatures('casting.test.js'))
    let validation = await parseAvaFile(fromFeatures('validation.test.js'))

    const locateTest = (...paths) => {
      return path.join(__dirname, '../test', ...paths)
    }

    const parseTransformer = async name => {
      return (await Promise.map(await parseAvaFile(locateTest(`features/types/${name}.test.js`)), async (test, index) => {
        return avaTestToMd(test, { htmlTitle: true, headingLevel: index === 0 ? mdOptions.headingLevel : mdOptions.headingLevel + 1 })
      })).join('\n\n')
    }

    const Transformers = {}
    await Promise.each(Object.keys(TheTransformers), async name => {
      Transformers[name] = await parseTransformer(name.toLowerCase())
    })

    Transformers.Custom = await parseTransformer('custom')

    const index = []
    const noTodos = t => {
      return t.flag !== 'todo'
    }

    schema = schema.filter(noTodos)
    validation = validation.filter(noTodos)
    casting = casting.filter(noTodos)

    index.push('- **Schema**')
    schema
      .forEach(({ title }) => {
        index.push(`  - [${title}](#${_.kebabCase(title)})`)
      })

    index.push('- **Validation**')
    validation
      .forEach(({ title }) => {
        index.push(`  - [${title}](#${_.kebabCase(title)})`)
      })

    index.push('- **Casting (sanitation)**')
    casting
      .forEach(({ title }) => {
        index.push(`  - [${title}](#${_.kebabCase(title)})`)
      })

    index.push('- **Types (transformers)**')

    const transformersIndex = Object.keys(Transformers).map(t => `- [${t}](#${_.kebabCase(t)})`)
    index.push(...transformersIndex.map(link => `  ${link}`))

    const transformers = []

    Object.keys(Transformers).forEach(transformerName => {
      transformers.push(Transformers[transformerName])
    })
    const readmeTemplate = [
      fs.readFileSync(path.join(__dirname, './template/README.md')).toString(),
      fs.readFileSync(path.join(__dirname, './template/README-CONTENT.md')).toString()
    ].join('\n\n')

    const guide = avaTestsToMd(schema.concat(validation).concat(casting), mdOptions) + '\n\n## Types\n\n' + transformers.join('\n\n')
    const payload = {
      guide,
      libSize: `${Math.round((fs.statSync(path.join(__dirname, '../dist/schema-validator.umd.js.gz')).size / 1024) * 10) / 10}KB`,
      shields,
      'advanced-usage': fs.readFileSync(path.join(__dirname, '../advanced-usage.js')).toString().replace('require(\'./\')', 'require(\'@devtin/schema-validator\')'),
      'at-a-glance': fs.readFileSync(path.join(__dirname, '../at-a-glance.js')).toString().replace('require(\'./\')', 'require(\'@devtin/schema-validator\')'),
      index,
      readme: true
    }

    fs.writeFileSync(path.join(__dirname, '../README.md'), mustache.render(readmeTemplate, payload))
    console.log('Readme created!')
    /*
        fs.writeFileSync(path.join(__dirname, '../guide/README.md'), mustache.render(guideTemplate, payload))
        console.log(`Guide created!`)
        fs.writeFileSync(path.join(__dirname, '../guide/TRANSFORMERS.md'), mustache.render(transformersTemplate, payload))
        console.log(`Transformers created!`)
    */
  })
