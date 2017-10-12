import {Process} from '../../os/process'
import {RangerLifetimeProcess} from '../lifetimes/ranger'
import {Utils} from '../../lib/utils'

export class RangerManagementProcess extends Process{
  type = 'rangerManagement'

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
        this.kernel.addProcess(RangerLifetimeProcess, creepName + '-lifetime', this.priority - 1, {
          creep: creepName,
          flag: this.metaData.flag
        })
      }
    }
  }
}
