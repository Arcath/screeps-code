var SHA1 = require('crypto-js/sha1')

module.exports = {
  inflate: function(ids){
    return _.transform(ids, function(result, id){
      result.push(Game.getObjectById(id))
    })
  },

  deflate: function(objects){
    return _.transform(objects, function(result, object){
      result.push(object.id)
    })
  },

  hash: function(object){
    var string = JSON.stringify(object)
    var hash = SHA1(string)

    return hash.toString()
  },

  addWithHash: function(object, database){
    // Create a Hash of the object
    var hash = this.hash(object)

    // Assign the hash to the object
    object.hash = hash

    // Add the object to the database
    database.add(object)
  },

  addIfNotExist: function(object, database){
    var hash = this.hash(object)
    object.hash = hash

    if(!database.indexLookup(hash)){
      object.hash = hash

      database.add(object)
    }
  },

  findCreepsForJob: function(job, ttl = 0){
    return _.filter(Game.creeps, function(creep){
      if(creep.memory.jobHash == job.hash){
        if(creep.ticksToLive){
          return (creep.ticksToLive > ttl)
        }else{
          return true
        }
      }else{
        return false
      }
    })
  },

  findCreepForJob: function(job, ttl = 0){
    return this.findCreepsForJob(job, ttl)[0]
  },

  jobForTarget: function(target, jobs){
    return jobs.findOne({target: target.id})
  },

  workRate: function(creeps, perWorkPart){
    var workRate = 0

    _.forEach(creeps, function(creep){
      _.forEach(creep.body, function(part){
        if(part.type == WORK){
          workRate += perWorkPart
        }
      })
    })

    return workRate
  },

  myNearestRoom: function(roomName, rooms, minCost = 0){
    var myRooms = rooms.where({mine: true}, {spawnable: true}, {name: {isnot: roomName}})

    var nearestRoom
    var nearestRoomDistance = 999
    var nearestRCL = 0

    _.forEach(myRooms, function(room){
      var distance = Game.map.getRoomLinearDistance(roomName, room.name)

      var roomInstance = Game.rooms[room.name]

      if(roomInstance.energyCapacityAvailable >= minCost){
        if(distance <= nearestRoomDistance && room.rcl >= nearestRCL){
          nearestRoomDistance = distance
          nearestRoom = room.name
          nearestRCL = room.rcl
        }
      }
    })

    return nearestRoom
  },

  moveCreep: function(creep, target, color, options = {}){
    if(options.waypoint && !creep.memory.waypointed && Game.flags[options.waypoint]){
      if(creep.pos.inRangeTo(Game.flags[options.waypoint].pos, 1)){
        creep.memory.waypointed = true
      }else{
        target = Game.flags[options.waypoint].pos
      }
    }

    if(creep.fatigue == 0){
      creep.moveTo(target, {
        visualizePathStyle: {
          fill: 'transparent',
          stroke: color,
          lineStyle: 'dashed',
          strokeWidth: .15,
          opacity: .1
        },
        costCallback: function(roomName, costMatrix){
          if(!Memory.costMatrix[roomName]){
            return
          }else{
            var myMatrix = PathFinder.CostMatrix.deserialize(Memory.costMatrix[roomName])

            return myMatrix
          }
        },
        maxOps: 10000
      })
    }
  },

  findHostileCreeps: function(unit){
    return _.filter(unit.room.find(FIND_HOSTILE_CREEPS), function(creep){
      return (Memory.allianceData.doNotAgress.indexOf(creep.owner.username) == -1)
    })
  },

  hasBodyPart: function(body, part){
    for(var bodyPart in body){
      if(body[bodyPart].type == part){
        return true
      }
    }

    return false
  }
}
