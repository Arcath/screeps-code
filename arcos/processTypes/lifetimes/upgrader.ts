import {LifetimeProcess} from '../../os/process'

export class UpgraderLifetimeProcess extends LifetimeProcess{
  type = AOS_UPGRADER_LIFETIME_PROCESS
  metaData: MetaData[AOS_UPGRADER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      let upgraderLink = this.kernel.data.roomData[creep.room.name].upgraderLink
      let emProcess = this.kernel.getProcess(AOS_ENERGY_MANAGEMENT_PROCESS, 'em-' + creep.room.name)

      if(upgraderLink && emProcess){
        if(upgraderLink.energy < creep.carryCapacity){
          let requests = _.filter(
            emProcess.metaData.linkRequests!,
            function(request: {
              link: string
            }){
              return (request.link === upgraderLink!.id)
            }
          )
          if(
            requests.length === 0
            &&
            (
              creep.room.storage!.store.energy > 50000
              ||
              creep.room.controller!.ticksToDowngrade < (CONTROLLER_DOWNGRADE[creep.room.controller!.level] - 3000)
            )
          ){
            emProcess.metaData.linkRequests!.push({
              link: upgraderLink!.id,
              send: true,
              stage: 0
            })

            return
          }
        }else{
          this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
            target: upgraderLink.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return
        }
      }else{
        let targets = <DeliveryTarget[]>[].concat(
          <never[]>this.kernel.data.roomData[creep.room.name].generalContainers
        )

        if(this.kernel.data.roomData[creep.room.name].storage){
          targets.push(this.kernel.data.roomData[creep.room.name].storage)
        }

        let capacity = creep.carryCapacity

        targets = _.filter(targets, function(target){
          return (target.store.energy > capacity)
        })

        if(targets.length > 0){
          let target = creep.pos.findClosestByPath(targets)

          this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
            target: target.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return
        }
      }
    }

    // If the creep has been refilled
    this.fork(AOS_UPGRADE_PROCESS, 'upgrade-' + creep.name, this.priority - 1, {
      creep: creep.name
    })
  }
}
