var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/data/json', function(req, res, next) {
  res.send('respond with a resource');
  var http = require('http');
  var fs = require('fs');

  var file = fs.createWriteStream("file.jpg");
  var request = http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function(response) {
	    response.pipe(file);
  });
});

module.exports = router;
