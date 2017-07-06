const path = require('path')

module.exports = function(grunt){
  grunt.loadNpmTasks('grunt-screeps')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-file-append')

  data = require('./private.json')

  var currentdate = new Date()

  grunt.initConfig({
    screeps: {
      options: {
        email: data.email,
        password: data.password,
        branch: 'arcai3',
        ptr: false
      },
      dist: {
        src: ['dist/*.js']
      }
    },
    shell: {
      webpack: path.join('.', 'node_modules', '.bin', 'webpack')
    },
    file_append: {
      versioning: {
        files: [
          {
            prepend: "\nmodule.exports = "+ currentdate.getTime() + "\n",
            input: 'arcai2/version.js',
            output: 'dist/version.js'
          }
        ]
      }
    }
  })

  grunt.registerTask('publish', ['shell:webpack', 'file_append', 'screeps'])
}
