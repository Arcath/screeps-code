interface RoomPathFinderEntry{
  name: string
  distanceToTarget: number
  distanceFromStart: number
  score: number
  path: string[]
}

export class RoomPathFinder{
  usedRooms: string[] = []
  openRooms: RoomPathFinderEntry[] = []
  currentRoom: RoomPathFinderEntry
  targetRoom: string
  startRoom: string

  constructor(sourceRoom: string, targetRoom: string){
    this.currentRoom = {
      name: sourceRoom,
      distanceToTarget: Game.map.getRoomLinearDistance(sourceRoom, targetRoom),
      distanceFromStart: 0,
      score: Game.map.getRoomLinearDistance(sourceRoom, targetRoom),
      path: [sourceRoom]
    }
    this.targetRoom = targetRoom
    this.startRoom = sourceRoom

    this.step()
  }

  step(){
    if(this.currentRoom.name != this.targetRoom){
      let pathFinder = this
      let roomNames = <string[]>_.values(Game.map.describeExits(this.currentRoom.name))

      _.forEach(roomNames, function(roomName){
        let distanceToTarget = Game.map.getRoomLinearDistance(roomName, pathFinder.targetRoom)
        let distanceFromStart = Game.map.getRoomLinearDistance(roomName, pathFinder.startRoom)

        if(!_.include(pathFinder.usedRooms, roomName)){
          pathFinder.openRooms.push({
            name: roomName,
            distanceToTarget: distanceToTarget,
            distanceFromStart: distanceFromStart,
            score: (distanceFromStart + distanceToTarget),
            path: [].concat(<never[]>pathFinder.currentRoom.path, <never[]>[roomName])
          })
        }
      })

      this.openRooms = _.sortBy(this.openRooms, 'score').reverse()

      this.currentRoom = this.openRooms.pop()!
      this.usedRooms.push(this.currentRoom.name)

      this.step()
    }
  }

  results(){
    return {
      length: this.currentRoom.path.length,
      details: this.currentRoom.path
    }
  }
}
