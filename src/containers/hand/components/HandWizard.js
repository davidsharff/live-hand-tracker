import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { Route, Redirect } from 'react-router-dom';

import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography/Typography";
import Input from "@material-ui/core/Input/Input";
import Button from "@material-ui/core/Button/Button";

import PokerTable from "../../../components/PokerTable";
import ManageCards from "./ManageCards";
import {bettingRounds, cardInputTypes, handActionTypes} from "../../../constants";
import {getAvailableActionForSeatIndex, getPositionLabelForSeatIndex} from '../../../redux/reducers/hand';

export default function HandWizard(props) {
  //const { hand, deck, matchParams, isHandComplete, onSaveBoardCards } = props;

  const { hand, deck, onClickSeat, isHandComplete, onSaveHoleCards, onSaveBoardCards, onAction } = props;
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
                    headerText={(matchedSeatIndex === hand.heroSeatIndex ? 'Hero' : `Seat ${matchedSeatIndex + 1}`) + ' Hole Cards'}
                  />
                );
              }}/>
              {
                hand.seats.map(({ isActive }, i) => isActive &&
                  <Route key={i} path={`/hand/actions/seat/${i + 1}`} render={(routerProps) => {
                    if (hand.buttonSeatIndex === null) {
                      return <Redirect to="/hand/actions" />;
                    }

                    setSelectedSeatIndex(i);

                    return (
                      <ActionBody
                        hand={hand}
                        seatIndex={i}
                        isHandComplete={isHandComplete}
                        onClickAction={onAction}
                        positionLabel={i === hand.heroSeatIndex ? 'Hero' : getPositionLabelForSeatIndex(hand, i)}
                      />
                    );
                  }}/>

                )
              }
            </React.Fragment>
          )
      }

      {
        _.values(bettingRounds).map((bettingRound) =>
          // TOO: bug. Handle if they manually return to prior board input url.
          <Route exact key={bettingRound} path={`/hand/board/${bettingRound}`} render={() => {
            if (hand.buttonSeatIndex === null) {
              return <Redirect to="/hand/actions" />;
            }

            return (
              <ManageCards
                cards={hand.board}
                deck={deck}
                type={bettingRound}
                onSave={(cards, isFinishedEditing) => onSaveBoardCards(cards, isFinishedEditing)}
                headerText={_.capitalize(bettingRound)}
              />
            );
          }}/>
        )
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

function ActionBody(props) {
  const { isHandComplete, hand, seatIndex, onClickAction, positionLabel } = props;

  const handleClick = useCallback((actionType, amount) =>
      onClickAction(seatIndex, actionType, amount)
    , [seatIndex, onClickAction]
  );

  if (isHandComplete) {
    return (
      <h4>TODO: Hand Complete</h4>
    );
  }

  // TODO: flashing some intervening state showing a Bet button on mobile.
    // Update: this todo was pre-ui overhaul
  return (
    <ActionBodyContainer>
      <Typography variant="h6" style={{ alignSelf: 'center', marginTop: '5px 0', lineHeight: '24px', paddingBottom: '5px' }}>
        { positionLabel }&nbsp;(Seat { seatIndex + 1 })
      </Typography>
      {
        // TODO: make most common actions sort first.
        _.sortBy(getAvailableActionForSeatIndex(hand, seatIndex), sortActionComponents)
          .map(availableAction =>
            <ActionOption
              key={seatIndex + availableAction.type}
              type={availableAction.type}
              amount={availableAction.amount}
              isHandComplete={isHandComplete}
              onClick={handleClick}
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
  const { type, amount, onClick } = props;

  // TODO: invesigate the native event warning.
  const handleClick = (optionalValue) => onClick(type, optionalValue || null);

  const passiveActions = [handActionTypes.FOLD, handActionTypes.CHECK, handActionTypes.CALL];
  const typeLabel = _.startCase(type);

  if (_.includes(passiveActions, type)) {
    return (
      <ActionButton color="primary" onClick={handleClick}>
        { typeLabel + (type === handActionTypes.CALL ? ' $' + amount : '')}
      </ActionButton>

    );
  }

  return (
    <ActionButtonWithInput buttonColor="secondary" amount={amount} handleClick={handleClick} label={typeLabel} />
  );
}

function ActionButtonWithInput(props) {
  const { amount, label, handleClick, buttonColor } = props;
  const [newAmount, setNewAmount] = useState(amount);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setNewAmount(
      isNaN(newValue) ? 0 : newValue
    );
  };

  return (
    <ActionButton variant="outlined" color={buttonColor} fullWidth disableRipple onClick={() => handleClick(newAmount)}>
      <span style={{ marginRight: '5px' }}>{ label }&nbsp;$</span>
      <Input
        onClick={(e) => e.stopPropagation() }
        inputProps={{ style: { maxWidth: '50px', textAlign: 'center', padding: '2px 0' } }}
        color="success"
        type="number"
        value={newAmount}
        onChange={handleChange}
      />
    </ActionButton>
  );
}

const ActionButton = styled(({ ...rest }) => <Button { ...rest } disableRipple fullWidth variant="outlined" />)`
  margin-top: 20px !important;
  height: 44px;
`;

function sortActionComponents({ type }) {
  return type === handActionTypes.CHECK
    ? 0
    : type  === handActionTypes.FOLD
      ? 1
      : type === handActionTypes.CALL
        ? 2
        : type === handActionTypes.BET
          ? 3
          : 4;
};