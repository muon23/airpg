import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import {
  Book as BookIcon,
  Person as PersonIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Story Editor',
      description: 'Create and edit your stories with a powerful text editor',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      path: '/story',
    },
    {
      title: 'Character Manager',
      description: 'Manage your characters and their attributes',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      path: '/characters',
    },
    {
      title: 'World Builder',
      description: 'Build and organize your story world',
      icon: <PublicIcon sx={{ fontSize: 40 }} />,
      path: '/world',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Storytelling Editor
      </Typography>
      <Typography variant="body1" paragraph>
        Create immersive stories, manage characters, and build rich worlds with our
        powerful storytelling tools.
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography>{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home; 