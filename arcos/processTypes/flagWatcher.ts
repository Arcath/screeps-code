import {ClaimProcess} from './empireActions/claim'
import {HoldRoomProcess} from './empireActions/hold'
import {Process} from '../os/process'
import {RemoteMiningManagementProcess} from './management/remoteMining'

export class FlagWatcherProcess extends Process{
  type = "flagWatcher"

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

  remoteMiningFlag(flag: Flag){
    this.kernel.addProcessIfNotExist(
      RemoteMiningManagementProcess,
      'rmmp-' + flag.name,
      40,
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
        case COLOR_YELLOW:
          proc.remoteMiningFlag(flag)
        break
      }
    })
  }
}
