import React from 'react';
import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography/Typography";

import PokerTable from "../../../components/PokerTable";

export default function HandWizard(props) {
  //const { hand, deck, matchParams, isHandComplete } = props;

  const { hand } = props;

  // TODO: below sections should be their own components
  return (
    <StyledContainer>
      {/* TODO: convert to onClick*/}
      <PokerTable
        seats={hand.seats}
        onToggleActiveSeat={() => ({})}
        onSetHeroSeatIndex={() => ({})}
        heroSeatIndex={hand.heroSeatIndex}
        showLegend={false}
      />
      {
        hand.buttonSeatIndex === null &&
        <InitialHandBody />
      }
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