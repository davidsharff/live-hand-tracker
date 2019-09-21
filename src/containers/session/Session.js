import React, { useState } from 'react';
import _ from 'lodash';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';

import styled from 'styled-components';

import PokerTable from '../../components/PokerTable';
import { sessionType } from '../../types';

import { isValidSession } from "../../redux/reducers/sessionReducer";

function SessionConnector(props) {

  const {
    session,
    handleChangeLocation,
    handleChangeSmallBlind,
    handleChangeBigBlind,
    handleChangeTableSize,
    handleClickSeat,
    handleClickNext
  } = props;

  return(
    <Container>
      <SessionField>
        <TextField
          label="Location"
          //className={classes.textField}
          value={session.location}
          onChange={handleChangeLocation}
          margin="normal"
          style={{ marginTop: 0}}
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
          onChange={handleChangeTableSize}
          minValue={2}
          maxValue={10}
          hideOtherInput
        />
      </SessionField>
      <SessionField>
        <InputLabel>Configure Seats</InputLabel>
        <PokerTable
          seats={session.defaultSeats}
          heroSeatIndex={session.defaultHeroSeatIndex}
          onClickSeat={handleClickSeat}
          showLegend
        />
      </SessionField>
      <SessionField>
        <Button
          disabled={!isValidSession(session)}
          color="primary"
          onClick={handleClickNext}
          variant="outlined"
          fullWidth
        >
          Next
        </Button>
      </SessionField>
    </Container>
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

const SessionField = styled.div`
  margin-bottom: 20px;
`;

const NumberSelector = ({ defaultValues, currentValue, onChange, minValue, maxValue, hideOtherInput }) => {
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

  const pctWidthVal = 100 / (defaultValues.length + (hideOtherInput ? 0 : 1));
  // TODO: this should use an Input not TextField
  return (
    <NumberRow>
      {
        defaultValues.map((value) =>
          <NumberButton
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
          </NumberButton>
        )
      }
      {/* TODO: use input components instead of textfield to get rid of shrunk label */}
      {
        !hideOtherInput &&
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
      }
    </NumberRow>
  );
};

const NumberRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  height: 50px;
`;

const NumberButton = styled(({ pctWidth, ...rest}) => <Button { ...rest }/>)`
  && {
    min-width: unset;
    min-width: ${p => `calc(${p.pctWidth} - 5px)`};
    max-width: ${p => `calc(${p.pctWidth} - 5px)`};
    padding: 5px 25px;
    // TODO: disable this outline globally
    outline: none;
  }
`;