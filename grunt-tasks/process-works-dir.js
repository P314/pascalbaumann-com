var fs = require('fs');

module.exports = function (grunt) {

    grunt.registerTask('processWorksDir', '', function () {

        grunt.verbose.writeflags(options, 'Options');

        var fs = require('fs'),
            path = require('path'),
            options = this.options({}),
            projects = []

        function readDir(dir) {
            var list = fs.readdirSync(dir);
            list.forEach(function(file) {
                var path = dir + "/" + file;
                if (fs.lstatSync(path).isDirectory()) {
                    dirAction(path);
                    var subList = fs.readdirSync(path);
                    subList.forEach(function(subFile) {
                        fileAction(subFile);
                        writeFile();
                    });
                }
            });
            grunt.log.write(">> ".green+options.destFile+", added " + String(projects.length).cyan + " projects \n")
        }

        function dirAction(path) {
            var splitedPath = path.split("/");
            var dirName = splitedPath[splitedPath.length-1];
            projects.push({title:dirName, description:'', metadata:{category:'', date:''}, media:[], text:''});
        }

        function fileAction(path){
            var fileType = path.substring(path.length-3); 
            if (fileType == "png" || fileType == "jpg") {
                projects[projects.length-1].media.push({type:"image", path:path});
            }
            if (fileType == "mp4" || fileType == "ogg" || fileType == "webm") {
                projects[projects.length-1].media.push({type:"video", path:path});
            }
        }

        function writeFile() {
            var util = require('util');
            var outputFilename = options.destFile;
            fs.writeFileSync(outputFilename, JSON.stringify(projects, null, 4));
        }

        readDir(options.srcDir);
    });
};