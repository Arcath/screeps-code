import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'


export class RepairerLifetimeProcess extends LifetimeProcess{
  type = AOS_REPAIRER_LIFETIME_PROCESS
  metaData: MetaData[AOS_REPAIRER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

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
    let repairableObjects = <RepairTarget[]>[].concat(
      <never[]>this.kernel.data.roomData[this.metaData.roomName].containers,
      <never[]>this.roomData().ramparts
    )

    let shortestDecay = 100

    let proc = this

    let repairTargets = _.filter(repairableObjects, function(object){
      if(object.ticksToDecay < shortestDecay){ shortestDecay = object.ticksToDecay }

      if(object.structureType != STRUCTURE_RAMPART){
        return (object.hits < object.hitsMax)
      }else{
        return (object.hits < Utils.rampartHealth(proc.kernel, proc.metaData.roomName))
      }
    })

    if(repairTargets.length === 0){
      let repairableObjects = <RepairTarget[]>[].concat(
        <never[]>this.kernel.data.roomData[this.metaData.roomName].roads
      )

      let shortestDecay = 100

      repairTargets = _.filter(repairableObjects, function(object){
        if(object.ticksToDecay < shortestDecay){ shortestDecay = object.ticksToDecay }

        if(object.structureType != STRUCTURE_RAMPART){
          return (object.hits < object.hitsMax)
        }else{
          return (object.hits < Utils.rampartHealth(proc.kernel, proc.metaData.roomName))
        }
      })
    }

    if(repairTargets.length > 0){
      //let target = creep.pos.findClosestByPath(repairTargets)

      let sorted = _.sortBy(repairTargets, 'hits')
      let target = sorted[0]

      this.fork(AOS_REPAIR_PROCESS, 'repair-' + creep.name, this.priority - 1, {
        creep: creep.name,
        target: target.id
      })
    }else{
      this.suspend = shortestDecay
      return
    }
  }
}
