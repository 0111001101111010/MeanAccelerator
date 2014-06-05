/*jslint node: true */
module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            development: {
                NODE_ENV: 'development'
            },
            production: {
                NODE_ENV: 'production'
            }
        },
        jshint: {
            // define the files to lint
            files: ['gruntfile.js',
                    'server/**/*.js',
                    'client/**/*.js'
                    ],
            options: {
                globals: {
                    node: true,
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint']
        },
        nodemon: {
            development: {
                script: 'index.js',
                options: {
                    nodeArgs: ['--debug']
                }
            },
            production: {
                script: 'index.js'
            }
        },
        concurrent: {
            development: {
                tasks: ['nodemon', 'node-inspector', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            production: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        'node-inspector': {
            dev: {}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-node-inspector');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['env:development', 'jshint', 'concurrent:production']);
    grunt.registerTask('debug', ['env:development', 'jshint', 'concurrent:development']);
    grunt.registerTask('deploy', ['env:production', 'clean', 'jshint', 'concurrent:production']); /* TODO: uglify, concat, copy public */
};