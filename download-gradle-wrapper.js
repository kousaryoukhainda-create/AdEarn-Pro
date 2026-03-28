import https from 'https';
import fs from 'fs';

const url = 'https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar';
const dest = 'mobile/android/gradle/wrapper/gradle-wrapper.jar';

https.get(url, (response) => {
  const writer = fs.createWriteStream(dest);
  response.pipe(writer);
  writer.on('finish', () => {
    console.log('gradle-wrapper.jar downloaded successfully!');
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
