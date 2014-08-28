var fs = require('fs');

module.exports = function (grunt) {

    grunt.registerTask('processWorksDir', '', function () {

        grunt.verbose.writeflags(options, 'Options');

        var fs = require('fs'),
            path = require('path'),
            options = this.options({}),
            shell = require('shelljs'),
            projects = []

        function readDir(dir) {
            var list = fs.readdirSync(dir);
            list.forEach(function(file) {
                var path = dir + "/" + file;
                if (fs.lstatSync(path).isDirectory()) {
                    dirAction(path);
                    var subList = fs.readdirSync(path);
                    subList.forEach(function(subFile) {
                        fileAction(path, subFile);
                        writeFile();
                    });
                }
            });
            grunt.log.write(">> ".green+options.destFile+", added " + String(projects.length).cyan + " projects \n")
        }

        function dirAction(path) {
            var splitedPath = path.split("/");
            var plainPath = splitedPath[splitedPath.length-1];
            var plainPathWithWhitespace = plainPath.replace(/\-/g," ");
            var splitedPlainPath = plainPathWithWhitespace.split("_");
            var title = splitedPlainPath[1];
            var description = (splitedPlainPath.length > 2) ? splitedPlainPath[2]:"";
            projects.push({title:title, description:description, metadata:{category:'', date:''}, media:[], text:''});
        }

        function fileAction(path,file){
            var splitedPath = path.split("/");
            var dirName = splitedPath[splitedPath.length-1];
            var fileName = file.substring(0,file.length-4);
            var fileType = file.substring(file.length-3);
            if (fileType == "png" || fileType == "jpg") {
                projects[projects.length-1].media.push({type:"image", path:dirName+"/"+file});
            }
            if (fileType == "mov") {
                shell.exec("mkdir -p uploads/works/" + dirName + "/generated");
                var src = "uploads/works/" + dirName + "/" + fileName + ".mov";
                var dest = "uploads/works/" + dirName + "/generated/" + fileName;
                grunt.log.write(">> ".green+"convert mp4 from " + src .green + " \n");
                shell.exec("ffmpeg -loglevel warning -i " + src + " -vcodec libx264 -crf 20 -pix_fmt yuv420p -y " + dest + ".mp4");
                grunt.log.write(">> ".green+"convert ogv from " + src .green + " \n");
                shell.exec("ffmpeg -loglevel warning -i " + src + " -c:v libtheora -c:a libvorbis -q:v 10 -q:a 10 -y " + dest + ".ogv");
                var path = {mp4:"uploads/works/" + dirName + "/generated/" + fileName + ".mp4", ogg:"uploads/works/" + dirName + "/generated/" + fileName + ".ogg"};
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
