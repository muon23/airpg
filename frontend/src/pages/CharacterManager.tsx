import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AddAPhoto as AddPhotoIcon
} from '@mui/icons-material';

interface Character {
  id: string;
  name: string;
  description: string;
  icon?: string;
  persona?: string;
}

const CharacterManager: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const savedCharacters = localStorage.getItem('characters');
    return savedCharacters ? JSON.parse(savedCharacters) : [];
  });

  const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({ 
    name: '', 
    description: '' 
  });

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // Persist characters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('characters', JSON.stringify(characters));
    // Dispatch custom event when characters change
    const event = new CustomEvent('characterManagerUpdate', { detail: characters });
    window.dispatchEvent(event);
  }, [characters]);

  const handleAddCharacter = () => {
    // Check for duplicate names
    const nameExists = characters.some(
      char => char.name.toLowerCase() === newCharacter.name.toLowerCase()
    );
    if (nameExists) {
      alert('A character with this name already exists');
      return;
    }

    if (newCharacter.name.trim()) {
      const character: Character = {
        id: Date.now().toString(),
        ...newCharacter,
        icon: ''
      };
      setCharacters(prev => [...prev, character]);
      setNewCharacter({ name: '', description: '' });
    }
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === updatedCharacter.id ? updatedCharacter : char
      )
    );
  };

  const handleDeleteCharacter = (characterId: string) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, characterId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacters(characters.map(char => 
          char.id === characterId 
            ? { ...char, icon: reader.result as string }
            : char
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    // Check for duplicate names
    const nameExists = characters.some(
      char => char.id !== updatedCharacter.id && 
      char.name.toLowerCase() === updatedCharacter.name.toLowerCase()
    );
    if (nameExists) {
      alert('A character with this name already exists');
      return;
    }

    setCharacters(characters.map(char => 
      char.id === updatedCharacter.id ? updatedCharacter : char
    ));
    setEditingCharacter(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Character Manager
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Character Name"
          value={newCharacter.name}
          onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          sx={{ mb: 2 }}
          error={characters.some(
            char => char.name.toLowerCase() === newCharacter.name.toLowerCase()
          )}
          helperText={
            characters.some(
              char => char.name.toLowerCase() === newCharacter.name.toLowerCase()
            ) ? 'A character with this name already exists' : ''
          }
        />
        <TextField
          label="Character Description"
          value={newCharacter.description}
          onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddCharacter}
          disabled={!newCharacter.name.trim() || !newCharacter.description.trim()}
        >
          Add Character
        </Button>
      </Box>

      <List>
        {characters.map((character) => (
          <ListItem
            key={character.id}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoIcon />}
                  size="small"
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, character.id)}
                  />
                </Button>
                <IconButton edge="end" onClick={() => handleDeleteCharacter(character.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar src={character.icon}>
                {!character.icon && <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={character.name}
              secondary={character.description}
            />
          </ListItem>
        ))}
      </List>

      {/* Character Edit Dialog */}
      <Dialog 
        open={!!editingCharacter} 
        onClose={() => setEditingCharacter(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCharacter?.id === characters[characters.length - 1]?.id ? 'Add Character' : 'Edit Character'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={editingCharacter?.name || ''}
              onChange={(e) => setEditingCharacter({ ...editingCharacter!, name: e.target.value })}
              fullWidth
              error={characters.some(
                char => char.id !== editingCharacter?.id && 
                char.name.toLowerCase() === editingCharacter?.name.toLowerCase()
              )}
              helperText={
                characters.some(
                  char => char.id !== editingCharacter?.id && 
                  char.name.toLowerCase() === editingCharacter?.name.toLowerCase()
                ) ? 'A character with this name already exists' : ''
              }
            />
            <TextField
              label="Persona"
              value={editingCharacter?.persona || ''}
              onChange={(e) => setEditingCharacter({ ...editingCharacter!, persona: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {editingCharacter?.icon ? (
                <Avatar 
                  src={editingCharacter.icon} 
                  sx={{ width: 64, height: 64 }}
                />
              ) : (
                <Avatar sx={{ width: 64, height: 64 }}>
                  <PersonIcon />
                </Avatar>
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoIcon />}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, editingCharacter!.id)}
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCharacter(null)}>Cancel</Button>
          <Button 
            onClick={() => handleCharacterUpdate(editingCharacter!)}
            variant="contained"
            disabled={!editingCharacter?.name || !editingCharacter?.persona}
          >
            {editingCharacter?.id === characters[characters.length - 1]?.id ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CharacterManager; 