const ScreepsAPI = require('screeps-api')
program = require('commander')

var login = require('../private.json')

program
  .version('0.0.0')
  .option('-d, --database [value]', 'Which database to search')
  .option('-a, --all', 'Return all Records')
  .parse(process.argv)

const api = new ScreepsAPI(login)

Promise.resolve()
  .then(() => api.connect())
  .then(() => api.memory.get())
  .then(memory => {
    console.dir(memory.state)
  })
  .catch(err => console.error(err));
