import {CreepBuilder} from './creepBuilder'
import {Kernel} from '../os/kernel'
import {Process, LifetimeProcess} from '../os/process'
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
    let body = CreepBuilder.design(creepType, Game.rooms[roomName], kernel)
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
      <never[]>_.filter(proc.kernel.data.roomData[creep.room.name].generalContainers, function(container){
        return (container.store.energy > 0)
      })
    )

    let sourceContainers = <never[]>_.filter(proc.kernel.data.roomData[creep.room.name].sourceContainers, function(container){
      return (container.store.energy > 1000)
    })

    withdraws = [].concat(
      withdraws,
      sourceContainers
    )

    if(creep.room.storage){
      withdraws = [].concat(
        withdraws,
        <never[]>[creep.room.storage]
      )
    }

    let inRoomHLF = _.filter(proc.kernel.getProcessesByType('hlf'), function(process: LifetimeProcess){
      let crp = process.getCreep()

      if(!crp){
        return false
      }

      return creep.room.name === crp.room.name
    })

    if(withdraws.length === 0 && inRoomHLF.length > 1){
      withdraws = <never[]>proc.kernel.data.roomData[creep.room.name].spawns
      withdraws = <never[]>_.filter(withdraws, function(spawn: StructureSpawn){
        return (spawn.energy > 250 && spawn.room.energyAvailable > (spawn.room.energyCapacityAvailable - 50))
      })
    }

    return <Structure>creep.pos.findClosestByRange(withdraws)
  },

  /** Returns the room closest to the source room with the required spawn energy */
  nearestRoom(sourceRoom: string, minSpawnEnergy = 0, bestDistance = 999){
    let bestRoom = ''

    _.forEach(Game.rooms, function(room){
      if(room.controller && room.controller.my && room.name != sourceRoom){
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
  findResource(room: string, resource: ResourceConstant, amount: number){
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
  },

  /** Find hostile creeps, excludes creeps in the same alliance */
  filterHostileCreeps(creeps: Creep[]){
    return _.filter(creeps, function(creep){
      if(Memory.loanData){
        return !(_.include(Memory.loanData[AOS_ALLIANCE], creep.owner.username)) && (!_.include(AOS_NO_AGRESS, creep.owner.username))
      }else{
        console.log('LOAN Data not loaded')
        return true
      }
    })
  }
}
