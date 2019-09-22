import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { useTheme } from '@material-ui/styles';

import cardImages from '../assets/cards';

import { isTinyScreen } from '../utils';

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
        board.map((card) =>
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
      }
    </BoardRow>
  );
}


const BoardRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;