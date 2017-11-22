import {LifetimeProcess} from '../../os/process'

export class DistroLifetimeProcess extends LifetimeProcess{
  type = AOS_DISTRO_LIFETIME_PROCESS
  metaData: MetaData[AOS_DISTRO_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    let container = <StructureContainer>Game.getObjectById(this.metaData.sourceContainer)
    if(!container){
      this.completed = true
      return
    }

    if(_.sum(creep.carry) === 0){
      this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
        target: this.metaData.sourceContainer,
        creep: creep.name,
        resource: RESOURCE_ENERGY
      })

      return
    }

    // If the creep has been refilled
    let sourceContainer = <Structure>Game.getObjectById(this.metaData.sourceContainer)
    if(sourceContainer.structureType != STRUCTURE_STORAGE && creep.room.storage){
      if(this.kernel.getProcessByName('em-' + creep.room.name).metaData.distroCreeps[creep.room.storage!.id]){
        if(_.sum(creep.room.storage!.store) < creep.room.storage!.storeCapacity){
          this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
            creep: creep.name,
            target: creep.room.storage!.id,
            resource: RESOURCE_ENERGY
          })

          return
        }
      }
    }


    let targets = [].concat(
      <never[]>this.kernel.data.roomData[creep.room.name].spawns,
      <never[]>this.kernel.data.roomData[creep.room.name].extensions
    )

    let deliverTargets = _.filter(targets, function(target: DeliveryTarget){
      return (target.energy < target.energyCapacity)
    })

    if(
      deliverTargets.length === 0
    ){
      let targets = [].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].towers
      )

      deliverTargets = _.filter(targets, function(target: DeliveryTarget){
        return (target.energy < target.energyCapacity - 250)
      })
    }

    if(deliverTargets.length === 0){
      targets = [].concat(
        <never[]>this.kernel.data.roomData[creep.room.name].labs,
        <never[]>this.kernel.data.roomData[creep.room.name].generalContainers
      )

      deliverTargets = _.filter(targets, function(target: DeliveryTarget){
        if(target.store){
          return (_.sum(target.store) < target.storeCapacity)
        }else{
          return (target.energy < target.energyCapacity)
        }
      })
    }

    let target = creep.pos.findClosestByPath(deliverTargets)

    if(target){
      this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority -1, {
        creep: creep.name,
        target: target.id,
        resource: RESOURCE_ENERGY
      })
    }else{
      this.suspend = 10
    }
  }
}
