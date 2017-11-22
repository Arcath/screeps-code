const Main = require('../lib/main')
const processTypes = require('../lib/os/kernel').processTypes
const expect = require('chai').expect

const fs = require('fs')
const path = require('path')

global._ = require('lodash')

const walkSync = function(dir, filelist, base) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  base = base || ''
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist, file);
    }
    else {
      filelist.push(base + path.sep + file);
    }
  });
  return filelist;
};

describe('Main', function(){
  it('should define all process types as AOS_* variables on global and in the kernel', function(){
    expect(AOS_INIT_PROCESS).to.equal('init')

    var types = []
    var used = []
    _.forEach(Object.keys(global), function(key){
      if(key[0] === 'A' && key[1] === 'O' && key[2] == 'S'){
        types.push(global[key])
      }
    })

    var files = walkSync(path.join(__dirname, '..', 'lib', 'processTypes'))
    _.forEach(files, function(file){
      if(path.extname(file) === '.js'){
        var req = require(path.join(__dirname, '..', 'lib', 'processTypes', file))
        var proc = new req[Object.keys(req)[0]]({
          priority: 1
        })

        expect(types).to.include(proc.type)
        expect(Object.keys(processTypes)).to.include(proc.type)
        expect(used).not.to.include(proc.type)
        used.push(proc.type)
      }
    })
  })
})
