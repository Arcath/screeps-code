import {MoveProcess} from './move'
import {Process} from '../../os/process'

export class HoldProcess extends Process{
  type = 'hold'

  run(){
    let creep = Game.creeps[this.metaData.creep]
    let flag = Game.flags[this.metaData.flag]

    if(!creep || !flag){
      this.completed = true
      return
    }

    if(!creep.pos.isNearTo(flag.pos)){
      this.fork(MoveProcess, 'move-' + creep.name, 30, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      })
      return
    }else{
      creep.reserveController(creep.room.controller!)
    }
  }
}
