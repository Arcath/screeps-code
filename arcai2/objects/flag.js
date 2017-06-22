module.exports = function(flag){
  return {
    color: flag.color,
    name: flag.name,
    room: flag.pos.roomName,
    secondaryColor: flag.secondaryColor
  }
}
