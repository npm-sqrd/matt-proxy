const fs = require('fs');
const fetch = require('node-fetch');
const Promise = require('bluebird');
const path = require('path');
const services = require('./service-config.json');

const exists = Promise.promisify(fs.stat);
const clientPath = path.join(__dirname, 'public/services');
const serverPath = path.join(__dirname, 'templates/services');

const fetchBundles = (paths, service, suffix = '') => {
 Object.keys(service).forEach((item) => {
   const filename = `${paths}/${item}${suffix}.js`;
   exists(filename)
     .catch((err) => {
       if (err.code === 'ENOENT') {
         const url = `${service[item]}${suffix}.js`;
         console.log(`Fetching: ${url}`);
         fetch(url)
           .then((res) => {
             const dest = fs.createWriteStream(filename);
             res.body.pipe(dest);
           });
       } else {
         console.log('WARNING: Unknown fs error');
       }
     });
 });
};

fetchBundles(clientPath, services);
fetchBundles(serverPath, services, '-server');
