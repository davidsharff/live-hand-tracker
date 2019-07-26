import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { Container, Row, Col } from 'reactstrap';

import { positionLabelsMap } from '../../../constants';

export default function OverviewWizard(props) {
  const { hand, blinds } = props;

  return (
    <Container>
      <Row className="mb-1">
        {
          hand.seats.map((s, i) =>
            <HeaderItem
              key={i}
              isButtonInputMode={hand.buttonSeatIndex === null}
              onClick={() => props.onSetButtonSeatIndex(i)}
              className="d-flex flex-column justify-content-between"
            >
              <Row className="d-flex flex-row justify-content-between m-0 flex-fill">
                {
                  s.isActive
                    ? (
                      <React.Fragment>
                        <span>
                          {
                            i === hand.heroSeatIndex
                              ? 'Hero'
                              : `S${ i + 1 }`
                          }
                       </span>
                        {
                          hand.buttonSeatIndex !== null &&
                          <span>{ getSeatPositionLabel(hand, i, hand.buttonSeatIndex) }</span>
                        }
                      </React.Fragment>
                    )
                    : <span>Empty</span>
                }
              </Row>
              <ActionRow className="d-flex flex-row justify-content-around m-0 flex-fill align-items-start">
                {
                  hand.buttonSeatIndex !== null &&
                  <div style={{fontSize: '12px'}}>
                    <span>
                      {
                        getSeatPositionLabel(hand, i, hand.buttonSeatIndex) === 'SB'
                          ? blinds.small
                          : getSeatPositionLabel(hand, i, hand.buttonSeatIndex) === 'BB'
                            ? blinds.big
                            : null
                      }
                    </span>
                  </div>
                }
              </ActionRow>
            </HeaderItem>
          )
        }
      </Row>
      <Row className="d-flex flex-row justify-content-center">
        {
          // TODO: need input for selecting Button position and consider expandable editable session details.
          // TODO: also consider editable session details on action input (expandable or otherwise out of the way as well)
        }
        <div style={{ textAlign: 'center'}}>
          {
            hand.buttonSeatIndex === null &&
            <React.Fragment>
              <div>Where's the button?</div>
              <div>Tap seat above to set position</div>
            </React.Fragment>

          }
        </div>
      </Row>
    </Container>
  );
}

const HeaderItem = styled(Col)`
  flex-basis: 20%;
  font-size: 12px;
  height: 75px;
  padding: 1px 1px 0 4px;
  border: ${p => 
    p.isButtonInputMode
      ? 'solid #28a745 2px'
      : 'solid #eee 1px'
  };
`;

const ActionRow = styled(Row)`
  margin-top: -12px !important;
`;

function getSeatPositionLabel(hand, targetSeatIndex, buttonSeatIndex) {
  const decoratedSeats = hand.seats.map((s, i) => _.assign({}, s, {
    seatIndex: i
  }));

  const decoratedActiveSeats = _.filter(decoratedSeats, 'isActive');

  const convertedButtonIndex =_.findIndex(decoratedActiveSeats, { seatIndex: buttonSeatIndex });

  const seatsByPositionOrder = [
    ...decoratedActiveSeats.slice(convertedButtonIndex),
    ...decoratedActiveSeats.slice(0, convertedButtonIndex)
  ];

  const positionOrderIndex = _.findIndex(seatsByPositionOrder, { seatIndex: targetSeatIndex });

  const positionLabels = positionLabelsMap[decoratedActiveSeats.length];

  return positionLabels[positionOrderIndex];
}

