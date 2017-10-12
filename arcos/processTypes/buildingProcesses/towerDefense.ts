import {Process} from '../../os/process'

export class TowerDefenseProcess extends Process{
  type = 'td'

  run(){
    let room = Game.rooms[this.metaData.roomName]

    if(!room){
      this.completed = true
      return
    }

    let enemies = <Creep[]>room.find(FIND_HOSTILE_CREEPS)

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
    }else{
      this.completed = true
    }
  }
}
