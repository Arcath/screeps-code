const ScreepsAPI = require('screeps-api')
program = require('commander')

var login = require('../private.json')

program
  .version('0.0.0')
  .option('-d, --database [value]', 'Which database to search')
  .option('-a, --all', 'Return all Records')
  .option('-r, --room [value]', 'Limit to Room')
  .parse(process.argv)

const api = new ScreepsAPI(login)

Promise.resolve()
  .then(() => api.connect())
  .then(() => api.memory.get())
  .then(memory => {
    var database = JSON.parse(memory.state[program.database])

    database.objects.forEach(function(entry){
      if(program.room){
        if(entry.room == program.room){
          console.dir(entry)
        }
      }else{
        console.dir(entry)
      }
    })
  })
  .catch(err => console.error(err));
