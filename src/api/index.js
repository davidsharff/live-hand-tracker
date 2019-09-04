import store from '../redux/store';

export function addHand() {
  const { hand, local: { authToken } } = store.getState();
  post(authToken, 'hand/add', hand);
}

export function updateHand() {
  const { hand, local: { authToken } } = store.getState();
  post(authToken, 'hand/update', hand);
}

async function post(authToken, endpoint, data) {
  const response = await fetch('http://localhost:8080/' + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      authToken,
      data
    })
  });

  const responseBody = await response.json();

  // TODO: consider how/if user needs to be alerted.
  if (response.status !== 200) {
    throw Error(responseBody.message);
  }
}
