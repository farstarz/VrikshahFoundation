var http = require("https");

var options = {
  "method": "POST",
  "hostname": "api.pepipost.com",
  "port": null,
  "path": "/v2/sendEmail",
  "headers": {
    "content-type": "application/json",
    "api_key": "4a313664cc518338f18fe8391519b10d"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(JSON.stringify({ personalizations: [ { recipient: 'vaibhav.pandey9890@gmail.com', 'margaretful@gmail.com' } ],
  from: { fromEmail: 'farstarz@pepisandbox.com', fromName: 'farstarz' },
  subject: 'Welcome to Pepipost',
  content: 'Hi, this email is getting sent to multiple people' }));
req.end();