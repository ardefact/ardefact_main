Ardefact source 

## [Checkout the wiki!](https://github.com/ardefact/ardefact_main/wiki)

## Installing
Check out the code, then run `npm install` in root folder.  
### Windows 
On Windows you may have to follow additional directions here before running `npm install` - https://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm

> As administrator run 

> `npm install --global --production windows-build-tools`

> `npm install --global node-gyp`

## Running in Debug Mode
To turn on debug mode set `ARDEFACT_DEBUG_MODE` to true.  Either change https://github.com/ardefact/ardefact_main/blob/master/ardefact_modules/config/cfg/dev.json or run `export ARDEFACT_DEBUG_MODE=True`
