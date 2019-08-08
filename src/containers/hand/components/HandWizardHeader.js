import React from 'react';
import _ from "lodash";
import { Col, Row } from "reactstrap";
import {
  getCurrentActionsForSeat,
  getCurrentAmountInvestedForSeat,
  getPositionLabelForSeatIndex
} from "../../../redux/reducers/hand";
import { handActionTypes } from "../../../constants";
import styled from "styled-components";

export default function WizardHeader(props) {
  const { hand, shouldCollapse, selectedSeatIndex, handleSetButtonSeatIndex } = props;

  return (
    <Row className="mb-1 mx-0">
      {
        hand.seats.map((s, i) => {

          const lastAction =  _.last(getCurrentActionsForSeat(hand, i));
          const isHero = i === hand.heroSeatIndex;

          // TODO: this needs to be updated if support is added for revisiting earlier hand states in wizard.
          const foldedInPriorRound = (
            !!lastAction &&
            lastAction.type === handActionTypes.FOLD &&
            lastAction.bettingRound !== hand.currentBettingRound
          );

          return (
            <HeaderItem
              key={i}
              isButtonInputMode={hand.buttonSeatIndex === null}
              onClick={() => hand.buttonSeatIndex === null && handleSetButtonSeatIndex(i)}
              className="d-flex flex-column justify-content-between pt-0"
              isSelected={selectedSeatIndex === i}
              shouldCollapse={shouldCollapse}
              isInactive={!s.isActive || (lastAction && lastAction.type === handActionTypes.FOLD)}
            >
              <Row className={`d-flex flex-row m-0 flex-fill justify-content-${shouldCollapse ? 'center' : 'between'}`}>
                {
                  s.isActive
                    ? (
                      <React.Fragment>
                        {
                          (!shouldCollapse || hand.buttonSeatIndex === null) &&
                          <span>
                            { isHero ? 'Hero' : `S${ i + 1 }` }
                          </span>
                        }
                        {
                          hand.buttonSeatIndex !== null &&
                          <span>
                            {
                              s.isActive
                                ? getPositionLabelForSeatIndex(hand, i, s) + ( shouldCollapse && isHero ? ' (H)' : '')
                                : 'Empty'
                            }
                          </span>
                        }
                      </React.Fragment>
                    )
                    : <span>Empty</span>
                }
              </Row>
              {
                !shouldCollapse &&
                <ActionRow className="d-flex flex-row justify-content-around m-0 flex-fill align-items-start">
                  {
                    hand.buttonSeatIndex !== null &&
                    <div style={{fontSize: '12px'}}>
                      {
                        lastAction && !foldedInPriorRound && (
                        <React.Fragment>
                          <div>{ _.capitalize(lastAction.type) }</div>
                          {
                            (lastAction.type !== handActionTypes.FOLD && lastAction.type !== handActionTypes.CHECK) &&
                            <div>${getCurrentAmountInvestedForSeat(hand, i)}</div>
                          }
                        </React.Fragment>
                        )
                      }
                    </div>
                  }
                </ActionRow>
              }
            </HeaderItem>
          );
        })
      }
    </Row>
  );
}

const HeaderItem = styled(({ isButtonInputMode, isInactive, shouldCollapse, isSelected, ...rest }) => <Col {...rest} />)`
  flex-basis: 20%;
  font-size: 12px;
  height: ${p => p.shouldCollapse ? '20px' : '75px'};
  padding: 1px 1px 0 4px;
  border: ${p =>
    p.isSelected
      ? 'solid #28a745 2px'
      : 'solid #eee 1px'
  };
  transition: height .25s;
  background-color: ${p => p.isInactive && '#ccc'};
`;

const ActionRow = styled(Row)`
  margin-top: -12px !important;
`;