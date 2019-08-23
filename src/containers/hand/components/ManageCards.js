import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Grow from '@material-ui/core/Grow';
//import Collapse from '@material-ui/core/Collapse';
import Slide from '@material-ui/core/Slide';

import ArrowLeft from '@material-ui/icons/KeyboardArrowLeft';


import { cardInputTypes, cardValues } from '../../../constants';
import { deckType, holeCardsType } from '../../../types';

// TODO: if a react web app is used in production, need to be smart about when to load these.
import cardImages from '../../../assets/cards';

// TODO: after refactoring from just hole cards to all card inputs, I'm confident the state Object could be converted to Collection for easier usage.
export default function ManageCards(props) {
  //const { deck, onSave, type, header } = props;
  const { type, header, cards } = props;

  const [selectedCardIndex, setSelectedCardIndex] = useState(getInitialCardIndexForType(type));

  const totalCardsLenForType = type === cardInputTypes.HOLE_CARDS ? 2 : 5;

  const [pendingCards, setPendingCards] = useState(
    _(Array(totalCardsLenForType))
      .fill('') // Create applicable num of empty slots
      .map((emptyCardVal, i) => // Override empty slot if props card exists.
        cards[i] || emptyCardVal
      )
      .value()
  );

  const selectedCard = pendingCards[selectedCardIndex];

  const canSubmit = false;

  const handleClickCardSlot = (cardIndex) => {
    const targetPendingCard = pendingCards[cardIndex];

    if (!!targetPendingCard) {
      handleChangeCardValue(cardIndex, targetPendingCard[0]); // They clicked on populated card, remove suit to trigger card image selection display.
    }

    setSelectedCardIndex(cardIndex);
  };

  const handleClickValue = (value) => handleChangeCardValue(selectedCardIndex, value);

  const handleChangeCardValue = (targetIndex, value) => console.log('changing card value', value, selectedCardIndex) || setPendingCards(
    pendingCards.map((c, i) =>
      i === targetIndex
        ?  ('' + value)
        : c
    )
  );

  const handlePickCard = (card) => {
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

  const showCardImageSelection = !!selectedCard && (
    selectedCard.length === 1
  );

  // TODO: larger card dimensions in picker when screen is > tinyScreen
  //       shrink header so that the card slot selections can be larger
  //       use pending deck and disable card picker items and card value keys
  //       Write up "view all cards" link that opens true carousel of entire deck with labels of card location underneath.
  //       show value key as selected when returning to card value input
  //       save and consider if should nav after inputting last card the first time or always use next button.
  //
  return (
    <React.Fragment>
      <CardsSurface>
        <Typography variant="h6" style={{ alignSelf: 'center', marginTop: '5px 0', lineHeight: '24px', paddingBottom: '5px' }}>
          { header }
        </Typography>
      <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
        {
        pendingCards.map((card, i) =>
        <CardSlot
          key={i}
          onClick={() => !getIsCardIndexDisabled(type, i) && handleClickCardSlot(i)}
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
        showCardImageSelection &&
        <CardPicker>
          <Grow
            in={true}
            style={{ transformOrigin: '0 0 0', transitionDelay: '100ms' }}
            timeOut={1000}
          >
            <CardCarouselRow>
              {
                _(cardImages)
                  .keys()
                  .filter(cardKey => !!selectedCard && cardKey.startsWith(selectedCard))
                  .map((cardKey) =>
                    <div key={cardKey} onClick={() => handlePickCard(cardKey)}>
                      <img src={cardImages[cardKey]} style={{ width: '60px', height: '100px'}} alt="" />
                    </div>
                  )
                  .value()
              }
            </CardCarouselRow>
          </Grow>
          <div onClick={() => handleClickValue('')}>
            <ArrowLeft fontSize="large" />
            <span>Card Value</span>
          </div>
        </CardPicker>
      }
      {
        !showCardImageSelection &&
        <Slide
          in={true}
          direction="up"
          style={{ transformOrigin: '0 0 0' }}
          timeOut={1000}
        >
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
        </Slide>
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
  padding: 5px 5px 10px 5px;
  background-color: #fafafa !important; // TODO: use theme if surface and background color sticks around.
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

const CardPicker = styled.div`
  display: flex;
  flex-direction: column; 
  width: 100%;
  margin: 10px 0;
  justify-content: space-around;
  flex: 1;
  padding-top: 10px;
`;

const CardCarouselRow = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-around;
`;

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