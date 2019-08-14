import React from "react";
import _ from 'lodash';
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FaceIcon from '@material-ui/icons/Face';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import { useTheme } from '@material-ui/styles';


import styled from 'styled-components';
import {formatSeatIndexLabel, isTinyScreen} from "../utils";


export default function PokerTable({ seats, onToggleActiveSeat, onSetHeroSeatIndex, heroSeatIndex }) {
  const theme = useTheme();
  const { palette } = theme;

  if (!seats.length) {
   return null;
  }

  // const handleClick = (seatIndex) => {
  //   if (seatIndex === heroSeatIndex) {
  //     onSetHeroSeatIndex(null);
  //   } else  {
  //     if (seats[seatIndex].isActive && heroSeatIndex === null) {
  //       onSetHeroSeatIndex(seatIndex);
  //     } else {
  //       onToggleActiveSeat(seatIndex);
  //     }
  //   }
  // };

  const getAvatar = (seatIndex) => {
    const isActive = seats[seatIndex].isActive;

    return (
      <Avatar>
        {
          seatIndex === heroSeatIndex
            ? <FaceIcon />
            : isActive
              ? <PersonIcon />
              : <PersonOutlineIcon />
        }
      </Avatar>
    );
  };

  const getColor = (seatIndex) => {
    const isActive = seats[seatIndex].isActive;

    return (
      seatIndex === heroSeatIndex
        ? 'secondary' // TODO: I don't really like red as a secondary color.
        : isActive
          ? 'primary'
          : ''
    );
  };

  const getLabel = (seatIndex) => {
    const isActive = seats[seatIndex].isActive;

    return (
      isActive
        ? formatSeatIndexLabel(seatIndex) // TODO: consider having this handle Empty label
        : <span style={{ width: '49px'}}>Empty</span>
    );
  };

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

  // TODO: all of the below need serious refactor once/if general approach is confirmed.
  // TODO: can seat 1 position choice be improved?
  const topRowSeats = seats.length === 6
    ? [2, 3]
    : [4, 5, 6];

  const midRowsSeats = seats.length === 6
    ? [[1, 4]]
    : [[3, 7], [2, 8]];

  const bottomRowSeats =  seats.length === 6
    ? [0, 5]
    : [1, 0, 9];

  const bottomRowLen = bottomRowSeats.length;

  const midRowPadding = '10px';

  const outerRowPadding = isTinyScreen() || seats.length > 6
    ? '40px'
    : '60px';

  console.log('thme', theme);
  return (
    <React.Fragment>
      <InputLabel shrink>Tap to Change</InputLabel>
      <LegendRow>
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
      <div style={{ marginTop: '20px'  }}>
        <TableRow style={{ justifyContent: 'space-around' }}>
          {
            topRowSeats.map((seatIndex, i) =>
              <Chip
                style={{
                  marginLeft: i === 0 ? outerRowPadding : 'unset',
                  marginRight: ((bottomRowLen === 3 && i === 2) || (bottomRowLen === 2 && i === 1)) && outerRowPadding,
                  marginTop: topRowSeats.length === 3 && (i === 0 || i === 2) && '25px'
                }}
                key={seatIndex}
                avatar={getAvatar(seatIndex)}
                variant="outlined"
                size="small"
                label={getLabel(seatIndex)}
                clickable
                color={getColor(seatIndex)}
              />
            )
          }
        </TableRow>
        {
          _.flatMap(midRowsSeats, (seats, i) =>
            // TODO: screen size change could break this key by index.
            <TableRow key={i} style={{
              justifyContent: 'space-between',
              paddingLeft: midRowsSeats.length === 3 && i !== 1 && midRowPadding,
              paddingRight: midRowsSeats.length === 3 && i !== 1 && midRowPadding}
            }>
              {
                seats.map((seatIndex) =>
                  <Chip
                    key={seatIndex}
                    variant="outlined"
                    size="small"
                    avatar={getAvatar(seatIndex)}
                    label={getLabel(seatIndex)}
                    clickable
                    color={getColor(seatIndex)}
                  />
                )
              }
            </TableRow>
          )
        }
        <TableRow style={{ justifyContent: 'space-around' }}>
          {
            bottomRowSeats.map((seatIndex, i) =>
              <Chip
                style={{
                  marginLeft: i === 0 && outerRowPadding,
                  marginRight: ((bottomRowLen === 3 && i === 2) || (bottomRowLen === 2 && i === 1)) && outerRowPadding,
                  marginTop: bottomRowLen === 3 && i === 1 && '25px'
                }}
                key={seatIndex}
                variant="outlined"
                size="small"
                avatar={getAvatar(seatIndex)}
                label={getLabel(seatIndex)}
                clickable
                color={getColor(seatIndex)}
              />
            )
          }
        </TableRow>
      </div>
    </React.Fragment>
  );
}

const TableRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
`;

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