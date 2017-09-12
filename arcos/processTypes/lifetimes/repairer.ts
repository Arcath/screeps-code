import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

import {CollectProcess} from '../creepActions/collect'
import {RepairProcess} from '../creepActions/repair'

export class RepairerLifetimeProcess extends LifetimeProcess{
  type = 'rlf'

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
    let repairableObjects = <StructureRoad[]>[].concat(
      <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
      <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
    )

    let shortestDecay = 100

    let repairTargets = _.filter(repairableObjects, function(object){
      if(object.ticksToDecay < shortestDecay){ shortestDecay = object.ticksToDecay }

      return (object.hits < object.hitsMax)
    })

    if(repairTargets.length > 0){
      let target = creep.pos.findClosestByPath(repairTargets)

      this.kernel.addProcess(RepairProcess, 'repair-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: target.id
      })
      this.suspend = 'repair-' + creep.name
    }else{
      this.suspend = shortestDecay
      return
    }
  }
}
