import React from 'react';
import _ from 'lodash';

import Button from '@material-ui/core/Button/Button';
import Typography from '@material-ui/core/Typography/Typography';


export default function HandCompleteBody(props) {
  const { resultDecoratedPositions, board, onCreateNewHand } = props;

  // const cardImgStyle = isTinyScreen()
  //   ? { width: '46.2px', height: '70px'}
  //   : { width: '60px',   height: '90px'};

  // TODO: handle split pot
  return (
    <React.Fragment>
      <div style={{ alignSelf: 'flex-start', width: '100%' }}>
        <Typography variant="h5" style={{ textAlign: 'center' }}>
          Results
        </Typography>
        <Typography variant="subtitle2">
          Board: { board.join(' ')}
        </Typography>
        {
          // TODO: show board first then each position either has hole cards or mucked.
          _.sortBy(resultDecoratedPositions, ({ amountWon }) => amountWon > 0 ? -1 : 1).map(p =>
            <div key={p.seatIndex}>
              <Typography variant="subtitle2" style={{ margin: '2px 0'}}>
                <span>Seat { p.seatIndex + 1}</span> { p.holeCards.length ? 'showed ' + p.holeCards.join(' ') : 'Mucked'}
              </Typography>
              {
                p.handDescription !== 'Mucked' &&
                <React.Fragment>
                  <Typography variant="subtitle2">
                    Seat { p.seatIndex + 1} hand { p.handCards.join(' ') }
                  </Typography>
                  <Typography variant="subtitle2">
                    Seat { p.seatIndex + 1} has { p.handDescription}
                  </Typography>
                </React.Fragment>
              }
              {
                p.amountWon > 0 &&
                <Typography variant="subtitle2">
                  Seat { p.seatIndex + 1} wins ${ p.amountWon}
                </Typography>
              }
            </div>
          )
        }
      </div>
      <Button onClick={onCreateNewHand} variant="contained" color="primary" fullWidth style={{ margin: '20px 0'}}>
        Create New Hand
      </Button>
    </React.Fragment>
  );
}