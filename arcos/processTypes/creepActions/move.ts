import {Process} from '../../os/process'
import {RoomPathFinder} from '../../lib/roomPathFinder'

export class MoveProcess extends Process{
  metaData: MetaData[AOS_MOVE_PROCESS]
  type = AOS_MOVE_PROCESS

  run(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep || !this.metaData.pos){
      this.completed = true
      this.resumeParent()
      return
    }

    /*let triggers = _.filter(creep.body, function(part){
      return (part.type === HEAL || part.type === RANGED_ATTACK || part.type === ATTACK)
    })

    if(triggers.length > 0){*/
      if(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0){
        this.completed = true
        this.resumeParent()
        return
      }
    //}

    this.oldRun()
  }

  newRun(){
    let creep = Game.creeps[this.metaData.creep]

    // If the creep does not exist, or the POS is not defined end the process
    if(!creep || !this.metaData.pos){
      this.completed = true
      this.resumeParent()
      return
    }

    // Get the target pos
    let target = new RoomPosition(this.metaData.pos.x, this.metaData.pos.y, this.metaData.pos.roomName)

    // If the creep has arrived end the process
    if(creep.pos.inRangeTo(target, this.metaData.range)){
      this.completed = true
      this.resumeParent()
      return
    }

    if(creep.fatigue === 0){
      // If the creep is able to move
      this.move(creep, target)
    }else{
      // The creep is fatigued and the process can suspend
      let decreasePerTick = 0
      _.forEach(creep.body, function(part){
        if(part.type === MOVE){
          decreasePerTick += 2
        }
      })

      let ticks = Math.ceil(creep.fatigue / decreasePerTick)

      this.suspend = ticks
    }
  }

  move(creep: Creep, target: RoomPosition){
    let path: string
    let stuck = this.isStuck(creep)
    let newPath = false

    if(!this.metaData.path && !stuck){
      this.log('generating path because "' + JSON.stringify(this.metaData.path)+ '" is falsey and stuck is ' + stuck)
      path = this.generatePath(creep.pos, target, true)
      newPath = true
    }else{
      if(stuck){
        this.log('generating path because there is one but the creep is stuck')
        path = this.generatePath(creep.pos, target, false)
        newPath = true
      }else{
        path = this.metaData.path!
      }
    }

    this.drawPath(creep, path)

    if(this.metaData.stuck === 0){
      this.log('shortening path because stuck is ' + this.metaData.stuck)
      this.metaData.path = path.substr(1)
    }else if(newPath){
      this.metaData.path = path
    }

    this.metaData.lastPos = [creep.pos.x, creep.pos.y, creep.pos.roomName]

    let nextDirection = <DirectionConstant>parseInt(path.substr(0,1))
    creep.move(nextDirection)
  }

  drawPath(creep: Creep, pathString: string){
    let lastPos = creep.pos

    let path = pathString.split('')
    _.forEach(path, function(direction){
      let x = lastPos.x
      let y = lastPos.y

      switch(parseInt(direction)){
        case TOP_RIGHT:
          y --
          x ++
        break
        case TOP_LEFT:
          y --
          x --
        break
        case TOP:
          y --
        break
        case LEFT:
          x --
        break
        case BOTTOM_LEFT:
          y ++
          x --
        break
        case BOTTOM:
          y ++
        break
        case BOTTOM_RIGHT:
          y ++
          x ++
        break
        case RIGHT:
          x ++
        break
      }

      let pos = new RoomPosition(x, y, lastPos.roomName)

      new RoomVisual(pos.roomName)
        .line(pos, lastPos, {color: '#f00', lineStyle: 'dashed'})

      lastPos = pos
    })
  }

  /** Is POS1 the same as POS2 */
  samePos(pos1: RoomPosition, pos2: RoomPosition){
    return this.sameCoord(pos1, pos2) && pos1.roomName === pos2.roomName
  }

  /** Is POS1 x/y the same as POS2 x/y */
  sameCoord(pos1: RoomPosition, pos2: RoomPosition){
    return pos1.x === pos2.x && pos1.y === pos2.y
  }

  /** Take a serialised POS and infalte it */
  inflatePos(posData: [number, number, string]){
    return new RoomPosition(posData[0], posData[1], posData[2])
  }

  /** serialise a POS for storage */
  deflatePos(pos: RoomPosition): [number, number, string]{
    return [pos.x, pos.y, pos.roomName]
  }

  /** Is the creep stuck */
  isStuck(creep: Creep){
    if(!this.metaData.lastPos){
      this.metaData.stuck = 0
      return false
    }else{
      if(this.samePos(creep.pos, this.inflatePos(this.metaData.lastPos))){
        this.metaData.stuck! += 1

        this.log('stuck ' + this.metaData.stuck)

        if(this.metaData.stuck! > 3){
          creep.say('stuck proper')
          return true
        }else{
          return false
        }
      }else{
        this.metaData.stuck = 0
        return false
      }
    }
  }

  generatePath(start: RoomPosition, end: RoomPosition, ignoreCreeps: boolean): string{
    this.log('generating path')
    let allowedRooms: string[]
    if(start.roomName != end.roomName){
      let roomPath = new RoomPathFinder(start.roomName, end.roomName)
      allowedRooms = roomPath.results().details
    }else{
      allowedRooms = [start.roomName]
    }

    let proc = this
    let roomCallback = function(roomName: string){
      if(_.include(allowedRooms, roomName)){
        return proc.generateCostMatrix(roomName, ignoreCreeps)
      }else{
        return false
      }
    }

    let  result = PathFinder.search(start, end, {
      roomCallback: roomCallback,
      plainCost: 2,
      swampCost: 5
    })

    return this.serializePath(start, result.path)
  }

  generateCostMatrix(roomName: string, ignoreCreeps: boolean): CostMatrix{
    let matrix = new PathFinder.CostMatrix()

    let room = Game.rooms[roomName]

    if(room){
      this.addStructuresToMatrix(room, matrix)

      this.log(JSON.stringify(ignoreCreeps))
      if(!ignoreCreeps){
        this.log('ignore creeps')
        matrix = matrix.clone()
        this.addCreepsToMatrix(room, matrix)
      }
    }

    let i = 0
    let j = 0
    let visual = new RoomVisual(roomName)

    while(i < 50){
      while(j < 50){
        visual.text(matrix.get(i, j).toString(), i, j, {color: 'white', font: 0.5})
        j++
      }
      j = 0
      i++
    }

    return matrix
  }

  addCreepsToMatrix(room: Room, matrix: CostMatrix){
    if(this.kernel.data.costMatrixes[room.name + '-cs']){
      matrix = this.kernel.data.costMatrixes[room.name + '-cs']
    }else{
      let creeps = <Creep[]>room.find(FIND_CREEPS)
      _.forEach(creeps, function(creep){
        matrix.set(creep.pos.x, creep.pos.y, 255)
      })

      this.kernel.data.costMatrixes[room.name + '-cs'] = matrix
    }
  }

  addStructuresToMatrix(room: Room, matrix: CostMatrix){
    if(this.kernel.data.costMatrixes[room.name + '-s']){
      matrix = this.kernel.data.costMatrixes[room.name + '-s']
    }else{
      let structures = <Structure[]>room.find(FIND_STRUCTURES)

      _.forEach(structures, function(structure: StructureRampart){
        if(structure.structureType === STRUCTURE_RAMPART){
          if(!structure.my && !structure.isPublic){
            matrix.set(structure.pos.x, structure.pos.y, 255)
          }
        }else if(structure.structureType === STRUCTURE_ROAD && matrix.get(structure.pos.x, structure.pos.y) === 0){
          matrix.set(structure.pos.x, structure.pos.y, 1)
        }else if(structure.structureType === STRUCTURE_CONTAINER){
          matrix.set(structure.pos.x, structure.pos.y, 5)
        }else{
          matrix.set(structure.pos.x, structure.pos.y, 255)
        }
      })

      let constructionSites = <ConstructionSite[]>room.find(FIND_MY_CONSTRUCTION_SITES)
      _.forEach(constructionSites, function(site){
        if(_.include(OBSTACLE_OBJECT_TYPES, site.structureType)){
          matrix.set(site.pos.x, site.pos.y, 255)
        }
      })

      this.kernel.data.costMatrixes[room.name + '-s'] = matrix
    }
  }

  serializePath(start: RoomPosition, path: RoomPosition[]){
    let string = ""
    let lastPos = start
    _.forEach(path, function(pos){
      if(lastPos.roomName === pos.roomName){
        string += lastPos.getDirectionTo(pos)
      }

      lastPos = pos
    })

    return string
  }

  oldRun(){
    let creep = Game.creeps[this.metaData.creep]

    if(!creep || !this.metaData.pos){
      this.completed = true
      this.resumeParent()
      return
    }

    let target = new RoomPosition(this.metaData.pos.x, this.metaData.pos.y, this.metaData.pos.roomName)

    if(creep.fatigue == 0){
      if(creep.pos.inRangeTo(target, this.metaData.range)){
        this.completed = true
        this.resumeParent()
      }else{
        let proc = this

        creep.moveTo(target, {
          costCallback: function(roomName, costMatrix){
            if(!Memory.costMatrix){ Memory.costMatrix = {} }
            if(!Memory.costMatrix[roomName]){
              let regex = /[W|E]([0-9]*)[S|N]([0-9]*)/g
              let matches = regex.exec(creep.room.name)

              let valid = function(num: number){
                return (
                  (num % 5) === 0
                  &&
                  (num % 10) != 0
                )
              }

              if(
                (
                  valid(parseInt(matches![1]))
                  ||
                  valid(parseInt(matches![1]) - 1)
                  ||
                  valid(parseInt(matches![1]) + 1)
                )
                &&
                (
                  valid(parseInt(matches![2]))
                  ||
                  valid(parseInt(matches![2]) - 1)
                  ||
                  valid(parseInt(matches![2]) + 1)
                )
              ){
                return proc.createCostMatrix(creep.room)
              }

              return costMatrix
            }else{
              let myMatrix = PathFinder.CostMatrix.deserialize(Memory.costMatrix[roomName])

              return myMatrix
            }
          },
          maxOps: 10000
        })
      }
    }else{
      let decreasePerTick = 0
      _.forEach(creep.body, function(part){
        if(part.type === MOVE){
          decreasePerTick += 2
        }
      })

      let ticks = Math.ceil(creep.fatigue / decreasePerTick)

      this.suspend = ticks
    }
  }

  createCostMatrix(room: Room){
    let matrix = new PathFinder.CostMatrix

    let sourceKeepers = _.filter(room.find(FIND_STRUCTURES), function(structure: Structure){
      return (structure.structureType == STRUCTURE_KEEPER_LAIR)
    })

    if(sourceKeepers.length > 0){
      var sources = room.find(FIND_SOURCES)
      var minerals = room.find(FIND_MINERALS)

      var avoids = [].concat(<never[]>sources, <never[]>minerals)

      _.forEach(avoids, function(avoid: RoomObject){
        var x = avoid.pos.x - 5
        var yStart = avoid.pos.y - 5

        while(x <= avoid.pos.x + 5){
          var y = yStart

          while(y <= avoid.pos.y + 5){
            matrix.set(x, y, 20)
            y += 1
          }
          x += 1
        }
      })
    }

    Memory.costMatrix[room.name] = matrix.serialize()

    return matrix
  }
}
