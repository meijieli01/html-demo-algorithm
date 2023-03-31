const fs = require('fs')
const map = {
  'test-build': './dist_test/',
  'beta-build': './dist_beta/',
}
const typeList = [
  'test',
  'beta',
]
const icoTypeList = [
  'test.svg',
  'beta.svg',
]
const retainType = process.env.npm_lifecycle_event
console.log('-postbuild-', retainType)
const prefix = map[process.env.npm_lifecycle_event]
typeList.forEach((type) => {
  if (retainType.indexOf(type) < 0) {
    if (icoTypeList.includes(`${type}.ico`)) {
      fs.unlinkSync(`${prefix}${type}.ico`)
    }
    if (icoTypeList.includes(`${type}.svg`)) {
      fs.unlinkSync(`${prefix}${type}.svg`)
    }
  }
})
