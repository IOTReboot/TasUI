var http = require('http'),
    httpProxy = require('http-proxy');
    handler = require('serve-handler');
    url = require('url');

var port = 80;

var proxy = httpProxy.createProxyServer({});

proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
  
    res.end('Something went wrong while connecting to ' + req.url);
  });

//   proxy.on('proxyReq', function(proxyReq, req, res, options) {
//     console.log("ProxyReq URL %O", proxyReq.path)
//   });

// proxy.on('proxyRes', function (proxyRes, req, res) {
//     // console.log('RAW Response from the target', JSON.stringify(Object.keys(proxyRes), true, 2));
// });
  

// proxy.on('proxyRes', function (proxyRes, req, res) {
//     var body = [];
//     proxyRes.on('data', function (chunk) {
//         body.push(chunk);
//     });
//     proxyRes.on('end', function () {
//         body = Buffer.concat(body).toString();
//         console.log("res from proxied server:", body);
//         // res.end(body);
//     });
// });

const haFiltering = Boolean(process.env.HA_FILTERING === "1");

var server = http.createServer(function(req, res) {
    if (haFiltering && req.socket.remoteAddress !== "172.30.32.2") {
        res.writeHead(401, {
            'Content-Type': 'text/plain'
          });
        
        res.end('Client not allowed to connect from ' + req.socket.remoteAddress);
        return
    }

    if (url.parse(req.url,true).query.url) {

        let parsedUrl = url.parse(req.url,true)
        let target = parsedUrl.query.url;
        let parsedTarget = url.parse(target)
        console.log(`Routing to ${target}`)

        req.url = target
        proxy.web(req, res, { target: `${parsedTarget.protocol}//${parsedTarget.host}`, });
    } else {
        return handler(req, res);
    }
});

console.log("listening on port " + port)
server.listen(port);