import {LifetimeProcess} from '../../os/process'

import {DeliverProcess} from '../creepActions/deliver'
import {HarvestProcess} from '../creepActions/harvest'
import {UpgradeProcess} from '../creepActions/upgrade'

export class HarvesterLifetimeProcess extends LifetimeProcess{
  type = 'hlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
        source: this.metaData.source,
        creep: creep.name
      })

      return
    }

    // Creep has been harvesting and has energy in it
    if(this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]){
      let container = this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]

      if(_.sum(container.store) < container.storeCapacity){
        this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
          target: container.id,
          creep: creep.name,
          resource: RESOURCE_ENERGY
        })

        return
      }
    }

    // Source Container does not exist OR source container is full
    let deliverTargets

    let targets = [].concat(
      <never[]>this.kernel.data.roomData[creep.room.name].spawns,
      <never[]>this.kernel.data.roomData[creep.room.name].extensions
    )

    deliverTargets = _.filter(targets, function(target: DeliveryTarget){
      return (target.energy < target.energyCapacity)
    })

    if(creep.room.storage && deliverTargets.length === 0){
      let targets = [].concat(
        <never[]>[creep.room.storage]
      )

      deliverTargets = _.filter(targets, function(target: DeliveryTarget){
        return (_.sum(target.store) < target.storeCapacity)
      })
    }

    if(deliverTargets.length === 0){
      // If there is no where to deliver to
      this.kernel.addProcess(UpgradeProcess, creep.name + '-upgrade', this.priority, {
        creep: creep.name
      })

      this.suspend = creep.name + '-upgrade'
      return
    }

    // Find the nearest target
    let target = <Structure>creep.pos.findClosestByPath(deliverTargets)

    this.fork(DeliverProcess, creep.name + '-deliver', this.priority, {
      creep: creep.name,
      target: target.id,
      resource: RESOURCE_ENERGY
    })
  }
}
