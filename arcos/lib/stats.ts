import {Kernel} from '../os/kernel'
import {Utils} from './utils'

export const Stats = {
  build(kernel: Kernel){
    if(!Memory.stats){ Memory.stats = {}}

    Memory.stats['gcl.progress'] = Game.gcl.progress
    Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal
    Memory.stats['gcl.level'] = Game.gcl.level
    Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()
    Memory.stats['cpu.limit'] = Game.cpu.limit
    Memory.stats['cpu.bucket'] = Game.cpu.bucket
    Memory.stats['cpu.kernelLimit'] = kernel.limit
    Memory.stats['memory.size'] = RawMemory.get().length
    Memory.stats['market.credits'] = Game.market.credits

    Memory.stats['processes.counts.total'] = Object.keys(kernel.processTable).length
    Memory.stats['processes.counts.run'] = kernel.execOrder.length
    Memory.stats['processes.counts.suspend'] = kernel.suspendCount
    Memory.stats['processes.counts.missed'] = (Object.keys(kernel.processTable).length - kernel.execOrder.length - kernel.suspendCount)

    if(Memory.stats['processes.counts.missed'] < 0){
      Memory.stats['processes.counts.missed'] = 0
    }

    _.forEach(Object.keys(kernel.processTypes), function(type){
      Memory.stats['processes.types.' + type] = 0
    })

    Memory.stats['processes.types.undefined'] = 0
    Memory.stats['processes.types.init'] = 0
    Memory.stats['processes.types.flagWatcher'] = 0

    _.forEach(kernel.execOrder, function(execed: {type: string, cpu: number}){
      Memory.stats['processes.types.' + execed.type] += execed.cpu
    })

    _.forEach(Object.keys(kernel.data.roomData), function(roomName){
      let room = Game.rooms[roomName]

      if(room.controller && room.controller.my){
        Memory.stats['rooms.' + roomName + '.rcl.level'] = room.controller.level
        Memory.stats['rooms.' + roomName + '.rcl.progress'] = room.controller.progress
        Memory.stats['rooms.' + roomName + '.rcl.progressTotal'] = room.controller.progressTotal
        Memory.stats['rooms.' + roomName + '.rcl.percentage'] = (room.controller.progress / room.controller.progressTotal) * 100
        Memory.stats['rooms.' + roomName + '.ramparts.target'] = Utils.rampartHealth(kernel, roomName)

        Memory.stats['rooms.' + roomName + '.spawn.energy'] = room.energyAvailable
        Memory.stats['rooms.' + roomName + '.spawn.energyTotal'] = room.energyCapacityAvailable

        if(room.storage){
          Memory.stats['rooms.' + roomName + '.storage.energy'] = room.storage.store.energy
        }else{
          Memory.stats['rooms.' + roomName + '.storage.energy'] = 0
        }
      }
    })
  }
}
