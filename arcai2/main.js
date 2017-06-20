var SODB = require('sodb')

var BuildingsController = require('./controllers/buildings')
var CreepsActor = require('./actors/creeps')
var CreepsController = require('./controllers/creeps')
var FlagObject = require('./objects/flag')
var JobsController = require('./controllers/jobs')
var RoomObject = require('./objects/room')
var SiteObject = require('./objects/site')
var Utils = require('./utils')

// Create an empty state if none exists
if(!Memory.state){
  Memory.state = {}
  Memory.stateCheck = 'new'
}

// Clear dead creeps from memory
for(var name in Memory.creeps){
  if(!Game.creeps[name]){
    delete Memory.creeps[name]
    for(var rm in Memory.arc){
      Memory.arc[rm].newCreep = true
    }
    console.log('Clearing non-existing creep memory:', name);
  }
}

// Get the total of all rcls added together (for state change on RCL up)
var rclTotal = 0
_.forEach(Game.rooms, function(room){
  if(room.controller){
    if(room.controller.my){
      rclTotal += room.controller.level
    }
  }
})
// Use object-hash to check if anything in the game has changed
var hashCheck = {
  codeRevision: 1,
  rooms: Object.keys(Game.rooms).length,
  creeps: Object.keys(Game.creeps).length,
  spawns: Object.keys(Game.spawns).length,
  structures: Object.keys(Game.structures).length,
  sites: Object.keys(Game.constructionSites).length,
  rclTotal: rclTotal,
  flags: Object.keys(Game.flags).length
}

var newHash = Utils.hash(hashCheck)

if(Memory.stateCheck != newHash){
  console.log('============ New Game State ============')
  console.log(newHash)
  // The Game state has changed, need to rebuild objects

  // Store the new hash in Memory
  Memory.stateCheck = newHash

  // Create the SODBs
  var rooms = new SODB({cache: true})
  var jobs = new SODB({cache: true})
  var sites = new SODB({cache: true})
  var flags = new SODB({cache: true})

  _.forEach(Game.flags, function(flag){
    var flagObject = FlagObject(flag)

    flags.add(flagObject)
  })

  _.forEach(Game.constructionSites, function(site){
    var siteObject = SiteObject(site)

    sites.add(siteObject)
  })

  // Build data
  for(var roomName in Game.rooms){
    var roomObject = RoomObject(Game.rooms[roomName])
    rooms.add(roomObject)

    JobsController.jobsForRoom(roomObject, jobs)
  }
}else{
  // The Game state has not changed, restore the objects
  var rooms = SODB.buildFromJSON(Memory.state.rooms, {cache: true})
  var jobs = SODB.buildFromJSON(Memory.state.jobs, {cache: true})
  var sites = SODB.buildFromJSON(Memory.state.sites, {cache: true})
  var flags = SODB.buildFromJSON(Memory.state.flags, {cache: true})
}

var spawnQueue = new SODB()

// Add dynamic jobs
JobsController.energyJobs(rooms, jobs)
JobsController.siteJobs(sites, jobs)

// Run the Buildings Controller
BuildingsController.run(rooms, jobs, flags)

// Run the Creeps Controller
CreepsController.run(rooms, jobs, spawnQueue)

// Run creep actions
CreepsActor.run(rooms, jobs)

// Process the spawn queue
for(var roomName in Game.rooms){
  var room = rooms.findOne({name: roomName})
  var spawns = Utils.inflate(room.spawns)

  _.forEach(spawns, function(spawn){
    if(!spawn.spawning){
      var queue = spawnQueue.order({room: roomName}, {spawned: false}, 'priority')[0]

      if(queue){
        spawn.createCreep(queue.creep, undefined, queue.memory)

        queue.spawned = true

        spawnQueue.update(queue)
      }
    }
  })
}

// End of the loop, store objects in game state
Memory.state.rooms = rooms.toJSON()
Memory.state.jobs = jobs.toJSON()
Memory.state.sites = sites.toJSON()
Memory.state.flags = flags.toJSON()
