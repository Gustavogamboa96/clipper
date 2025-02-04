import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { DragIndicator, Close } from '@mui/icons-material';
import { TextField } from '@mui/material';

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
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // Always start with the first item selected
  const [clipboardItems, setClipboardItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    window.electron.getClipboardData();
    window.electron.onClipboardUpdate((data) => setClipboardItems(data));
    window.electron.onClipboardData((data) => setClipboardItems(data));
  }, []);

  useEffect(() => {
    if (clipboardItems.length > 0) {
      setSelectedIndex(0); // Ensure the first item is selected initially
      window.electron.writeToClipboard(clipboardItems[0]); // Copy first item to clipboard
    }
  }, [clipboardItems]);

  const handleListItemClick = (index: number) => {
    setSelectedIndex(index);
    const textToCopy = clipboardItems[index];
    if (textToCopy) {
      window.electron.writeToClipboard(textToCopy);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredItems = clipboardItems
  .map((item, index) => ({ item, originalIndex: index })) // Store original index
  .filter(({ item }) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (clipboardItems.length === 0) return;

      let newIndex = selectedIndex;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        newIndex = Math.max(selectedIndex - 1, 0);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        newIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
      }

      if (newIndex !== selectedIndex) {
        setSelectedIndex(newIndex);
        window.electron.writeToClipboard(clipboardItems[newIndex]);

        const selectedItemRef = itemRefs.current[filteredItems[newIndex].originalIndex];
        if (selectedItemRef) {
          selectedItemRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, selectedIndex]);

  const handleCloseApp = () => {
    window.electron.closeApp();
  };

  return (
    <Box sx={{ width: '100vw', backgroundColor: 'gray', display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <DragIndicator className="drag-button" sx={{ color: "black", bgcolor: 'gray' }} />
      <Close className="close-button" onClick={handleCloseApp} sx={{ color: "black", bgcolor: 'gray' }} />
      <Box sx={{ flex: 1, overflowX:'hidden', overflowY: 'auto' }}>
      <List component="nav" aria-label="clipboard contents" sx={{ bgcolor: "gray" }}>
        {filteredItems.map(({ item, originalIndex }, index) => (
          <ListItemButton
            key={originalIndex}
            selected={selectedIndex === originalIndex}
            onClick={() => handleListItemClick(originalIndex)}
            ref={(el) => (itemRefs.current[originalIndex] = el)} // Store ref for this item
            sx={{
              backgroundColor: selectedIndex === originalIndex ?'#606060' :  '#808080' , // Selected item is darker
              '&.Mui-selected': { backgroundColor: '#606060' },
              '&:hover': { backgroundColor: '#cfcfcf' },
              transition: 'background-color 0.3s, transform 0.2s',
            }}
          >
            <ListItemText primary={item} sx={{ color: "white" }} />
          </ListItemButton>
        ))}
      </List>
      </Box>
      <Box className="search-bar" sx={{
        scale:'1.04',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#2e2e2e',
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search clipboard..."
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            input: { color: 'white' }, 
            width: '100%',
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: 'transparent', // Remove the blue border on focus
              },
            },
          }}
        />
      </Box>

      <Divider />
    </Box>
  );
};

export default ClipboardList;