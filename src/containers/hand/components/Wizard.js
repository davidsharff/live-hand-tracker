import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { Container, Row, Col, Button, Input } from 'reactstrap';

import {
  getAvailableActionForSeatIndex,
  getCurrentActionsForSeat,
  getCurrentAmountInvestedForSeat,
  getNextToActSeatIndex,
  getPositionLabelForSeatIndex,
} from "../../../redux/reducers/hand";

import { handActionTypes } from "../../../constants";

export default function OverviewWizard(props) {
  const { hand } = props;

  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);

  const nextToActSeatIndex = hand.buttonSeatIndex !== null
    ? getNextToActSeatIndex(hand, selectedSeatIndex)
    : null;

  useEffect(() => {
    if (hand.buttonSeatIndex !== null) {
      setSelectedSeatIndex(nextToActSeatIndex);
    }
  }, [hand.buttonSeatIndex, nextToActSeatIndex]);

  const handleAction = (actionType, amount) => props.onAction(selectedSeatIndex, actionType, amount);

  const actionComponentMap = createActionComponentsMap(handleAction);

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
                          <span>
                            { s.isActive
                              ? getPositionLabelForSeatIndex(hand, i, s)
                              : 'Empty'
                            }
                          </span>
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
                        const action = _.last(getCurrentActionsForSeat(hand, i));

                        return action && (
                          <React.Fragment>
                            <div>{_.capitalize(action.type)}</div>
                            {
                              (action.type !== handActionTypes.FOLD && action.type !== handActionTypes.CHECK) &&
                              <div>${getCurrentAmountInvestedForSeat(hand, i)}</div>
                            }
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
      <Row className="d-flex flex-row justify-content-center mt-2">
        {
          selectedSeatIndex &&
          <h4>
            {
              getPositionLabelForSeatIndex(hand, selectedSeatIndex)
            }
            &nbsp;(Seat { (selectedSeatIndex + 1) })
          </h4>
        }
      </Row>
      <Row className="d-flex flex-row justify-content-center flex-fill">
        {
          // TODO: need input for selecting Button position and consider expandable editable session details.
          // TODO: also consider editable session details on action input (expandable or otherwise out of the way as well)
        }
        <div className="flex-fill">
          {
            hand.buttonSeatIndex === null &&
            <React.Fragment>
              <div>Where's the button?</div>
              <div>Tap seat above to set position</div>
            </React.Fragment>

          }
          {
            hand.buttonSeatIndex !== null &&
            _.sortBy(getAvailableActionForSeatIndex(hand, selectedSeatIndex), sortActionComponents).map(availableAction => {
              const ThisActionComponent = actionComponentMap[availableAction.type]; // TODO: use props below instead.

              return (
                <ThisActionComponent key={availableAction.type} amount={availableAction.amount} />
              );
            })
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

function createActionComponentsMap(handleAction) {

  const CallComponent = ({ amount }) => (
    <ActionButtonRow>
      <Button className="flex-fill" color="primary" onClick={() => handleAction(handActionTypes.CALL)}>
        Call&nbsp;${ amount }
      </Button>
    </ActionButtonRow>
  );

  const RaiseComponent = ({ minRaise }) => {
    const [raiseAmount, setRaiseAmount] = useState(minRaise);

    const handleChange = (e) => {
      const newValue = parseInt(e.target.value, 10);
      setRaiseAmount(
        isNaN(newValue) ? 0 : newValue
      );
    };

    return (
      <React.Fragment>
        <ActionButtonRow className="justify-content-center align-items-center">
          <Button className="flex-fill" color="warning" onClick={() => handleAction(handActionTypes.RAISE, raiseAmount)}>
            <Row className="d-flex flex-row justify-content-center align-items-center">
              <span style={{ marginRight: '10px'}}>Raise</span>
              <Input onClick={(e) => e.stopPropagation()} className="px-0" style={{ maxWidth: '50px', textAlign: 'center', height: '24px'}} color="success" type="number" value={raiseAmount} onChange={handleChange} />
            </Row>
          </Button>
        </ActionButtonRow>
      </React.Fragment>
    );
  };

  const BetComponent = ({ onBet, minBet }) => {
    const [betAmount, setBetAmount] = useState(minBet);

    const handleChange = (e) => {
      const newValue = parseInt(e.target.value, 10);
      setBetAmount(
        isNaN(newValue) ? 0 : newValue
      );
    };

    return (
      <React.Fragment>
        <ActionButtonRow className="justify-content-center align-items-center">
          <Button className="flex-fill" color="warning" onClick={() => handleAction(handActionTypes.BET, betAmount)}>
            <Row className="d-flex flex-row justify-content-center align-items-center">
              <span style={{ marginRight: '10px'}}>Bet</span>
              <Input onClick={(e) => e.stopPropagation()} className="px-0" style={{ maxWidth: '50px', textAlign: 'center', height: '24px'}} color="success" type="number" value={betAmount} onChange={handleChange} />
            </Row>
          </Button>
        </ActionButtonRow>
      </React.Fragment>
    );
  };

  const FoldComponent = ({ onFold }) => (
    <ActionButtonRow>
      <Button className="flex-fill" color="danger" onClick={() => handleAction(handActionTypes.FOLD)}>
        Fold
      </Button>
    </ActionButtonRow>
  );

  const CheckComponent = ({ onCheck }) => (
    <ActionButtonRow>
      <Button className="flex-fill" color="primary" onClick={() => handleAction(handActionTypes.CHECK)}>
        Check
      </Button>
    </ActionButtonRow>
  );

  return {
    [handActionTypes.CALL]: ({ amount }) => <CallComponent amount={amount} />,
    [handActionTypes.FOLD]: () =>  <FoldComponent />,
    [handActionTypes.CHECK]: () =>  <CheckComponent />,
    [handActionTypes.RAISE]: ({ amount }) => <RaiseComponent minRaise={amount} />,
    [handActionTypes.BET]: ({ amount }) => <BetComponent minBet={amount} />
  };
}

const ActionRow = styled(Row)`
  margin-top: -12px !important;
`;

const ActionButtonRow = styled(Row)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px 0 0 0 !important;
`;

function sortActionComponents({ type }) {
  return type === handActionTypes.CHECK
    ? 0
    : type === handActionTypes.CALL
      ? 1
      : type  === handActionTypes.FOLD
        ? 2
        : type === handActionTypes.BET
          ? 3
          : 4;
};