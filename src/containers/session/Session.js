import React, { useEffect } from 'react';
import { Button, Col, Container, Row, Card, CardHeader, CardTitle, CardBody, Table, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { sessionType } from '../../types';
import actionTypes from '../../redux/actionTypes';

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

  const handleChangeMaxSeats = (change) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_TOTAL_SEATS,
    payload: {
      change
    }
  });

  const handleToggleActiveSeat = (seatIndex) => props.dispatch({
    type: actionTypes.UPDATE_SESSION_IS_ACTIVE_SEAT,
    payload: {
      seatIndex
    }
  });

  // TODO: consider breaking into discreet steps
  return(
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <CardTitle>
                Configure Session
              </CardTitle>
            </CardHeader>
            <CardBody>
              {/* TODO: use past locations one day. */}
              <Row className="mb-1">
                <InputGroup>
                  <InputGroupAddon addonType="prepend">Location</InputGroupAddon>
                  <Input
                    value={ session.location }
                    onChange={(e) => handleChangeLocation(e.target.value)}
                  />
                </InputGroup>
              </Row>
              <Row className="mb-1">
                <span>Max Seats</span>
                <Button size="sm" color="primary" className="ml-2" onClick={() => handleChangeMaxSeats(-1)} disabled={session.defaultSeats.length === 2}>
                  -1
                </Button>
                { session.defaultSeats.length }
                <Button size="sm" color="primary" onClick={() => handleChangeMaxSeats(1)} disabled={session.defaultSeats.length === 10}>
                  +1
                </Button>
              </Row>
              <Row className="mb-1">
              {/* TODO: add total seats input include note about value validation */}
                <Table>
                  <thead>
                  <tr>
                    <th>Seat</th>
                    <th>Occupied</th>
                    <th>Hero?</th>
                  </tr>
                  </thead>
                  <tbody>
                  {
                    // TODO: consider dropping defaultSeats constants if we can dynamically create based on numeric input
                    session.defaultSeats.map(({ isActive }, i) =>
                      <tr key={i}>
                        <td>Seat: { i + 1 }</td>
                        <td>
                          {
                            session.defaultHeroSeatIndex === i
                              ? 'Hero'
                              : <Input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => handleToggleActiveSeat(i)}
                              />
                          }
                        </td>
                        <td>
                          <Input
                            type="checkbox"
                            checked={ session.defaultHeroSeatIndex === i }
                            onChange={() => handleSetHeroSeatIndex(i) }/>
                        </td>
                      </tr>
                    )
                  }
                  </tbody>
                </Table>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

Session.propTypes = {
  session: sessionType
};

export default connect((state) => ({
  session: state.session
}))(Session);