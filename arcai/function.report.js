module.exports = function(rooms){
  console.log('<span style="color:rgba(52, 152, 219,1.0)">   _____ ___________________     _____  .___ </span>')
  console.log('<span style="color:rgba(52, 152, 219,1.0)">  /  _  \\\\______   \\_   ___ \\   /  _  \\ |   |</span>')
  console.log('<span style="color:rgba(52, 152, 219,1.0)"> /  /_\\  \\|       _/    \\  \\/  /  /_\\  \\|   |</span>')
  console.log('<span style="color:rgba(52, 152, 219,1.0)">/    |    \\    |   \\     \\____/    |    \\   |</span>')
  console.log('<span style="color:rgba(52, 152, 219,1.0)">\\____|__  /____|_  /\\______  /\\____|__  /___|</span>')
  console.log('<span style="color:rgba(52, 152, 219,1.0)">        \\/       \\/        \\/         \\/     </span>')
  console.log('Running ' + Object.keys(rooms).length + ' Room(s)')
  for(var rm in rooms){
    var room = rooms[rm]
    if(room.needsSupport()){
      var msg = '<span style="color:rgba(231, 76, 60,1.0);">NEEDS SUPPORT</span>'
    }else{
      var msg = ''
    }

    console.log('<span style="color:rgba(142, 68, 173,1.0);">' + rm + '</span> ' + msg)
    console.log('<span style="color:rgba(142, 68, 173,1.0);">##################################################</span>')

    console.log(room.room.energyAvailable + ' Energy for spawning ' + room.room.energyCapacityAvailable + ' Total spawning capacity')

    console.log('<span style="color:rgba(39, 174, 96,1.0);">Structures</span>')
    console.log(room.extractors.length + ' Extractor(s) ' + room.extractorContainers.length + ' with a Container')
    console.log(room.sources.length + ' Source(s) ' + room.sourceContainers.length + ' with a Container')
    console.log(room.spawns.length + ' Spawn(s) ' + room.extensions.length + ' Extension(s)')
    console.log(room.towers.length + ' Tower(s) ' + room.notFullTowers.length + ' Need(s) Energy')

    console.log('<span style="color:rgba(39, 174, 96,1.0);">Creeps</span>')

    for(var i in room.actions){
      var action = room.actions[i]

      console.log(action + ' ' + room.creepsByAction[action].length + '/' + room.required[action])
    }

    console.log('<span style="color:rgba(39, 174, 96,1.0);">Storage</span>')

    console.log(room.recycleContainers.length + ' Recycle Container(s)')
    console.log(room.generalUseContainers.length + ' General Use Container(s)')
    console.log(room.storages.length + ' Storage(s)')
  }
}
