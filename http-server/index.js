const fs = require('fs');
const http = require('http');
const server = http.createServer((req, res) => {
    const stream = fs.createReadStream('sample.txt');
    stream.pipe(res);
});
server.listen(3000);

// const http = require('http');
// const fs = require('fs');
// const server = http.createServer((req, res) => {
//   const stream = fs.createReadStream('sample.txt');
//   stream.pipe(res);
// });
// server.listen(3000);
// fs.writeFile (
//   "sample.txt",
//   "Hello world, Welcome to Node.js file module",
//   (err) => {
//     if(err) throw err;
//     console.log('File Crated');
//   }
// );

// fs.readFile(
//   'sample.txt',
//   (err, data) => {
//     if(err) throw err;
//     console.log(data.toString());
//   }
// );

