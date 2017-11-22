import {Process} from '../../os/process'
import {Bunker} from '../../lib/classes/bunker'

export class RoomLayoutProcess extends Process{
  type = AOS_ROOM_LAYOUT_PROCESS
  metaData: MetaData[AOS_ROOM_LAYOUT_PROCESS]

  run(){
    let room = Game.rooms[this.metaData.roomName]

    if(!room){
      this.completed = true
      return
    }

    let bunker: Bunker

    if(!Memory.bunkers){
      Memory.bunkers = {}
    }

    if(!Memory.bunkers[this.metaData.roomName]){
      Memory.bunkers[this.metaData.roomName] = {}
    }

    if(Memory.bunkers[this.metaData.roomName].bunkerBase){
      if(!Memory.bunkers[this.metaData.roomName].bunkerBase.roomName){
        room.memory.bunkerBase.roomName = this.metaData.roomName
      }

      bunker = new Bunker(Memory.bunkers[this.metaData.roomName].bunkerBase)
      if(Game.time % 20 === 0){
        bunker.build(room)
      }
    }else{
      if(Game.flags[room.name + 'Bunker']){
        if(this.validateBase(Game.flags[room.name + 'Bunker'].pos, room)){
          bunker = new Bunker(Game.flags[room.name + 'Bunker'].pos)
          Memory.bunkers[this.metaData.roomName].bunkerBase = {
            x: Game.flags[room.name + 'Bunker'].pos.x,
            y: Game.flags[room.name + 'Bunker'].pos.y,
            roomName: Game.flags[room.name + 'Bunker'].pos.roomName
          }
          Game.flags[room.name + 'Bunker'].remove()
        }
      }
    }
  }

  validateBase(pos: RoomPosition, room: Room){
    let size = 6

    let area = <LookAtResultWithPos[]>room.lookForAtArea(
      LOOK_TERRAIN,
      pos.y - size,
      pos.x - size,
      pos.y + size,
      pos.x + size,
      true
    )

    let valid = true
    //let proc = this

    _.forEach(area, function(tile){
      if(!(tile.type === 'terrain') && !(tile.terrain === 'plain')){
        valid = false
      }
    })

    return valid
  }

  generateBase(room: Room){
    let size = 6

    let minX = 2 + size
    let maxX = 48 - size
    let minY = 2 + size
    let maxY = 48 - size

    let potentials = []

    let iX = minX
    while(iX < maxX){
      let iY = minY
      while(iY < maxY){
        let area = <LookAtResultWithPos[]>room.lookForAtArea(
          LOOK_TERRAIN,
          iY - size,
          iX - size,
          iY + size,
          iX + size,
          true
        )

        if(area.length === 0){
          potentials.push({
            x: iX,
            y: iY
          })
        }

        iY ++
      }
      iX ++
    }

    this.log(JSON.stringify(potentials))
    //return new RoomPosition(x, y, this.metaData.roomName)
  }
}
