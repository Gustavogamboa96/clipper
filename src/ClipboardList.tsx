import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import {DragIndicator, Close} from '@mui/icons-material';

declare global {
  interface Window {
    electron: {
      getClipboardData: () => void;
      onClipboardUpdate: (callback: (data: string[]) => void) => void;
      onClipboardData: (callback: (data: string[]) => void) => void; 
      writeToClipboard: (text: string) => void;
      closeApp: () => void;
    };
  }
}

const ClipboardList: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [clipboardItems, setClipboardItems] = useState<string[]>([]);
  useEffect(() => {
    window.electron.getClipboardData();
    window.electron.onClipboardUpdate((data) => setClipboardItems(data));
    window.electron.onClipboardData((data) => setClipboardItems(data));
  }, []);

  const handleListItemClick = (index: number) => {
    const rightIndex=clipboardItems.length - 1 - index
    setSelectedIndex(rightIndex);
    const textToCopy = clipboardItems[rightIndex];
    if (textToCopy) {
      window.electron.writeToClipboard(textToCopy);
      console.log('Copied text:', textToCopy);
    }
  };

  const handleCloseApp = () => {
    window.electron.closeApp(); // Call the closeApp function
  };
  

  return (
    <Box sx={{ width: '100vw', backgroundColor: 'gray'}}>
      <DragIndicator className='drag-button' sx={{ color: "black", bgcolor: 'gray'}}/>
      <Close className='close-button' onClick={handleCloseApp} sx={{ color: "black", bgcolor: 'gray' }}/>
      <List component="nav" aria-label="clipboard contents" sx={{bgColor: "gray"}}>
        {clipboardItems.slice().reverse().map((item, index) => (
          <ListItemButton
            key={index}
            selected={selectedIndex === index}
            onClick={() => handleListItemClick(index)}
            sx={{
              // selected item stays darker
              backgroundColor: selectedIndex === clipboardItems.length - 1 - index ? '#606060' : 'transparent', 
              '&:hover': {
                backgroundColor: '#cfcfcf', // Light gray background on hover
              },
              '&:active': {
                backgroundColor: '#bdbdbd', // Darker gray background on click
                transform: 'scale(0.98)', // Slightly shrink on click
              },
              transition: 'background-color 0.3s, transform 0.2s',
            }}
          >
            <ListItemText primary={item} sx={{ color: "white" }}/>
          </ListItemButton>
        ))}
      </List>
      <Divider />
    </Box>
  );
};

export default ClipboardList;
