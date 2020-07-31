const fs = require('fs')
const path = require('path')

const getLibSize = () => {
  return `${Math.round((fs.statSync(path.join(__dirname, '../../dist/schema-validator.umd.js.gz')).size / 1024) * 10) / 10}KB`
}

module.exports = { getLibSize }
