const path = require('path')

module.exports = function(grunt){
  grunt.loadNpmTasks('grunt-screeps')
  grunt.loadNpmTasks('grunt-shell')

  data = require('./private.json')

  grunt.initConfig({
    screeps: {
      options: {
        email: data.email,
        password: data.password,
        branch: 'arcai3',
        ptr: false
      },
      dist: {
        src: ['dist/main.js']
      }
    },
    shell: {
      webpack: path.join('.', 'node_modules', '.bin', 'webpack')
    }
  })

  grunt.registerTask('publish', ['shell:webpack', 'screeps'])
}
