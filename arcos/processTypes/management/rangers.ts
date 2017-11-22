import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class RangerManagementProcess extends Process{
  type = AOS_RANGER_MANAGEMENT_PROCESS
  metaData: MetaData[AOS_RANGER_MANAGEMENT_PROCESS]

  run(){
    this.metaData.rangers = Utils.clearDeadCreeps(this.metaData.rangers)

    if(!this.flag()){
      this.completed = true
      return
    }

    let count = this.metaData.rangers.length
    let counted = _.filter(this.metaData.rangers, function(creepName: string){
      let creep = Game.creeps[creepName]

      return (creep.ticksToLive > 300)
    }).length

    if(_.min([count, counted]) < this.metaData.count){
      let creepName = 'ranger-' + Game.time

      let spawned = Utils.spawn(
        this.kernel,
        Utils.nearestRoom(this.flag().pos.roomName, 1300),
        'ranger',
        creepName,
        {}
      )

      if(spawned){
        this.metaData.rangers.push(creepName)
        this.kernel.addProcess(AOS_RANGER_LIFETIME_PROCESS, creepName + '-lifetime', this.priority - 1, {
          creep: creepName,
          flag: this.metaData.flag
        })
      }
    }
  }
}
