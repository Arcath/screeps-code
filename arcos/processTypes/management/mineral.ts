import {Process} from '../../os/process'

import {Utils} from '../../lib/utils'

import {MineralharvesterLifetimeProcess} from '../lifetimes/mineralHarvester'

export class MineralManagementProcess extends Process{
  type = 'mineralManagement'

  run(){
    if(this.roomData().mineral && this.roomData().extractor){
      if(this.roomData().mineral!.mineralAmount > 0){
        let creep = Game.creeps[this.metaData.creep]

        if(!creep){
          let spawned = Utils.spawn(
            this.kernel,
            this.metaData.roomName,
            'worker',
            'min-' + this.metaData.roomName + '-' + Game.time,
            {}
          )

          if(spawned){
            this.metaData.creep = 'min-' + this.metaData.roomName + '-' + Game.time
          }
        }else{
          this.fork(MineralharvesterLifetimeProcess, 'mhlf-' + creep.name, 20, {
            creep: creep.name,
            extractor: this.roomData().extractor!.id,
            mineral: this.roomData().mineral!.id
          })
        }
      }else{
        this.log('no minerals, completing')
        this.completed = true
      }
    }else{
      this.suspend = 200
    }
  }
}
