const path = require('path')
const { forOwn } = require('lodash')

class CoverageShield {
  static computeCoverage (file = path.join(process.cwd(), 'coverage/coverage-summary.json')) {
    const coverageResult = require(file)
    let pct = []
    Object.keys(coverageResult.total).forEach(prop => {
      pct.push(coverageResult.total[prop].pct)
    })
    return pct.reduce((a, b) => {
      return a + b
    }, 0) / pct.length
  }

  static coveragePctColor (pct) {
    const colorPalette = {
      '25': 'red',
      '50': 'orange',
      '75': 'yellow',
      '100': 'green'
    }
    let color

    forOwn(colorPalette, (value, prop) => {
      if (pct <= parseInt(prop)) {
        color = value
        return false
      }
    })

    return color
  }

  static getShield () {
    const pct = Math.round(CoverageShield.computeCoverage())
    return `![](https://img.shields.io/badge/coverage-${ pct }%25-${ CoverageShield.coveragePctColor(pct) })`
  }
}

module.exports = CoverageShield
