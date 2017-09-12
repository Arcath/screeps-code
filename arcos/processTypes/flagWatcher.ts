import {ClaimProcess} from './creepActions/claim'
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

  run(){
    this.completed = true

    let proc = this

    _.forEach(Game.flags, function(flag){
      switch(flag.color){
        case COLOR_PURPLE:
          proc.claimFlag(flag)
        break
      }
    })
  }
}
