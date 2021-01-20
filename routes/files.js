// routes/files.js

var express  = require('express');
var router = express.Router();
var File = require('../models/File');

router.get('/:serverFileName/:originalFileName', function(req, res){ // 3
  File.findOne({serverFileName:req.params.serverFileName, originalFileName:req.params.originalFileName}, function(err, file){ // 3-1
    if(err) return res.json(err);

    var stream = file.getFileStream(); // 3-2
    if(stream){ // 3-3
      res.writeHead(200, {
        // 한글파일도 지원가능한 코드 
        // ori cod -  'Content-Type': 'application/octet-stream'
        //'Content-Disposition': 'attachment; filename=' + file.originalFileName
        'Content-Type': 'application/octet-stream; charset =utf-8',
        'Content-Disposition': 'attachment; filename=' + encodeURI(file.originalFileName)
      });
      stream.pipe(res);
    }
    else { // 3-4
      res.statusCode = 404;
      res.end();
    }
  });
});

module.exports = router;