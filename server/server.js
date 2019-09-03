// https://dev.to/loujaybee/using-create-react-app-with-express
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const cors = require('cors');

const buildPath = path.join(__dirname,'../build');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(buildPath));

// TODO: fix. Not serving up actual build. Only the api end points are working currently.
// app.get('/', function (req, res) {
//   const rootAppPath = path.join(buildPath, 'index.html');
//   console.log('root: path to index html', rootAppPath);
//   res.sendFile(rootAppPath);
// });

const PORT = process.env.PORT || 8080;
app.listen(console.log('Listening on ' + PORT) || PORT);

app.route('/save/session-and-hand')
  .post(saveHand)

function saveHand(req, res) {
  const data = req.body;
  console.log('data', JSON.stringify(data.actions.length));
}