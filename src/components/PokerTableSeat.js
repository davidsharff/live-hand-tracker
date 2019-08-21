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
  const { type, onClick, seatIndex, isActive, isHero } = props;

  const theme = useTheme();
  const { palette } = theme;

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
            borderColor={palette.primary.dark}
          >
            <GetAvatar
              style={{
                height: isHero ? '26px' : '24px',
                width:  isHero ? '26px' : '24px',
                // TODO: extract. This is ugly and bad.
                backgroundColor: isHero ? palette.secondary.dark : isActive ? palette.primary.dark : undefined
              }}
            />
            <div style={{ color: palette.text.secondary }}>
              Seat&nbsp;{ seatIndex + 1}
            </div>
          </SquareSeat>
        )
        : null // TODO: consider validation / typing

  );
}

const SquareSeat = styled(({ borderColor, ...rest}) => <div {...rest} />)`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  flex-basis: 19%;
  margin-bottom: 5px;
  height: 70px;
  //background-color: #303f9f;
  border: ${p => `solid ${p.borderColor} 1px`};
  border-radius: 5px;
  font-size: 12px;
`;
