import {LifetimeProcess} from '../../os/process'

import {CollectProcess} from '../creepActions/collect'
import {DeliverProcess} from '../creepActions/deliver'

export class DistroLifetimeProcess extends LifetimeProcess{
  type = 'dlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      this.kernel.addProcess(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
        target: this.metaData.sourceContainer,
        creep: creep.name,
        resource: RESOURCE_ENERGY
      })

      this.suspend = 'collect-' + creep.name

      return
    }

    // If the creep has been refilled
    let targets = [].concat(
      <never[]>this.kernel.data.roomData[creep.room.name].spawns,
      <never[]>this.kernel.data.roomData[creep.room.name].extensions,
      <never[]>this.kernel.data.roomData[creep.room.name].towers
    )

    let deliverTargets = _.filter(targets, function(target: DeliveryTarget){
      return (target.energy < target.energyCapacity)
    })

    if(deliverTargets.length === 0){
      targets = [].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].generalContainers
      )

      deliverTargets = _.filter(targets, function(target: DeliveryTarget){
        return (_.sum(target.store) < target.storeCapacity)
      })
    }

    let target = creep.pos.findClosestByPath(deliverTargets)

    if(target){
      this.kernel.addProcess(DeliverProcess, 'deliver-' + creep.name, this.priority -1, {
        creep: creep.name,
        target: target.id,
        resource: RESOURCE_ENERGY
      })

      this.suspend = 'deliver-' + creep.name
    }else{
      this.suspend = 20
    }
  }
}
