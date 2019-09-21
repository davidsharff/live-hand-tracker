import React, { useCallback, useState } from 'react';
import _ from 'lodash';

import Typography from '@material-ui/core/Typography/Typography';

import { handActionTypes } from '../../../constants';

// TODO: need to either move these to container component or move selector calls into other components where applicable.
import {
  getAvailableActionForSeatIndex,
  getIsHandComplete,
  getPositionLabelForSeatIndex,
  getTotalPotSizeDuringRound
} from '../../../redux/reducers/handReducer';
import styled from 'styled-components';
import { isTinyScreen } from '../../../utils';
import BackspaceIcon from '@material-ui/core/SvgIcon/SvgIcon';
import Button from '@material-ui/core/Button/Button';

export default function ActionBody(props) {
  const { hand, seatIndex, onClickAction, areMultipleSeatsSelected } = props;

  const positionLabel = seatIndex === hand.heroSeatIndex
    ? 'Hero'
    : getPositionLabelForSeatIndex(hand, seatIndex);

  const potSize = getTotalPotSizeDuringRound(hand, hand.currentBettingRound);

  const isHandComplete = getIsHandComplete(hand);

  const availableActions = getAvailableActionForSeatIndex(hand, seatIndex);

  const handleClick = useCallback((actionType, amount) =>
      onClickAction(seatIndex, actionType, amount)
    , [seatIndex, onClickAction]
  );

  return (
    <React.Fragment>
      <Typography variant="h5">
        { isHandComplete ? 'Showdown' : _.startCase(hand.currentBettingRound) }
      </Typography>
      <Typography variant="h6">
        {positionLabel}&nbsp;|&nbsp;Seat { seatIndex + 1 }&nbsp;|&nbsp;Pot: ${ potSize }
      </Typography>
      <ActionsContainer>
        {
          // TODO: make most common actions sort first.
          _(availableActions)
            .sortBy(sortActionComponents)
            .reject(({ type }) => areMultipleSeatsSelected && type === handActionTypes.MUCK)
            .map((availableAction) => {
              const { type, amount } = availableAction;
              const isBetOrRaise = type === handActionTypes.BET || type === handActionTypes.RAISE;

              return (
                <div style={{ flex: isBetOrRaise ? 2 : .75}} key={seatIndex + type}>
                  <ActionOption
                    type={type}
                    amount={amount}
                    onClick={handleClick}
                  />
                </div>
              );
            })
            .value()
        }
        {
          // TODO: hacky spacer to keep showdown buttons in same spot.
          availableActions.length < 3 &&
          <div style={{ flex: 2}} />
        }
      </ActionsContainer>
    </React.Fragment>
  );
}

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  padding-top: ${ isTinyScreen() ? '10px' : '20px'};
  justify-content: space-between;
`;

function ActionOption(props) {
  const { type, amount, onClick } = props;

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
        onSubmit={handleClick}
        label={typeLabel}
      />
    );
  }

  return (
    <ActionButton color={buttonColor} onClick={() => handleClick()}>
      { typeLabel + (type === handActionTypes.CALL ? ' $' + amount : '')}
    </ActionButton>
  );
}

function BetOrRaiseActionOptions(props) {
  const { minAmount, label, onSubmit, buttonColor } = props;
  const [newAmount, setNewAmount] = useState('');
  //const [showMinAmountError, setShowMinAmountError] = useState();

  const hasMetMin = newAmount && newAmount >= minAmount;

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


  const handleSubmit = () => {
    if (hasMetMin) {
      onSubmit(newAmount);
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

  return (
    <React.Fragment>
      <ActionButton
        color={ newAmount ? buttonColor : 'default'}
        variant={hasMetMin ? 'contained' : 'outlined'}
        disabled={!newAmount}
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

// TODO: look at removing !important via && syntax
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