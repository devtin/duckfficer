const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const Promise = require('bluebird')
const _ = require('lodash')
const { name: packageName } = require('../../package.json')

const codeFinders = {
  all: /^(?<=```js\n).*?(?=\n```$)/msg,
  no: /^(?<=```js\n(?!\/\/ [^\s]+ scope)).*?(?=\n```$)/msg,
  scoped (scope) {
    return new RegExp('^(?<=```js\n\/\/ ' + scope + ' scope\n).*?(?=\n```$)', 'msg')
  }
}

function getJsExpectedOutput (jsCode) {
  return (jsCode.match(/(?<=\/\/ => ).*?$/msg) || []).join('\n')
}

function getJsBlocks (code, { scope = 'all' } = {}) {
  return code.match(scope === 'all' ? codeFinders.all : (scope === 'no' ? codeFinders.no : codeFinders.scoped(scope)))
}

const runCodeInNode = code => {
  const tmp = path.join(__dirname, 'vm-test.js')
  fs.writeFileSync(tmp, code)

  return new Promise((resolve, reject) => {
    const node = spawn('node', [tmp])
    const output = []
    const errors = []

    node.stdout.on('data', s => output.push(s.toString()))
    node.stderr.on('data', s => errors.push(s.toString()))
    node.on('error', error => reject({ error, errors }))
    node.on('exit', () => resolve(output.join('')))
  })
}

async function checkMdJsCode (mdText) {
  const globals = getJsBlocks(mdText, { scope: 'global' }).join(`\n`)
  const noScope = getJsBlocks(mdText, { scope: 'no' })
  const res = []
  const expectedOutput = []
  await Promise.each(noScope, async code => {
    const script = (globals + `\n` + code).replace(`require('${ packageName }')`, `require('${ path.join(__dirname, '../../') }')`)
    expectedOutput.push(getJsExpectedOutput(code))
    res.push(await runCodeInNode(script))
  })
  // console.log(`RES>>>\n`, res.join(''))
  // console.log(`EXPECTED>>>\n`, expectedOutput.join('\n'))
  return _.trim(res.join(`\n`)) === _.trim(expectedOutput.join(`\n`))
}

module.exports = {
  getJsBlocks,
  checkMdJsCode
}
