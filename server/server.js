// https://dev.to/loujaybee/using-create-react-app-with-express
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const cors = require('cors');
const fs = require('fs');

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


const handsPath = path.join(__dirname, 'db/hands.json');
if (!fs.existsSync(handsPath)) {
  fs.writeFileSync(handsPath, JSON.stringify([]))
}

app.route('/hand/add')
  .post(createHand)

app.route('/hand/update')
  .post(updateHand)


function createHand(req, res) {
  const { authToken, data: hand } = req.body;

  const updatedHands = [
    ...(JSON.parse(fs.readFileSync(handsPath))),
    {
      authToken,
      hand
    }
  ];

  fs.writeFileSync(handsPath, JSON.stringify(updatedHands));

  res.send('Success');
}

function updateHand(req, res) {
  const { authToken, data: hand } = req.body;

  const updatedHands = (JSON.parse(fs.readFileSync(handsPath))).map((record) =>
    record.authToken === authToken && record.hand.id === hand.id
      ? { authToken, hand }
      : record
  );

  fs.writeFileSync(handsPath, JSON.stringify(updatedHands));

  res.send('Success');
}