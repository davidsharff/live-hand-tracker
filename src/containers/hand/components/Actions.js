import React, { useCallback, useState, useRef } from 'react';
import _ from 'lodash';

import styled from 'styled-components';

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Button from '@material-ui/core/Button/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
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
                <AggressiveActionInput
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

function AggressiveActionInput(props) {
  const { minAmount, label, onSubmit } = props;

  const { palette } = useTheme();

  const [newAmount, setNewAmount]  = useState('');

  // TODO: abstract popper handling into shared component or hook.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnchorRef = useRef(null);

  const [isAllIn, setIsAllIn] = useState(false);

  const hasMetMin = newAmount && (isAllIn || newAmount >= minAmount);

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

  const handleMenuItemClick = (option) => {
    setIsAllIn(option.toLowerCase() === 'all-in');
    setIsMenuOpen(false);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (menuAnchorRef.current && menuAnchorRef.current.contains(event.target)) {
      return;
    }

    setIsMenuOpen(false);
  };

  const backspaceColorProp = newAmount && !hasMetMin
    ? { color: 'primary' }
    : {};

  const actionLabel = isAllIn ? 'All-In' : label;

  return (
    <React.Fragment>
      <ActionButton
        color="primary"
        variant={hasMetMin ? 'contained' : 'outlined'}
        onClick={handleSubmit}
      >
        <ActionDropdownButton
          aria-owns={isMenuOpen ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          focusRipple={false}
          style={{ minWidth: 0, color: hasMetMin ? '#fff' : palette.primary.dark }}
          component="div"
        >
          <ArrowDropDownIcon ref={menuAnchorRef} />
        </ActionDropdownButton>
        {
          newAmount
            ? (
              <span style={{ marginRight: '2px' }}>
                  { actionLabel }:&nbsp;${ newAmount }
                </span>
            )
            : (
              <span>
                  Input { actionLabel }&nbsp;
                {
                  !isAllIn &&
                  <span>(min: ${minAmount})</span>
                }
                </span>
            )
        }
        {
          newAmount &&
          <BackspaceClickTarget onClick={handleBackspace}>
            <BackspaceIcon { ...backspaceColorProp } style={{ marginRight: '10px' }} />
          </BackspaceClickTarget>
        }
      </ActionButton>
      <Popper open={isMenuOpen} anchorEl={menuAnchorRef.current} transition>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper id="menu-list-grow">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {[_.capitalize(label), 'All-In'].map((option) => (
                    <MenuItem
                      key={option}
                      selected={option === label}
                      onClick={event => handleMenuItemClick(option)}
                    >
                      { option }
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
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

const ActionDropdownButton = styled(props => <Button disableRipple {...props} />)`
  position: absolute !important;
  left: 0;
  width: 44px;
  :focus {
    outline: none;
  }
  :active {
    background-color: #7281d6 !important;
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
  z-index: 0;
`;

const BackspaceClickTarget = styled.div`
  position: absolute;
  right: 0;
  width: 65px; 
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  color: #fff;
  :active {
    background-color: #7281d6;
  }
`;