import {Kernel} from '../os/kernel'
import {Utils} from './utils'

export const Stats = {
  build(kernel: Kernel){
    //if(!Memory.stats){ Memory.stats = {}}

    let stats: {[key: string]: number} = {}

    stats['gcl.progress'] = Game.gcl.progress
    stats['gcl.progressTotal'] = Game.gcl.progressTotal
    stats['gcl.level'] = Game.gcl.level
    stats['cpu.getUsed'] = Game.cpu.getUsed()
    stats['cpu.limit'] = Game.cpu.limit
    stats['cpu.bucket'] = Game.cpu.bucket
    stats['cpu.kernelLimit'] = kernel.limit
    stats['memory.size'] = RawMemory.get().length
    stats['market.credits'] = Game.market.credits

    stats['processes.counts.total'] = Object.keys(kernel.processTable).length
    stats['processes.counts.run'] = kernel.execOrder.length
    stats['processes.counts.suspend'] = kernel.suspendCount
    stats['processes.counts.missed'] = (Object.keys(kernel.processTable).length - kernel.execOrder.length - kernel.suspendCount)
    stats['processes.counts.faulted'] = 0

    if(stats['processes.counts.missed'] < 0){
      stats['processes.counts.missed'] = 0
    }

    _.forEach(Object.keys(kernel.processTypes), function(type){
      stats['processes.types.' + type] = 0
    })

    stats['processes.types.undefined'] = 0
    stats['processes.types.init'] = 0
    stats['processes.types.flagWatcher'] = 0

    _.forEach(kernel.execOrder, function(execed: {type: string, cpu: number, faulted: boolean}){
      stats['processes.types.' + execed.type] += execed.cpu

      if(execed.faulted){
        stats['processes.counts.faulted'] += 1
      }
    })

    stats['processes.types.scheduler'] = kernel.schedulerUsage
    stats['processes.types.kernel-scheduler'] = 0

    _.forEach(Object.keys(kernel.data.roomData), function(roomName){
      let room = Game.rooms[roomName]

      if(room.controller && room.controller.my){
        stats['rooms.' + roomName + '.rcl.level'] = room.controller.level
        stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress
        stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal
        stats['rooms.' + roomName + '.rcl.percentage'] = (room.controller.progress / room.controller.progressTotal) * 100
        stats['rooms.' + roomName + '.ramparts.target'] = Utils.rampartHealth(kernel, roomName)

        stats['rooms.' + roomName + '.spawn.energy'] = room.energyAvailable
        stats['rooms.' + roomName + '.spawn.energyTotal'] = room.energyCapacityAvailable

        if(room.storage){
          stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
        }else{
          stats['rooms.' + roomName + '.storage.energy'] = 0
        }
      }
    })

    let json: {[shard: string]: any} = {}
    json[Game.shard.name] = stats

    RawMemory.segments[90] = JSON.stringify(json)
  }
}
