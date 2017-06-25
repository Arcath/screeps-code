module.exports = {
  run: function(rooms){
    if(!Memory.defcon){
      Memory.defcon = {}
    }


    var myRooms = rooms.where({mine: true})
    _.forEach(myRooms, function(roomObject){
      var room = Game.rooms[roomObject.name]
      var roomDefcon = (Memory.defcon[room.name] || {defcon: 0, count: 0})

      var hostileCreeps = room.find(FIND_HOSTILE_CREEPS)

      if(hostileCreeps.length == 0){
        roomDefcon.defcon = 0
        roomDefcon.count = 0
      }

      if(hostileCreeps.length > 0 && hostileCreeps.length < 4){
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

      if(roomDefcon.defcon == 50 && roomDefcon.defcon == 1){
        roomDefcon.defcon = 2
        roomDefcon.count = 0
      }

      if(roomDefcon.defcon == 50){
        room.controller.activateSafeMode()
      }

      Memory.defcon[room.name] = roomDefcon
    })
  }
}
