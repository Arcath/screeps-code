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

      if(Game.time % 20 === 0){
        var roomPlans = require('../data/roomPlans')

        if(roomPlans[room.name] && roomPlans[room.name][room.rcl]){
          var roomPlan = roomPlans[room.name][room.rcl]

          _.forEach(Object.keys(roomPlan.buildings), function(buildingType){
            _.forEach(roomPlan.buildings[buildingType].pos, function(position){
              var pos = new RoomPosition(position.x, position.y, room.name)

              var structures = _.filter(pos.look(), function(entry){
                if(entry.type == 'structure'){
                  return (entry.structureType == buildingType)
                }else if(entry.type == 'constructionSite'){
                  return (entry.structureType == buildingType)
                }else{
                  return false
                }
              })

              if(structures.length == 0){
                pos.createConstructionSite(buildingType)
                if(room.spawns.length == 0 && buildingType == 'spawn' && !Game.flags[room.name + buildingType]){
                  pos.createFlag(room.name + buildingType, COLOR_GREEN)
                }
              }
            })
          })
        }
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
      var hostiles = Utils.findHostileCreeps(tower)

      var closestHostile = tower.pos.findClosestByRange(hostiles)
      if(closestHostile){
        tower.attack(closestHostile)
      }else{
        var repairTargets = tower.pos.findInRange(FIND_STRUCTURES, 40, {
          filter: function(structure){
            if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART){
              return (
                structure.hits < 20000
                ||
                structure.hits > (tower.room.controller.level * 100000) - 2000
                &&
                structure.hits < (tower.room.controller.level * 100000) + 1000
              )
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
