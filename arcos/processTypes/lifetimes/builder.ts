import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

export class BuilderLifetimeProcess extends LifetimeProcess{
  type = AOS_BUILDER_LIFETIME_PROCESS
  metaData: MetaData[AOS_BUILDER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    if(this.metaData.suicide){
      creep.suicide()
      return
    }

    if(_.sum(creep.carry) === 0){
      let target = Utils.withdrawTarget(creep, this)

      if(target){
        this.fork(AOS_COLLECT_PROCESS, 'collect-' + creep.name, this.priority - 1, {
          creep: creep.name,
          target: target.id,
          resource: RESOURCE_ENERGY
        })

        return
      }else{
        this.suspend = 10
        return
      }
    }

    // If the creep has been refilled
    let sites = this.kernel.data.roomData[creep.room.name].constructionSites

    let towerSites = _.filter(sites, function(site){
      return (site.structureType === STRUCTURE_TOWER)
    })

    let extensionSites = _.filter(sites, function(site){
      return (site.structureType === STRUCTURE_EXTENSION)
    })

    let containerSites = _.filter(sites, function(site){
      return (site.structureType === STRUCTURE_CONTAINER)
    })

    let rampartSites = _.filter(sites, function(site){
      return (site.structureType === STRUCTURE_RAMPART)
    })

    let normalSites = _.filter(sites, function(site){
      return !(
        site.structureType === STRUCTURE_TOWER
        ||
        site.structureType === STRUCTURE_EXTENSION
        ||
        site.structureType === STRUCTURE_RAMPART
        ||
        site.structureType === STRUCTURE_CONTAINER
      )
    })

    let buildNow: ConstructionSite[]
    if(towerSites.length > 0){
      buildNow = towerSites
    }else{
      if(extensionSites.length > 0){
        buildNow = extensionSites
      }else{
        if(containerSites.length > 0){
          buildNow = containerSites
        }else{
          if(rampartSites.length > 0){
            buildNow = rampartSites
          }else{
            buildNow = normalSites
          }
        }
      }
    }

    let target = creep.pos.findClosestByRange(buildNow)

    if(target){
      this.fork(AOS_BUILD_PROCESS, 'build-' + creep.name, this.priority - 1, {
        creep: creep.name,
        site: target.id
      })

      return
    }else{
      if(creep.carry.energy > 0){
        let target
        if(creep.room.storage){
          target = creep.room.storage
        }else{
          if(this.kernel.data.roomData[creep.room.name].generalContainers[0]){
            target = this.kernel.data.roomData[creep.room.name].generalContainers[0]
          }else{
            target = this.kernel.data.roomData[creep.room.name].spawns[0]
          }
        }

        if(target){
          this.metaData.suicide = true
          this.fork(AOS_DELIVER_PROCESS, 'deliver-' + creep.name, this.priority - 1, {
            creep: creep.name,
            target: target.id,
            resource: RESOURCE_ENERGY
          })

          return
        }
      }
    }
  }
}
