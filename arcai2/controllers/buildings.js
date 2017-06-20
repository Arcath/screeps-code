var Utils = require('../utils')

var BuildingsController = {
  run: function(rooms, jobs, flags){
    var myRooms = rooms.where({mine: true})

    _.forEach(myRooms, function(room){
      var roomFlags = flags.where({room: room.name})

      if(room.rcl > 0){
        BuildingsController.createPaths(room, roomFlags, flags)
      }

      if(room.towers.length > 0){
        BuildingsController.runTowers(room, room.towers)
      }
    })
  },

  createPaths: function(room, roomFlags, flags){
    var spawnPathFlags = flags.refineSearch(roomFlags, {color: COLOR_ORANGE}, {secondaryColor: COLOR_ORANGE})

    _.forEach(spawnPathFlags, function(flagObject){
      var flag = Game.flags[flagObject.name]

      flag.memory = {}

      var remove = true

      if(!flag.memory.sites){
        flag.memory.sites = []
        _.forEach(Utils.inflate(room.spawns), function(spawn){
          var path = PathFinder.search(spawn.pos, flag.pos)

          _.forEach(path.path, function(point){
            flag.memory.sites.push([point.x, point.y, point.roomName])
          })
        })

        _.forEach(flag.memory.sites, function(point){
          var pos = new RoomPosition(point[0], point[1], point[2])

          if(Game.rooms[point[2]].createConstructionSite(pos, STRUCTURE_ROAD) != ERR_INVALID_TARGET){
            remove = false
          }
        })
      }

      if(remove){
        flag.remove()
      }
    })
  },

  runTowers: function(room, towers){
    _.forEach(Utils.inflate(towers), function(tower){
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
      if(closestHostile){
        tower.attack(closestHostile)
      }else{
        var repairTargets = tower.pos.findInRange(FIND_STRUCTURES, 40, {
          filter: function(structure){
            if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
              return (structure.hits < 100000)
            }else{
              return (structure.hits < structure.hitsMax)
            }
          }
        })

        if(repairTargets.length){
          repairTargets.sort(function(a, b){
            return a.hits - b.hits
          })

          tower.repair(repairTargets[0])
        }
      }
    })
  }
}

module.exports = BuildingsController
