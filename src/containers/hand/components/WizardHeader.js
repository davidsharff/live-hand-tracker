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
  const { hand, isInputtingCards, selectedSeatIndex, handleSetButtonSeatIndex } = props;

  return (
    <Row className="mb-1 mx-0">
      {
        hand.seats.map((s, i) => {

          const lastAction =  _.last(getCurrentActionsForSeat(hand, i));
          const isHero = i === hand.heroSeatIndex;

          return (
            <HeaderItem
              key={i}
              isButtonInputMode={hand.buttonSeatIndex === null}
              onClick={() => hand.buttonSeatIndex === null && handleSetButtonSeatIndex(i)}
              className="d-flex flex-column justify-content-between"
              isSelected={selectedSeatIndex === i}
              isInputtingBoardCards={isInputtingCards}
              isInactive={!s.isActive || (lastAction && lastAction.type === handActionTypes.FOLD)}
            >
              <Row className={`d-flex flex-row m-0 flex-fill justify-content-${isInputtingCards ? 'center' : 'between'}`}>
                {
                  s.isActive
                    ? (
                      <React.Fragment>
                        {
                          !isInputtingCards &&
                          <span>
                            { isHero ? 'Hero' : `S${ i + 1 }` }
                          </span>
                        }
                        {
                          hand.buttonSeatIndex !== null &&
                          <span>
                            {
                              s.isActive
                                ? getPositionLabelForSeatIndex(hand, i, s) + ( isInputtingCards && isHero ? ' (H)' : '')
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
                !isInputtingCards &&
                <ActionRow className="d-flex flex-row justify-content-around m-0 flex-fill align-items-start">
                  {
                    hand.buttonSeatIndex !== null &&
                    <div style={{fontSize: '12px'}}>
                      {
                        lastAction && (
                        <React.Fragment>
                          <div>{_.capitalize(lastAction.type)}</div>
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

const HeaderItem = styled(({ isButtonInputMode, isInactive, isInputtingBoardCards, isSelected, ...rest }) => <Col {...rest} />)`
  flex-basis: 20%;
  font-size: 12px;
  height: ${p => p.isInputtingBoardCards ? '20px' : '75px'};
  padding: 1px 1px 0 4px;
  border: ${p =>
  !p.isInputtingBoardCards && (p.isButtonInputMode || p.isSelected)
    ? 'solid #28a745 2px'
    : 'solid #eee 1px'
  };
  transition: height .25s;
  background-color: ${p => p.isInactive && '#ccc'};
`;

const ActionRow = styled(Row)`
  margin-top: -12px !important;
`;