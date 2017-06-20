module.exports = function(site){
  if(site.structureType == STRUCTURE_EXTENSION){
    if(site.room.controller.level < 3){
      var priority = 110
    }else{
      var priority = 50
    }
  }else if(site.structureType == STRUCTURE_CONTAINER){
    if(site.room.controller.level < 3){
      var priority = 110
    }else{
      var priority = 40
    }
  }else{
    var priority = 30
  }

  return {
    id: site.id,
    priority: priority,
    structureType: site.structureType,
    room: site.room.name
  }
}
