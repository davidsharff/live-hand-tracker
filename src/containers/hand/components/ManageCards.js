import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import {  Col, Row, Button } from 'reactstrap';

import { cardValues, suits } from '../../../constants';
import { holeCardsType } from '../../../types';

const suitAbbreviations = _.map(suits, s => s.slice(0, 1));

// TODO: after refactoring from just hole cards to all card inputs, I'm confident the state Object could be converted to Collection for easier usage.
export default function ManageCards(props) {

  const [selectedCardKey, setSelectedCardKey] = useState('card1');

  // TODO: should also check if props.cards is already filled out and use that instead.

  const [cards, setCards] = useState(
    _.range(0, props.numCards).reduce((obj, i) =>
        _.assign({}, obj, { ['card' + (i + 1)]: {
            value: props.cards.length > i ? props.cards[i].slice(0, -1) : null,
            suit: props.cards.length > i ? props.cards[i].slice(1, 2) : null,
          }})
      , {})
  );

  const handleClickCard = (cardKey) => setSelectedCardKey(cardKey);

  const handleClickSuit = (suit) => setCards(_.assign({}, cards, {
    [selectedCardKey]: _.assign({}, cards[selectedCardKey], {
      suit
    })
  }));

  const handleClickValue = (value) => {
    setCards(_.assign({}, cards, {
      [selectedCardKey]: _.assign({}, cards[selectedCardKey], {
        value
      })
    }));
  };

  const toggleCardIfComplete = () => {
    const selectedCardNum = parseInt(selectedCardKey.slice(-1), 10);
    // Auto-toggle selected card the first time they fill out card1
    if (selectedCardNum < 3) {
      const selectedCard = cards['card' + selectedCardNum];

      const nextCardKey = 'card' + (selectedCardNum + 1);
      const nextCard = cards[nextCardKey];

      if (
        !!selectedCard.value && !!selectedCard.suit &&
        nextCard.value === null && nextCard.suit === null
      ) {
        setSelectedCardKey(nextCardKey);
      }
    }
  };

  const getPendingDeck = useCallback(() =>
    _.reject(props.deck, (c) =>
      c === (cards.card1.value + cards.card1.suit) ||
      c === (cards.card2.value + cards.card2.suit)
    ), [props.deck, cards]);

  useEffect(toggleCardIfComplete, [toggleCardIfComplete, cards]);

  return (
    <Col className="pb-2 d-flex flex-column flex-fill">
      <div>
        <Row className="d-flex flex-row flex-fill justify-content-around">
          {
            _.map(cards, ({ value, suit, }, cardKey) =>
              <Col key={cardKey} className="d-flex flex-column align-items-center">
                <CardSlot
                  className="mb-4 d-flex flex-column justify-content-center align-items-center"
                  onClick={() => handleClickCard(cardKey)}
                  isSelected={selectedCardKey === cardKey}
                >
                  <span>{ `${value || ''}${suit || ''}` }</span>
                </CardSlot>
              </Col>
            )
          }
        </Row>
      </div>
      <Col className="my-2 d-flex flex-column flex-fill">
        {
          _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
            <Row className="d-flex flex-row flex-fill justify-content-between" key={i}>
              {
                chunk.map((cv) =>
                  <ValueContainer
                    className="d-flex flex-column align-items-center justify-content-center"
                    key={cv}
                    onClick={() =>
                      !isCardValueDisabled(getPendingDeck(), cards[selectedCardKey].suit, cv) &&
                      handleClickValue(cv)
                    }
                    disabled={isCardValueDisabled(getPendingDeck(), cards[selectedCardKey].suit, cv)}
                    isSelected={cards[selectedCardKey].value === cv}
                  >
                    { cv }
                  </ValueContainer>
                )
              }
            </Row>
          )
        }
      </Col>
      <SuitContainer>
        <Row className="d-flex flex-row justify-content-between">
          {
            _.range(0, 4).map(i =>
              <Suit
                key={i}
                className="d-flex flex-column justify-content-center align-items-center"
                onClick={() =>
                  !isSuitDisabled(getPendingDeck(), cards[selectedCardKey].value, suitAbbreviations[i]) &&
                  handleClickSuit(suitAbbreviations[i])
                }
                isSelected={cards[selectedCardKey].suit === suitAbbreviations[i]}
                disabled={isSuitDisabled(getPendingDeck(), cards[selectedCardKey].value, suitAbbreviations[i])}
              >
                { suitAbbreviations[i] }
              </Suit>
            )
          }
        </Row>
      </SuitContainer>
      <Button className="mb-4" color="success" onClick={() => props.onSave(_.values(cards))}>
        Submit
      </Button>
    </Col>
  );
}

// TODO: set whether cards are disabled here via selector
ManageCards.propTypes = {
  cards: holeCardsType,
  // TODO: define cb param types
  onSave: PropTypes.func
};

// ...rest is a workaround to avoid unknown prop warning. See: https://github.com/styled-components/styled-components/issues/305
const CardSlot = styled(({ isSelected, ...rest }) => <Col { ...rest }/>)`
  border: dotted 1px #333;
  min-height: 100px;
  width: 80px;
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 3px;
  `};
`;

const SuitContainer = styled(Col)`
  min-height: 100px;
  max-height: 100px;
`;

const Suit = styled(({ disabled, isSelected, ...rest }) => <Col { ...rest }/>)`
  padding: 5px;
  border: solid 1px #333;
  max-width: 24%;
  background-color: ${p => !p.isSelected && p.disabled && '#eee'};
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 2px;
  `}
`;

const ValueContainer = styled(({ disabled, isSelected, ...rest }) => <Col { ...rest }/>)`
  border: solid 1px #333;
  background-color: ${p => !p.isSelected && p.disabled && '#eee'};
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 2px;
  `}
`;

function isCardValueDisabled(deck, selectedSuit, cardValue) {
  // TODO: test first condition when board cards are wired up.
  const noCardValueInDeck = !deck.some((c) => c.slice(0, -1) === cardValue);
  const noCardInDeck = !!selectedSuit && !_.includes(deck, (cardValue + selectedSuit));

  return noCardValueInDeck || noCardInDeck;
}

function isSuitDisabled(deck, selectedValue, suit) {
  return !!selectedValue && !_.includes(deck, (selectedValue + suit));
}