import React from 'react';
import styled from 'styled-components';

import { Container, Row } from 'reactstrap';


export default function ManageHoleCards(props) {
  const { hand } = props;

  return (
    <Container>
      <Row>
        {
          hand.seats.map((s, i) =>
            <HeaderItem>
              Seat { i + 1 }
            </HeaderItem>
          )
        }
        <div style={{ width: '100%'}}>Header</div>
      </Row>
      <Row>
        <div style={{ width: '100%'}}>Body</div>
      </Row>
    </Container>
  );
}

const HeaderItem = styled.div`
  flex-basis: 20%;
  font-size: 14px;
  height: 50px;
  border: solid #eee 1px;
  padding: 2px 0 0 4px;
`;