const Main = require('../lib/main')
const processTypes = require('../lib/os/kernel').processTypes
import {expect} from 'chai'

const fs = require('fs')
const path = require('path')

const gl: any = global

gl._ = require('lodash')

const walkSync = function(dir: string, filelist: string[] = [], base: string = '') {
  var files = fs.readdirSync(dir);
  files.forEach(function(file: string) {
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
    expect(Main.loaded()).to.equal(true)

    expect(AOS_INIT_PROCESS).to.equal('init')

    var types: string[] = []
    var used: string[] = []
    _.forEach(Object.keys(global), function(key){
      if(key[0] === 'A' && key[1] === 'O' && key[2] == 'S'){
        types.push((<any>global)[key])
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
