import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { Container, Row, Col, Button, Input } from 'reactstrap';

import {
  getAvailableActionForSeatIndex,
  getNextToActSeatIndex,
  getSeatPositionLabel
} from "../../../redux/reducers/hand";

import { handActionTypes } from "../../../constants";

export default function OverviewWizard(props) {
  const { hand } = props;

  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  const nextToActSeatIndex = hand.buttonSeatIndex !== null
    ? getNextToActSeatIndex(hand)
    : null;

  useEffect(() => {
    if (hand.buttonSeatIndex !== null) {
      setSelectedSeatIndex(nextToActSeatIndex);
    }
  }, [hand.buttonSeatIndex, nextToActSeatIndex]);

  const actionComponentMap = createActionComponentsMap();

  return (
    <Container>
      <Row className="mb-1">
        {
          hand.seats.map((s, i) =>
            <HeaderItem
              key={i}
              isButtonInputMode={hand.buttonSeatIndex === null}
              onClick={() => hand.buttonSeatIndex === null && props.onSetButtonSeatIndex(i)}
              className="d-flex flex-column justify-content-between"
              isSelected={selectedSeatIndex === i}
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
                    {
                      (() => {
                        const action = _.find(hand.actions, { bettingRound: hand.currentBettingRound, seatIndex: i });

                        return action && (
                          <React.Fragment>
                            <div>{_.capitalize(action.actionType)}</div>
                            <div>${action.amount}</div>
                          </React.Fragment>
                        );
                      })()
                    }
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
          {
            hand.buttonSeatIndex !== null &&
            getAvailableActionForSeatIndex(hand, selectedSeatIndex + 1).map(availableAction =>
              <div key={availableAction.type}>
                {
                  actionComponentMap[availableAction.type]()
                }
              </div>
            )
          }
        </div>
      </Row>
    </Container>
  );
}

const HeaderItem = styled(({ isButtonInputMode, isSelected, ...rest }) => <Col {...rest} />)`
  flex-basis: 20%;
  font-size: 12px;
  height: 75px;
  padding: 1px 1px 0 4px;
  border: ${p => 
    p.isButtonInputMode || p.isSelected
      ? 'solid #28a745 2px'
      : 'solid #eee 1px'
  };
`;

function createActionComponentsMap(handleCall, handleFold, handleRaise, liveAmount) {

  const CallComponent = ({ onCall }) => (
    <Button onClick={handleCall}>Call</Button>
  );

  const RaiseComponent = ({ onRaise, liveAmount }) => {
    const { raiseAmount, setRaiseAmount } = useState(liveAmount * 2);

    const handleChange = (e) => {
      const newValue = parseInt(e.target.value);
      if (newValue > (liveAmount * 2)) {
        setRaiseAmount(newValue);
      }
    };

    return (
      <Row>
        <Button onClick={handleRaise}>Raise</Button>
        <Input type="number" value={raiseAmount} onChange={handleChange}>
          { raiseAmount }
        </Input>
      </Row>
    );
  };

  const FoldComponent = ({ onFold }) => (
    <Button onClick={handleFold}>Fold</Button>
  );

  return {
    [handActionTypes.CALL]:  () =>  <CallComponent  onCall={handleCall}   />,
    [handActionTypes.FOLD]:  () =>  <FoldComponent  onFold={handleFold}   />,
    [handActionTypes.RAISE]: () =>  <RaiseComponent onRaise={handleRaise} liveAmount={liveAmount} />
  };
}

const ActionRow = styled(Row)`
  margin-top: -12px !important;
`;