const CoverageShield = require('../lib/coverage-shield')

const shields = [
  '<a href="https://www.npmjs.com/package/duckfficer" target="_blank"><img src="https://img.shields.io/npm/v/duckfficer.svg" alt="Version"></a>',
  CoverageShield.getShield(), // test coverage
  '<a href="/test/features"><img src="https://github.com/devtin/duckfficer/workflows/test/badge.svg"></a>',
  /* '<a href="https://gitter.im/duckfficer/community"><img src="https://badges.gitter.im/duckfficer/community.svg"></a>', */
  '<a href="https://opensource.org/licenses" target="_blank"><img src="https://img.shields.io/badge/License-MIT-brightgreen.svg"></a>' // MIT
]

module.exports = { shields }
