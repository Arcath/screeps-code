import {Process} from '../../os/process'

export class HoldProcess extends Process{
  type = AOS_HOLD_PROCESS
  metaData: MetaData[AOS_HOLD_PROCESS]

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let flag = Game.flags[this.metaData.flag]

    if(!creep || !flag){
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

    if(!creep.pos.isNearTo(flag.pos)){
      this.fork(AOS_MOVE_PROCESS, 'move-' + creep.name, 30, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      })
      return
    }else{
      let signText = 'ArcOS Reserved Room https://arcath.net/category/screeps'
      if((creep.room.controller!.reservation && creep.room.controller!.reservation!.ticksToEnd > 100) && (!creep.room.controller!.sign || creep.room.controller!.sign!.text !== signText)){
        creep.signController(creep.room.controller!, signText)
      }else{
        creep.reserveController(creep.room.controller!)
      }
    }
  }
}
