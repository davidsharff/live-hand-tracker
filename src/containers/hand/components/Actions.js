import React, { useCallback, useState } from 'react';
import _ from 'lodash';

import styled from 'styled-components';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Button from '@material-ui/core/Button/Button';
import { useTheme } from '@material-ui/styles';

import BoardDisplay from '../../../components/BoardDisplay';
import { MainHeader, SubHeader } from '../../../components/StyledTypography';

import { handActionTypes, passiveActionTypes } from '../../../constants';
// TODO: need to either move these to container component or move selector calls into other components where applicable.
import {
  getAvailableActionForSeatIndex,
  getIsHandComplete,
  getPositionLabelForSeatIndex,
  getTotalPotSizeDuringRound
} from '../../../redux/reducers/handReducer';

import { isTinyScreen } from '../../../utils';

export default function Actions(props) {
  const { hand, seatIndex, onClickAction, areMultipleSeatsSelected } = props;

  const { palette } = useTheme();

  const positionLabel = seatIndex === hand.heroSeatIndex
    ? 'Hero'
    : getPositionLabelForSeatIndex(hand, seatIndex);

  const potSize = getTotalPotSizeDuringRound(hand, hand.currentBettingRound);

  const isHandComplete = getIsHandComplete(hand);

  const availableActions = getAvailableActionForSeatIndex(hand, seatIndex);

  const handleClick = useCallback((actionType, betOrRaiseAmount) =>
      onClickAction(seatIndex, actionType, betOrRaiseAmount)
    , [seatIndex, onClickAction]
  );

  const aggressiveAction = _.some(availableActions, { type: handActionTypes.REVEAL }) // Showdown: no options available.
    ? null
    : _.find(availableActions, { type: handActionTypes.RAISE }) || _.find(availableActions, { type: handActionTypes.BET });

  const Divider = () => (
    <span style={{ fontSize: '18px', borderLeft: `solid 2px ${palette.text.secondary}`}}/>
  );

  return (
    <React.Fragment>
      {/* TODO: consider moving to a StyledTypography components file. */}
      <MainHeader>
        { isHandComplete ? 'Showdown' : _.startCase(hand.currentBettingRound) }
      </MainHeader>
      <SubHeader variant="h6" style={{ lineHeight: isTinyScreen() && !isHandComplete && 1, marginBottom: '5px' }}>
        Pos: {positionLabel}&nbsp;<Divider />&nbsp;Seat: { seatIndex + 1 }&nbsp;<Divider />&nbsp;Pot: ${ potSize }
      </SubHeader>
      {
        isHandComplete &&
        <BoardDisplay board={hand.board} />
      }
      {
        _.some(availableActions, { type: handActionTypes.REVEAL }) &&
        availableActions.map(({ type }) =>
          <div key={type} style={{ marginTop: '20px', width: '100%'}}>
            <ActionOption
              key={type}
              type={type}
              onClick={() => handleClick(type)}
            >
            </ActionOption>
          </div>
        )
      }

        {
          !_.some(availableActions, { type: handActionTypes.REVEAL }) &&
          <ActionsContainer>
            {
              _(passiveActionTypes)
                .chunk(2)
                .flatMap((actions, rowIndex) =>
                  <ActionOptionRow key={rowIndex}>
                    {
                      actions.map((type, i) => {
                        const availableAction = _.find(availableActions, { type });
                        const xMargin = '5px';
                        return (
                          <div
                            key={type}
                            style={{ flex: 1, marginRight: i === 0 && xMargin, marginLeft: i === 1 && xMargin }}
                          >
                            <ActionOption
                              type={type}
                              amount={_.get(availableAction, 'amount')}
                              onClick={() => handleClick(type)}
                              disabled={
                                !availableAction ||
                                (availableAction.type === handActionTypes.MUCK && areMultipleSeatsSelected)
                              }
                            />
                          </div>
                        );
                      })
                    }
                  </ActionOptionRow>
                )
                .value()
            }
            {
              aggressiveAction &&
              <div style={{ flex: .75 }}>
                <AggresiveActionInput
                  minAmount={aggressiveAction.amount}
                  onSubmit={(newAmount) => handleClick(aggressiveAction.type, newAmount)}
                  label={aggressiveAction.type}
                />
              </div>
            }
          </ActionsContainer>
        }
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

const ActionOptionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: ${p => p.rowHeight};
`;

function ActionOption(props) {
  const { type, amount, disabled, onClick } = props;

  // TODO: invesigate the native event warning.
  const handleClick = (optionalValue) => onClick(type, optionalValue || null);

  const buttonColor = type === handActionTypes.MUCK || type === handActionTypes.FOLD
    ? 'secondary'
    : 'primary';

  const typeLabel = _.startCase(type);

  return (
    <ActionButton
      color={buttonColor}
      onClick={() => handleClick()}
      variant="contained"
      disabled={disabled}
    >
      { typeLabel + (type === handActionTypes.CALL && !disabled ? ' $' + amount : '')}
    </ActionButton>
  );
}

function AggresiveActionInput(props) {
  const { minAmount, label, onSubmit } = props;
  const [newAmount, setNewAmount] = useState('');

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
        color="primary"
        variant={hasMetMin ? 'contained' : 'outlined'}
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
            <BackspaceIcon { ...backspaceColorProp } />
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
  height: ${isTinyScreen() ? '44px' : '54px'};
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