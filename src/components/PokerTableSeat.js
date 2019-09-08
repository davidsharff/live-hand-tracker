import React from 'react';
//import Chip from "@material-ui/core/Chip/Chip";
import Avatar from "@material-ui/core/Avatar/Avatar";
import FaceIcon from '@material-ui/icons/Face';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import { useTheme } from '@material-ui/styles';

import styled from 'styled-components';
import { handActionTypes}  from '../constants';
import _ from 'lodash';

export default function PokerTableSeat(props) {
  // TODO: either pass this a collated pokerSeat object or move a lot of logic into prop creation in PokerTable
  const {
    onClick,
    seatIndex,
    isHero,
    isSelected,
    isMultiSelected,
    seat,
    positionLabel,
    lastAction,
    isLiveHand,
    currentBettingRound,
    amountInvested,
    showHoleCards,
    shrink
  } = props;

  const theme = useTheme();
  const { palette } = theme;

  const isActive = !!seat && seat.isActive;

  const SeatAvatar = (props) => {
    return (
      <Avatar {...props}>
        {
          isHero
            ? <FaceIcon/>
            : !!positionLabel
              ? positionLabel
              : isActive
                ? <PersonIcon/>
                : <PersonOutlineIcon/>

        }
      </Avatar>
    );
  };

  const foldedInPriorRound = (
    !!lastAction &&
    (
      lastAction.type === handActionTypes.FOLD ||
      lastAction.type === handActionTypes.MUCK
    ) &&
    lastAction.bettingRound !== currentBettingRound
  );

  const useDisabledUI = foldedInPriorRound || !isActive;

  const selectedBorderColor = palette.primary.dark;

  const borderColor = useDisabledUI
    ? palette.action.disabled
      : isMultiSelected
        ? selectedBorderColor + '8c'
        : isSelected
          ? selectedBorderColor
          : palette.primary.light;
  // TODO: when < 10 seats, consider leaving all 10 slots buy completing greying out non-applicable seats.
  return (
    <SquareSeatContainer
      onClick={onClick}
      borderColor={borderColor}
      heavyBorder={isSelected}
      isMultiRow={isLiveHand}
      shrink={shrink}
      backgroundColor={
        useDisabledUI
          ? palette.action.disabledBackground
          : isMultiSelected
            ? selectedBorderColor + '29'
            : palette.grey['50']
      }
    >
      <SeatAvatar
        style={{
          height: '24px',
          width: '24px',
          fontSize: '14px',
          // TODO: extract. This is ugly and bad.
          backgroundColor: isHero ? palette.secondary.dark : isActive ? palette.primary.dark : undefined,
          opacity: foldedInPriorRound && .5
        }}
      />
      {
        isLiveHand && isActive &&
        <BodyContainer style={{color: palette.text.secondary}}>
          {
            showHoleCards
              ? (
                <div>
                  {
                    lastAction.type === handActionTypes.MUCK
                      ? _.capitalize(handActionTypes.MUCK)
                      : seat.holeCards.length
                        ? seat.holeCards.join(' ')
                        : lastAction.type === handActionTypes.REVEAL
                          ? 'Reveal'
                          : '??'
                  }
                </div>
              )
              : lastAction && (
                <React.Fragment>
                  <div>
                    {
                      _.capitalize(lastAction.type)
                    }
                  </div>
                  {
                    !shrink &&
                    <div>
                      {
                        lastAction && lastAction.amount > 0 &&
                        '$' + amountInvested
                      }
                    </div>
                  }
                </React.Fragment>
              )
          }
        </BodyContainer>
      }
      {
        !isLiveHand &&
        <div style={{color: palette.text.secondary }}>
          Seat&nbsp;{seatIndex + 1}
        </div>
      }
    </SquareSeatContainer>
  );
}

const SquareSeatContainer = styled(({ borderColor, heavyBorder, backgroundColor, isMultiRow, shrink, ...rest}) => <div {...rest} />)`
  display: flex;
  flex-direction: column;
  justify-content: ${p => p.isMultiRow ? 'space-between' : 'space-around'}
  align-items: center;
  flex-basis: calc(20% - 5px);
  margin-right: 5px;
  margin-bottom: 5px;
  padding-top: ${p => p.isMultiRow && '5px'};
  height: ${p => p.shrink ? '55px' : '70px'};
  background-color: ${p => p.backgroundColor};
  border: ${p => `solid ${p.borderColor} 1px`};
  border-radius: 5px;
  font-size: 12px;
  transition: height 500ms;
  ${p => p.heavyBorder && `
    border-width: 2px
  `};
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-around;
  align-items: center;
 `;
