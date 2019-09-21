import React from 'react';

import Typography from '@material-ui/core/Typography/Typography';


export default function NewHandBody({ header, subtitle }) {
  return (
    <React.Fragment>
      <Typography variant="h5">
        New Hand
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: '10px', textAlign: 'center'}}>
        Tap button seat location to begin.
      </Typography>
    </React.Fragment>
  );
}