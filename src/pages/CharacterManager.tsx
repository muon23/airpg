import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface Character {
  id: string;
  name: string;
  description: string;
  attributes: {
    [key: string]: string;
  };
}

const CharacterManager: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    attributes: '',
  });

  const handleOpenDialog = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setFormData({
        name: character.name,
        description: character.description,
        attributes: Object.entries(character.attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n'),
      });
    } else {
      setEditingCharacter(null);
      setFormData({ name: '', description: '', attributes: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCharacter(null);
    setFormData({ name: '', description: '', attributes: '' });
  };

  const handleSaveCharacter = () => {
    const attributes = formData.attributes
      .split('\n')
      .reduce((acc, line) => {
        const [key, value] = line.split(':').map((s) => s.trim());
        if (key && value) acc[key] = value;
        return acc;
      }, {} as { [key: string]: string });

    const character: Character = {
      id: editingCharacter?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      attributes,
    };

    if (editingCharacter) {
      setCharacters(
        characters.map((c) => (c.id === character.id ? character : c))
      );
    } else {
      setCharacters([...characters, character]);
    }

    handleCloseDialog();
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters(characters.filter((c) => c.id !== id));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Character Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Character
        </Button>
      </Box>

      <Paper sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {characters.map((character) => (
            <ListItem key={character.id}>
              <ListItemText
                primary={character.name}
                secondary={character.description}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleOpenDialog(character)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteCharacter(character.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCharacter ? 'Edit Character' : 'Add Character'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Attributes (one per line, format: key: value)"
              value={formData.attributes}
              onChange={(e) =>
                setFormData({ ...formData, attributes: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCharacter} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterManager; 