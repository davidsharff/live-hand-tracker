import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import MoreVert from '@material-ui/icons/MoreVert';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import styled from 'styled-components';



export default function HandHeader(props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCloseDrawer = () => setIsDrawerOpen(false);
  return (
    <div style={{ flex: 1 }}>
      <AppBar position="static" >
        <StyledToolbar disableGutters >
          <LeftItems>
            <ArrowLeft fontSize="large" />
            <span>
              Session
            </span>
          </LeftItems>
          <MoreVert edge="end" onClick={() => setIsDrawerOpen(true)}/>
          <Drawer
            open={isDrawerOpen}
            anchor="right"
            onClose={handleCloseDrawer}
          >
            <DrawerContents onClose={handleCloseDrawer}/>
          </Drawer>
        </StyledToolbar>
      </AppBar>
    </div>
  );
}

const LeftItems = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

`;

const StyledToolbar = styled(Toolbar)`
  justify-content: space-between;
`;

const DrawerContents = ({ onClose }) => (
  <div
    style={{ width: '250px' }}
    role="presentation"
    onClick={onClose}
  >
    <List>
      {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
        <ListItem button key={text}>
          <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
    <Divider />
    <List>
      {['All mail', 'Trash', 'Spam'].map((text, index) => (
        <ListItem button key={text}>
          <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
          <ListItemText primary={text} />
        </ListItem>
      ))}
    </List>
  </div>
);