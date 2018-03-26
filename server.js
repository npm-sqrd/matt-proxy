require('newrelic');
const http = require('http');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const request = require('request');
const React = require('react');
const ReactDom = require('react-dom/server');
const Layout = require('./templates/layout');
const App = require('./templates/app');
const Scripts = require('./templates/scripts');
const redis = require('redis');

const port = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const cache = {
 MenuView: require('./templates/services/MenuView-server.js').default,
};

const renderComponents = (components, props = {}) => (
 Object.keys(components).map((item) => {
   const component = React.createElement(components[item], { itemId: props });
   return ReactDom.renderToString(component);
 })
);


http.createServer((req, res) => {
 if (req.method === 'GET' && req.url === '/') {
   const components = renderComponents(cache);
   res.end(Layout(
     'silverspoon',
     App(components[0]),
     Scripts(Object.keys(cache)),
   ));
 } else if (req.method === 'GET' && req.url.match('MenuView.js')) {
   const stream = fs.createReadStream(path.join(__dirname, './public/services/menuView.js'), 'utf8');
   res.writeHead(200, { 'Content-Type': 'text/javascript' });
   stream.pipe(res);
 } else if (req.method === 'GET' && req.url.match(/\/restaurants\/\S*\/menu\/\S*/)) {
   const urlArr = req.url.split('/');
    const name = urlArr[2];
    const meal = urlArr[4];
    const tag = urlArr[5];
    const redisKey = `${name}${meal}${tag}`;
    client.get(redisKey, (err, reply) => {
      if(err || reply === null) {
        request(`http://localhost:3500${req.url}`, (err, data) => {
       if (err) {
         res.writeHead(500);
         res.end();
       } else {
         client.setex(redisKey, 600, JSON.stringify(data.body));
         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(data.body);
       }
     });
   } else if (reply) {
     console.log(reply, redisKey)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(reply);
      }
    });
  }
}).listen(port, () => {
 console.log(`server start at port ${port}`);
});
