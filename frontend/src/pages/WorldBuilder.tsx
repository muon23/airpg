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
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AddAPhoto as AddPhotoIcon,
  Public as PublicIcon
} from '@mui/icons-material';

interface World {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

const WorldBuilder: React.FC = () => {
  const [worlds, setWorlds] = useState<World[]>(() => {
    const savedWorlds = localStorage.getItem('worlds');
    return savedWorlds ? JSON.parse(savedWorlds) : [];
  });

  const [newWorld, setNewWorld] = useState<Omit<World, 'id'>>({ 
    name: '', 
    description: '',
    icon: ''
  });

  // Persist worlds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('worlds', JSON.stringify(worlds));
    // Dispatch custom event when worlds change
    const event = new CustomEvent('worldBuilderUpdate', { detail: worlds });
    window.dispatchEvent(event);
  }, [worlds]);

  const handleAddWorld = () => {
    // Check for duplicate names
    const nameExists = worlds.some(
      world => world.name.toLowerCase() === newWorld.name.toLowerCase()
    );
    if (nameExists) {
      alert('A world with this name already exists');
      return;
    }

    if (newWorld.name.trim()) {
      const world: World = {
        id: Date.now().toString(),
        ...newWorld
      };
      setWorlds(prev => [...prev, world]);
      setNewWorld({ name: '', description: '', icon: '' });
    }
  };

  const handleUpdateWorld = (updatedWorld: World) => {
    setWorlds(prev => 
      prev.map(world => 
        world.id === updatedWorld.id ? updatedWorld : world
      )
    );
  };

  const handleDeleteWorld = (worldId: string) => {
    setWorlds(prev => prev.filter(world => world.id !== worldId));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, worldId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorlds(worlds.map(world => 
          world.id === worldId 
            ? { ...world, icon: reader.result as string }
            : world
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        World Builder
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="World Name"
          value={newWorld.name}
          onChange={(e) => setNewWorld(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
          sx={{ mb: 2 }}
          error={worlds.some(
            world => world.name.toLowerCase() === newWorld.name.toLowerCase()
          )}
          helperText={
            worlds.some(
              world => world.name.toLowerCase() === newWorld.name.toLowerCase()
            ) ? 'A world with this name already exists' : ''
          }
        />
        <TextField
          label="World Description"
          value={newWorld.description}
          onChange={(e) => setNewWorld(prev => ({ ...prev, description: e.target.value }))}
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddWorld}
          disabled={!newWorld.name.trim() || !newWorld.description.trim()}
        >
          Add World
        </Button>
      </Box>

      <List>
        {worlds.map((world) => (
          <ListItem
            key={world.id}
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
                    onChange={(e) => handleImageUpload(e, world.id)}
                  />
                </Button>
                <IconButton edge="end" onClick={() => handleDeleteWorld(world.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar src={world.icon}>
                {!world.icon && <PublicIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={world.name}
              secondary={world.description}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default WorldBuilder; 