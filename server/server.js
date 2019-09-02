// https://dev.to/loujaybee/using-create-react-app-with-express
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));

app.route('/save/hand')
  .post(savehand)

// TODO: fix. Not serving up actual build. Only the api end points are working currently.
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(console.log('Listening on ' + PORT) || PORT);

function savehand(req, res) {
  const hand = req.body.data;

  console.log('saving hand...', JSON.stringify(hand));
}