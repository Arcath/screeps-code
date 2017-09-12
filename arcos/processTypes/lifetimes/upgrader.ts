import {LifetimeProcess} from '../../os/process'

import {CollectProcess} from '../creepActions/collect'
import {UpgradeProcess} from '../creepActions/upgrade'

export class UpgraderLifetimeProcess extends LifetimeProcess{
  type = 'ulf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      let targets = <DeliveryTarget[]>[].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].generalContainers
      )

      let capacity = creep.carryCapacity

      targets = _.filter(targets, function(target){
        return (target.store.energy > capacity)
      })

      if(targets.length > 0){
        let target = creep.pos.findClosestByPath(targets)

        this.kernel.addProcess(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
          target: target.id,
          creep: creep.name,
          resource: RESOURCE_ENERGY
        })

        this.suspend = 'collect-' + creep.name

        return
      }
    }

    // If the creep has been refilled
    this.kernel.addProcess(UpgradeProcess, 'upgrade-' + creep.name, this.priority - 1, {
      creep: creep.name
    })

    this.suspend = 'upgrade-' + creep.name
  }
}
