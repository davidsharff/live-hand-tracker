import React from "react";
import _ from 'lodash';
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from '@material-ui/core/Avatar';
import FaceIcon from '@material-ui/icons/Face';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import { useTheme } from '@material-ui/styles';


import styled from 'styled-components';
import PokerTableSeat from "./PokerTableSeat";
import {
  getCurrentActionsForSeat,
  getCurrentAmountInvestedForSeat,
  getPositionLabelForSeatIndex,
  getIsHandComplete, getCurrentActions
} from '../redux/reducers/handReducer';
import { handActionTypes } from '../constants';


// TODO: consider wrapper for session/hand poker tables
export default function PokerTable(props) {
  // TODO: either keep hand prop and drop other props in favor of applicable selectors, or drop hand and use props for everything.
  // TODO: would be nice to have wrapper component that prevented needing to handle null refs if being using in Session vs Hand.
  const { seats, heroSeatIndex, showLegend, onClickSeat, hand, shrink, selectedSeatIndices } = props;
  const theme = useTheme();
  const { palette } = theme;

  const isHandComplete = !!hand && getIsHandComplete(hand);

  if (!seats.length) {
   return null;
  }

  const LegendAvatar = ({ children, label, backgroundColor, ...rest }) => (
    <LegendItem>
      <Avatar {...rest} style={{ height: '24px', width: '24px', backgroundColor}}>
        {
          children
        }
      </Avatar>
      <div style={{ color: palette.text.secondary, fontSize: '12px' }}>
        {
          label
        }
      </div>
    </LegendItem>
  );

  const getCascadeActionType = () => {
    console.log('_.sumBy(getCurrentActions(hand), \'amount\')', _.sumBy(getCurrentActions(hand), 'amount'), 'CLEANUP');

    return _.sumBy(getCurrentActions(hand), 'amount') > 0
      ? handActionTypes.FOLD
      : handActionTypes.CHECK;
  };

  return (
    <React.Fragment>
      {
        showLegend && (
        <React.Fragment>
          <InputLabel shrink>Tap to Change</InputLabel>
          <LegendRow style={{ marginBottom: '10px'}}>
            <LegendAvatar label="Hero" backgroundColor={palette.secondary.dark}>
              <FaceIcon fontSize="small" />
            </LegendAvatar>
            <LegendAvatar label="Filled" backgroundColor={palette.primary.dark}>
              <PersonIcon fontSize="small" />
            </LegendAvatar>
            <LegendAvatar label="Empty">
              <PersonOutlineIcon fontSize="small" />
            </LegendAvatar>
          </LegendRow>
        </React.Fragment>
        )
      }
      <div style={{ width: '100%'}}>
        {
          _.flatMap(_.chunk(seats, 5), (seatsRow, rowIndex) =>
            <SquareTableRow key={rowIndex}>
              {
                seatsRow.map(({ isActive }, _i) => {
                  const seatIndex = _i + ( rowIndex === 1 ? 5 : 0);
                  const isSelected = selectedSeatIndices && selectedSeatIndices.indexOf(seatIndex) > -1;
                  const isMultiSelected = isSelected &&  _.last(selectedSeatIndices) !== seatIndex;

                  return (
                    <PokerTableSeat
                      key={seatIndex}
                      type="square"
                      onClick={() => onClickSeat(seatIndex)}
                      seat={seats[seatIndex]}
                      isHero={seatIndex === heroSeatIndex}
                      isSelected={isSelected}
                      isMultiSelected={isMultiSelected}
                      seatIndex={seatIndex}
                      positionLabel={
                        hand && hand.positions.length
                          ? getPositionLabelForSeatIndex(hand, seatIndex)
                          : null
                      }
                      currentBettingRound={hand && hand.currentBettingRound}
                      isLiveHand={hand && hand.buttonSeatIndex !== null}
                      showHoleCards={isHandComplete}
                      amountInvested={hand && getCurrentAmountInvestedForSeat(hand, seatIndex)}
                      shrink={shrink}
                      lastAction={hand && (
                        isMultiSelected
                          ? { type: getCascadeActionType(), bettingRound: hand.currentBettingRound }
                          : _.last(getCurrentActionsForSeat(hand, seatIndex))
                      )}
                    />
                  );
                })
              }
            </SquareTableRow>
          )
        }
      </div>
    </React.Fragment>
  );
}
const LegendRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 20px;
`;

const SquareTableRow = styled.div`
  display: flex;
  flex-direction: row;
`;

// function CircularTable(props) {
//   const { onClick, seats, heroSeatIndex } = props;
//
//   // TODO: all of the below need serious refactor once/if general approach is confirmed.
//   // TODO: can seat 1 position choice be improved?
//   const topRowSeats = seats.length === 6
//     ? [2, 3]
//     : [4, 5, 6];
//
//   const midRowsSeats = seats.length === 6
//     ? [[1, 4]]
//     : [[3, 7], [2, 8]];
//
//   const bottomRowSeats =  seats.length === 6
//     ? [0, 5]
//     : [1, 0, 9];
//
//   const bottomRowLen = bottomRowSeats.length;
//
//   const midRowPadding = '10px';
//
//   const outerRowPadding = isTinyScreen() || seats.length > 6
//     ? '40px'
//     : '60px';
//
//   return (
//     <React.Fragment>
//       <CircularTableRow style={{ justifyContent: 'space-around' }}>
//         {
//           topRowSeats.map((seatIndex, i) =>
//             <PokerTableSeat
//               key={seatIndex}
//               style={{
//                 marginLeft: i === 0 ? outerRowPadding : 'unset',
//                 marginRight: ((bottomRowLen === 3 && i === 2) || (bottomRowLen === 2 && i === 1)) && outerRowPadding,
//                 marginTop: topRowSeats.length === 3 && (i === 0 || i === 2) && '25px'
//               }}
//               type="badge"
//               onClick={() => onClick(seatIndex)}
//               isActive={_.get(seats[seatIndex], 'isActive')}
//               isHero={console.log('seatIndex === heroSeatIndex', seatIndex === heroSeatIndex, seatIndex, heroSeatIndex) || seatIndex === heroSeatIndex}
//               seatIndex={seatIndex}
//             />
//           )
//         }
//       </CircularTableRow>
//       {
//         _.flatMap(midRowsSeats, (seatIndicies, i) =>
//           // TODO: screen size change could break this key by index.
//           <CircularTableRow key={i} style={{
//             justifyContent: 'space-between',
//             paddingLeft: midRowsSeats.length === 3 && i !== 1 && midRowPadding,
//             paddingRight: midRowsSeats.length === 3 && i !== 1 && midRowPadding}
//           }>
//             {
//               seatIndicies.map((seatIndex) =>
//                 <PokerTableSeat
//                   key={seatIndex}
//                   type="badge"
//                   onClick={() => onClick(seatIndex)}
//                   isActive={_.get(seats[seatIndex], 'isActive')}
//                   isHero={seatIndex === heroSeatIndex}
//                   seatIndex={seatIndex}
//                 />
//               )
//             }
//           </CircularTableRow>
//         )
//       }
//       <CircularTableRow style={{ justifyContent: 'space-around' }}>
//         {
//           bottomRowSeats.map((seatIndex, i) =>
//             <PokerTableSeat
//               key={seatIndex}
//               style={{
//                 marginLeft: i === 0 && outerRowPadding,
//                 marginRight: ((bottomRowLen === 3 && i === 2) || (bottomRowLen === 2 && i === 1)) && outerRowPadding,
//                 marginTop: bottomRowLen === 3 && i === 1 && '25px'
//               }}
//               type="badge"
//               onClick={() => onClick(seatIndex)}
//               isActive={_.get(seats[seatIndex], 'isActive')}
//               isHero={seatIndex === heroSeatIndex}
//               seatIndex={seatIndex}
//             />
//           )
//         }
//       </CircularTableRow>
//     </React.Fragment>
//   );
// }

// const CircularTableRow = styled.div`
//   display: flex;
//   flex-direction: row;
//   margin-bottom: 20px;
// `;