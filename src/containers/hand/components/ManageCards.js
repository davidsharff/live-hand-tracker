import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";


import { cardInputTypes, cardValues } from '../../../constants';
import { deckType, holeCardsType } from '../../../types';

import cardImages from '../../../assets/cards';

// TODO: after refactoring from just hole cards to all card inputs, I'm confident the state Object could be converted to Collection for easier usage.
export default function ManageCards(props) {
  //const { deck, onSave, type, header } = props;
  const { type, header } = props;

  const [selectedCardIndex, setSelectedCardIndex] = useState(getInitialCardIndexForType(type));

  const totalCardsLenForType = type === cardInputTypes.HOLE_CARDS ? 2 : 5;

  const [pendingCards, setPendingCards] = useState(
    _(Array(totalCardsLenForType))
      .fill('') // Create applicable num of empty slots
      .map((emptyCardVal, i) => // Override empty slot if props card exists.
        props.cards[i] || emptyCardVal
      )
      .value()
  );

  const selectedCard = pendingCards[selectedCardIndex];

  const canSubmit = false;

  const handleClickCard = (cardIndex) => setSelectedCardIndex(cardIndex);

  const handleClickValue = (value) =>
    setPendingCards(pendingCards.map((c, i) =>
      i === selectedCardIndex
        ? '' + value
        : c
    )
  );

  const handleSelectCard = (card) => {
    setPendingCards(
      pendingCards.map((c, i) =>
        i === selectedCardIndex
          ? card
          : c
      )
    );

    if (selectedCardIndex < pendingCards.length - 1) {
      setSelectedCardIndex(selectedCardIndex + 1);
    } else {
      setSelectedCardIndex(null);
    }
  };

  //const Card = Cards.clubs[0];

  if (canSubmit) {
    return (
      <Button
        color="primary"
        //onClick={handleClickNext}
        variant="outlined"
        fullWidth
      >
        Submit
      </Button>
    );
  }

  return (
    <React.Fragment>
      {/*<CardsSurface>*/}
        {/**/}
      {/*</CardsSurface>*/}
      <CardsSurface>
        <Typography variant="h6" style={{ alignSelf: 'center', marginTop: '5px 0' }}>
          { header }
        </Typography>
      <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
        {
        pendingCards.map((card, i) =>
        <CardSlot
          key={i}
          onClick={() => !getIsCardIndexDisabled(type, i) && handleClickCard(i)}
          isEmpty={!card || card.length === 1}
          isSelected={i === selectedCardIndex}
          type={type}
          isDisabled={getIsCardIndexDisabled(type, i)}
          style={{ margin: '0 5px'}}
        >
          {
            card.length === 2 &&
            <img src={cardImages[card]} style={{ width: '100%', height: '100%'}} alt="" />
          }
        </CardSlot>
        )
        }
      </div>
      </CardsSurface>
      {
        selectedCard && selectedCard.length === 1 &&
        <div style={{ display: 'flex', width: '100%', margin: '10px 0'}}>
          {
            _(cardImages)
              .keys()
              .filter(cardKey => console.log('cardKey', cardKey, cardKey.startsWith(selectedCard)) || cardKey.startsWith(selectedCard))
              .map((cardKey) => console.log('mapping', cardKey, cardImages[cardKey]) ||
                <div key={cardKey} onClick={() => handleSelectCard(cardKey)}>
                  <img src={cardImages[cardKey]} style={{ width: '55px', height: '75px'}} alt="" />
                </div>
              )
              .value()
          }
        </div>
      }
      {
        !selectedCard &&
        <ValueInputContainer>
          {
            _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
              <CardsRow key={i}>
                {
                  chunk.map((cv) =>
                    <ValueButton
                      key={cv}
                      color="primary"
                      //onClick={handleClickNext}
                      variant="outlined"
                      fullWidth
                      onClick={() =>
                        //!isCardValueDisabled(getPendingDeck(), cardsMap[selectedCardKey].suit, cv) &&
                        handleClickValue(cv)
                      }
                      // disabled={isCardValueDisabled(getPendingDeck(), cardsMap[selectedCardKey].suit, cv)}
                      // isSelected={cardsMap[selectedCardKey].value === cv}
                    >
                      { cv }
                    </ValueButton>
                  )
                }
              </CardsRow>
            )
          }
        </ValueInputContainer>
      }
    </React.Fragment>
  );
}

// TODO: set whether cards are disabled here via selector
ManageCards.propTypes = {
  cards: holeCardsType,
  // TODO: define cb param types
  onSave: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  deck: deckType.isRequired
};

const CardsSurface = styled(Paper)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
`;

const CardsRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex: 1;
  padding-bottom: .5px;
`;
const ValueInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  margin-top: 10px;
  padding-bottom: 15px;
  //justify-content: space-between;
`;

const ValueButton = styled(Button)`
  height: 100%;
`;
// Old....

// ...rest is a workaround to avoid unknown prop warning. See: https://github.com/styled-components/styled-components/issues/305
const CardSlot = styled(({ isEmpty, isSelected, type, isDisabled, ...rest }) => <div { ...rest }/>)`
  border: ${p => p.isEmpty && 'dotted 1px #333'};
  height: 75px;
  width: 55px;
  margin: 10px 10px;
  ${p => p.isSelected && `
    border-color: #118844;
    border-width: 2px;
  `};                  
`;

// function isCardValueDisabled(deck, selectedSuit, cardValue) {
//   // TODO: test first condition when board cards are wired up.
//   const noCardValueInDeck = !deck.some((c) => c.slice(0, -1) === cardValue);
//   const noCardInDeck = !!selectedSuit && !_.includes(deck, (cardValue + selectedSuit));
//
//   return noCardValueInDeck || noCardInDeck;
// }
//
// function isSuitDisabled(deck, selectedValue, suit) {
//   return !!selectedValue && !_.includes(deck, (selectedValue + suit));
// }

function getInitialCardIndexForType(type) {
  return type === cardInputTypes.TURN
    ? 3
    : type === cardInputTypes.RIVER
      ? 4
      : 0;
}

function getIsCardIndexDisabled(type, cardIndex) {
  return type !== cardInputTypes.HOLE_CARDS && (
    (type === cardInputTypes.FLOP && cardIndex > 2) ||
    (type === cardInputTypes.TURN && cardIndex > 3)
  );
}