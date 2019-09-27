import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { useTheme } from '@material-ui/styles';

import cardImages from '../assets/cards';

import { isTinyScreen } from '../utils';

// TODO: consider using card table surface and standardizing with ManageCards
export default function BoardDisplay(props) {
  const { board } = props;
  const winningCards = props.winningCards || [];

  const { palette } = useTheme();

  const cardImgDimensions = isTinyScreen()
    ? { width: '50px', height: '75px'}
    : { width: '60px',   height: '90px'};

  const winningCardStyle = {
    border: `solid 2px ${palette.primary.dark}`,
    borderRadius: '6px'
  };

  return (
    <BoardRow>
      {
        _(board)
          .concat(Array(5).fill(''))
          .slice(0, 5)
          .map((card, i) =>
            card
              ? (
                <img
                  key={card}
                  src={cardImages[card]}
                  style={{
                    ...(_.includes(winningCards, card) ? winningCardStyle : {}),
                    ...cardImgDimensions
                  }}
                  alt={card}
                />
              )
              : <EmptyCardSlot key={i} style={cardImgDimensions} emptyBackgroundColor={palette.action.disabledBackground}/>
        )
          .value()
      }
    </BoardRow>
  );
}


const BoardRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

// TODO: these styles need to be shared with manage cards. Really, the entire board display should be shared.
const EmptyCardSlot = styled.div`
  border: dotted 1px #333;
  border-radius: 6px;
  background-color: ${p => p.emptyBackgroundColor}
`;