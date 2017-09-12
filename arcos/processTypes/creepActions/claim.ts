import {Process} from '../../os/process'
import {MoveProcess} from './move'
//import {Utils} from '../lib/utils'

interface ClaimProcessMetaData{
  creep: string
  targetRoom: string
  flagName: string
}

export class ClaimProcess extends Process{
  metaData: ClaimProcessMetaData
  type = 'claim'

  run(){
    let creep = Game.creeps[this.metaData.creep]

    let flag = Game.flags[this.metaData.flagName]


    if(!flag){
      this.completed = true

      return
    }

    if(!creep){
      /*let creepName = 'claim-' + this.metaData.targetRoom + '-' + Game.time
      let spawned = Utils.spawn(
        this.kernel,
        '',
        'claimer',
        creepName,
        {}
      )

      if(spawned){
        this.metaData.creep = creepName
      }*/

      return
    }

    let room = Game.rooms[this.metaData.targetRoom]

    if(!room){
      this.kernel.addProcess(MoveProcess, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: flag.pos,
        range: 1
      })

      this.suspend = 'move-' + creep.name
    }else{
      creep.say('claim?')
    }
  }
}
