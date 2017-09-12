import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

import {CollectProcess} from '../creepActions/collect'
import {BuildProcess} from '../creepActions/build'

export class BuilderLifetimeProcess extends LifetimeProcess{
  type = 'blf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      let target = Utils.withdrawTarget(creep, this)

      if(target){
        this.kernel.addProcess(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: target.id,
          resource: RESOURCE_ENERGY
        })

        this.suspend = 'collect-' + creep.name
        return
      }else{
        this.suspend = 10
        return
      }
    }

    // If the creep has been refilled
    let target = creep.pos.findClosestByRange(this.kernel.data.roomData[creep.room.name].constructionSites)

    if(target){
      this.kernel.addProcess(BuildProcess, 'build-' + creep.name, this.priority - 1, {
        creep: creep.name,
        site: target.id
      })

      this.suspend = 'build-' + creep.name
      return
    }else{
      creep.say('spare')
    }
  }
}
