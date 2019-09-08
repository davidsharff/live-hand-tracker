import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { Route, Redirect } from 'react-router-dom';

import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography/Typography";
import Input from "@material-ui/core/Input/Input";
import Button from "@material-ui/core/Button/Button";

import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';



import PokerTable from "../../../components/PokerTable";
import ManageCards from "./ManageCards";
import { bettingRounds, cardInputTypes, cascadeActionTypes, handActionTypes } from "../../../constants";
import {
  getAvailableActionForSeatIndex,
  getIsHandComplete,
  getPositionLabelForSeatIndex,
  getTotalPotSizeDuringRound,
  getResultDecoratedPositions,
  getCurrentActivePositions,
  getNextToActSeatIndex
} from '../../../redux/reducers/handReducer';
import { isTinyScreen } from '../../../utils';

export default function HandWizard(props) {
  //const { hand, deck, matchParams, isHandComplete, onSaveBoardCards } = props;

  const { hand, deck, onClickSeat, isHandComplete, onSaveHoleCards, onSaveBoardCards, onAction, onCreateNewHand, matchParams } = props;
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  const resultDecoratedPositions = getResultDecoratedPositions(hand);

  useEffect(() => {
    if (resultDecoratedPositions.length) {
      setSelectedSeatIndex(null);
    }
  }, [resultDecoratedPositions]);

  // TODO:
  //   - Support skipping to future seat for cascading actions if nextToAct and future seat last action was the same.
  //   - Table config every hand: session should exit before configuring table, table slides up, show legend and start in edit mode, have start hand button below, start hand button takes to button selection screen.
  //   - selectedSeatIndex state name is off now since multiple are supported. Its more of routeSeatIndex
  //   - HAND SPLIT POT and replace winningSeatIndice function with robust data for full descriptions
  //      -- Lookup how to handle odd number when splitting pot
  //   - Remove all setting hand in localStorage for single time setting currentHandId. Add api stub to getHand(currentHandId)
  //   - Handle changing past actions
  //   - write up if it needs to support inputting cards for folded hands. Could include at same time recording other seat/hand details, or could add a button to go into card input mode?
  //   - get rid of all exact '/hand/actions' navigation
  //   - Support all-in flag
  //   - Breakout hand and session middleware and make sure apiMiddleware saves session and hand seperately
  //   - handle forward/back nav and possibly also clicking seats to edit past action selection during betting round and ultimately in any betting round.
  //   - Add interstitial start hand screen should default to setting button but toggle to re-configure seat. Maybe make session details visible here but need to decide if certain edits create new sessions.
  //   - Need explicit constraint or support for editing session since you can now return to it after hand begins.
  //   - Use consistent typography, particularly missing text color
  //   - Don't nav to board cards onMount if they are already populated. Consider hook useEffectNoMount useEffectOnMount
  //   - Consider showing total amount invested on seats after hand is completed and consider that and other relevant details in action body
  //   - Change action urls to include betting round to setup support for future editing
  // TODO: below sections should be their own components

  // TODO: move to Hand.js route definition redirect handling.
  if (matchParams.inputStepType === 'actions') {

    const positionsMissingRevealedCards = hand.actions
      .filter(({ type, seatIndex }) =>
        type === handActionTypes.REVEAL &&
        hand.seats[seatIndex].holeCards.length < 2
      );

    if (positionsMissingRevealedCards.length) {
      const seatIndex = positionsMissingRevealedCards[0].seatIndex;
      return <Redirect to={`/hand/cards/seat/${seatIndex + 1}`} />;
    }
  }

  const getIncludeInSeatSelection = (seatIndex) => {
    // Short-circuit. Evaluations below assume that either routeSeatIndex is null or there are multiple selected seats.
    if (seatIndex === selectedSeatIndex) {
      return true;
    }

    const activePositions = getCurrentActivePositions(hand);

    // TODO: test this before committing.
    // In results phase, all winners are selected.
    if (isHandComplete) {
      const resultDecoratedPosition = _.find(resultDecoratedPositions, { seatIndex });
      return (
        (resultDecoratedPosition && resultDecoratedPosition.amountWon > 0) ||
        (
          activePositions.length === 0 &&
          _.last(hand.actions).seatIndex === seatIndex
        )

      );
    }

    if (hand.buttonSeatIndex !== null && matchParams.inputStepType === 'actions' && selectedSeatIndex !== null) {
      // Note: this only includes seats that haven't acted this round. A clearer but too long variable name would be
      // orderedSeatIndicesWaitingForInitialActionThisRound
      const leftToActSeatIndices = _(activePositions)
        .map('seatIndex')
        .reject((sIndex) => _.some(hand.actions, { seatIndex: sIndex, bettingRound: hand.currentBettingRound }))
        .value();

      const targetSeatLeftToActIndex = leftToActSeatIndices.indexOf(seatIndex);
      const selectedSeatLeftToActIndex = leftToActSeatIndices.indexOf(selectedSeatIndex);

      // Handle multiple seats selected
      return targetSeatLeftToActIndex !== -1 && targetSeatLeftToActIndex <= selectedSeatLeftToActIndex;
    }
  };

  const selectedSeatIndices = _(hand.positions)
    .filter(({ seatIndex }) =>
      getIncludeInSeatSelection(seatIndex)
    )
    .map('seatIndex')
    .value();

  return (
    <StyledContainer>
      {/* TODO: convert to onClick*/}
      <PokerTable
        seats={hand.seats}
        onClickSeat={onClickSeat}
        heroSeatIndex={hand.heroSeatIndex}
        showLegend={false}
        routeSeatIndex={selectedSeatIndex}
        resultDecoratedPositions={resultDecoratedPositions}
        hand={hand}
        shrink={isTinyScreen() && matchParams.inputStepType === 'cards'}
        isHandComplete={isHandComplete}
        selectedSeatIndices={selectedSeatIndices}
      />
      {
        // TODO: this will be unecessary once card management routes are moved into parent Hand component
        hand.buttonSeatIndex === null
          ? <NewHandBody /> // TODO: needs its own route.
          : matchParams.inputStepType === 'actions' && resultDecoratedPositions.length
            // TODO: needs its own route.
            ? <HandCompleteBody
                resultDecoratedPositions={resultDecoratedPositions}
                potSize={getTotalPotSizeDuringRound(hand, bettingRounds.RIVER)}
                board={hand.board}
                onCreateNewHand={onCreateNewHand}
              />
            : (
            <React.Fragment>
              {
                hand.seats.map(({ isActive }, i) => isActive &&
                  <Route key={i} path={`/hand/actions/seat/${i + 1}`} render={(routerProps) => {
                    if (hand.buttonSeatIndex === null || resultDecoratedPositions.length > 0) {
                      // TODO: make this a different route
                      return <Redirect to="/hand/actions" />;
                    }

                    setSelectedSeatIndex(i);

                    // TODO: include betting round in header.
                    return (
                      <ActionBody
                        hand={hand}
                        seatIndex={i}
                        onClickAction={onAction}
                        areMultipleSeatsSelected={selectedSeatIndices.length > 1}
                        nextToActSeatIndex={getNextToActSeatIndex(hand)}
                      />
                    );
                  }}/>
                )
              }
            </React.Fragment>
          )
      }
      {/* TODO: move all card input routes to Hand.js and rename HandWizard to ActionWizard */}
      {
        hand.seats.map((s, i) =>
          <Route key={i} path={`/hand/cards/seat/${i + 1}`} render={(routerProps) => {
            // TODO: add global redirect at /hand route that redirects to button selection if you hit future state url.
            setSelectedSeatIndex(i); // TODO: re-route if invalid seat index (somehow?).

            return (
              <ManageCards
                cards={hand.seats[i].holeCards}
                deck={deck}
                type={cardInputTypes.HOLE_CARDS}
                onSave={(cards, isFinishedEditing) => {
                  onSaveHoleCards(i, cards, isFinishedEditing);
                  if (isHandComplete && isFinishedEditing) {
                    setSelectedSeatIndex(null);
                  }
                }}
                headerText={'Hole Cards: ' + (i === hand.heroSeatIndex ? 'Hero' : `Seat ${i + 1}`)}
              />
            );
          }}/>
        )
      }
      {
        _.values(bettingRounds).map((bettingRound) =>
          // TOO: bug. Handle if they manually return to prior board input url.
          <Route exact key={bettingRound} path={`/hand/cards/board/${bettingRound}`} render={() => {
            if (hand.buttonSeatIndex === null) {
              return <Redirect to="/hand/actions" />;
            }

            const potSize = getTotalPotSizeDuringRound(hand, hand.currentBettingRound);

            setSelectedSeatIndex(null);

            return (
              <ManageCards
                cards={hand.board}
                deck={deck}
                type={bettingRound}
                onSave={(cards, isFinishedEditing) => onSaveBoardCards(cards, isFinishedEditing)}
                headerText={_.capitalize(bettingRound) + (potSize ? ' $' + potSize : '' )}
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
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

function NewHandBody({ header, subtitle }) {
  return (
    <BodyContainer>
      <Typography variant="h5">
       New Hand
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: '10px', textAlign: 'center'}}>
        Tap button seat location to begin.
      </Typography>
    </BodyContainer>
  );
}

function HandCompleteBody(props) {
  const { resultDecoratedPositions, board, onCreateNewHand } = props;

  // const cardImgStyle = isTinyScreen()
  //   ? { width: '46.2px', height: '70px'}
  //   : { width: '60px',   height: '90px'};

  // TODO: handle split pot
  return (
    <BodyContainer style={{ alignItems: 'unset' }}>
      <Typography variant="h5" style={{ textAlign: 'center'}}>
        Results
      </Typography>
      <Typography variant="subtitle2">
        Board: { board.join(' ')}
      </Typography>
      {/*<div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0'}}>*/}
        {/*{*/}
          {/*board.map(card =>*/}
            {/*<img key={card} src={cardImages[card]} style={cardImgStyle} alt="" />*/}
          {/*)*/}
        {/*}*/}
      {/*</div>*/}
      {
        // TODO: show board first then each position either has hole cards or mucked.
        _.sortBy(resultDecoratedPositions, ({ amountWon }) => amountWon > 0 ? -1 : 1).map(p =>
          <React.Fragment key={p.seatIndex}>
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
          </React.Fragment>

        )
      }
      <Button onClick={onCreateNewHand} variant="contained" color="primary" fullWidth style={{ margin: '20px 0'}}>
        Create New Hand
      </Button>
      <Button variant="contained" color="secondary" fullWidth disabled>
        Home
      </Button>
    </BodyContainer>
  );
}

function ActionBody(props) {
  const { hand, seatIndex, onClickAction, areMultipleSeatsSelected, nextToActSeatIndex } = props;

  const [cascadeActionType, setCascadeActionType] = useState(null);

  const positionLabel = seatIndex === hand.heroSeatIndex
    ? 'Hero'
    : getPositionLabelForSeatIndex(hand, seatIndex);

  const potSize = getTotalPotSizeDuringRound(hand, hand.currentBettingRound);

  const handleClick = useCallback((actionType, amount) =>
      onClickAction(seatIndex, actionType, amount, cascadeActionType)
    , [seatIndex, onClickAction, cascadeActionType]
  );

  // TODO: flashing some intervening state showing a Bet button on mobile.
  // Update: this todo was pre-ui overhaul

  const availableActions = getAvailableActionForSeatIndex(hand, seatIndex);
  const isHandComplete = getIsHandComplete(hand);

  const availableCascadeActionTypes = _(availableActions)
    .filter(({ type }) => areMultipleSeatsSelected && _.includes(cascadeActionTypes, type))
    .map('type')
    .value();

  const CascadeActionSelect = () => {
    const activePositions = getCurrentActivePositions(hand);

    const firstSkippedPosIndex = _.findIndex(activePositions, { seatIndex: nextToActSeatIndex});
    const lastSkippedPosIndex = _.findIndex(activePositions, { seatIndex }) - 1;

    useEffect(() => {
      if (cascadeActionType === null && availableCascadeActionTypes.length === 1) {
        setCascadeActionType(availableCascadeActionTypes[0]);
      }
    }, []);

    return (
      <FormControl style={{ width: '100%' }}>
        <InputLabel>
          Prior Seat(s) Action
        </InputLabel>
        <Select
          value={
            cascadeActionType === null && availableCascadeActionTypes.length === 1
              ? availableCascadeActionTypes[0]
              : cascadeActionType || ''
          }
          onChange={(e) => setCascadeActionType(e.target.value)}
        >
          {
            availableCascadeActionTypes.map((type) =>
              <MenuItem key={type} value={type} style={{ paddingBottom: '2px'}}>
                { _.capitalize(type) }
              </MenuItem>
            )
          }
        </Select>
        <FormHelperText>
          Apply this action to skipped positions:&nbsp;
          { activePositions[firstSkippedPosIndex].label }
          {
            lastSkippedPosIndex > firstSkippedPosIndex &&
            (' - ' + activePositions[lastSkippedPosIndex].label)
          }
        </FormHelperText>
      </FormControl>
    );
  };

  return (
    <BodyContainer>
      <Typography variant="h5">
        { isHandComplete ? 'Showdown' : _.startCase(hand.currentBettingRound) }
      </Typography>
      <Typography variant="h6">
        {positionLabel}&nbsp;|&nbsp;Seat { seatIndex + 1 }&nbsp;|&nbsp;Pot: ${ potSize }
      </Typography>
      {
        areMultipleSeatsSelected &&
        <CascadeActionSelect />
      }
      {
        // TODO: make most common actions sort first.
        _.sortBy(availableActions, sortActionComponents)
          .map(availableAction =>
            <ActionOption
              key={seatIndex + availableAction.type}
              type={availableAction.type}
              amount={availableAction.amount}
              onClick={handleClick}
              isDisabled={areMultipleSeatsSelected && !cascadeActionType}
            />
          )
      }
    </BodyContainer>
  );
}

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  padding: 10px 0 20px 0;
`;

function ActionOption(props) {
  const { type, amount, onClick, isDisabled } = props;

  // TODO: invesigate the native event warning.
  const handleClick = (optionalValue) => onClick(type, optionalValue || null);

  const passiveActions = _.reject(_.values(handActionTypes), t =>
    t === handActionTypes.BET || t === handActionTypes.RAISE
  );

  const typeLabel = _.startCase(type);

  if (_.includes(passiveActions, type)) {
    return (
      <ActionButton color="primary" onClick={handleClick} disabled={isDisabled}>
        { typeLabel + (type === handActionTypes.CALL ? ' $' + amount : '')}
      </ActionButton>

    );
  }

  return (
    <ActionButtonWithInput
      buttonColor="secondary"
      amount={amount}
      handleClick={handleClick}
      label={typeLabel}
      isDisabled={isDisabled}
    />
  );
}

function ActionButtonWithInput(props) {
  const { amount, label, handleClick, buttonColor, isDisabled } = props;
  const [newAmount, setNewAmount] = useState(amount);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setNewAmount(
      isNaN(newValue) ? 0 : newValue
    );
  };

  return (
    <ActionButton
      variant="outlined"
      color={buttonColor}
      fullWidth
      disableRipple
      onClick={() => handleClick(newAmount)}
      disabled={isDisabled}
    >
      <span style={{ marginRight: '5px' }}>{ label }&nbsp;$</span>
      <Input
        onClick={(e) => e.stopPropagation() }
        inputProps={{ style: { maxWidth: '50px', textAlign: 'center', padding: '2px 0' } }}
        color="success"
        type="number"
        value={newAmount}
        onChange={handleChange}
        disabled={isDisabled}
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
    : type === handActionTypes.CALL
      ? 1
      : type  === handActionTypes.FOLD
        ? 2
        : type === handActionTypes.BET
          ? 3
          : 4;
};