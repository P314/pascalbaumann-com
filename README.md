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
Klonen Repository
```shell
$ git clone git@github.com:P314/pascalbaumann-com.git
$ cd pascalbaumann-com
$ npm install
$ bower install
```
