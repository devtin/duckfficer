const path = require('path')
console.log(`v` + require(path.join(__dirname, '../package.json')).version)
