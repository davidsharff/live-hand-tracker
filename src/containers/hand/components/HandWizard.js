import React, {useEffect, useState} from 'react';
import _ from 'lodash';
import { Route } from 'react-router-dom';

import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography/Typography";
import Input from "@material-ui/core/Input/Input";
import Button from "@material-ui/core/Button/Button";

import PokerTable from "../../../components/PokerTable";
import ManageCards from "./ManageCards";
import { cardInputTypes, handActionTypes } from "../../../constants";
import {getAvailableActionForSeatIndex, getNextToActSeatIndex} from '../../../redux/reducers/hand';

export default function HandWizard(props) {
  //const { hand, deck, matchParams, isHandComplete, onSaveBoardCards } = props;

  const { hand, deck, onClickSeat, isHandComplete, onSaveHoleCards, onAction } = props;

  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  const nextToActSeatIndex = hand.buttonSeatIndex !== null
    ? getNextToActSeatIndex(hand)
    : null;

  useEffect(() => {
    if (hand.buttonSeatIndex !== null) {
      setSelectedSeatIndex(nextToActSeatIndex);
    }
  }, [hand.buttonSeatIndex, nextToActSeatIndex]);

  const handleAction = (actionType, amount) => onAction(selectedSeatIndex, actionType, amount);

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
        hand={hand}
      />
      {
        hand.buttonSeatIndex === null
          ? <InitialHandBody/>
          : (
            <React.Fragment>
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
                      onSaveHoleCards(matchedSeatIndex, cards, isFinishedEditing);
                      setSelectedSeatIndex(null);
                    }}
                    header={(matchedSeatIndex === hand.heroSeatIndex ? 'Hero' : `Seat ${matchedSeatIndex + 1}`) + ' Hole Cards'}
                  />
                );
              }}/>
              <Route exact path="/hand/actions" render={() =>
                <ActionBody
                  hand={hand}
                  selectedSeatIndex={selectedSeatIndex}
                  isHandComplete={isHandComplete}
                  handleAction={handleAction}
                />
              }/>
            </React.Fragment>
          )
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

function ActionBody(props) {
  const { isHandComplete, hand, selectedSeatIndex, handleAction } = props;

  if (isHandComplete) {
    return (
      <h4>TODO: Hand Complete</h4>
    );
  }

  // TODO: flashing some intervening state showing a Bet button on mobile.
    // Update: this todo was pre-ui overhaul
  return (
    <ActionBodyContainer>
      {
        // TODO: make most common actions sort first.
        _.sortBy(getAvailableActionForSeatIndex(hand, selectedSeatIndex), sortActionComponents)
          .map(availableAction =>
            <ActionOption
              key={availableAction.type}
              type={availableAction.type}
              amount={availableAction.amount}
              isHandComplete={isHandComplete}
              handleAction={handleAction}
            />
          )
      }
    </ActionBodyContainer>
  );
}

const ActionBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  padding: 20px 0;
`;

function ActionOption(props) {
  const { type, amount, handleAction } = props;

  const handleClick = (optionalValue) => handleAction(type, optionalValue || null);

  switch (type) {
    case handActionTypes.CALL: {
      return <CallButton amount={amount} handleClick={handleClick} />;
    }

    case handActionTypes.RAISE: {
      return <RaiseButton minRaise={amount} handleClick={handleClick} />;
    }

    default:
      console.log('TODO: handle ' + type + ' turn on throw when completes');
      return null;
      //throw new Error(`Unknown hand input type: ${type}`);
  }
}

function RaiseButton(props) {
  const { minRaise, innerStyle, handleClick } = props;
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setRaiseAmount(
      isNaN(newValue) ? 0 : newValue
    );
  };

  return (
    <ActionButton variant="outlined" color="primary" fullWidth style={innerStyle} disableRipple onClick={() => handleClick(raiseAmount)}>
      <span style={{ marginRight: '5px' }}>Raise $</span>
      <Input
        onClick={(e) => e.stopPropagation()}
        inputProps={{ style: { maxWidth: '50px', textAlign: 'center', padding: '2px 0' } }}
        color="success"
        type="number"
        value={raiseAmount}
        onChange={handleChange}
      />
    </ActionButton>
  );
}

function CallButton(props) {
  const { amount, innerStyle, handleClick } = props;

  return (
    <ActionButton variant="outlined" color="secondary" fullWidth style={innerStyle} disableRipple onClick={handleClick}>
      Call&nbsp;{ '$' + amount }
    </ActionButton>
  );
}

const ActionButton = styled(Button)`
  margin-top: 20px !important;
  height: 44px;
`;

function sortActionComponents({ type }) {
  return type === handActionTypes.CHECK
    ? 0
    : type === handActionTypes.CALL
      ? 1
      : type  === handActionTypes.FOLD
        ? 2
        : type === handActionTypes.BET
          ? 3
          : 4;
};