import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Route, Redirect } from "react-router-dom";
import styled from "styled-components";

import Container from "@material-ui/core/Container";

import Actions from "./components/Actions";
import NewHand from "./components/NewHand";
import ManageCards from "./components/ManageCards";
import HandComplete from "./components/HandComplete";

import PokerTable from "../../components/PokerTable";

import { bettingRounds, cardInputTypes, handActionTypes } from "../../constants";
import {
  getTotalPotSizeDuringRound,
  getResultDecoratedPositions,
  getCurrentActivePositions,
  getNextToActSeatIndex
} from "../../redux/reducers/handReducer";

import { isTinyScreen } from "../../utils";


export default function HandWizard(props) {
  const { hand, deck, onClickSeat, isHandComplete, onSaveHoleCards, onSaveBoardCards, onAction, onCreateNewHand, matchParams } = props;
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  const resultDecoratedPositions = getResultDecoratedPositions(hand);

  useEffect(() => {
    if (resultDecoratedPositions.length) {
      setSelectedSeatIndex(null);
    }
  }, [resultDecoratedPositions]);

  // TODO:
  //   - BREAKOUT THIS FILE INTO MULTIPLE COMPONENTS
  //   - Disable bet/raise if auto-cascade hasn't ben selected. Hide bet/raise keyboard when it has check and fold, then transform selection into simple label,
  //     and always use label for check-only, or make the drop down it's own step and never show anything about it on next screen, or only support auto-action for check/fold.
  //   - Handle clicking 0 when no bet/raise has been inputted
  //   - Consider moving board and manage card routes oustide of wizard
  //   - Support skipping to future seat for cascading actions if nextToAct and future seat last action was the same.
  //   - Table config every hand: session should exit before configuring table, table slides up, show legend and start in edit mode, have start hand button below, start hand button takes to button selection screen.
  //   - Confirm behavior for seat selection once final results are in. Currently, split pot situations are broken.
  //   - Write up handling 4 and 5 figures for long term.
  //   - To gain space for bet/raise presets and/or all-in flag consider
  //      - Poker seat action desc one line to shrink rectangles.
  //      - One line header switch smaller text desc round, pot, seat, etc.
  //      - Collapse top nav by default to just show hand #
  //   - selectedSeatIndex state name is off now since multiple are supported. Its more of routeSeatIndex
  //   - Continue to show past action in poker table seat during board input?
  //   - HAND SPLIT POT and replace winningSeatIndice function with robust data for full descriptions
  //      -- Lookup how to handle odd number when splitting pot
  //   - Remove all setting hand in localStorage for single time setting currentHandId. Add api stub to getHand(currentHandId)
  //   - Handle changing past actions
  //   - write up if it needs to support inputting cards for folded hands. Could include at same time recording other seat/hand details, or could add a button to go into card input mode?
  //   - get rid of all exact '/hand/actions' navigation
  //   - Support all-in flag
  //   - It'd be nice if the poker seat UI made it clear when and what is clickable (e.g. when you can click ahead to future seat, the fact you can't click on seats at all during board input, etc.)
  //   - Breakout hand and session middleware and make sure apiMiddleware saves session and hand seperately
  //   - handle forward/back nav and possibly also clicking seats to edit past action selection during betting round and ultimately in any betting round.
  //   - Add interstitial start hand screen should default to setting button but toggle to re-configure seat. Maybe make session details visible here but need to decide if certain edits create new sessions.
  //   - Need explicit constraint or support for editing session since you can now return to it after hand begins.
  //   - Use consistent typography, particularly missing text color
  //   - Don't nav to board cards onMount if they are already populated. Consider hook useEffectNoMount useEffectOnMount
  //   - Consider showing total amount invested on seats after hand is completed and consider that and other relevant details in action body
  //   - Change action urls to include betting round to setup support for future editing
  // TODO: below sections should be their own components

  // TODO: move to HandWizardConnector.js route definition redirect handling.
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

  const showHandCompleteUI = matchParams.inputStepType === 'actions' && resultDecoratedPositions.length;

  const createActionsInputComp = (seatIndex) => () => {
    if (hand.buttonSeatIndex === null || resultDecoratedPositions.length > 0) {
      // TODO: make this a different route
      return <Redirect to="/hand/actions" />;
    }

    setSelectedSeatIndex(seatIndex);

    // TODO: include betting round in header.
    return (
      <Actions
        hand={hand}
        seatIndex={seatIndex}
        onClickAction={onAction}
        areMultipleSeatsSelected={selectedSeatIndices.length > 1}
        nextToActSeatIndex={getNextToActSeatIndex(hand)}
      />
    );
  };

  const createHoleCardsComp = (seatIndex) => () => {
    // TODO: add global redirect at /hand route that redirects to button selection if you hit future state url.
    setSelectedSeatIndex(seatIndex); // TODO: re-route if invalid seat index (somehow?).
    return (
      <ManageCards
        cards={hand.seats[seatIndex].holeCards}
        deck={deck}
        type={cardInputTypes.HOLE_CARDS}
        onSave={(cards, isFinishedEditing) => {
          onSaveHoleCards(seatIndex, cards, isFinishedEditing);
          if (isHandComplete && isFinishedEditing) {
            setSelectedSeatIndex(null);
          }
        }}
        headerText={'Hole Cards: ' + (seatIndex === hand.heroSeatIndex ? 'Hero' : `Seat ${seatIndex + 1}`)}
      />
    );
  };

  const createBoardCardsComp = (bettingRound) => () => {
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
  };

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
      <BodyContainer>
        {
          // TODO: this will be unecessary once card management routes are moved into parent Hand component
          hand.buttonSeatIndex === null
            ? <NewHand />
            : showHandCompleteUI
              ? <HandComplete
                  resultDecoratedPositions={resultDecoratedPositions}
                  potSize={getTotalPotSizeDuringRound(hand, bettingRounds.RIVER)}
                  board={hand.board}
                  onCreateNewHand={onCreateNewHand}
                />
              : hand.seats.map(({ isActive }, i) => isActive &&
                  <Route key={i} path={`/hand/actions/seat/${i + 1}`} render={createActionsInputComp(i)}/>
              )
        }
        {
          hand.seats.map(({ isActive }, i) => isActive &&
            <Route key={i} path={`/hand/cards/seat/${i + 1}`} render={createHoleCardsComp(i)}/>
          )
        }
        {
          _.values(bettingRounds).map((bettingRound) =>
            // TOO: bug. Handle if they manually return to prior board input url.
            <Route exact key={bettingRound} path={`/hand/cards/board/${bettingRound}`} render={createBoardCardsComp(bettingRound)}/>
          )
        }
      </BodyContainer>
    </StyledContainer>
  );
}

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  padding-bottom: 20px;
`;