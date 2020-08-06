const fs = require('fs');
const axios = require('axios');

const downloadFile = async (externalFile, pathToSave) => {
  const writer = fs.createWriteStream(pathToSave);

  const response = await axios({
    url: externalFile,
    method: 'GET',
    responseType: 'stream',
  });

  // console.debug(response);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

module.exports = downloadFile;
