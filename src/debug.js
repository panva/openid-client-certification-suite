process.env.DEBUG_COLORS = 0
process.env.DEBUG_HIDE_DATE = 1

const fs = require('node:fs')
const util = require('node:util')

const Debug = require('debug')

const modules = new Map()

const origLog = Debug.log
Debug.log = function (...args) {
  const [msg, ...rest] = args
  origLog.call(this, ...args)
  if (!msg.startsWith('moduleId:')) return

  const [moduleId] = msg.split(':')[1].split(' ')
  const { moduleName, variant, planId } = modules.get(moduleId)
  let fileName = `./logs/${planId}-${moduleName}.log`
  if (variant.response_type) {
    fileName = `./logs/${planId}-${moduleName}_${variant.response_type.replace(/ /g, '-')}.log`
  }

  fs.appendFileSync(fileName, `${new Date().toISOString()} `)
  fs.appendFileSync(fileName, `${msg} `)
  for (const item of rest) {
    fs.appendFileSync(fileName, `${util.inspect(item, { depth: Infinity, colors: false })} `)
  }
  fs.appendFileSync(fileName, '\n\n')
}

module.exports = {
  set(moduleId, data) {
    modules.set(moduleId, data)
  },
  runner: new Debug('runner'),
  scoped(moduleId) {
    return new Debug(`moduleId:${moduleId}`)
  },
}
