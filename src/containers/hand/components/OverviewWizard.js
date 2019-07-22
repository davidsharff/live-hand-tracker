import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { Container, Row } from 'reactstrap';

export default function OverviewWizard(props) {
  const { hand } = props;

  return (
    <Container>
      <Row>
        {
          hand.seats.map((s, i) =>
            <HeaderItem key={i}>
              <div>
                {
                  i === hand.heroSeatIndex
                    ? 'Hero'
                    : `Seat ${ i + 1 }`
                }
              </div>
              {
                s.isActive && hand.buttonSeatIndex !== null &&
                <div>{ getSeatPositionLabel(hand, i, hand.buttonSeatIndex) }</div>
              }
              {
                !s.isActive &&
                <div>Empty</div>
              }
            </HeaderItem>
          )
        }
      </Row>
      <Row>
        {
          // TODO: need input for selecting Button position and consider expandable editable session details.
          // TODO: also consider editable session details on action input (expandable or otherwise out of the way as well)
        }
        <div style={{ width: '100%'}}>Body</div>
      </Row>
    </Container>
  );
}

const HeaderItem = styled.div`
  flex-basis: 20%;
  font-size: 14px;
  height: 75px;
  border: solid #eee 1px;
  padding: 2px 0 0 4px;
`;

function getSeatPositionLabel(hand, targetSeatIndex, buttonSeatIndex) {
  const decoratedSeats = hand.seats.map((s, i) => _.assign({}, s, {
    seatIndex: i
  }));

  const decoratedActiveSeats = _.filter(decoratedSeats, 'isActive');

  const seatsByPositionOrder = [
    ...decoratedActiveSeats.slice(buttonSeatIndex + 1),
    ...decoratedActiveSeats.slice(0, buttonSeatIndex),
    decoratedActiveSeats[buttonSeatIndex]
  ];

  const positionOrderIndex = _.findIndex(seatsByPositionOrder, { seatIndex: targetSeatIndex });

  if (decoratedActiveSeats.length === 9) {
    // TODO: better support for relative position labels for small tables (< 5 seats)
    return positionOrderIndex === 0
      ? 'SB'
      : positionOrderIndex === 1
        ? 'BB'
        : positionOrderIndex === 2
          ? 'EP1'
          : positionOrderIndex === 3
            ? 'EP2'
            : positionOrderIndex === 4
              ? 'MP1'
              : positionOrderIndex === 5
                ? 'MP2'
                : positionOrderIndex === 6
                  ? 'HJ'
                  : positionOrderIndex === 7
                    ? 'CO'
                    : 'Button';
  }

  throw new Error('TODO: need support different table sizes when getting seat position label');
}