import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Col, Container, Row, Card, CardHeader, CardTitle, CardBody, Table, Input, InputGroup, InputGroupAddon } from 'reactstrap';

import { sessionType } from '../../types';
import actionTypes from '../../redux/actionTypes';
import { isValidSession} from '../../selectors';

import connect from "react-redux/es/connect/connect";

// TODO: seat selection defaults to two rows with two column radio buttons: empty | hero and third option on last item X remove.
// TODO: after initial setup, show num seats/players with potentially collapsed edit table, blinds, hero seat, and other details that have to be confirmed at start of each hand.
// TODO: consider exposing isHero, isActive, and remove for seats inside the handInput wizard screens so they never are forced to use the extra screen to confirm session details.
function Session(props) {
  const { session } = props;

  useEffect(() => {
    if (session === null) {
      const storedSessionStr = localStorage.getItem('savedSession');

      if (storedSessionStr) {
        props.dispatch({
          type: actionTypes.LOAD_SESSION,
          payload: {
            session: JSON.parse(storedSessionStr)
          },
          aux: {
            redirectToFn: (pathName) => props.history.push(pathName)
          }
        });
      } else {
        props.dispatch({
          type: actionTypes.CREATE_SESSION
        });
      }
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

  const handleChangeSmallBlind = (e) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_SMALL_BLIND,
    payload: {
      smallBlind: parseInt(e.target.value, 10)
    }
  });

  const handleChangeBigBlind = (e) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_BIG_BLIND,
    payload: {
      bigBlind: parseInt(e.target.value, 10)
    }
  });

  // TODO: refeator to named functions?
  const handleClickNext = () => {

    // TODO: this should be in middleware that inspects the action type fire by next button
    if (props.hasHand) {
      // TODO: fire update hand action
    } else {
      localStorage.setItem('savedSession', JSON.stringify(session));
      props.dispatch({
        type: actionTypes.CREATE_HAND,
        payload: {
          hand: {
            heroSeatIndex: session.defaultHeroSeatIndex,
            seats: session.defaultSeats,
            smallBlind: session.smallBlind,
            bigBlind: session.bigBlind
          }
        },
        aux: {
          redirectToFn: (pathName) => props.history.push(pathName)
        }
      });
    }
  };

  // TODO: consider breaking into discreet steps
  return(
    <Container fluid>
      <Row>
        <Col>
          <Card style={{minHeight: '100vh'}}>
            <CardHeader>
              <CardTitle>
                Configure Session
              </CardTitle>
            </CardHeader>
            <CardBody className="d-flex flex-column justify-content-between">
              {/* TODO: use past locations one day. */}
              <Col className="p-0">
                <Row className="pb-2">
                  <InputGroup size="sm">
                    <InputGroupAddon addonType="prepend">Location</InputGroupAddon>
                    <Input
                      value={ session.location }
                      onChange={(e) => handleChangeLocation(e.target.value)}
                    />
                  </InputGroup>
                </Row>
                <Row className="py-2">
                  <BlindInputGroup size="sm">
                    <InputGroupAddon addonType="prepend" type="number">SB</InputGroupAddon>
                    <Input type="number" value={session.smallBlind || ''} onChange={handleChangeSmallBlind} />
                  </BlindInputGroup>
                  <BlindInputGroup size="sm">
                    <InputGroupAddon addonType="prepend">BB</InputGroupAddon>
                    <Input type="number" value={session.bigBlind || ''} onChange={handleChangeBigBlind} />
                  </BlindInputGroup>
                </Row>
                <Row className="py-2">
                  <UncontrolledDropdown size="sm">
                    <DropdownToggle caret>
                      {
                        session.defaultSeats.length === 0
                          ? 'Set Table Size'
                          : `${session.defaultSeats.length} Total Seats`
                      }
                    </DropdownToggle>
                    <DropdownMenu>
                      {
                        _.range(2, 11).reverse().map((num) =>
                          num !== session.defaultSeats.length &&
                          <DropdownItem key={num} onClick={() => handleChangeMaxSeats(num)}>
                            { num } Total Seats
                          </DropdownItem>
                        )
                      }
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </Row>
                <Row className="py-2">
                  <Table>
                    <thead>
                    <tr>
                      <th>Seat</th>
                      <CheckBoxCellHeader>Occupied</CheckBoxCellHeader>
                      <CheckBoxCellHeader>Hero?</CheckBoxCellHeader>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      !!session.defaultSeats.length &&
                      // TODO: consider dropping defaultSeats constants if we can dynamically create based on numeric input
                      session.defaultSeats.map(({ isActive }, i) =>
                        <tr key={i}>
                          <td>Seat: { i + 1 }</td>
                          <CheckBoxCell>
                            <Input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleToggleActiveSeat(i)}
                              disabled={session.defaultHeroSeatIndex === i}
                            />
                          </CheckBoxCell>
                          <CheckBoxCell>
                            <Input
                              type="checkbox"
                              checked={ session.defaultHeroSeatIndex === i }
                              onChange={() => handleSetHeroSeatIndex(i) }/>
                          </CheckBoxCell>
                        </tr>
                      )
                    }
                    </tbody>
                  </Table>
                </Row>
              </Col>
              <Row className="justify-self-end">
                <SubmitButton outline disabled={!isValidSession(session)} onClick={handleClickNext}>
                  Next
                </SubmitButton>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
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

const BlindInputGroup = styled(InputGroup)`
  max-width: 65px;
  margin-right: 10px;
`;

const SubmitButton = styled(Button)`
  min-width: 100%;
`;

const CheckBoxCellHeader = styled.th`
  text-align: center;
`;

const CheckBoxCell = styled.td`
  text-align: center;
`;