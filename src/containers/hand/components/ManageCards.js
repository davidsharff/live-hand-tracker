import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';

import {  Col, Row, Button } from 'reactstrap';

import {cardInputTypes, cardValues, suits} from '../../../constants';
import {deckType, holeCardsType} from '../../../types';
import Typography from "@material-ui/core/Typography/Typography";

const suitAbbreviations = _.map(suits, s => s.slice(0, 1));

// TODO: after refactoring from just hole cards to all card inputs, I'm confident the state Object could be converted to Collection for easier usage.
export default function ManageCards(props) {
  const { cards, deck, onSave, type, header } = props;

  const [selectedCardKey, setSelectedCardKey] = useState(
    type === cardInputTypes.TURN
      ? 'card4'
      : type === cardInputTypes.RIVER
        ? 'card5'
        : 'card1'
  );

  const numCardSlots = type === cardInputTypes.HOLE_CARDS
    ? 2
    : 5;

  // TODO: this is all horrible. Use an array.
  // Even with an array, if only this round's cards are editable, we must also allow a way to force any edit.
  const [cardsMap, setCardsMap] = useState(createCardsMap(cards, type, numCardSlots));

  useEffect(() => {
    // TODO: unfortunate that this will always set the state twice on mount
    setCardsMap(
      createCardsMap(cards, type, numCardSlots)
    );

    if (type === cardInputTypes.HOLE_CARDS) {
      setSelectedCardKey('card1');
    }

  }, [cards, numCardSlots, type]);

  // TODO: dropping useState and directly updating redux would drop requirement to track pending deck.
  const getPendingDeck = useCallback(() => {
    const pendingCards = _.values(cardsMap).map(({ value, suit}) =>
      value + suit
    );

    return _.reject(deck, (c) =>
      _.includes(pendingCards, c)
    );
  }, [deck, cardsMap]);

  useEffect(toggleCardIfComplete, [toggleCardIfComplete, cardsMap]);

  const handleClickCard = (cardKey) => setSelectedCardKey(cardKey);

  const handleClickSuit = (suit) => setCardsMap(_.assign({}, cardsMap, {
    [selectedCardKey]: _.assign({}, cardsMap[selectedCardKey], {
      suit
    })
  }));

  const handleClickValue = (value) => {
    setCardsMap(_.assign({}, cardsMap, {
      [selectedCardKey]: _.assign({}, cardsMap[selectedCardKey], {
        value
      })
    }));
  };

  //
  const handleSave = () => onSave(
    _.values(cardsMap) // TODO: another argument to either always use obj for cards or use array of strings here too.
      .filter(({ value, suit }) => !!value && !!suit)
      .map(({ value, suit }) =>
        '' + value + suit
      )
  );


  function toggleCardIfComplete() {
    const selectedCardNum = parseInt(selectedCardKey.slice(-1), 10);

    // Auto-toggle selected card the first time they fill out card1
    if (selectedCardNum < _.keys(cardsMap).length) {

      const selectedCard = cardsMap['card' + selectedCardNum];

      const nextCardKey = 'card' + (selectedCardNum + 1);
      const nextCard = cardsMap[nextCardKey];

      if (
        !!selectedCard.value && !!selectedCard.suit &&
        nextCard.value === null &&
        nextCard.suit === null &&
        !nextCard.isDisabled
      ) {
        setSelectedCardKey(nextCardKey);
      }
    }
  };

  const cardSlotClassName = 'd-flex flex-column justify-content-center align-items-center p-0 flex-grow-0 ' + (
    type === cardInputTypes.HOLE_CARDS
      ? 'mx-4 mb-2'
      : 'mx-2 mb-1'
  );

  return (
    <Col className="mb-1 d-flex flex-column p-0">
      <Typography variant="h6" style={{ alignSelf: 'center', marginTop: '5px 0'}}>
        { header }
      </Typography>
      <Row className="d-flex flex-row flex-nowrap mb-2 justify-content-center" style={{ flex: .4}}>
        {
          _.map(cardsMap, ({ value, suit, isDisabled}, cardKey) =>
            <CardSlot
              key={cardKey}
              className={cardSlotClassName}
              onClick={() => !isDisabled && handleClickCard(cardKey)}
              isSelected={selectedCardKey === cardKey}
              type={type}
              isDisabled={isDisabled}
            >
              <span>{ `${value || ''}${suit || ''}` }</span>
            </CardSlot>
          )
        }
      </Row>
      <Row className="d-flex flex-row justify-content-between m-0">
        {
          _.range(0, 4).map(i =>
            <Suit
              key={i}
              className="d-flex flex-column justify-content-center align-items-center"
              onClick={() =>
                !isSuitDisabled(getPendingDeck(), cardsMap[selectedCardKey].value, suitAbbreviations[i]) &&
                handleClickSuit(suitAbbreviations[i])
              }
              isSelected={cardsMap[selectedCardKey].suit === suitAbbreviations[i]}
              disabled={isSuitDisabled(getPendingDeck(), cardsMap[selectedCardKey].value, suitAbbreviations[i])}
            >
              { suitAbbreviations[i] }
            </Suit>
          )
        }
      </Row>
      <Row className="flex-fill m-0 my-3">
        <Col className="m-0 d-flex flex-column flex-fill">
          {
            _.flatMap(_.chunk(cardValues, 4), (chunk, i) =>
              <Row className="d-flex flex-row flex-fill justify-content-between" key={i}>
                {
                  chunk.map((cv) =>
                    <ValueContainer
                      className="d-flex flex-column align-items-center justify-content-center"
                      key={cv}
                      onClick={() =>
                        !isCardValueDisabled(getPendingDeck(), cardsMap[selectedCardKey].suit, cv) &&
                        handleClickValue(cv)
                      }
                      disabled={isCardValueDisabled(getPendingDeck(), cardsMap[selectedCardKey].suit, cv)}
                      isSelected={cardsMap[selectedCardKey].value === cv}
                    >
                      { cv }
                    </ValueContainer>
                  )
                }
              </Row>
            )
          }
        </Col>
      </Row>
      <Button className="mb-4" color="success" onClick={handleSave} outline>
        Submit
      </Button>
    </Col>
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

// ...rest is a workaround to avoid unknown prop warning. See: https://github.com/styled-components/styled-components/issues/305
const CardSlot = styled(({ isSelected, type, isDisabled, ...rest }) => <Col { ...rest }/>)`
  padding: 0;
  border: dotted 1px #333;
  // min-height: ${ p => p.type === cardInputTypes.HOLE_CARDS ? '100px' : '55px'};
  // max-height: ${ p => p.type === cardInputTypes.HOLE_CARDS ? '100px' : '55px'};
  // min-width:  ${ p => p.type === cardInputTypes.HOLE_CARDS ? '80px'  : '45px'};
  // max-width:  ${ p => p.type === cardInputTypes.HOLE_CARDS ? '80px'  : '45px'};
  min-height: 55px;
  max-height: 55px;
  min-width: 45px;
  max-width: 45px;
  ${p => p.isSelected && `
    border-color: #28a745;
    border-width: 3px;
  `};
  ${p => p.isDisabled && `
    background-color: #ccc;    
  `};                     
`;

const Suit = styled(({ disabled, isSelected, ...rest }) => <Col { ...rest }/>)`
  padding: 5px;
  border: solid 1px #333;
  max-width: 24%;
  max-height: 24px;
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

function createCardsMap(cards, type, numCardSlots) {
  return _.range(0, numCardSlots).reduce((obj, i) =>
      _.assign({}, obj, { ['card' + (i + 1)]: {
          value: cards.length > i ? cards[i].slice(0, -1) : null,
          suit: cards.length > i ? cards[i].slice(1, 2) : null,
          isDisabled: type !== cardInputTypes.HOLE_CARDS && (
            (type === cardInputTypes.FLOP && i > 2) ||
            (type === cardInputTypes.TURN && i > 3)
          )
        }})
    , {});
}