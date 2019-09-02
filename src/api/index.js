

export function saveSessionAndHand(data) {
  post('save/session-and-hand', data);
}

async function post(endpoint, data) {
  const response = await fetch('http://localhost:8080/' + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data })
  });

  const responseBody = await response.json();

  console.log('body', responseBody, 'response', response);

  if (response.status !== 200) {
    throw Error(responseBody.message);
  }
}