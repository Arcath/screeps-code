import {LifetimeProcess} from '../../os/process'
import {Utils} from '../../lib/utils'

export class RangerLifetimeProcess extends LifetimeProcess{
  type = AOS_RANGER_LIFETIME_PROCESS
  metaData: MetaData[AOS_RANGER_LIFETIME_PROCESS]

  run(){
    let creep = this.getCreep()

    if(!creep){ return }

    let flag = Game.flags[this.metaData.flag]

    if(!flag){
      this.completed = true

      return
    }

    let hostiles = Utils.filterHostileCreeps(creep.room.find(FIND_HOSTILE_CREEPS))

    if(!this.metaData.rangedBoosted && creep.room.controller && creep.room.controller.my && hostiles.length > 0){
      if(this.kernel.hasProcess('labs-' + creep.room.name)){
        let proc = this.kernel.getProcessByName('labs-' + creep.room.name)

        if(proc.metaData.boosts[RESOURCE_CATALYZED_KEANIUM_ALKALIDE]){
          this.fork(AOS_BOOST_PROCESS, 'boost-' + creep.name, this.priority - 1, {
            creep: creep.name,
            lab: proc.metaData.boosts[RESOURCE_CATALYZED_KEANIUM_ALKALIDE]
          })

          this.metaData.rangedBoosted = true
        }
      }
    }

    if(creep.room.name != flag.pos.roomName && hostiles.length === 0){
      this.fork(AOS_MOVE_PROCESS, 'move-' + creep.name, this.priority - 1, {
        creep: creep.name,
        pos: {
          x: flag.pos.x,
          y: flag.pos.y,
          roomName: flag.pos.roomName
        },
        range: 1
      })

      return
    }


    if(hostiles.length > 0){
      let nearestHostile = <Creep>creep.pos.findClosestByRange(hostiles)

      if(creep.pos.findInRange(hostiles, 3).length > 1){
        creep.rangedMassAttack()
      }else{
        if(creep.rangedAttack(nearestHostile) === ERR_NOT_IN_RANGE){
          creep.moveTo(nearestHostile)
        }
      }
    }else{
      if(!creep.pos.inRangeTo(flag.pos, 2)){
        creep.moveTo(flag)
      }
    }

    if(creep.hits < creep.hitsMax){
      creep.heal(creep)
    }
  }
}
