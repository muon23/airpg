import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: {
    x: number;
    y: number;
  };
  connections: string[];
}

const WorldBuilder: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    x: '',
    y: '',
    connections: '',
  });

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        description: location.description,
        x: location.coordinates.x.toString(),
        y: location.coordinates.y.toString(),
        connections: location.connections.join('\n'),
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', description: '', x: '', y: '', connections: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLocation(null);
    setFormData({ name: '', description: '', x: '', y: '', connections: '' });
  };

  const handleSaveLocation = () => {
    const location: Location = {
      id: editingLocation?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      coordinates: {
        x: parseFloat(formData.x),
        y: parseFloat(formData.y),
      },
      connections: formData.connections.split('\n').filter(Boolean),
    };

    if (editingLocation) {
      setLocations(
        locations.map((l) => (l.id === location.id ? location : l))
      );
    } else {
      setLocations([...locations, location]);
    }

    handleCloseDialog();
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter((l) => l.id !== id));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">World Builder</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Location
        </Button>
      </Box>

      <Paper sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {locations.map((location) => (
            <Grid item xs={12} sm={6} md={4} key={location.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">{location.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {location.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Coordinates: ({location.coordinates.x}, {location.coordinates.y})
                  </Typography>
                  {location.connections.length > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Connected to: {location.connections.join(', ')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(location)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLocation ? 'Edit Location' : 'Add Location'}
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="X Coordinate"
                value={formData.x}
                onChange={(e) =>
                  setFormData({ ...formData, x: e.target.value })
                }
                type="number"
                fullWidth
              />
              <TextField
                label="Y Coordinate"
                value={formData.y}
                onChange={(e) =>
                  setFormData({ ...formData, y: e.target.value })
                }
                type="number"
                fullWidth
              />
            </Box>
            <TextField
              label="Connections (one per line)"
              value={formData.connections}
              onChange={(e) =>
                setFormData({ ...formData, connections: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveLocation} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorldBuilder; 