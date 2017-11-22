interface RoomPathFinderEntry{
  name: string
  distanceToTarget: number
  distanceFromStart: number
  score: number
  path: string[]
}

const MAX_PATHFINDER_CPU = 30

export class RoomPathFinder{
  usedRooms: string[] = []
  openRooms: RoomPathFinderEntry[] = []
  currentRoom: RoomPathFinderEntry
  targetRoom: string
  startRoom: string
  maxBound: number
  startCPU: number

  constructor(sourceRoom: string, targetRoom: string){
    this.startCPU = Game.cpu.getUsed()
    this.currentRoom = {
      name: sourceRoom,
      distanceToTarget: Game.map.getRoomLinearDistance(sourceRoom, targetRoom),
      distanceFromStart: 0,
      score: Game.map.getRoomLinearDistance(sourceRoom, targetRoom),
      path: [sourceRoom]
    }
    this.targetRoom = targetRoom
    this.startRoom = sourceRoom

    this.maxBound = (Game.map.getWorldSize() / 2) + 1

    this.step()
  }

  step(){
    if(Game.cpu.getUsed() - this.startCPU > MAX_PATHFINDER_CPU){
      return
    }

    if(this.currentRoom.name != this.targetRoom){
      let pathFinder = this
      let roomNames = <string[]>_.values(Game.map.describeExits(this.currentRoom.name))

      _.forEach(roomNames, function(roomName){
        let distanceToTarget = Game.map.getRoomLinearDistance(roomName, pathFinder.targetRoom)
        let distanceFromStart = Game.map.getRoomLinearDistance(roomName, pathFinder.startRoom)
        let coords = pathFinder.roomNameToXY(roomName)

        if(!_.include(pathFinder.usedRooms, roomName) && pathFinder.inBounds(coords)){
          pathFinder.openRooms.push({
            name: roomName,
            distanceToTarget: distanceToTarget,
            distanceFromStart: distanceFromStart,
            score: (distanceFromStart + distanceToTarget),
            path: [].concat(<never[]>pathFinder.currentRoom.path, <never[]>[roomName])
          })
        }
      })

      let minScore = _.min(this.openRooms, 'score').score
      this.openRooms = _.sortBy(this.openRooms, function(room){
        if(room.score === minScore){
          return 100 - room.path.length
        }else{
          return 0
        }
      })

      this.usedRooms.push(this.currentRoom.name)
      this.currentRoom = this.openRooms.pop()!

      this.step()
    }
  }

  results(){
    if(Game.cpu.getUsed() - this.startCPU > MAX_PATHFINDER_CPU){
      return {
        length: Game.map.getRoomLinearDistance(this.startRoom, this.targetRoom),
        details: []
      }
    }else{
      return {
        length: this.currentRoom.path.length,
        details: this.currentRoom.path
      }
    }
  }

  roomNameToXY = function(name: string){
    name = name.toUpperCase()
    let match = name.match(/^(\w)(\d+)(\w)(\d+)$/);
    if(!match) {
      return [0, 0]
    }
    let [,hor,x,ver,y] = <[string, string, number, string, number]>match

    if(hor == 'W'){
      x = -x-1
    }else{
      x = +x
    }
    if(ver == 'N'){
      y = -y-1
    }else{
      y = +y
    }

    return [x,y]
  }

  inBounds(coords: number[]){
    return (
      coords[0] < this.maxBound
      &&
      coords[0] > (0 - this.maxBound)
      &&
      coords[1] < this.maxBound
      &&
      coords[1] > (0 - this.maxBound)
    )
  }
}
