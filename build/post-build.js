const path = require('path');
const fs = require('fs');
const util = require('util');

// get application version from package.json
const appVersion = require('../package.json').version;
const dateNow = new Date();
// promisify core API's
const readDir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

console.log('\nRunning post-build tasks');

// our version.json will be in the dist folder
const versionFilePath = path.join(__dirname + '/../dist/version.json');

let mainHash = '';
let mainBundleFile = '';

// RegExp to find main.bundle.js, even if it doesn't include a hash in it's name (dev build)
let mainBundleRegexp = /^main.?([a-z0-9]*)?.js$/;

// read the dist folder files and find the one we're looking for
readDir(path.join(__dirname, '../dist/'))
    .then(files => {
    mainBundleFile = files.find(f => mainBundleRegexp.test(f));

if (mainBundleFile) {
    let matchHash = mainBundleFile.match(mainBundleRegexp);

    // if it has a hash in it's name, mark it down
    if (matchHash.length > 1 && !!matchHash[1]) {
        mainHash = matchHash[1];
    }
}

console.log(`Writing version and hash to ${versionFilePath}`);

// write current version and hash into the version.json file
const dateNow = new Date();
const src = `{"version": "${appVersion}", "hash": "${mainHash}", "buildDate": "${dateNow}"}`;
return writeFile(versionFilePath, src);
}).then(() => {
    // main bundle file not found, dev build?
    if (!mainBundleFile) {
    return;
}

console.log(`Replacing hash in the ${mainBundleFile}`);

// replace hash placeholder in our main.js file so the code knows it's current hash
const mainFilepath = path.join(__dirname, '../dist/', mainBundleFile);
return readFile(mainFilepath, 'utf8')
    .then(mainFileData => {
    let replacedFile = mainFileData.replace('{{POST_BUILD_ENTERS_HASH_HERE}}', mainHash);
        replacedFile = replacedFile.replace('{{POST_BUILD_ENTERS_UI_BUILD_VERSION_HERE}}',appVersion);
        replacedFile = replacedFile.replace('{{POST_BUILD_ENTERS_UI_BUILD_DATE_HERE}}', dateNow);
return writeFile(mainFilepath, replacedFile);
});
}).catch(err => {
    console.log('Error with post build:', err);
});