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
        hand.seats.map((s, i) =>
          <HeaderItem
            key={i}
            isButtonInputMode={hand.buttonSeatIndex === null}
            onClick={() => hand.buttonSeatIndex === null && handleSetButtonSeatIndex(i)}
            className="d-flex flex-column justify-content-between"
            isSelected={selectedSeatIndex === i}
            isInputtingBoardCards={isInputtingCards}
          >
            <Row className={`d-flex flex-row m-0 flex-fill justify-content-${isInputtingCards ? 'center' : 'between'}`}>
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
                        hand.buttonSeatIndex !== null && !isInputtingCards &&
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
            {
              !isInputtingCards &&
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
            }
          </HeaderItem>
        )
      }
    </Row>
  );
}

const HeaderItem = styled(({ isButtonInputMode, isInputtingBoardCards, isSelected, ...rest }) => <Col {...rest} />)`
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
`;

const ActionRow = styled(Row)`
  margin-top: -12px !important;
`;