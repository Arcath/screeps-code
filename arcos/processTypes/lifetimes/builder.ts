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
        this.fork(CollectProcess, 'collect-' + creep.name, this.priority - 1, {
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
      this.fork(BuildProcess, 'build-' + creep.name, this.priority - 1, {
        creep: creep.name,
        site: target.id
      })

      return
    }else{
      creep.say('spare')
    }
  }
}
