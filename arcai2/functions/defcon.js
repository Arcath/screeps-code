module.exports = {
  run: function(rooms, structureTotal){
    if(!Memory.defcon){
      Memory.defcon = {}
    }


    var myRooms = rooms.where({mine: true})
    _.forEach(myRooms, function(roomObject){
      var room = Game.rooms[roomObject.name]
      var roomDefcon = (Memory.defcon[room.name] || {defcon: 0, count: 0, structureCount: 0})

      if(!roomDefcon.structureCount && Memory.defcon[room.name]){
        Memory.defcon[room.name].structureCount = structureTotal[roomObject.name]
      }

      roomDefcon.structureCount = structureTotal[roomObject.name]

      var hostileCreeps = room.find(FIND_HOSTILE_CREEPS)

      if(hostileCreeps.length == 0){
        roomDefcon.defcon = 0
        roomDefcon.count = 0
      }

      if(hostileCreeps.length > 0 && hostileCreeps.length < 4 && roomDefcon.defcon == 0){
        roomDefcon.defcon = 1
      }

      if(hostileCreeps.length > 4){
        roomDefcon.defcon = 3
      }

      if(hostileCreeps.length > 10){
        roomDefcon.defcon = 4
      }

      if(roomDefcon.defcon == 0){
        roomDefcon.count = 0
      }else{
        roomDefcon.count += 1
      }

      if(roomDefcon.count == 50 && roomDefcon.defcon == 1){
        roomDefcon.defcon = 2
        roomDefcon.count = 0
      }

      if(roomDefcon.count == 50){
        room.controller.activateSafeMode()
      }

      if(roomDefcon.defcon >= 1 && (roomDefcon.structureCount < Memory.defcon[room.name].structureCount)){
        room.controller.activateSafeMode()
      }

      Memory.defcon[room.name] = roomDefcon
    })
  }
}
