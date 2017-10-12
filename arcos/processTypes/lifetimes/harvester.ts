import {LifetimeProcess} from '../../os/process'

import {BuildProcess} from '../creepActions/build'
import {CollectProcess} from '../creepActions/collect'
import {DeliverProcess} from '../creepActions/deliver'
import {HarvestProcess} from '../creepActions/harvest'
import {UpgradeProcess} from '../creepActions/upgrade'

export class HarvesterLifetimeProcess extends LifetimeProcess{
  type = 'hlf'

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(_.sum(creep.carry) === 0){
      if(this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]){
        let container = this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]

        let link = <StructureLink>container.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: function(structure: Structure){
            return (structure.structureType === STRUCTURE_LINK)
          }
        })[0]

        if(link){
          if(container.store.energy > creep.carryCapacity){
            this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
              creep: creep.name,
              resource: RESOURCE_ENERGY,
              target: container.id
            })

            return
          }
        }
      }

      this.fork(HarvestProcess, 'harvest-' + creep.name, this.priority - 1, {
        source: this.metaData.source,
        creep: creep.name
      })

      return
    }

    // Creep has been harvesting and has energy in it
    let source = <Source>Game.getObjectById(this.metaData.source)
    let constructionSites = <ConstructionSite[]>source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1)
    if(constructionSites.length > 0){
      this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
        creep: creep.name,
        site: constructionSites[0].id
      })

      return
    }

    if(this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]){
      let container = this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]

      let link = <StructureLink>container.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: function(structure: Structure){
          return (structure.structureType === STRUCTURE_LINK)
        }
      })[0]

      if(link){
        if(link.energy < link.energyCapacity){
          this.fork(DeliverProcess, 'deliver-' + creep.name, this.priority - 1, {
            target: link.id,
            creep: creep.name,
            resource: RESOURCE_ENERGY
          })

          return
        }else{
          let requests = _.filter(
            this.kernel.getProcessByName('em-' + creep.room.name).metaData.linkRequests,
            function(request: {
              link: string
            }){
              return (request.link === link.id)
            }
          )
          if(requests.length === 0){
            this.kernel.getProcessByName('em-' + creep.room.name).metaData.linkRequests.push({
              link: link.id,
              send: false,
              stage: 0
            })

            return
          }
        }
      }

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

    if(
      deliverTargets.length === 0
      ||
      (
        this.kernel.data.roomData[creep.room.name].generalContainers.length === 0
        &&
        !creep.room.storage
        &&
        this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source]
        &&
        this.kernel.getProcessByName('em-' + creep.room.name).metaData.distroCreeps[this.kernel.data.roomData[creep.room.name].sourceContainerMaps[this.metaData.source].id]
      )
    ){
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
