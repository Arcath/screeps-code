import {isMyRoom} from '@open-screeps/is-my-room'

import {Colony} from './colony'

export class Empire{
  private colonies: {[coreRoomName: string]: Colony} = {}

  constructor(){
    // Ensure that the colonies data exists in Memory
    if(!Memory.arcos.colonies){
      Memory.arcos.colonies = {}
    }

    let myRooms = _.filter(Game.rooms, isMyRoom)

    myRooms.forEach((room) => {
      this.colonies[room.name] = new Colony(room.name, this)
    })
  }

  /**
   * Is there a colony centered on this room name
   * @param coreRoomName The core room for the colony
   */
  hasColony(coreRoomName: string){
    return !!this.colonies[coreRoomName]
  }

  /**
   * Returns the `Colony` for the given room.
   * 
   * If the room is not in a colony it will return false
   * 
   * @param roomName The core room for the colony
   */
  getColony(roomName: string): false | Colony{
    let colony: boolean | Colony = false

    Object.keys(this.colonies).forEach((coreRoomName) => {
      if(this.colonies[coreRoomName].hasRoom(roomName)){
        colony = this.colonies[coreRoomName]
      }
    })

    return colony
  }
}