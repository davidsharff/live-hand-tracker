import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Route, Redirect } from "react-router-dom";
import styled from "styled-components";

import Container from "@material-ui/core/Container";

import Actions from "./components/Actions";
import NewHand from "./components/NewHand";
import ManageCards from "./components/ManageCards";
import HandResults from "./components/HandResults";

import PokerTable from "../../components/PokerTable";

import { bettingRounds, cardInputTypes, handActionTypes } from "../../constants";
import {
  getTotalPotSizeDuringRound,
  getResultDecoratedPositions,
  getNextToActSeatIndex,
  getSkippedSeatIndicesForSeatIndex,
  getSeatIndicesThatCompletedHand
} from "../../redux/reducers/handReducer";

import { isTinyScreen } from "../../utils";


export default function HandWizard(props) {
  const { hand, deck, onClickSeat, isHandComplete, onSaveHoleCards, onSaveBoardCards, onAction, onCreateNewHand, matchParams } = props;
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  const isActionInput = matchParams.inputStepType === 'actions';
  const resultDecoratedPositions = getResultDecoratedPositions(hand);

  useEffect(() => {
    if (resultDecoratedPositions.length) {
      setSelectedSeatIndex(null);
    }
  }, [resultDecoratedPositions]);

  // TODO:
  //   - Bug: thought I noticed muck creating invalid hand state when multiselecting. Couldn't immediately duplicate
  //   - Bug: Prevent next in board input if cards are missing.
  //   - Bug: not ending hand if second to last player mucks
  //   - Bug: 10 card selection is broken
  //   - Add option to make notes about any seat in action body
  //   - Support clicking on any seat in results step to input discovered cards, notes, etc.
  //   - Move hand results to its own route and ensure it resets selectedSeatIndex
  //   - Order card picker options by suit and use spacers so that they don't shift after selections for faster inputs
  //   - Consider better name for the aggressor in round and their associated action. Currently calling "lastLiveAction" as opposed to passive actions.
  //   - Consider moving selectedSeat state handling, up to connector or moving all this file's content up and getting ride of connector approach entirely.
  //   - Handle clicking 0 when no bet/raise has been inputted
  //   - Consider moving board and manage card routes oustide of wizard
  //   - Table config every hand: session should exit before configuring table, table slides up, show legend and start in edit mode, have start hand button below, start hand button takes to button selection screen.
  //   - Show kicker in hand desc when necessary (needs verification but seems to not be supported out of the box with library)
  //   - Confirm behavior for seat selection once final results are in. Currently, split pot situations are broken.
  //   - Write up handling 4 and 5 figures for long term.
  //   - Replace one-off selector logic with existing selectors where applicable.
  //   - To gain space for bet/raise presets and/or all-in flag consider
  //      - Poker seat action desc one line to shrink rectangles.
  //      - One line header switch smaller text desc round, pot, seat, etc.
  //      - Collapse top nav by default to just show hand #
  //   - selectedSeatIndex state name is off now since multiple are supported. Its more of routeSeatIndex
  //   - Continue to show past action in poker table seat during board input?
  //   - HAND SPLIT POT and replace winningSeatIndice function with robust data for full descriptions
  //      -- Lookup how to handle odd number when splitting pot
  //   - Handle side pots (which requires all-in flag listed in seperate todo ).
  //   - Remove all setting hand in localStorage for single time setting currentHandId. Add api stub to getHand(currentHandId)
  //   - Handle changing past actions
  //   - write up if it needs to support inputting cards for folded hands. Could include at same time recording other seat/hand details, or could add a button to go into card input mode?
  //   - get rid of all exact '/hand/actions' navigation
  //   - It'd be nice if the poker seat UI made it clear when and what is clickable (e.g. when you can click ahead to future seat, the fact you can't click on seats at all during board input, etc.)
  //   - Breakout hand and session middleware and make sure apiMiddleware saves session and hand seperately
  //   - handle forward/back nav and possibly also clicking seats to edit past action selection during betting round and ultimately in any betting round.
  //       - Supporting editing old actions from current round may be pretty easy (cascade in reverse but with different action type)
  //       - Change action urls to include betting round to support editing past actions.
  //   - Need explicit constraint or support for editing session since you can now return to it after hand begins.
  //   - Use consistent typography, particularly missing text color
  //   - Don't nav to board cards onMount if they are already populated. Consider hook useEffectNoMount useEffectOnMount
  //   - Consider showing total amount invested on seats after hand is completed and consider that and other relevant details in action body
  // TODO: below sections should be their own components

  // TODO: move to HandWizardConnector.js route definition redirect handling.
  if (isActionInput) {

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

  const selectedSeatIndices = isHandComplete
    ? isActionInput ? [selectedSeatIndex] : getSeatIndicesThatCompletedHand(hand) // Use noi
    : selectedSeatIndex === null
      ? []
      : isActionInput
        ? [...getSkippedSeatIndicesForSeatIndex(hand, selectedSeatIndex), selectedSeatIndex]
        : [selectedSeatIndex];

  const hasFinalResults = matchParams.inputStepType === 'actions' && resultDecoratedPositions.length;

  // Use creator fn to prevent route from unnecessarily remounting component.
  const createActionsInputComp = (seatIndex) => () => {
    if (hand.buttonSeatIndex === null || resultDecoratedPositions.length > 0) {
      // TODO: make this a different route
      return <Redirect to="/hand/actions" />;
    }

    setSelectedSeatIndex(seatIndex);
    const nextToActSeatIndex = getNextToActSeatIndex(hand);

    // TODO: include betting round in header.
    return (
      <Actions
        hand={hand}
        seatIndex={seatIndex}
        onClickAction={onAction}
        areMultipleSeatsSelected={selectedSeatIndices.length > 1}
        nextToActSeatIndex={nextToActSeatIndex}
      />
    );
  };

  // Use creator fn to prevent route from unnecessarily remounting component.
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

  // Use creator fn to prevent route from unnecessarily remounting component.
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
        shrink={
          isHandComplete ||
          (isTinyScreen() && matchParams.inputStepType === 'cards')
        }
        isHandComplete={isHandComplete}
        selectedSeatIndices={selectedSeatIndices}
      />
      <BodyContainer>
        {
          // TODO: this will be unecessary once card management routes are moved into parent Hand component
          hand.buttonSeatIndex === null
            ? <NewHand />
            : hasFinalResults
              ? <HandResults
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