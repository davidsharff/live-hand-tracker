import _ from 'lodash';
import store from '../redux/store';

export function saveHand() {
  const { hand, local: { authToken } } = store.getState();
  post(authToken, 'save/session-and-hand', hand);
}

async function post(authToken, endpoint, data) {
  if (endpoint === 'save/session-and-hand') {
    const storedHandsStr = localStorage.getItem('_fakeAllHands');
    const parsedHands = storedHandsStr
      ? JSON.parse(storedHandsStr)
      : [];

    const updatedHands = parsedHands.length
      ? _.map(parsedHands, (hand) => hand.id === data.id ? data : hand)
      : [data];

    localStorage.setItem('hands', JSON.stringify(updatedHands));
  }
  // const response = await fetch('http://localhost:8080/' + endpoint, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ data })
  // });
  //
  // const responseBody = await response.json();
  //
  // console.log('body', responseBody, 'response', response);
  //
  // if (response.status !== 200) {
  //   throw Error(responseBody.message);
  // }
}
