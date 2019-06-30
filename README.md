Tind3r.com - frontend
=====================

Author Rafał Leśniak

### Usage

```
yarn install
yarn start
open http://localhost:3000
```



### Building

A basic production script is included that builds your app to a `dist` folder

```
yarn run build
```

### Serving production
```
yarn run server
```

### Dependencies
To be able to run app you have to have installed [Chrome Extension]( https://chrome.google.com/webstore/detail/tind3rcom-client/olicollicgbjgnialpnmnolopimdccon?hl=pl&authuser=1) or build from this repo [tind3r-chrome-extension](https://github.com/rlesniak/tind3r-chrome-extension).
If you are build your own Extension remember to change Extension ID in `src/const/index.js` by replacing value in `originalId`.


##Updates from niko247
Update src/const/index.js with version of extension you added in assets. 

Run 
For building:
```
mvn_build.bat
```
For running:
```
mvn_run.bat
```
For both:
```
mvn_build_run.bat
```