import React, { useState } from 'react';
import { Route } from 'react-router-dom';

import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography/Typography";

import PokerTable from "../../../components/PokerTable";
import ManageCards from "./ManageCards";
import { cardInputTypes } from "../../../constants";

export default function HandWizard(props) {
  //const { hand, deck, matchParams, isHandComplete, onSaveBoardCards } = props;

  const { hand, deck, onClickSeat } = props;

  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  // TODO: below sections should be their own components
  return (
    <StyledContainer>
      {/* TODO: convert to onClick*/}
      <PokerTable
        seats={hand.seats}
        onClickSeat={onClickSeat}
        heroSeatIndex={hand.heroSeatIndex}
        showLegend={false}
        selectedSeatIndex={selectedSeatIndex}
      />
      {
        hand.buttonSeatIndex === null &&
        <InitialHandBody />
      }

      {/*{*/}
        {/*_.values(bettingRounds).map((bettingRound) =>*/}
          {/*// TOO: bug. Handle if they manually return to prior board input url.*/}
          {/*<Route exact key={bettingRound} path={`/hand/board/${bettingRound}`} render={() => {*/}
            {/*if (hand.buttonSeatIndex === null) {*/}
              {/*return <Redirect to="/hand/actions" />;*/}
            {/*}*/}

            {/*return <ManageCards cards={hand.board} deck={deck} onSave={onSaveBoardCards} type={bettingRound} />*/}
          {/*}}/>*/}
        {/*)*/}
      {/*}*/}

      <Route path="/hand/cards/seat/:seatNum" render={(routerProps) => {
        // TODO: add global redirect at /hand route that redirects to button selection if you hit future state url.
        const matchedSeatIndex = parseInt(routerProps.match.params.seatNum, 10) - 1;
        setSelectedSeatIndex(matchedSeatIndex); // TODO: re-route if invalid seat index (somehow?).
        return (
          <ManageCards
            cards={hand.seats[matchedSeatIndex].holeCards}
            deck={deck}
            type={cardInputTypes.HOLE_CARDS}
            onSave={(cards, isFinishedEditing) => {
              props.onSaveHoleCards(matchedSeatIndex, cards, isFinishedEditing);
              setSelectedSeatIndex(null);
            }}
            header={(matchedSeatIndex === hand.heroSeatIndex ? 'Hero' : `Seat ${matchedSeatIndex + 1}`) + ' Hole Cards'}
          />
        );
      }}/>
    </StyledContainer>
  );
}

const StyledContainer = styled(Container)`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
`;

function InitialHandBody() {
  return (
    <React.Fragment>
      <Typography variant="h6">
        New Hand
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: '10px'}}>
        Tap button seat location to begin.
      </Typography>
    </React.Fragment>
  );
}