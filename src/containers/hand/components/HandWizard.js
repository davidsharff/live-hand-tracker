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
import {
  getAvailableActionForSeatIndex,
  getPositionLabelForSeatIndex,
  getTotalPotSizeDuringRound
} from '../../../redux/reducers/handReducer';

export default function HandWizard(props) {
  //const { hand, deck, matchParams, isHandComplete, onSaveBoardCards } = props;

  const { hand, deck, onClickSeat, isHandComplete, onSaveHoleCards, onSaveBoardCards, onAction, matchParams } = props;
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  // TODO:
  //   - Add interstitial start hand screen should default to setting button but toggle to re-configure seat. Maybe make session details visible here but need to decide if certain edits create new sessions.
  //   - Need explicit constraint or support for editing session since you can now return to it after hand begins.
  //   - Use consistent typography, particularly missing text color
  //   - Don't nav to board cards onMount if they are already populated. Consider hook useEffectNoMount useEffectOnMount
  //   - Consider showing total amount invested on seats after hand is completed and consider that and other relevant details in action body
  //   - Change action urls to include betting round to setup support for future editing
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
        shrink={matchParams.inputStepType === 'cards'}
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
                    headerText={'Hole Cards: ' + (matchedSeatIndex === hand.heroSeatIndex ? 'Hero' : `Seat ${matchedSeatIndex + 1}`)}
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

                    // TODO: include betting round in header.
                    return (
                      <ActionBody
                        hand={hand}
                        seatIndex={i}
                        isHandComplete={isHandComplete}
                        onClickAction={onAction}
                        positionLabel={i === hand.heroSeatIndex ? 'Hero' : getPositionLabelForSeatIndex(hand, i)}
                        bettingRound={hand.currentBettingRound}
                        potSize={getTotalPotSizeDuringRound(hand, hand.currentBettingRound)}
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
          <Route exact key={bettingRound} path={`/hand/cards/board/${bettingRound}`} render={() => {
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
                potSize={getTotalPotSizeDuringRound(hand, bettingRound)}
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
  const { isHandComplete, hand, seatIndex, onClickAction, positionLabel, bettingRound, potSize } = props;

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
      <Typography variant="h4">
        { _.startCase(bettingRound) }
      </Typography>
      <Typography variant="h6">
        {positionLabel}&nbsp;|&nbsp;Seat { seatIndex + 1 }&nbsp;|&nbsp;Pot: ${ potSize }
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
  padding: 10px 0;
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