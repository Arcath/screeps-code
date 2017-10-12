import {LifetimeProcess} from '../../os/process'

import {DeliverProcess} from '../creepActions/deliver'
import {HarvestProcess} from '../creepActions/harvest'
import {MoveProcess} from '../creepActions/move'

export class RemoteMinerLifetimeProcess extends LifetimeProcess{
  type = 'rmlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true
      return
    }

    if(creep.room.name === flag.pos.roomName){
      if(creep.room.find(FIND_HOSTILE_CREEPS).length > 0){
        if(!Memory.remoteRoomStatus){
          Memory.remoteRoomStatus = {}
        }

        Memory.remoteRoomStatus[creep.room.name] = false
      }else{
        if(!Memory.remoteRoomStatus){
          Memory.remoteRoomStatus = {}
        }
        
        Memory.remoteRoomStatus[creep.room.name] = true
      }
    }

    if(_.sum(creep.carry) === 0){
      if(!creep.pos.isNearTo(flag)){
        this.fork(MoveProcess, 'move-' + creep.name, this.priority - 1, {
          creep: creep.name,
          pos: {
            x: flag.pos.x,
            y: flag.pos.y,
            roomName: flag.pos.roomName
          },
          range: 1
        })
      }

      this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
        creep: creep.name,
        source: flag.memory.source
      })

      return
    }

    if(Game.rooms[this.metaData.deliverRoom].storage){
      this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: Game.rooms[this.metaData.deliverRoom].storage!.id,
        resource: RESOURCE_ENERGY
      })
    }
  }
}
