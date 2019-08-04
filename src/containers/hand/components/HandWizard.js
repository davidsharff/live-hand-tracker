import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import _ from 'lodash';
import styled from 'styled-components';

import { Container, Row, Button, Input } from 'reactstrap';

import {
  getAvailableActionForSeatIndex,
  getNextToActSeatIndex,
  getPositionLabelForSeatIndex,
} from "../../../redux/reducers/hand";

import {bettingRounds, cardInputTypes, handActionTypes} from "../../../constants";
import ManageCards from "./ManageCards";
import HandWizardHeader from "./HandWizardHeader";

export default function HandWizard(props) {
  const { hand, deck, matchParams } = props;

  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);
  // TODO: I don't think we need this anymore
  const isInputtingBoardCards = matchParams.inputStepType === 'board';
  const isInputtingHoleCards = matchParams.inputStepType === 'cards';

  const nextToActSeatIndex = hand.buttonSeatIndex !== null
    ? getNextToActSeatIndex(hand, selectedSeatIndex)
    : null;

  useEffect(() => {
    if (hand.buttonSeatIndex !== null) {
      setSelectedSeatIndex(nextToActSeatIndex);
    }
  }, [hand.buttonSeatIndex, nextToActSeatIndex]);

  const handleAction = (actionType, amount) => props.onAction(selectedSeatIndex, actionType, amount);

  const actionComponentMap = createActionComponentsMap(handleAction);

  const selectedSeatPosLabel = selectedSeatIndex !== null && hand.buttonSeatIndex !== null
    ? getPositionLabelForSeatIndex(hand, selectedSeatIndex)
    : null;

  // TODO: below sections should be their own components
  return (
    <Container className="flex-fill d-flex flex-column px-0">
      <HandWizardHeader
        hand={hand}
        shouldCollapse={isInputtingHoleCards || isInputtingBoardCards}
        selectedSeatIndex={selectedSeatIndex}
        handleSetButtonSeatIndex={props.onSetButtonSeatIndex}
      />
      <Row className="d-flex flex-row justify-content-center my-2">
        {
          isInputtingBoardCards
            ? <h4>{ _.capitalize(hand.currentBettingRound) }</h4>
            : selectedSeatIndex !== null
              ? <h4>{selectedSeatPosLabel}&nbsp;(Seat {(selectedSeatIndex + 1)})</h4>
              : null
        }
      </Row>
      <Switch>
        {
          _.values(bettingRounds).map((bettingRound) =>
            // TOO: bug. Handle if they manually return to prior board input url.
            <Route exact key={bettingRound} path={`/hand/board/${bettingRound}`} render={() =>
              <ManageCards cards={hand.board} deck={deck} onSave={props.onSaveBoardCards} type={bettingRound} />
            }/>
          )
        }
        <Route exact path="/hand/cards/seat/:seatIndex" render={(routerProps) =>
          <ManageCards cards={hand.seats[1].holeCards} deck={deck} onSave={(cards) => props.onSaveHoleCards(1, cards)} type={cardInputTypes.HOLE_CARDS} />
        }/>
        {/* TODO: optimally this would be /hand/action/bettingRound/seatIndex */}
        <Route exact path="/hand/actions" render={() =>
          <ActionInput hand={hand} selectedSeatIndex={selectedSeatIndex} actionComponentMap={actionComponentMap} />
        }/>
      </Switch>
    </Container>
  );
}

const ActionInput = ({ hand, selectedSeatIndex, actionComponentMap, }) => (
  <Row className="d-flex flex-row justify-content-center flex-fill mx-0">

    {
      // TODO: need input for selecting Button position and consider expandable editable session details.
      // TODO: also consider editable session details on action input (expandable or otherwise out of the way as well)
    }
    <div className="flex-fill">

      {
        hand.buttonSeatIndex === null &&
        <React.Fragment>
          <div>Where's the button?</div>
          <div>Tap seat above to set position</div>
        </React.Fragment>

      }
      {
        hand.buttonSeatIndex !== null &&
        _.sortBy(getAvailableActionForSeatIndex(hand, selectedSeatIndex), sortActionComponents).map(availableAction => {
          const ThisActionComponent = actionComponentMap[availableAction.type]; // TODO: use props below instead.

          return (
            <ThisActionComponent key={availableAction.type} amount={availableAction.amount} />
          );
        })
      }
    </div>
  </Row>
);

function createActionComponentsMap(handleAction) {

  const CallComponent = ({ amount }) => (
    <ActionButtonRow>
      <Button outline className="flex-fill" color="primary" onClick={() => handleAction(handActionTypes.CALL)}>
        Call&nbsp;${ amount }
      </Button>
    </ActionButtonRow>
  );

  const RaiseComponent = ({ minRaise }) => {
    const [raiseAmount, setRaiseAmount] = useState(minRaise);

    const handleChange = (e) => {
      const newValue = parseInt(e.target.value, 10);
      setRaiseAmount(
        isNaN(newValue) ? 0 : newValue
      );
    };

    return (
      <React.Fragment>
        <ActionButtonRow className="justify-content-center align-items-center">
          <Button outline className="flex-fill" color="info" onClick={() => handleAction(handActionTypes.RAISE, raiseAmount)}>
            <Row className="d-flex flex-row justify-content-center align-items-center">
              <span style={{ marginRight: '10px'}}>Raise</span>
              <Input onClick={(e) => e.stopPropagation()} className="px-0" style={{ maxWidth: '50px', textAlign: 'center', height: '24px'}} color="success" type="number" value={raiseAmount} onChange={handleChange} />
            </Row>
          </Button>
        </ActionButtonRow>
      </React.Fragment>
    );
  };

  const BetComponent = ({ onBet, minBet }) => {
    const [betAmount, setBetAmount] = useState(minBet);

    const handleChange = (e) => {
      const newValue = parseInt(e.target.value, 10);
      setBetAmount(
        isNaN(newValue) ? 0 : newValue
      );
    };

    return (
      <React.Fragment>
        <ActionButtonRow className="justify-content-center align-items-center">
          <Button outline className="flex-fill" color="warning" onClick={() => handleAction(handActionTypes.BET, betAmount)}>
            <Row className="d-flex flex-row justify-content-center align-items-center">
              <span style={{ marginRight: '10px'}}>Bet</span>
              <Input onClick={(e) => e.stopPropagation()} className="px-0" style={{ maxWidth: '50px', textAlign: 'center', height: '24px'}} color="success" type="number" value={betAmount} onChange={handleChange} />
            </Row>
          </Button>
        </ActionButtonRow>
      </React.Fragment>
    );
  };

  const FoldComponent = ({ onFold }) => (
    <ActionButtonRow>
      <Button outline className="flex-fill" color="danger" onClick={() => handleAction(handActionTypes.FOLD)}>
        Fold
      </Button>
    </ActionButtonRow>
  );

  const CheckComponent = ({ onCheck }) => (
    <ActionButtonRow>
      <Button outline className="flex-fill" color="primary" onClick={() => handleAction(handActionTypes.CHECK)}>
        Check
      </Button>
    </ActionButtonRow>
  );

  return {
    [handActionTypes.CALL]: ({ amount }) => <CallComponent amount={amount} />,
    [handActionTypes.FOLD]: () =>  <FoldComponent />,
    [handActionTypes.CHECK]: () =>  <CheckComponent />,
    [handActionTypes.RAISE]: ({ amount }) => <RaiseComponent minRaise={amount} />,
    [handActionTypes.BET]: ({ amount }) => <BetComponent minBet={amount} />
  };
}

const ActionButtonRow = styled(Row)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px 0 0 0 !important;
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