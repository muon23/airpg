import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import Layout from './components/Layout';
import StoryEditor from './pages/StoryEditor';
import CharacterManager from './pages/CharacterManager';
import WorldBuilder from './pages/WorldBuilder';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_relativeSplatPath: true }}>
        <Layout>
          <Routes>
            <Route path="/" element={<StoryEditor />} />
            <Route path="/story/:id" element={<StoryEditor />} />
            <Route path="/characters" element={<CharacterManager />} />
            <Route path="/world" element={<WorldBuilder />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App; 