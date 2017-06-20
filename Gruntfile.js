module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

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
        }
    });
}
