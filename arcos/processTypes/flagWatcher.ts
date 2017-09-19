import {ClaimProcess} from './empireActions/claim'
import {HoldRoomProcess} from './empireActions/hold'
import {Process} from '../os/process'

export class FlagWatcherProcess extends Process{
  claimFlag(flag: Flag){
    this.kernel.addProcessIfNotExist(
      ClaimProcess,
      'claim-' + flag.name,
      20,
      {
        targetRoom: flag.pos.roomName,
        flagName: flag.name
      }
    )
  }

  holdFlag(flag: Flag){
    this.kernel.addProcessIfNotExist(
      HoldRoomProcess,
      'hold-' + flag.name,
      20,
      {
        flag: flag.name
      }
    )
  }

  run(){
    this.completed = true

    let proc = this

    _.forEach(Game.flags, function(flag){
      switch(flag.color){
        case COLOR_PURPLE:
          switch(flag.secondaryColor){
            case COLOR_PURPLE:
              proc.holdFlag(flag)
            break
            case COLOR_RED:
              proc.claimFlag(flag)
            break
          }
        break
      }
    })
  }
}
