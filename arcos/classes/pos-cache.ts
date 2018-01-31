type StructureWithPos = {
  id: string
  pos: RoomPosition
}

export class POSCache{
  constructor(){
    if(!Memory.arcos.posCache){
      Memory.arcos.posCache = {}
    }
  }

  /**
   * Get the RoomPosition for the given id.
   * 
   * If the id is not in the cache POS Cache will try to get it by ID. If it finds the object it will cache it and return it.
   * If it can't find it it will return `false`.
   * 
   * @param id The game ID of the object you want to find.
   */
  get(id: string){
    if(Memory.arcos.posCache[id]){
      return new RoomPosition(
        Memory.arcos.posCache[id].x,
        Memory.arcos.posCache[id].y,
        Memory.arcos.posCache[id].roomName
      )
    }else{
      let obj = Game.getObjectById<StructureWithPos>(id)
      if(obj){
        this.set(obj)

        return obj.pos
      }else{
        return false
      }
    }
  }

  /**
   * Store the supplied objects POS in the cache.
   * 
   * @param object The object (with a POS) that you want to store in the cache.
   */
  set(object: StructureWithPos){
    let pos = {
      x: object.pos.x,
      y: object.pos.y,
      roomName: object.pos.roomName
    }

    Memory.arcos.posCache[object.id] = pos
  }
}