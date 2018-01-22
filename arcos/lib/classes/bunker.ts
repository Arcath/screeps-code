export class Bunker{
  basePos: RoomPosition

  bunkerMap: BunkerLayout = {
    "buildings": {
      "road": {
        "pos": [
          {"x":-5,"y":-6},
          {"x":-4,"y":-6},
          {"x":-3,"y":-6},
          {"x":-1,"y":-6},
          {"x":0,"y":-6},
          {"x":1,"y":-6},
          {"x":3,"y":-6},
          {"x":4,"y":-6},
          {"x":5,"y":-6},
          {"x":-6,"y":-5},
          {"x":-2,"y":-5},
          {"x":2,"y":-5},
          {"x":6,"y":-5},
          {"x":-6,"y":-4},
          {"x":-3,"y":-4},
          {"x":-1,"y":-4},
          {"x":1,"y":-4},
          {"x":3,"y":-4},
          {"x":6,"y":-4},
          {"x":-6,"y":-3},
          {"x":-4,"y":-3},
          {"x":0,"y":-3},
          {"x":4,"y":-3},
          {"x":6,"y":-3},
          {"x":-5,"y":-2},
          {"x":-1,"y":-2},
          {"x":1,"y":-2},
          {"x":5,"y":-2},
          {"x":-6,"y":-1},
          {"x":-4,"y":-1},
          {"x":-2,"y":-1},
          {"x":2,"y":-1},
          {"x":4,"y":-1},
          {"x":6,"y":-1},
          {"x":-6,"y":0},
          {"x":-3,"y":0},
          {"x":3,"y":0},
          {"x":6,"y":0},
          {"x":-6,"y":1},
          {"x":-4,"y":1},
          {"x":-2,"y":1},
          {"x":2,"y":1},
          {"x":4,"y":1},
          {"x":6,"y":1},
          {"x":-5,"y":2},
          {"x":-1,"y":2},
          {"x":1,"y":2},
          {"x":5,"y":2},
          {"x":-6,"y":3},
          {"x":-4,"y":3},
          {"x":0,"y":3},
          {"x":4,"y":3},
          {"x":6,"y":3},
          {"x":-6,"y":4},
          {"x":-3,"y":4},
          {"x":-1,"y":4},
          {"x":1,"y":4},
          {"x":3,"y":4},
          {"x":6,"y":4},
          {"x":-6,"y":5},
          {"x":-2,"y":5},
          {"x":0,"y":5},
          {"x":2,"y":5},
          {"x":6,"y":5},
          {"x":-5,"y":6},
          {"x":-4,"y":6},
          {"x":-3,"y":6},
          {"x":3,"y":6},
          {"x":4,"y":6},
          {"x":5,"y":6}
        ]
      },
      "extension": {
        "pos": [
          {"x":-2,"y":-6},
          {"x":2,"y":-6},
          {"x":-5,"y":-5},
          {"x":-4,"y":-5},
          {"x":-3,"y":-5},
          {"x":-1,"y":-5},
          {"x":0,"y":-5},
          {"x":1,"y":-5},
          {"x":3,"y":-5},
          {"x":4,"y":-5},
          {"x":5,"y":-5},
          {"x":-5,"y":-4},
          {"x":-4,"y":-4},
          {"x":-2,"y":-4},
          {"x":0,"y":-4},
          {"x":2,"y":-4},
          {"x":4,"y":-4},
          {"x":5,"y":-4},
          {"x":-5,"y":-3},
          {"x":-3,"y":-3},
          {"x":-2,"y":-3},
          {"x":-1,"y":-3},
          {"x":1,"y":-3},
          {"x":2,"y":-3},
          {"x":3,"y":-3},
          {"x":5,"y":-3},
          {"x":-6,"y":-2},
          {"x":-4,"y":-2},
          {"x":-3,"y":-2},
          {"x":-2,"y":-2},
          {"x":2,"y":-2},
          {"x":3,"y":-2},
          {"x":4,"y":-2},
          {"x":6,"y":-2},
          {"x":-5,"y":-1},
          {"x":-3,"y":-1},
          {"x":3,"y":-1},
          {"x":5,"y":-1},
          {"x":-5,"y":0},
          {"x":-4,"y":0},
          {"x":4,"y":0},
          {"x":5,"y":0},
          {"x":-5,"y":1},
          {"x":-3,"y":1},
          {"x":0,"y":1},
          {"x":3,"y":1},
          {"x":5,"y":1},
          {"x":-6,"y":2},
          {"x":3,"y":2},
          {"x":4,"y":2},
          {"x":6,"y":2},
          {"x":2,"y":3},
          {"x":3,"y":3},
          {"x":5,"y":3},
          {"x":2,"y":4},
          {"x":4,"y":4},
          {"x":5,"y":4},
          {"x":3,"y":5},
          {"x":4,"y":5},
          {"x":5,"y":5}
        ]
      },
      "spawn": {
        "pos": [
          {"x":0,"y":-2},
          {"x":-2,"y":0},
          {"x":2,"y":0}
        ]
      },
      "tower": {
        "pos": [
          {"x":-1,"y":-1},
          {"x":0,"y":-1},
          {"x":1,"y":-1},
          {"x":-1,"y":0},
          {"x":1,"y":0}
        ]
      },
      "lab": {
        "pos": [
          {"x":-4,"y":2},
          {"x":-3,"y":2},
          {"x":-5,"y":3},
          {"x":-3,"y":3},
          {"x":-2,"y":3},
          {"x":-5,"y":4},
          {"x":-4,"y":4},
          {"x":-2,"y":4},
          {"x":-4,"y":5},
          {"x":-3,"y":5}
        ]
      },
      "terminal": {
        "pos": [
          {"x":-2,"y":2}
        ]
      },
      "powerSpawn": {
        "pos": [
          {"x":0,"y":2}
        ]
      },
      "link": {
        "pos": [
          {"x":2,"y":2}
        ]
      },
      "storage": {
        "pos": [
          {"x":0,"y":4}
        ]
      },
      "observer": {
        "pos": [
          {"x":-5,"y":5}
        ]
      },
      "nuker": {
        "pos": [
          {"x":0,"y":6}
        ]
      },
      "rampart": {
        "pos":[
          {"x":-6,"y":-6},
          {"x":-5,"y":-6},
          {"x":-4,"y":-6},
          {"x":-3,"y":-6},
          {"x":-2,"y":-6},
          {"x":-1,"y":-6},
          {"x":0,"y":-6},
          {"x":1,"y":-6},
          {"x":2,"y":-6},
          {"x":3,"y":-6},
          {"x":4,"y":-6},
          {"x":5,"y":-6},
          {"x":6,"y":-6},
          {"x":-6,"y":-5},
          {"x":-5,"y":-5},
          {"x":-4,"y":-5},
          {"x":-3,"y":-5},
          {"x":-2,"y":-5},
          {"x":-1,"y":-5},
          {"x":0,"y":-5},
          {"x":1,"y":-5},
          {"x":2,"y":-5},
          {"x":3,"y":-5},
          {"x":4,"y":-5},
          {"x":5,"y":-5},
          {"x":6,"y":-5},
          {"x":-6,"y":-4},
          {"x":-5,"y":-4},
          {"x":5,"y":-4},
          {"x":6,"y":-4},
          {"x":-6,"y":-3},
          {"x":-5,"y":-3},
          {"x":5,"y":-3},
          {"x":6,"y":-3},
          {"x":-6,"y":-2},
          {"x":-5,"y":-2},
          {"x":5,"y":-2},
          {"x":6,"y":-2},
          {"x":-6,"y":-1},
          {"x":-5,"y":-1},
          {"x":5,"y":-1},
          {"x":6,"y":-1},
          {"x":-6,"y":0},
          {"x":-5,"y":0},
          {"x":5,"y":0},
          {"x":6,"y":0},
          {"x":-6,"y":1},
          {"x":-5,"y":1},
          {"x":5,"y":1},
          {"x":6,"y":1},
          {"x":-6,"y":2},
          {"x":-5,"y":2},
          {"x":5,"y":2},
          {"x":6,"y":2},
          {"x":-6,"y":3},
          {"x":-5,"y":3},
          {"x":5,"y":3},
          {"x":6,"y":3},
          {"x":-6,"y":4},
          {"x":-5,"y":4},
          {"x":5,"y":4},
          {"x":6,"y":4},
          {"x":-6,"y":5},
          {"x":-5,"y":5},
          {"x":-4,"y":5},
          {"x":-3,"y":5},
          {"x":-2,"y":5},
          {"x":-1,"y":5},
          {"x":0,"y":5},
          {"x":1,"y":5},
          {"x":2,"y":5},
          {"x":3,"y":5},
          {"x":4,"y":5},
          {"x":5,"y":5},
          {"x":6,"y":5},
          {"x":-6,"y":6},
          {"x":-5,"y":6},
          {"x":-4,"y":6},
          {"x":-3,"y":6},
          {"x":-2,"y":6},
          {"x":-1,"y":6},
          {"x":0,"y":6},
          {"x":1,"y":6},
          {"x":2,"y":6},
          {"x":3,"y":6},
          {"x":4,"y":6},
          {"x":5,"y":6},
          {"x":6,"y":6}
        ]
      }
    },
    "creeps": {
      "linker": {"x": 1, "y": 3},
      "terminator": {"x": -1, "y": 3}
    },
    "labs": {
      "reactions": [
        {"x":-3,"y":2},
        {"x":-3,"y":3},
        {"x":-2,"y":3},
        {"x":-4,"y":4},
        {"x":-2,"y":4},
        {"x":-4,"y":5}
      ],
      "boosts": [
        {"x":-4,"y":2},
        {"x":-5,"y":3},
        {"x":-5,"y":4},
        {"x":-3,"y":5}
      ]
    }
  }

  constructor(basePos: RoomPosition){
    this.basePos = basePos

    if(Game.rooms[basePos.roomName]){
      let room = Game.rooms[basePos.roomName]

      if(
        Memory.bunkers[room.name].bunker
        &&
        Memory.bunkers[room.name].bunker.creeps
        &&
        Memory.bunkers[room.name].bunker.labs
      ){
        this.bunkerMap = Memory.bunkers[room.name].bunker
      }else{
        this.buildMap()
        Memory.bunkers[room.name].bunker = this.bunkerMap
      }
    }
  }

  buildMap(){
    let proxy = this
    _.forEach(Object.keys(this.bunkerMap.buildings), function(structureType: BunkerStructures){
      _.forEach(proxy.bunkerMap.buildings[structureType].pos, function(pos){
        pos.x = pos.x + proxy.basePos.x
        pos.y = pos.y + proxy.basePos.y
      })
    })

    _.forEach(Object.keys(this.bunkerMap.creeps), function(creepType){
      proxy.bunkerMap.creeps[creepType].x = proxy.bunkerMap.creeps[creepType].x + proxy.basePos.x
      proxy.bunkerMap.creeps[creepType].y = proxy.bunkerMap.creeps[creepType].y + proxy.basePos.y
    })

    _.forEach(this.bunkerMap.labs.reactions, function(pos){
      pos.x = pos.x + proxy.basePos.x
      pos.y = pos.y + proxy.basePos.y
    })

    _.forEach(this.bunkerMap.labs.boosts, function(pos){
      pos.x = pos.x + proxy.basePos.x
      pos.y = pos.y + proxy.basePos.y
    })
  }

  lookAtBunker(room: Room){
    return room.lookForAtArea(
      LOOK_STRUCTURES,
      this.basePos.y - 6,
      this.basePos.x - 6,
      this.basePos.y + 6,
      this.basePos.x + 6
    )
  }

  build(room: Room){
    let proc = this
    let structureTypes = Object.keys(this.bunkerMap.buildings)

    let bunkerArea = this.lookAtBunker(room)

    _.forEach(structureTypes, function(structureType: BunkerStructures){
      _.forEach(proc.bunkerMap.buildings[structureType].pos, function(posEntry){
        let build = true

        if(bunkerArea[posEntry.y] && bunkerArea[posEntry.y][posEntry.x]){
          let results = bunkerArea[posEntry.y][posEntry.x]
          _.forEach(results, function(result){
            if(result.structure && result.structure.structureType === structureType){
              build = false
            }
          })
        }

        if(build){
          if(
            (structureType != STRUCTURE_RAMPART || room.controller!.level >= 3)
            &&
            (structureType != STRUCTURE_ROAD || room.controller!.level >= 3)
          ){
            if(Object.keys(Game.constructionSites).length < 90 || structureType === STRUCTURE_SPAWN){
              let pos = new RoomPosition(posEntry.x, posEntry.y, room.name)
              pos.createConstructionSite(structureType)
            }
          }
        }
      })
    })
  }
}
