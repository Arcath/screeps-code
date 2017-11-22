import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class HoldRoomProcess extends Process{
  type = AOS_HOLD_ROOM_PROCESS
  metaData: MetaData[AOS_HOLD_ROOM_PROCESS]

  run(){
    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true
      return
    }

    let creep = Game.creeps[this.metaData.creep!]

    if(!creep){
      // Spawn a new Creep
      let spawned = Utils.spawn(
        this.kernel,
        Utils.nearestRoom(flag.pos.roomName, 1300),
        'hold',
        'h-' + flag.pos.roomName + '-' + Game.time,
        {}
      )

      if(spawned){
        this.metaData.creep = 'h-' + flag.pos.roomName + '-' + Game.time
      }
    }else{
      // Use the existing creep
      this.fork(AOS_HOLD_PROCESS, 'hold-' + creep.name, 30, {
        flag: flag.name,
        creep: creep.name
      })
    }
  }
}
