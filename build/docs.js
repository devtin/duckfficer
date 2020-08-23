const { parseAvaFile, avaTestsToMd, avaTestToMd, jsCodeToMd } = require('@pleasure-js/docs')
const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')
const mustache = require('mustache')
const { kebabCase, trim } = require('lodash')

const { shields } = require('./fixtures/shields.js')
const { getLibSize } = require('./lib/get-lib-size')

const { Transformers: TheTransformers } = require('../')

const mdOptions = { headingLevel: 2, htmlTitle: false }

const fromFeatures = (...paths) => {
  return path.join(__dirname, '../test/features', ...paths)
}

const fromRoot = (...paths) => {
  return path.join(__dirname, '../', ...paths)
}

const fromDocs = (...paths) => {
  return fromRoot('docs', ...paths)
}

const writeDoc = (fileName, content) => {
  return fs.writeFileSync(fromDocs(fileName), content)
}

const locateTest = (...paths) => {
  return path.join(__dirname, '../test', ...paths)
}

const noTodos = t => {
  return t.flag !== 'todo'
}

const parseTransformer = async name => {
  return (await Promise.map(await parseAvaFile(locateTest(`features/types/${name}.test.js`)), async (test, index) => {
    return avaTestToMd(test, { htmlTitle: false, headingLevel: 2 + (index === 0 ? 0 : 1) })
  })).join('\n\n')
}

const getIndexesFromTests = (tests) => {
  return tests.map(({ title }) => `- [${title}](#${kebabCase(title)})`).join('\n')
}

const testsToSection = (sectionTitle, tests) => {
  if (tests.length === 1) {
    return avaTestsToMd(tests)
  }
  return `# ${sectionTitle}\n\n${getIndexesFromTests(tests)}\n\n${avaTestsToMd(tests, mdOptions)}`
}

(async function () {
  const libSize = getLibSize()
  const readmeTemplate = fs.readFileSync(path.join(__dirname, './template/README.md')).toString()
  const transformers = []
  let guide = await parseAvaFile(fromFeatures('schema.test.js'))
  let casting = await parseAvaFile(fromFeatures('casting.test.js'))
  let validation = await parseAvaFile(fromFeatures('validation.test.js'))
  const virtuals = await parseAvaFile(fromFeatures('virtuals.test.js'))
  const methods = await parseAvaFile(fromFeatures('methods-events-errors.test.js'))

  const Transformers = {}
  await Promise.each(Object.keys(TheTransformers), async name => {
    Transformers[name] = await parseTransformer(name.toLowerCase())
  })

  Transformers.Custom = await parseTransformer('custom')

  guide = guide.filter(noTodos)
  validation = validation.filter(noTodos)
  casting = casting.filter(noTodos)

  Object.keys(Transformers).forEach(transformerName => {
    transformers.push(Transformers[transformerName])
  })

  const readmePayload = {
    libSize,
    shields,
    'at-a-glance': jsCodeToMd(trim(fs.readFileSync(path.join(__dirname, '../at-a-glance.js')).toString().replace('require(\'./\')', 'require(\'duckfficer\')')))
  }

  writeDoc('guide.md', testsToSection('Guide', guide))
  writeDoc('casting.md', testsToSection('Casting (sanitation)', casting))
  writeDoc('validation.md', testsToSection('Validation', validation))
  writeDoc('virtuals.md', testsToSection('Virtuals', virtuals))
  writeDoc('methods-events.md', testsToSection('Methods & Events', methods))
  writeDoc('types.md', transformers.join('\n\n'))
  writeDoc('README.md', mustache.render(readmeTemplate, readmePayload))
})()
