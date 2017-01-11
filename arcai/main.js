Memory.arc = {}

var ARCRoom = require('object.room')
var report = require('function.report')
var CreepDesigner = require('function.creepDesigner')

var mineRooms = {
  'E65S73': {
    from: 'E64S73',
    count: 3
  }
}

var claimRooms = {
  'E63S74': {
    from: 'E63S73'
  }
}

var holdRooms = {
  'E65S73': {
    from: 'E64S73'
  }
}

var defendRoom = {
}

var attackRooms = {
}

module.exports.loop = function(){
  for(var name in Memory.creeps){
    if(!Game.creeps[name]){
      delete Memory.creeps[name]
      for(var rm in Memory.arc){
        Memory.arc[rm].newCreep = true
      }
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  for(var name in Memory.creeps){
    var creep = Game.creeps[name]

    if(creep.memory.goToRoom){
      if(creep.memory.goToRoom == creep.room.name){
        if(creep.pos.findInRange(FIND_EXIT, 0).length){
          creep.moveTo(creep.room.controller)
        }else{
          creep.memory.goToRoom = undefined
        }
      }
    }
  }

  var rooms = {}

  for(var rm in Game.rooms){
    rooms[rm] = new ARCRoom(rm)
  }

  var needsSupport = []
  var canSupport = []
  var sendEnergy = []

  for(var rm in rooms){
    if(rooms[rm].needsSupport()){
      needsSupport.push(rm)
    }else{
      if(rooms[rm].canSupport() && !rooms[rm].needsSupport() && !rooms[rm].sendEnergy()){
        canSupport.push(rm)
      }
    }

    if(rooms[rm].sendEnergy() && !rooms[rm].needsSupport()){
      sendEnergy.push(rm)
    }
  }

  if(needsSupport.length){
    if(canSupport.length){
      for(var rm in needsSupport){
        for(var t in rooms[needsSupport[rm]].required){
          rooms[needsSupport[rm]].required[t] = rooms[needsSupport[rm]].required[t] - rooms[needsSupport[rm]].creepsByAction[t].length
        }

        for(var crm in canSupport){
          for(var t in rooms[needsSupport[rm]].required){
            rooms[canSupport[crm]].required[t] += rooms[needsSupport[rm]].required[t]

            rooms[canSupport[crm]].countAndEnsureNumbers(t)

            if(rooms[canSupport[crm]].creepsByAction[t][0]){
              rooms[canSupport[crm]].creepsByAction[t][0].memory.goToRoom = needsSupport[rm]
            }
          }
        }
      }
    }
  }

  if(sendEnergy.length){
    for(var rm in sendEnergy){
      for(var crm in canSupport){
        var room = rooms[canSupport[crm]]


        if(room.creepsByAction.interHaul){
          if(!room.creepsByAction.interHaul.length){
            var creep = CreepDesigner.createCreep({
              base: CreepDesigner.baseDesign.haul,
              room: room.room,
              cap: CreepDesigner.caps.haul
            })

            var spawn = room.getSpawn()

            if(spawn){
              spawn.createCreep(creep, undefined, {action: 'interHaul',  from: canSupport[crm], to: sendEnergy[rm]})
              Memory.arc[room.name].newCreep = true
            }
          }
        }
      }
    }
  }

  for(var targetName in holdRooms){
    var creeps = _.filter(Game.creeps, function(creep){
      return (creep.memory.action == 'hold' && creep.memory.to == targetName)
    })

    if(creeps.length == 0){
      var room = rooms[holdRooms[targetName].from]
      var spawn = room.getSpawn()

      if(spawn){
        spawn.createCreep([CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE], undefined, {action: 'hold', to: targetName})
        Memory.arc[room.name].newCreep = true
      }
    }
  }

  for(var targetName in claimRooms){
    var creeps = _.filter(Game.creeps, function(creep){
      return (creep.memory.action == 'claim' && creep.memory.to == targetName)
    })

    if(creeps.length == 0){
      var room = rooms[claimRooms[targetName].from]
      var spawn = room.getSpawn()

      if(spawn){
        spawn.createCreep([CLAIM, MOVE, MOVE, MOVE, MOVE], undefined, {action: 'claim', to: targetName})
        Memory.arc[room.name].newCreep = true
      }
    }
  }

  for(var targetName in mineRooms){
    var creeps = _.filter(Game.creeps, function(creep){
      return (creep.memory.action == 'remoteHarvest' && creep.memory.mine == targetName)
    })

    if(creeps.length < mineRooms[targetName].count){
      var room = rooms[mineRooms[targetName].from]
      var spawn = room.getSpawn()

      if(spawn){
        var creep = CreepDesigner.createCreep({
          base: CreepDesigner.baseDesign.harvest,
          room: room.room,
          cap: CreepDesigner.caps.harvest
        })

        spawn.createCreep(creep, undefined, {action: 'remoteHarvest', mine: targetName, to: mineRooms[targetName].from})
        Memory.arc[room.name].newCreep = true
      }
    }
  }

  for(var targetName in defendRoom){
    var creeps = _.filter(Game.creeps, function(creep){
      return (creep.memory.action == 'defend' && creep.memory.to == targetName)
    })

    if(creeps.length < defendRoom[targetName].count){
      var room = rooms[defendRoom[targetName].from]
      var spawn = room.getSpawn()

      if(spawn){
        var creep = CreepDesigner.createCreep({
          base: CreepDesigner.baseDesign.defend,
          room: room.room,
          cap: CreepDesigner.caps.defend
        })

        spawn.createCreep(creep, undefined, {action: 'defend', to: targetName})
        Memory.arc[room.name].newCreep = true
      }
    }
  }

  for(var targetName in attackRooms){
    var creeps = _.filter(Game.creeps, function(creep){
      return (creep.memory.action == 'attack' && creep.memory.to == targetName)
    })

    if(creeps.length < attackRooms[targetName].count){
      var room = rooms[attackRooms[targetName].from]
      var spawn = room.getSpawn()

      if(spawn){
        var creep = CreepDesigner.createCreep({
          base: CreepDesigner.baseDesign.defend,
          room: room.room,
          cap: CreepDesigner.caps.defend
        })

        spawn.createCreep(creep, undefined, {action: 'attack', to: targetName})
        Memory.arc[room.name].newCreep = true
      }
    }
  }

  if(Game.time % 20 ===  0){
    report(rooms)
  }
}
