const initialState = {
  location: 'Flamingo'
};

// TODO: consider renaming file to sessionDefaults or add default suffix to overrideable fields
export default function session(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
