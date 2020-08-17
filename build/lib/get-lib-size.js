const fs = require('fs')
const path = require('path')

const getLibSize = () => {
  return `${Math.round((fs.statSync(path.join(__dirname, '../../dist/duckfficer.umd.js.gz')).size / 1024) * 10) / 10}KB`
}

module.exports = { getLibSize }
