var SHA1 = require('crypto-js/sha1')

/** Takes an array of game ids and returns an array of game objects */
function inflateFunction(ids: SerializedContainers): StructureContainer[]
function inflateFunction(ids: SerializedExtensions): StructureExtension[]
function inflateFunction(ids: SerializedExtractors): StructureExtractor[]
function inflateFunction(ids: SerializedLabs): StructureLab[]
function inflateFunction(ids: SerializedLinks): StructureLink[]
function inflateFunction(ids: SerializedMinerals): Mineral[]
function inflateFunction(ids: SerializedRamparts): StructureRampart[]
function inflateFunction(ids: SerializedSources): Source[]
function inflateFunction(ids: SerializedSpawns): StructureSpawn[]
function inflateFunction(ids: SerializedTowers): StructureTower[]
function inflateFunction(ids: SerializedWalls): StructureWall[]
function inflateFunction(ids: string[]): any[]{
  return _.transform(ids, function(result, id){
    result.push(Game.getObjectById(id))
  })
}

export const Utils = {
  inflate: inflateFunction,

  deflate: function(objects: any[]){
    return <string[]>_.transform(objects, function(result, object){
      result.push(object.id)
    })
  },

  hash: function(object: object){
    var string = JSON.stringify(object)
    var hash = SHA1(string)

    return hash.toString()
  },

  addWithHash: function(object: ObjectJob, database: SODB){
    // Create a Hash of the object
    var hash = this.hash(object)

    // Assign the hash to the object
    object.hash = hash

    // Add the object to the database
    database.add(object)
  },

  addIfNotExist: function(object: ObjectJob, database: SODB){
    var hash = this.hash(object)
    object.hash = hash

    if(!database.indexLookup(hash)){
      object.hash = hash

      database.add(object)
    }
  },

  findCreepsForJob: function(job: ObjectJob, ttl = 0){
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

  findCreepForJob: function(job: ObjectJob, ttl = 0){
    return this.findCreepsForJob(job, ttl)[0]
  },

  jobForTarget: function(target: GameObject, jobs: SODB){
    return <ObjectJob>jobs.findOne({target: target.id})
  },

  workRate: function(creeps: Creep[], perWorkPart: number){
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

  myNearestRoom: function(roomName: string, rooms: SODB, minCost = 0){
    var myRooms = rooms.where({mine: true}, {spawnable: true}, {name: {isnot: roomName}})

    var nearestRoom = ''
    var nearestRoomDistance = 999
    var nearestRCL = 0

    _.forEach(myRooms, function(room: ObjectRoom){
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

    return <string>nearestRoom
  },

  moveCreep: function(
    creep: Creep,
    target: RoomPosition,
    color: string,
    options:{
      waypoint?: string
    } = {}
  ){
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
            return costMatrix
          }else{
            var myMatrix = PathFinder.CostMatrix.deserialize(Memory.costMatrix[roomName])

            return myMatrix
          }
        },
        maxOps: 10000
      })
    }
  },

  findHostileCreeps: function(unit: RoomObject){
    if(unit.room){
      var creeps = <Creep[]>unit.room.find(FIND_HOSTILE_CREEPS)
    }else{
      var creeps = <Creep[]>[]
    }
    return _.filter(creeps, function(creep){
      return (Memory.allianceData.doNotAgress.indexOf(creep.owner.username) == -1)
    })
  },

  hasBodyPart: function(body: BodyPartDefinition[], part: string){
    for(var bodyPart in body){
      if(body[bodyPart].type == part){
        return true
      }
    }

    return false
  }
}
