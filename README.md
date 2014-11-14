# pascalbaumann-com

## Entwicklungsumgebung Einrichten

Installieren Homebrew
```shell
$ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```
Installieren Node, Grunt und Bower
```shell
$ brew install node
$ npm install -g grunt-cli
$ npm install -g bower
```
Installieren ffmpeg
```shell
$ brew install --with-theora --with-libvorbis ffmpeg
```
Installieren Node.js
```shell
$ npm install -g grunt-cli
$ npm install -g bower
```
Klonen Repository
```shell
$ git clone git@github.com:P314/pascalbaumann-com.git
$ cd pascalbaumann-com
$ npm install
$ bower install
```
Installieren Homebrew und ffmpeg
```shell
$ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
$ brew install --with-theora --with-libvorbis ffmpeg
```

## Tasks

### Uploads

Komprimiert und konvertiert die Videos aus dem uploads/ Ordner und erstellt die notwendigen JSON Dateien.
```shell
$ grunt uploads
```
