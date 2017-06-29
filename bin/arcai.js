const ScreepsAPI = require('screeps-api')
program = require('commander')
const SODB = require('sodb')
const {table} = require('table')
const colors = require('colors')

var login = require('../private.json')

program
  .version('0.0.0')
  .option('-r, --room [value]', 'Find Room')
  .option('-s, --source [value]', 'Find Source')
  .option('-t, --target [value]', 'Find Target')
  .option('-h, --hash [value]', 'Find Hash')
  .option('-a, --act [value]', 'Find Act Type')
  .option('-c, --collect [value]', 'Find collect Type')
  .option('--no-harvest', 'Exclude Harvest Jobs')
  .option('--highlight [value]', 'Highlight target/source/from')
  .option('--extra [value]', 'Show an extra field')
  .parse(process.argv)

const api = new ScreepsAPI(login)

Promise.resolve()
  .then(() => api.connect())
  .then(() => api.memory.get())
  .then(memory => {
    var database = SODB.buildFromJSON(memory.state.jobs, {cache: true})

    var search = []
    if(program.room){ search.push({room: program.room}) }
    if(program.source){ search.push({source: program.source}) }
    if(program.target){ search.push({target: program.target}) }
    if(program.hash){ search.push({target: program.hash}) }
    if(program.act){ search.push({act: program.act}) }
    if(program.collect){ search.push({collect: program.collect}) }

    if(!program.harvest){
      search.push({collect: {isnot: 'harvest'}})
    }

    var results = database.order(...search, 'priority').reverse()

    console.log('   _____ ___________________     _____  .___ ')
    console.log('  /  _  \\\\______   \\_   ___ \\   /  _  \\ |   |')
    console.log(' /  /_\\  \\|       _/    \\  \\/  /  /_\\  \\|   |')
    console.log('/    |    \\    |   \\     \\____/    |    \\   |')
    console.log('\\____|__  /____|_  /\\______  /\\____|__  /___|')
    console.log('        \\/       \\/        \\/         \\/     ')
    console.log('')
    console.log(results.length + ' results')

    var headings = [
      '#',
      'Room',
      'Job Hash',
      'Collect',
      'Act',
      'Target ID',
      'Priority'
    ]

    if(program.extra){ headings.push(program.extra) }

    var data = [
      headings
    ]
    var i = 1
    results.forEach(function(result){
      var color = 'white'
      var target = (result.target || result.source || result.from || 'Controller')

      if(target == program.highlight){
        color = 'green'
      }

      if(!result.collect){ result.collect = '' }
      if(!result.act){ result.act = '' }

      var row = [
        colors[color](i),
        colors[color](result.room),
        colors[color](result.hash),
        colors[color](result.collect),
        colors[color](result.act),
        colors[color](target),
        colors[color](result.priority)
      ]

      if(program.extra){ row.push(result[program.extra]) }

      data.push(row)
      i++
    })

    console.log(table(data))
  })
  .catch(err => console.error(err));
