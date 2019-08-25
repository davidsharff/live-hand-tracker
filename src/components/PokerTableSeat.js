import React from 'react';
import Chip from "@material-ui/core/Chip/Chip";
import Avatar from "@material-ui/core/Avatar/Avatar";
import FaceIcon from '@material-ui/icons/Face';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import { useTheme } from '@material-ui/styles';

import styled from 'styled-components';

import { formatSeatIndexLabel } from "../utils";

export default function PokerTableSeat(props) {
  const { type, onClick, seatIndex, isActive, isHero, isSelected } = props;

  const GetAvatar = (props) => {
    return (
      <Avatar {...props}>
        {
          isHero
            ? <FaceIcon />
              : isActive
                ? <PersonIcon />
                : <PersonOutlineIcon />
        }
        {/*<span style={{ fontSize: '13px' }}>*/}
          {/*{*/}
            {/*positionLabelsMap['10'][seatIndex]*/}
          {/*}*/}
        {/*</span>*/}
      </Avatar>
    );
  };

  const getColor = (seatIndex) => {

    return (
      isHero
        ? 'secondary' // TODO: I don't really like red as a secondary color.
        : isActive
          ? 'primary'
          : 'default'
    );
  };

  const getLabel = (seatIndex) => {
    return (
      isActive
        ? formatSeatIndexLabel(seatIndex) // TODO: consider having this handle Empty label
        : <span style={{ width: '49px'}}>Empty</span>
    );
  };

  // TODO: when < 10 seats, consider leaving all 10 slots buy completing greying out non-applicable seats.
  return (
    type === 'badge'
      ? (
        <Chip
          variant="outlined"
          size="small"
          avatar={GetAvatar}
          label={getLabel(seatIndex)}
          clickable
          color={getColor(seatIndex)}
          onClick={onClick}
        />
      )
      : type === 'square'
        ? (
          <SquareSeat
            onClick={onClick}
            isHero={isHero}
            isActive={isActive}
            Avatar={GetAvatar}
            seatIndex={seatIndex}
            isSelected={isSelected}
          />
        )
        : null // TODO: consider validation / typing

  );
}

function SquareSeat(props) {
  const { onClick, isHero, isActive, seatIndex, Avatar, isSelected } = props;
  const theme = useTheme();
  const { palette } = theme;

  return (
    <SquareSeatContainer
      onClick={onClick}
      borderColor={isSelected ? palette.secondary.light : palette.primary.dark}
      backgroundColor={palette.grey['100']}
      heavyBorder={isSelected}
    >
      <Avatar
        style={{
          height: '24px',
          width:  '24px',
          // TODO: extract. This is ugly and bad.
          backgroundColor: isHero ? palette.secondary.dark : isActive ? palette.primary.dark : undefined
        }}
      />
      <div style={{ color: palette.text.secondary }}>
        Seat&nbsp;{ seatIndex + 1}
      </div>
    </SquareSeatContainer>
  );
}

const SquareSeatContainer = styled(({ borderColor, heavyBorder, ...rest}) => <div {...rest} />)`
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
