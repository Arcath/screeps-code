import {Process} from '../../os/process'

import {isMyRoom} from '@open-screeps/is-my-room'

export class InitProcess extends Process{
  type = AOS_INIT_PROCESS
  metaData: MetaData[AOS_INIT_PROCESS]

  /** Run the init process */
  run(){
    let proc = this

    for(var name in Memory.creeps){
      if(!Game.creeps[name]){
        delete Memory.creeps[name]
      }
    }

    if(!this.kernel.hasProcess('loanData')){
      this.kernel.addProcess(AOS_LOAN_DATA_PROCESS, 'loanData', 10, {
        state: STATE_LOAD
      })
    }

    if(!this.kernel.hasProcess('intershard')){
      this.kernel.addProcess(AOS_INTER_SHARD_PROCESS, 'intershard', 10, {
        state: STATE_READ
      })
    }

    _.forEach(Game.rooms, function(room){
      if(isMyRoom(room)){
        proc.kernel.addProcessIfNotExist(AOS_COLONY_PROCESS, 'colony-' + room.name, 90, {
          roomName: room.name
        })

        if(!proc.kernel.hasProcess('em-' + room.name)){
          proc.kernel.addProcess(AOS_ENERGY_MANAGEMENT_PROCESS, 'em-' + room.name, 50, {
            roomName: room.name
          })
        }
  
        if(!proc.kernel.hasProcess('sm-' + room.name)){
          proc.kernel.addProcess(AOS_STRUCTURE_MANAGEMENT_PROCESS, 'sm-' + room.name, 48, {
            roomName: room.name
          })
        }
      }

      if(true){
        proc.kernel.addProcess(global.AOS_ROOM_DATA_PROCESS, 'roomData-' + room.name, 99, {
          roomName: room.name
        })
      }
    })

    this.kernel.addProcess(AOS_SUSPENSION_PROCESS, 'suspension-master', 99, {master: true})
    this.kernel.addProcess(AOS_FLAG_WATCHER_PROCESS, 'flag-watcher', 98, {})

    this.kernel.loadMemory()
    this.completed = true
  }
}
