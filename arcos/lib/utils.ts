import {CreepBuilder} from './creepBuilder'
import {Kernel} from '../os/kernel'
import {Process} from '../os/process'
import {RoomPathFinder} from './roomPathFinder'

export const Utils = {
  clearDeadCreeps: function(list: string[]){
    return _.filter(list, function(entry){
      return !!Game.creeps[entry]
    })
  },

  inflateCreeps: function(list: string[]): Creep[]{
    return _.transform(list, function(result, entry){
      result.push(Game.creeps[entry])
    })
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

  spawn(kernel: Kernel, roomName: string, creepType: string, name: string, memory: any): boolean{
    let body = CreepBuilder.design(creepType, Game.rooms[roomName])
    let spawns = kernel.data.roomData[roomName].spawns
    let outcome = false

    _.forEach(spawns, function(spawn){
      if(!_.includes(kernel.data.usedSpawns, spawn.id) &&!spawn.spawning && spawn.canCreateCreep(body) === OK){
        spawn.createCreep(body, name, memory)
        outcome = true
        kernel.data.usedSpawns.push(spawn.id)
      }
    })

    return outcome
  },

  withdrawTarget(creep: Creep, proc: Process){
    let withdraws = [].concat(
      <never[]>proc.kernel.data.roomData[creep.room.name].generalContainers
    )

    if(creep.room.storage){
      withdraws = [].concat(
        withdraws,
        <never[]>[creep.room.storage]
      )
    }

    if(withdraws.length === 0 && proc.kernel.getProcessesByType('hlf').length > 1){
      withdraws = <never[]>proc.kernel.data.roomData[creep.room.name].spawns
      withdraws = <never[]>_.filter(withdraws, function(spawn: StructureSpawn){
        return (spawn.energy > 250 && spawn.room.energyAvailable > (spawn.room.energyCapacityAvailable - 50))
      })
    }

    return <Structure>creep.pos.findClosestByRange(withdraws)
  },

  /** Returns the room closest to the source room with the required spawn energy */
  nearestRoom(sourceRoom: string, minSpawnEnergy = 0){
    let bestRoom = ''
    let bestDistance = 999

    _.forEach(Game.rooms, function(room){
      if(room.controller && room.controller.my){
        if(room.energyCapacityAvailable >= minSpawnEnergy){
          let path = new RoomPathFinder(sourceRoom, room.name).results()

          if(path.length < bestDistance){
            bestDistance = path.length
            bestRoom = room.name
          }
        }
      }
    })

    return bestRoom
  },

  /** Finds a room that can supply the given resource/amount */
  findResource(room: string, resource: string, amount: number){
    let rooms = <{
      name: string
      distance: number
    }[]>[]

    _.forEach(Game.rooms, function(rm: Room){
      if(rm.name != room && rm.controller && rm.controller.my && rm.storage && rm.terminal){
        if(rm.storage.store[resource] && rm.storage.store[resource]! > amount){
          rooms.push({
            name: rm.name,
            distance: Game.map.getRoomLinearDistance(room, rm.name, true)
          })
        }
      }
    })

    if(rooms.length > 0){
      let sortedRooms = _.sortBy(rooms, 'distance')

      return sortedRooms[0].name
    }else{
      return undefined
    }
  },

  /** Calculate the maximum rampart health  for the given room */
  rampartHealth(kernel: Kernel, roomName: string){
    let room = Game.rooms[roomName]

    if(room.controller!.level < 3){
      return 0
    }else{
      let max = room.controller!.level * 100000

      let average = Math.ceil(_.sum(<never[]>kernel.data.roomData[roomName].ramparts, 'hits') / kernel.data.roomData[roomName].ramparts.length)
      let target = average + 10000
      if(target > max){
        return max
      }else{
        return target
      }
    }
  }
}
