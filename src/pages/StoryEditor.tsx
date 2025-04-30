import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import Editor from '@monaco-editor/react';

const StoryEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" gutterBottom>
        Story Editor
      </Typography>
      
      <TextField
        fullWidth
        label="Story Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Paper sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          height="70vh"
          defaultLanguage="markdown"
          value={content}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="primary">
          Save Draft
        </Button>
        <Button variant="contained" color="primary">
          Publish
        </Button>
      </Box>
    </Box>
  );
};

export default StoryEditor; 