import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { sessionType } from '../../types';
import actionTypes from '../../redux/actionTypes';

import { isValidSession } from "../../redux/reducers/sessionReducer";

import Session from './Session';

// TODO: seat selection defaults to two rows with two column radio buttons: empty | hero and third option on last item X remove.
// TODO: after initial setup, show num seats/players with potentially collapsed edit table, blinds, hero seat, and other details that have to be confirmed at start of each hand.
// TODO: consider exposing isHero, isActive, and remove for seats inside the handInput wizard screens so they never are forced to use the extra screen to confirm session details.
function SessionConnector(props) {
  const { session } = props;

  useEffect(() => {
    if (session === null) {
      props.dispatch({
        type: actionTypes.CREATE_SESSION
      });
    }
  });

  if (session === null) {
    // TODO: any real loading indicator should use reactstrap spinners
    return (
      <div>Loading...</div>
    );
  }

  const handleChangeLocation = (e) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_LOCATION,
    payload: {
      location: e.target.value
    }
  });

  const handleChangeTableSize = (newTotalSeats) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_TOTAL_SEATS,
    payload: {
      change: newTotalSeats - props.session.defaultSeats.length
    }
  });

  const handleToggleActiveSeat = (seatIndex) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_IS_ACTIVE_SEAT,
    payload: {
      seatIndex
    }
  });

  // TODO: handle blur on enter
  const handleChangeBigBlind = (bigBlind) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_BIG_BLIND,
    payload: {
      bigBlind
    }
  });

  const handleClickSeat = (seatIndex) => {
    const { defaultHeroSeatIndex } = session;
    if (seatIndex === defaultHeroSeatIndex) {
      handleSetHeroSeatIndex(null);
    } else  {
      if (defaultHeroSeatIndex === null) {
        handleSetHeroSeatIndex(seatIndex);
      } else {
        handleToggleActiveSeat(seatIndex);
      }
    }
  };

  const handleSetHeroSeatIndex = (seatIndex) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_HERO_SEAT_INDEX,
    payload: {
      seatIndex
    }
  });

  const handleChangeSmallBlind = (smallBlind) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_SMALL_BLIND,
    payload: {
      smallBlind
    }
  });

  const handleClickNext = () => {
    // TODO: this should be in middleware that inspects the action type fire by next button
    if (props.hasHand) {
      // TODO: fire update hand action
    } else {
      props.dispatch({
        type: actionTypes.CREATE_HAND
      });
    }
    props.history.push('/hand/actions');
  };

  // TODO: consider breaking into discreet steps
  return(
    <Session
      session={session}
      isValidSession={isValidSession(session)}
      handleChangeLocation={handleChangeLocation}
      handleChangeSmallBlind={handleChangeSmallBlind}
      handleChangeBigBlind={handleChangeBigBlind}
      handleChangeTableSize={handleChangeTableSize}
      handleClickSeat={handleClickSeat}
      handleClickNext={handleClickNext}
    />
  );
}

SessionConnector.propTypes = {
  session: sessionType,
  hasHand: PropTypes.bool
};

export default withRouter(connect((state) => ({
  session: state.session,
  hasHand: state.hand !== null
}))(SessionConnector));