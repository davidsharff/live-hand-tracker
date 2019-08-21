import React from 'react';
import Chip from "@material-ui/core/Chip/Chip";
import Avatar from "@material-ui/core/Avatar/Avatar";
import FaceIcon from '@material-ui/icons/Face';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';

import { formatSeatIndexLabel } from "../utils";

export default function PokerTableSeat(props) {
  const { type, onClick, seatIndex, isActive, isHero } = props;

  const getAvatar = (seatIndex) => {
    return (
      <Avatar>
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
          avatar={getAvatar(seatIndex)}
          label={getLabel(seatIndex)}
          clickable
          color={getColor(seatIndex)}
          onClick={onClick}
        />
      )
      : type === 'square'
        ? (
          <div>{ getLabel(seatIndex) }</div>
        )
        : null // TODO: consider validation / typing

  );
}
