const fs = require('fs');

function requestHandler(request, response) {
  const url = request.url;
  if (url === '/') {
    response.setHeader('Content-Type', 'text/html');
    response.write('<html>');
    response.write('<head><title>Form</title></head>');
    response.write(`
      <form action="/message" method="post">
        <input type="text" name="message" placeholder="type your name">
        <button type="submit">Submit</button>
      </form>
    `);
    response.write('<body>');
    response.write('</body>');

    response.write('</html>');
  }

  if (url === '/message' && request.method === 'POST') {
    let body = [];
    request.on('data', function onData(chunk) {
      console.log(chunk);
      body.push(chunk);
    });

    return request.on('end', function onEnd() {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      fs.writeFile('message.txt', message, function onFinish(error) {
        response.statusCode = 302;
        response.setHeader('Location', '/');
        return response.end();
      });
    });
  }
  return response.end();
}

module.exports = requestHandler;
