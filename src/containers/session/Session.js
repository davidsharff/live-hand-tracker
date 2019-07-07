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

  const handleChangeLocation = (location) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_LOCATION,
    payload: {
      location
    }
  });

  if (props.session === null) {
    // TODO: any real loading indicator should use reactstrap spinners
    return (
      <div>Loading...</div>
    );
  }

  return(
    <div>
      <h1>Session</h1>
      {/* TODO: use past locations one day. */}
      <Input
        value={ props.session.location }
        onChange={(e) => handleChangeLocation(e.target.value)}
      />
      {
        <Table>
          <thead>
            <tr>
              <th>Seat</th>
              <th>Is Empty?</th>
              <th>Hero?</th>
            </tr>
          </thead>
          <tbody>
          {
            props.session.defaultSeats.map(({ isActive }, i) =>
              <tr key={i}>
                <td>Seat: { i + 1 }</td>
                <td>{ isActive ? 'No' : 'Yes' }</td>
                <td>{ props.session.defaultHeroSeatIndex === i ? 'Yes' : 'No' }</td>
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