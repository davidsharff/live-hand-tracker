import React from 'react';
//import Chip from "@material-ui/core/Chip/Chip";
import Avatar from "@material-ui/core/Avatar/Avatar";
import FaceIcon from '@material-ui/icons/Face';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import { useTheme } from '@material-ui/styles';

import styled from 'styled-components';

//import { formatSeatIndexLabel } from "../utils";
import {handActionTypes} from '../constants';
import _ from 'lodash';
//import {getCurrentAmountInvestedForSeat} from '../redux/reducers/hand';



export default function PokerTableSeat(props) {
  // TODO: either pass this a collated pokerSeat object or move a lot of logic into prop creation in PokerTable
  const {
    onClick, seatIndex, isActive, isHero, isSelected, positionLabel, lastAction, currentBettingRound
  } = props;

  const theme = useTheme();
  const { palette } = theme;

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
        {/*<span style={{ fontSize: '13px' }}>*/}
        {/*{*/}
        {/*positionLabelsMap['10'][seatIndex]*/}
        {/*}*/}
        {/*</span>*/}
      </Avatar>
    );
  };

  // const getColor = (seatIndex) => {
  //
  //   return (
  //     isHero
  //       ? 'secondary' // TODO: I don't really like red as a secondary color.
  //       : isActive
  //       ? 'primary'
  //       : 'default'
  //   );
  // };
  //
  // const getLabel = (seatIndex) => {
  //   return (
  //     isActive
  //       ? formatSeatIndexLabel(seatIndex) // TODO: consider having this handle Empty label
  //       : <span style={{width: '49px'}}>Empty</span>
  //   );
  // };

  const foldedInPriorRound = (
    !!lastAction &&
    lastAction.type === handActionTypes.FOLD &&
    lastAction.bettingRound !== currentBettingRound
  );

  // TODO: when < 10 seats, consider leaving all 10 slots buy completing greying out non-applicable seats.
  return (
    <SquareSeatContainer
      onClick={onClick}
      borderColor={isSelected ? palette.secondary.light : palette.primary.dark}
      backgroundColor={palette.grey['50']}
    >
      <SeatAvatar
        style={{
          height: '24px',
          width: '24px',
          fontSize: '14px',
          // TODO: extract. This is ugly and bad.
          backgroundColor: isHero ? palette.secondary.dark : isActive ? palette.primary.dark : undefined
        }}
      />
      {
        lastAction && !foldedInPriorRound
          // TODO: use Typography
          ? <div style={{color: palette.text.secondary}}>
              <div style={{ textAlign: 'center'}}>{ _.capitalize(lastAction.type) }</div>
              {
                (lastAction.type !== handActionTypes.FOLD && lastAction.type !== handActionTypes.CHECK) &&
                <div style={{ textAlign: 'center'}}>${lastAction.amount}</div>
              }
            </div>
          : (
            <div style={{color: palette.text.secondary}}>
              Seat&nbsp;{seatIndex + 1}
            </div>
          )
      }
    </SquareSeatContainer>
  );
}

const SquareSeatContainer = styled(({ borderColor, backgroundColor, ...rest}) => <div {...rest} />)`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  flex-basis: calc(20% - 5px);
  margin-right: 5px;
  margin-bottom: 5px;
  height: 70px;
  background-color: ${p => p.backgroundColor};
  border: ${p => `solid ${p.borderColor} 1px`};
  border-radius: 5px;
  font-size: 12px;
`;
