const fs = require('fs');
function deleteFile(replayPath) {
  fs.unlink(replayPath, (err) => {
    if (err) {
      console.log(err);
      return false;
    }
    console.log('The file was deleted');
    return true;
  });
}
module.exports = { deleteFile };
