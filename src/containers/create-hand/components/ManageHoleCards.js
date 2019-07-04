import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';

import { cardValues, suits } from '../../../constants';
import { holeCardsType } from '../../../types';

export default function ManageHoleCards(props) {

  return (
    <Container>
      <div>
        <HoleCardsRow>
          <HoleCard card={props.holeCards[0]}/>
          <HoleCard card={props.holeCards[1]}
          />
        </HoleCardsRow>
      </div>
      <CardSelectionContainer>
        {
          _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
            <CardsRow key={i}>
              {
                chunk.map((cv) =>
                  <CardValue key={cv}>
                    { cv }
                  </CardValue>
                )
              }
            </CardsRow>
          )
        }
      </CardSelectionContainer>
    </Container>
  );
}

ManageHoleCards.propTypes = {
  holeCards: holeCardsType
};

function HoleCard(props) {
  const suitAbbreviations = _.map(suits, s => s.slice(0, 1));
  return (
    <HoleCardContainer>
      <HoleCardSlot className="mb-2">
        <HoleCardLabel>{ props.card || 'As' }</HoleCardLabel>
      </HoleCardSlot>
      <SuitsContainer>
        <SuitRow>
          <Suit>{ suitAbbreviations[0] }</Suit>
          <Suit>{ suitAbbreviations[1] }</Suit>
        </SuitRow>
        <SuitRow>
          <Suit>{ suitAbbreviations[2] }</Suit>
          <Suit>{ suitAbbreviations[3] }</Suit>
        </SuitRow>
      </SuitsContainer>
    </HoleCardContainer>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled(Col)`
  flex: 1;
  padding-bottom: 20px;
`;

const CardSelectionContainer = styled(Col)`
  flex: 1;
`;

const HoleCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 150px;
  width: 100px;
  align-items: center;
`;

const HoleCardsRow = styled(Row)`
  justify-content: space-around;
  flex: 1;
`;

const HoleCardSlot = styled(Col)`
  flex: 1;
  justify-content: center;
  align-items: center;
  border: dotted 1px #333;
  height: 75px;
  width: 60px;
`;

const HoleCardLabel = styled.div`
  text-align: center;
`;

const SuitsContainer = styled(Col)`
  flex: 1;
  justify-content: space-between;
  width: 100%;
`;

const SuitRow = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const Suit = styled(Col)`
  flex: 1;
  justify-content: center;
  align-items: center;
  border: solid 1px #333;
`;

const CardsRow = styled(Row)`
  flex: 1;
  justify-content: space-between;
`;

const CardValue = styled(Col)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;