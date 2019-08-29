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
import { useTheme } from '@material-ui/styles';


import { bettingRounds, cardInputTypes, cardValues } from '../../../constants';
import { deckType, holeCardsType } from '../../../types';

// TODO: if a react web app is used in production, need to be smart about when to load these.
import cardImages from '../../../assets/cards';

// TODO: all the consts seem messy--could be cleaned up.
export default function ManageCards(props) {
  const { type, headerText, cards, onSave, deck } = props;

  const { palette } = useTheme();

  const [initialCards] = useState(cards);

  // TODO: consider changing to single useReducer instead of multiple useState.
  const [selectedCardIndex, setSelectedCardIndex] = useState(getInitialCardIndexForType(type));

  const [pendingCards, setPendingCards] = useState(createInitialPendingCards(type, cards));

  const selectedCard = pendingCards[selectedCardIndex];

  const handleClickCardSlot = (pendingCardIndex) => clickCardSlot(pendingCards, pendingCardIndex, setPendingCards, setSelectedCardIndex);

  const handleClickCardValue = (targetIndex, value) => updatePendingCardVal(pendingCards, setPendingCards, targetIndex, value);

  const handlePickCard = (card) =>
    pickCard(
      type, pendingCards, selectedCardIndex, setPendingCards, setSelectedCardIndex, initialCards, onSave, card
    );

  const showCardCarousel = !!selectedCard && !showButtonControls(initialCards, pendingCards, type);

  // TODO: larger card dimensions in picker when screen is > tinyScreen
  //       shrink header so that the card slot selections can be larger
  //       Write up "view all cards" link that opens true carousel of entire deck with labels of card location underneath.
  //       handle next button required when returning to hole cards to edit

  return (
    <React.Fragment>
      <CardsSurface>
        <Typography variant="h6" style={{ alignSelf: 'center', marginTop: '5px 0', lineHeight: '24px', paddingBottom: '5px' }}>
          { headerText }
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
          disabledBackgroundColor={palette.action.disabledBackground}
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
        showButtonControls(initialCards, pendingCards, type) &&
        <EditContainer>
          {
            <Button
              color="primary"
              onClick={() => onSave(pendingCards, true) /* TODO: unecessary save action. */}
              fullWidth
              variant="contained"
              disabled={!isBoardFilledForRound(pendingCards, type)}
            >
              Next
            </Button>
          }
        </EditContainer>
      }
      {
        showCardCarousel &&
        <CardPicker>

            <CardCarouselRow>
              {
                _(cardImages)
                  .keys()
                  .filter(cardKey =>
                    !!selectedCard &&
                    cardKey.startsWith(selectedCard) &&
                    (
                      _.includes(deck, cardKey) ||
                      // Include a dealt card if it is the one they clicked on to edit.
                      !_.includes(pendingCards, cardKey)
                    )
                  )
                  .map((cardKey) =>
                    <Grow
                      key={cardKey}
                      in={true}
                      style={{ transformOrigin: '0 0 0', transitionDelay: '100ms' }}
                    >
                      {/* TODO: should we somehow include cards no longer in deck and show them disabled and/or with cards location? */}
                      <div onClick={() => handlePickCard(cardKey)}>
                        <img src={cardImages[cardKey]} style={{ width: '60px', height: '100px'}} alt="" />
                      </div>
                    </Grow>
                  )
                  .value()
              }
            </CardCarouselRow>
          <div onClick={() => handleClickCardValue(selectedCardIndex, '')}>
            <ArrowLeft fontSize="large" />
            <span>Card Value</span>
          </div>
        </CardPicker>
      }
      {
        !showCardCarousel && !showButtonControls(initialCards, pendingCards, type) &&
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
                        variant="outlined"
                        fullWidth
                        onClick={() =>
                          !isCardValueDisabled(deck, cv) &&
                          handleClickCardValue(selectedCardIndex, cv)
                        }
                        disabled={isCardValueDisabled(deck, cv)}
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
`;

const EditContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1; 
  width: 100%;
  padding-bottom: 10px;
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

const CardSlot = styled(({ isEmpty, isSelected, isDisabled, disabledBackgroundColor, ...rest }) => <div { ...rest }/>)`
  border: ${p => p.isEmpty && 'dotted 1px #333'};
  height: 75px;
  width: 55px;
  margin: 10px 10px;
  background-color: ${p => p.isDisabled && p.disabledBackgroundColor}
  ${p => p.isSelected && `
    border-color: #118844;
    border-width: 2px;
  `};               
`;

// TODO: Update everywhere else. I like this approach to helper functions. Defining inside function like methods is hold over from class based approach.
function isCardValueDisabled(deck, cardValue) {
  // TODO: untested post refactor now that you never no suit before value.

  return !deck.some((c) => c.slice(0, -1) === cardValue);
}

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

function updatePendingCardVal(pendingCards, setPendingCards, pendingCardIndex, newValue) {
  setPendingCards(
    pendingCards.map((c, i) =>
      i === pendingCardIndex
        ?  ('' + newValue)
        : c
    )
  );
};

function pickCard(type, pendingCards, selectedCardIndex, setPendingCards, setSelectedCardIndex, initialCards, onSave, pickedCard) {
  const updatedPendingCards = pendingCards.map((c, i) =>
    i === selectedCardIndex
      ? pickedCard
      : c
  );

  setPendingCards(updatedPendingCards);

  const nextCardIndex = selectedCardIndex + 1;
  const isNextCardDisabled = getIsCardIndexDisabled(type, nextCardIndex);

  const isFinishedEditing = (
    (isNextCardDisabled || selectedCardIndex === pendingCards.length - 1) &&
    (
      (
        (type === cardInputTypes.HOLE_CARDS || type === cardInputTypes.FLOP) && initialCards.length === 0
      ) ||
      (
        type === cardInputTypes.TURN && initialCards.length === 3
      ) ||
      (
        type === cardInputTypes.RIVER && initialCards.length === 4
      )
    )
  );

  onSave(_.filter(updatedPendingCards), isFinishedEditing);

  if (!isNextCardDisabled) {
    setSelectedCardIndex(nextCardIndex);
  }
}

function clickCardSlot(pendingCards, pendingCardIndex, setPendingCards, setSelectedCardIndex) {
  const targetPendingCard = pendingCards[pendingCardIndex];

  // They clicked on prev selected card--clear value.
  if (!!targetPendingCard) {
    updatePendingCardVal(pendingCards, setPendingCards, pendingCardIndex, '');
  }

  setSelectedCardIndex(pendingCardIndex);
}

function createInitialPendingCards(type, existingCards) {
  const totalCardsLenForType = type === cardInputTypes.HOLE_CARDS ? 2 : 5;

  return _(Array(totalCardsLenForType))
    .fill('') // Create applicable num of empty slots
    .map((emptyCardVal, i) => // Override empty slot if props card exists.
      existingCards[i] || emptyCardVal
    )
    .value();
}

function showButtonControls(initialCards, pendingCards, bettingRound) {
  const filledPendingCards = pendingCards.filter((c) => c.length === 2);
  return !!initialCards.length &&
    isBoardFilledForRound(filledPendingCards, bettingRound);
}

function isBoardFilledForRound(board, bettingRound) {
  const boardLength = board.length;
  return (
    (bettingRound === bettingRounds.FLOP  && boardLength >= 3) ||
    (bettingRound === bettingRounds.TURN  && boardLength >= 4) ||
    (bettingRound === bettingRounds.RIVER && boardLength >= 5)
  );
}