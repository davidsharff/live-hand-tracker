import React from 'react';

import { MainHeader, Subtitle } from '../../../components/StyledTypography';


export default function NewHand({ header, subtitle }) {
  return (
    <React.Fragment>
      <MainHeader>
        New Hand
      </MainHeader>
      <Subtitle style={{ marginBottom: '10px', textAlign: 'center'}}>
        Tap button seat location to begin.
      </Subtitle>
    </React.Fragment>
  );
}