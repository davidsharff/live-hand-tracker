import React, { useEffect } from 'react';
import { sessionType } from '../../types';
import actionTypes from '../../redux/actionTypes';

//import { bettingRounds, defaultSeats } from '../../../constants';
import connect from "react-redux/es/connect/connect";
import {defaultSeats} from "../../constants";

// TODO: seat selection defaults to two rows with two column radio buttons: empty | hero and third option on last item X remove.
// TODO: after initial setup, show num seats/players with potentially collapsed edit table, blinds, hero seat, and other details that have to be confirmed at start of each hand.
// TODO: consider exposing isHero, isActive, and remove for seats inside the handInput wizard screens so they never are forced to use the extra screen to confirm session details.
function Session(props) {

  useEffect(() => {
    if (props.session === null) {
      props.dispatch({
        type: actionTypes.CREATE_SESSION,
        payload: {
          session: {
            location: '',
            defaultHeroSeatIndex: null,
            defaultSeats
          }
        }
      });
    }
  });

  if (props.session === null) {
    return (
      <div>Loading...</div>
    );
  }

  return(
    <div>
      <h1>Session</h1>
      {
        props.session.defaultSeats.map(({ isActive }, i) =>
          <div key={i}>
            <span>Seat: { i + 1 }</span>
            <span>&nbsp;Active? { isActive }</span>
          </div>
        )
      }
    </div>
  );
}

Session.propTypes = {
  session: sessionType
};

export default connect((state) => ({
  session: state.session
}))(Session);

// useEffect(() =>
//   props.dispatch({
//     type: actionTypes.CREATE_HAND,
//     payload: {
//       bettingRound: bettingRounds[0],
//       heroSeatIndex: 3,
//       // TODO: consider using a set instead of array.
//       seats: props.hand.seats.length
//         ? props.hand.seats
//         : defaultSeats
//     }
//   }));