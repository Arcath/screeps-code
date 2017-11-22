import {Process} from '../../os/process'
import {Utils} from '../../lib/utils'

export class TowerDefenseProcess extends Process{
  type = AOS_TOWER_DEFENSE_PROCESS
  metaData: MetaData[AOS_TOWER_DEFENSE_PROCESS]

  run(){
    let room = Game.rooms[this.metaData.roomName]

    if(!room){
      this.completed = true
      return
    }

    let enemies = Utils.filterHostileCreeps(<Creep[]>room.find(FIND_HOSTILE_CREEPS))

    if(enemies.length > 0){
      _.forEach(this.kernel.data.roomData[this.metaData.roomName].towers, function(tower){
        let enemy = tower.pos.findClosestByRange(enemies)

        tower.attack(enemy)
      })

      if(!this.metaData.runTime){
        this.metaData.runTime = 0
      }else{
        this.metaData.runTime += 1
      }

      if(this.metaData.runTime > 30){
        if(Memory.bunkers[this.metaData.roomName].bunkerBase){
          let bunkerBase = Memory.bunkers[this.metaData.roomName].bunkerBase
          let pos = new RoomPosition(bunkerBase.x, bunkerBase.y, this.metaData.roomName)

          pos.createFlag('defend-' + this.metaData.roomName + '.2')
        }
      }
    }else{
      this.completed = true
    }
  }
}
