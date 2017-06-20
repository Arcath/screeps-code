module.exports = function(flag){
  return {
    color: flag.color,
    name: flag.name,
    room: flag.room.name,
    secondaryColor: flag.secondaryColor
  }
}
