import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Header from '../../components/Header';
import { sessionType } from '../../types';
import actionTypes from '../../redux/actionTypes';
//import { isValidSession } from "../../redux/reducers/session";

import connect from "react-redux/es/connect/connect";

// TODO: seat selection defaults to two rows with two column radio buttons: empty | hero and third option on last item X remove.
// TODO: after initial setup, show num seats/players with potentially collapsed edit table, blinds, hero seat, and other details that have to be confirmed at start of each hand.
// TODO: consider exposing isHero, isActive, and remove for seats inside the handInput wizard screens so they never are forced to use the extra screen to confirm session details.
function Session(props) {
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

  const handleChangeLocation = (location) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_LOCATION,
    payload: {
      location
    }
  });

  // const handleSetHeroSeatIndex = (seatIndex) => props.dispatch({
  //   type: actionTypes.UPDATE_SESSION_HERO_SEAT_INDEX,
  //   payload: {
  //     seatIndex
  //   }
  // });
  //
  // const handleChangeMaxSeats = (newTotalSeats) => props.dispatch({
  //   type: actionTypes.UPDATE_SESSION_TOTAL_SEATS,
  //   payload: {
  //     change: newTotalSeats - props.session.defaultSeats.length
  //   }
  // });
  //
  // const handleToggleActiveSeat = (seatIndex) => props.dispatch({
  //   type: actionTypes.UPDATE_SESSION_IS_ACTIVE_SEAT,
  //   payload: {
  //     seatIndex
  //   }
  // });

  const handleChangeSmallBlind = (smallBlind) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_SMALL_BLIND,
    payload: {
      smallBlind
    }
  });

  const handleChangeBigBlind = (bigBlind) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_BIG_BLIND,
    payload: {
      bigBlind
    }
  });

  // // TODO: refeator to named functions?
  // const handleClickNext = () => {
  //   localStorage.setItem('savedSession', JSON.stringify(session));
  //   // TODO: this should be in middleware that inspects the action type fire by next button
  //   if (props.hasHand) {
  //     // TODO: fire update hand action
  //     props.history.push('/hand');
  //   } else {
  //     props.dispatch({
  //       type: actionTypes.CREATE_HAND
  //     });
  //     props.history.push(`/hand/cards/seat/${session.defaultHeroSeatIndex}`);
  //   }
  // };

  // TODO: consider breaking into discreet steps
  return(
    <React.Fragment>
      <Header />
      <Container>
        <SessionField>
          <TextField
            label="Location"
            //className={classes.textField}
            value={session.location}
            onChange={(e) => handleChangeLocation(e.target.value)}
            margin="normal"
          />
        </SessionField>
        <SessionField>
          <InputLabel>Small Blind</InputLabel>
          <BlindSelect
            defaultValues={[1, 2, 5, 10]}
            currentValue={session.smallBlind}
            onChange={handleChangeSmallBlind}
            minValue={null}
            maxValue={session.bigBlind}
          />
        </SessionField>
        <SessionField>
          <InputLabel>Big Blind</InputLabel>
          <BlindSelect
            defaultValues={[2, 3, 5, 10]}
            currentValue={session.bigBlind}
            onChange={handleChangeBigBlind}
            minValue={session.smallBlind}
            maxValue={null}
          />
        </SessionField>
      </Container>
    </React.Fragment>
  );
}

Session.propTypes = {
  session: sessionType,
  hasHand: PropTypes.bool
};

export default withRouter(connect((state) => ({
  session: state.session,
  hasHand: state.hand !== null
}))(Session));

const SessionField = styled.div`
  margin-bottom: 20px;
`;

const BlindSelect = ({ defaultValues, currentValue, onChange, minValue, maxValue }) => {

  const [otherValue, setOtherValue] = useState(null);

  // TODO: determine if empty array really is best practice for ComponentDidMount and then silence this warning.
  useEffect(() => {
    if (!_.includes(defaultValues, currentValue)) {
      setOtherValue(currentValue);
    }
  }, []);

  const handleSelectDefault = (val) => {
    setOtherValue(null);
    onChange(val);
  };

  const handleChangeOtherValue = (e) => {
    const parsedVal = parseInt(e.target.value, 10);
    const val = isNaN(parsedVal)
      ? null
      : parsedVal;

    onChange(val);
    setOtherValue(val);
  };

  const isDefaultDisabled = (v) => (
    (!!minValue && v < minValue) ||
    (maxValue && v > maxValue)
  );

  return (
    <BlindsRow>
      {
        defaultValues.map((blind) =>
          <Button
            key={blind}
            disabled={isDefaultDisabled(blind)}
            color="primary"
            onClick={() => handleSelectDefault(blind)}
            // TODO: disable this outline globally
            style={{ marginRight: '5px', outline: 'none' }}
            variant={
              currentValue === blind && otherValue === null
                ? 'contained'
                : 'outlined'
            }
          >
            { blind }
          </Button>
        )
      }
      <TextField
        style={{ flexBasis: '20%'}}
        value={otherValue !== null ? otherValue : ''}
        onChange={handleChangeOtherValue}
        margin="none"
        type="number"
        label="Other"
        inputProps={{
          style: { textAlign: 'center' }
        }}
        inputLabelProps={{
          style: { textAlign: 'center' }
        }}
      />

    </BlindsRow>
  );
};

const BlindsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;