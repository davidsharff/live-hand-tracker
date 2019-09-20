import React, { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { Route, Redirect } from 'react-router-dom';

import styled from 'styled-components';
import Container from '@material-ui/core/Container';
import Typography from "@material-ui/core/Typography/Typography";
import BackspaceIcon from "@material-ui/icons/BackspaceOutlined";
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
  //   - BREAKOUT THIS FILE INTO MULTIPLE COMPONENTS
  //   - Disable bet/raise if auto-cascade hasn't ben selected. Hide bet/raise keyboard when it has check and fold, then transform selection into simple label,
  //     and always use label for check-only, or make the drop down it's own step and never show anything about it on next screen, or only support auto-action for check/fold.
  //   - Handle clicking 0 when no bet/raise has been inputted
  //   - Support skipping to future seat for cascading actions if nextToAct and future seat last action was the same.
  //   - Table config every hand: session should exit before configuring table, table slides up, show legend and start in edit mode, have start hand button below, start hand button takes to button selection screen.
  //   - Confirm behavior for seat selection once final results are in. Currently, split pot situations are broken.
  //   - Write up handling 4 and 5 figures for long term.
  //   - To gain space for bet/raise presets and/or all-in flag consider
  //      - Poker seat action desc one line to shrink rectangles.
  //      - One line header swith smaller text desc round, pot, seat, etc.
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
      <ActionsContainer>
        {
          // TODO: make most common actions sort first.
          _.sortBy(availableActions, sortActionComponents)
            .map((availableAction) => {
              const { type, amount } = availableAction;
              const isBetOrRaise = type === handActionTypes.BET || type === handActionTypes.RAISE;

              return (
                <div style={{ flex: isBetOrRaise ? 2 : .75}} key={seatIndex + type}>
                  <ActionOption
                    type={type}
                    amount={amount}
                    onClick={handleClick}
                    // TODO: this logic seems wrong.
                    isDisabled={areMultipleSeatsSelected && !cascadeActionType}
                  />
                </div>
              );
            })
        }
        {
          // TODO: hacky spacer to keep showdown buttons in same spot.
          availableActions.length < 3 &&
          <div style={{ flex: 2}} />
        }
      </ActionsContainer>
    </BodyContainer>
  );
}

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  padding-bottom: 20px;
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  padding-top: ${ isTinyScreen() ? '10px' : '20px'};
  justify-content: space-between;
`;

function ActionOption(props) {
  const { type, amount, onClick, isDisabled } = props;

  // TODO: invesigate the native event warning.
  const handleClick = (optionalValue) => onClick(type, optionalValue || null);

  const buttonColor = type === handActionTypes.MUCK || type === handActionTypes.FOLD
    ? 'secondary'
    : 'primary';

  const typeLabel = _.startCase(type);

  // TODO: consider breaking this out and moving to a new turnary where ActionOption is called.
  if (type === handActionTypes.BET || type === handActionTypes.RAISE) {
    return (
      <BetOrRaiseActionOptions
        buttonColor={buttonColor}
        minAmount={amount}
        handleClick={handleClick}
        label={typeLabel}
        isDisabled={isDisabled}
      />
    );
  }

  return (
    <ActionButton color={buttonColor} onClick={handleClick} disabled={isDisabled}>
      { typeLabel + (type === handActionTypes.CALL ? ' $' + amount : '')}
    </ActionButton>
  );
}

function BetOrRaiseActionOptions(props) {
  const { minAmount, label, handleClick, buttonColor, isDisabled } = props;
  const [newAmount, setNewAmount] = useState('');
  //const [showMinAmountError, setShowMinAmountError] = useState();

  const hasMetMin = newAmount && newAmount > minAmount;

  const handleClickValue = (val) => {
    const newAmountStr = '' + newAmount + val;
    setNewAmount(
      parseInt(newAmountStr, 10)
    );
  };

  const handleBackspace = (e) => {
    e.stopPropagation();
    const amountStr = newAmount + '';

    if (amountStr.length === 1) {
      setNewAmount('');
    } else {
      setNewAmount(
        parseInt(amountStr.slice(0, -1), 10)
      );
    }
  };


  // TODO: check against minAmount and show error
  const handleSubmit = () => {
    if (hasMetMin) {
      handleClick(newAmount);
    } else {
      // setShowMinAmountError(true);
      // setTimeout(() => setShowMinAmountError(false), 3000);
      // TODO: use toastr or notification bar to show error
      window.alert(`${label} must be at least $${minAmount}.\nYour amount: $${newAmount}`);
    }
  };

  const backspaceColorProp = newAmount && (newAmount < minAmount)
    ? { color: 'primary' }
    : {};

  console.log('hasMetMin', hasMetMin, newAmount, minAmount);

  return (
    <React.Fragment>
      <ActionButton
        color={ newAmount ? buttonColor : 'default'}
        variant={hasMetMin ? 'contained' : 'outlined'}
        disabled={!newAmount || isDisabled}
        onClick={handleSubmit}
      >
        {
          newAmount
            ? (
              <span style={{ marginRight: '2px' }}>
                { label }:&nbsp;${ newAmount }
              </span>
            )
            : (
              <span>
                Input {label}&nbsp;
                <span>(min: ${minAmount})</span>
              </span>
            )
        }
        {
          newAmount &&
          <BackspaceClickTarget onClick={handleBackspace}>
            <BackspaceIcon { ...backspaceColorProp }/>
          </BackspaceClickTarget>
        }
      </ActionButton>
      {
        [_.range(1, 6), [..._.range(6, 10), 0]].map((rowVals, rowIndex) =>
          <AmountButtonsRow key={rowIndex}>
            {
              rowVals.map((val, i) =>
                <AmountValueButton
                  key={rowIndex + '' + i}
                  color="primary"
                  isLastItem={i === 4}
                  onClick={() => (newAmount || val > 0) && handleClickValue(val)}
                >
                  { val }
                </AmountValueButton>
              )
            }
          </AmountButtonsRow>
        )
      }
    </React.Fragment>
  );
}

const ActionButton = styled(({ variant, ...rest }) => <Button { ...rest } disableRipple fullWidth variant={variant || "outlined"} />)`
  height: 44px;
  :focus {
    outline: none;
  }
`;

const AmountButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  height: ${isTinyScreen() ? '44px' : '54px' };
  justify-content: space-between;
  margin-top: 10px;
`;

const AmountValueButton = styled(({ isLastItem, ...rest }) => <Button { ...rest } disableRipple variant="outlined" />)`
  padding-left: 1px !important;
  padding-right: 1px !important;
  flex: 1;
  margin-right: ${(p) => p.isLastItem ? '0' : '2px'} !important;
  min-width: 44px !important;
`;

const BackspaceClickTarget = styled.div`
  position: absolute;
  right: 0;
  width: 75px; 
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  :active {
    background-color: #7281d6;
  }
`;

function sortActionComponents({ type }) {
  return type === handActionTypes.CHECK
    ? 0
    : type === handActionTypes.CALL
      ? 1
      : type  === handActionTypes.FOLD
        ? 2
        : type === handActionTypes.MUCK
          ? 3
          : 4;
};