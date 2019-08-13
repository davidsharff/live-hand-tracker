import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';

// TODO: move to another component, particularly since it has more usecases after redesign and may be fancy poker table display.
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';


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

  const handleSetHeroSeatIndex = (seatIndex) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_HERO_SEAT_INDEX,
    payload: {
      seatIndex
    }
  });

  const handleChangeMaxSeats = (newTotalSeats) => props.dispatch({
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
          <NumberSelector
            defaultValues={[1, 2, 5, 10]}
            currentValue={session.smallBlind}
            onChange={handleChangeSmallBlind}
            minValue={null}
            maxValue={session.bigBlind}
          />
        </SessionField>
        <SessionField>
          <InputLabel>Big Blind</InputLabel>
          <NumberSelector
            defaultValues={[2, 3, 5, 10]}
            currentValue={session.bigBlind}
            onChange={handleChangeBigBlind}
            minValue={session.smallBlind}
            maxValue={null}
          />
        </SessionField>
        <SessionField>
          <InputLabel>Table Size (total seats)</InputLabel>
          <NumberSelector
            defaultValues={[6, 9, 10]}
            currentValue={session.defaultSeats.length || null}
            onChange={handleChangeMaxSeats}
            minValue={2}
            maxValue={10}
          />
        </SessionField>
        <SessionField>
          <InputLabel>Configure Seats</InputLabel>
          <Paper>
            <Table>
              <TableHead>
              <TableRow>
                <TableCell>Seat</TableCell>
                <TableCell >Occupied</TableCell>
                <TableCell>Hero?</TableCell>
              </TableRow>
              </TableHead>
              <TableBody>
              {
                !!session.defaultSeats.length &&
                // TODO: consider dropping defaultSeats constants if we can dynamically create based on numeric input
                session.defaultSeats.map(({ isActive }, i) =>
                  <TableRow key={i}>
                    <TableCell>Seat: { i + 1 }</TableCell>
                    <TableCell>
                      <Checkbox
                        color="primary"
                        checked={isActive}
                        onChange={() => handleToggleActiveSeat(i)}
                        disabled={session.defaultHeroSeatIndex === i}
                      />
                      {/*<Input*/}
                        {/*type="checkbox"*/}

                      {/*/>*/}
                    </TableCell>
                    <TableCell>
                      <Radio
                        checked={ session.defaultHeroSeatIndex === i }
                        onChange={() => handleSetHeroSeatIndex(i)
                        }/>
                    </TableCell>
                  </TableRow>
                )
              }
              </TableBody>
            </Table>
          </Paper>
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

const NumberSelector = ({ defaultValues, currentValue, onChange, minValue, maxValue }) => {
  const [otherValue, setOtherValue] = useState(_.includes(defaultValues, currentValue) ? null : currentValue);

  const handleSelectDefault = (val) => {
    setOtherValue(null);
    onChange(val);
  };

  const handleChangeOtherValue = (e) => {
    // TODO: incorporate min/max validation here too
    // TODO: look in the mirror and deeply reflect if the cause of such madness with number type inputs
    // is in nature of the spec itself, or a personal flaw that needs conquering.
    const parsedVal = parseInt(e.target.value, 10);
    const val = isNaN(parsedVal)
      ? null
      : parsedVal;

    onChange(val);
    setOtherValue(val === null ? '' : val);
  };

  const isDefaultDisabled = (v) => (
    (!!minValue && v < minValue) ||
    (maxValue && v > maxValue)
  );

  const pctWidthVal = 100 / (defaultValues.length + 1);
  // TODO: this should use an Input not TextField
  return (
    <BlindsRow>
      {
        defaultValues.map((value) =>
          <BlindButton
            key={value}
            disabled={isDefaultDisabled(value)}
            color="primary"
            onClick={() => handleSelectDefault(value)}
            variant={
              currentValue === value && otherValue === null
                ? 'contained'
                : 'outlined'
            }
            pctWidth={pctWidthVal+ '%'}
          >
            { value }
          </BlindButton>
        )
      }
      {/* TODO: use input components instead of textfield to get rid of shrunk label */}
      <TextField
        style={{ flexBasis: '20%' }}
        value={otherValue !== null ? otherValue : ''}
        onChange={handleChangeOtherValue}
        margin="none"
        type="number"
        label="Other"
        inputProps={{
          style: { textAlign: 'center' }
        }}
      />
    </BlindsRow>
  );
};

const BlindsRow = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 48px;
  justify-content: space-between;
  align-items: baseline;
`;

const BlindButton = styled(({ pctWidth, ...rest}) => <Button { ...rest }/>)`
  && {
    min-width: unset;
    //padding: 10px;
    min-width: ${p => `calc(${p.pctWidth} - 5px)`};
    max-width: ${p => `calc(${p.pctWidth} - 5px)`};
    padding: 5px 25px;
    // TODO: disable this outline globally
    outline: none;
  }
`;