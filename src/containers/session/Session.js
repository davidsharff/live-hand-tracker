import React, { useEffect } from 'react';
import { Table, Input } from 'reactstrap';
import { sessionType } from '../../types';
import actionTypes from '../../redux/actionTypes';

//import { bettingRounds, defaultSeats } from '../../../constants';
import connect from "react-redux/es/connect/connect";
import {defaultSeats} from "../../constants";

// TODO: seat selection defaults to two rows with two column radio buttons: empty | hero and third option on last item X remove.
// TODO: after initial setup, show num seats/players with potentially collapsed edit table, blinds, hero seat, and other details that have to be confirmed at start of each hand.
// TODO: consider exposing isHero, isActive, and remove for seats inside the handInput wizard screens so they never are forced to use the extra screen to confirm session details.
function Session(props) {
  const { session } = props;

  useEffect(() => {
    if (session === null) {
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

  if (session === null) {
    // TODO: any real loading indicator should use reactstrap spinners
    return (
      <div>Loading...</div>
    );
  }

  const handleChangeLocation = (location) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_LOCATION,
    payload: {
      location
    }
  });

  const handleSetHeroSeatIndex = (seatIndex) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_DEFAULT_HERO_SEAT_INDEX,
    payload: {
      seatIndex
    }
  });

  return(
    <div>
      <h1>Session</h1>
      {/* TODO: use past locations one day. */}
      <Input
        value={ session.location }
        onChange={(e) => handleChangeLocation(e.target.value)}
      />
      {/* TODO: add total seats input */}
      {
        <Table>
          <thead>
            <tr>
              <th>Seat</th>
              <th>Status</th>
              <th>Hero?</th>
            </tr>
          </thead>
          <tbody>
          {
            defaultSeats.map(({ isActive }, i) =>
              <tr key={i}>
                <td>Seat: { i + 1 }</td>
                <td>
                  {
                    session.defaultHeroSeatIndex === i
                      ? 'Hero'
                      : isActive
                        ? 'Filled'
                        : 'Empty'
                  }
                </td>
                <td>
                  <Input
                    type="checkbox"
                    checked={ session.defaultHeroSeatIndex === i }
                    onClick={() => handleSetHeroSeatIndex(i) }/>
                </td>
              </tr>
            )
          }
          </tbody>
        </Table>
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