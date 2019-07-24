import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { Container, Row } from 'reactstrap';

import { positionLabelsMap } from '../../../constants';

export default function OverviewWizard(props) {
  const { hand } = props;

  return (
    <Container>
      <Row>
        {
          hand.seats.map((s, i) =>
            <HeaderItem key={i} isButtonInputMode={hand.buttonSeatIndex === null}>
              <div>
                {
                  i === hand.heroSeatIndex
                    ? 'Hero'
                    : `Seat ${ i + 1 }`
                }
              </div>
              {
                s.isActive && (hand.buttonSeatIndex !== null) &&
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
        <div style={{ width: '100%'}}>
          {
            hand.buttonSeatIndex === null &&
            <div>Where's the button (tap seat above to set position)?</div>

          }
        </div>
      </Row>
    </Container>
  );
}

const HeaderItem = styled.div`
  flex-basis: 20%;
  font-size: 14px;
  height: 75px;
  padding: 2px 0 0 4px;
  border: ${p => 
    p.isButtonInputMode
      ? 'solid #aaa 2px'
      : 'solid #eee 1px'
  };
`;

function getSeatPositionLabel(hand, targetSeatIndex, buttonSeatIndex) {
  const decoratedSeats = hand.seats.map((s, i) => _.assign({}, s, {
    seatIndex: i
  }));

  const decoratedActiveSeats = _.filter(decoratedSeats, 'isActive');

  const seatsByPositionOrder = [
    ...decoratedActiveSeats.slice(buttonSeatIndex),
    ...decoratedActiveSeats.slice(0, buttonSeatIndex)
  ];

  const positionOrderIndex = _.findIndex(seatsByPositionOrder, { seatIndex: targetSeatIndex });

  const positionLabels = positionLabelsMap[decoratedActiveSeats.length];

  return positionLabels[positionOrderIndex];
}

