import React from 'react';
import _ from 'lodash';

import Button from '@material-ui/core/Button/Button';
import Typography from '@material-ui/core/Typography/Typography';

import BoardDisplay from '../../../components/BoardDisplay';

export default function HandResults(props) {
  const { resultDecoratedPositions, board, onCreateNewHand } = props;



  // TODO: handle split pot
  const winningCardsObj = _(resultDecoratedPositions)
    .filter('amountWon')
    .sortBy('amountWon') // Only highlight cards belonging to hand winning the most (in anticipation of supporting side-pots in the future)
    .last();

  const winningCards = winningCardsObj
    ? winningCardsObj.handCards.map(({ value, suit }) => value + suit)
    : [];

  const LogLinePrefix = ({ positionLabel, seatIndex, children }) => (
    <Typography variant="subtitle2" style={{ margin: '2px 0'}}>
      <span>{ positionLabel } (Seat {seatIndex + 1})</span>
      { children }
    </Typography>
  );

  return (
    <React.Fragment>
      <Typography variant="h5" style={{ marginBottom: '5px', textAlign: 'center'}}>
        Results
      </Typography>
      <BoardDisplay board={board} winningCards={winningCards} />
      <div style={{ flex: 1, width: '100%', marginTop: '5px'}}>
        {
          // TODO: show board first then each position either has hole cards or mucked.
          _.sortBy(resultDecoratedPositions, 'amountWon').reverse().map(p =>
            <div key={p.seatIndex} style={{ margin: '2px 0'}}>
              <LogLinePrefix positionLabel={p.label} seatIndex={p.seatIndex}>
                  <span>
                    {
                      p.handDescription
                        ? ': ' + p.handDescription
                        : ' mucked'
                    }
                  </span>
              </LogLinePrefix>
              {
                p.amountWon > 0 &&
                <LogLinePrefix positionLabel={p.label} seatIndex={p.seatIndex}>
                  <span>&nbsp;wins ${ p.amountWon }</span>
                </LogLinePrefix>
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