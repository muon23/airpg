import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Send as SendIcon,
  AutoAwesome as AutoAwesomeIcon,
  FolderOpen as FolderOpenIcon,
  DragIndicator as DragIndicatorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Settings as SettingsIcon,
  AddPhotoAlternate as AddPhotoIcon,
  ContentCopy as DuplicateIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Circle as CircleIcon,
  Restore as RestoreIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

interface StoryNode {
  id: string;
  name: string;
  type: 'folder' | 'story';
  children?: StoryNode[];
  alias?: string;
}

interface Story {
  id: string;
  title: string;
  alias?: string;
  recap: string;
  instructions: string;
  panels: StoryPanel[];
  isEdited: boolean;
  selectedCharacters: string[];
  selectedWorld: string;
}

interface StoryPanel {
  id: string;
  userInput: string;
  aiOutput: string;
  characters: string[];
  worldContext: string;
  isEdited: boolean;
  sectionInstructions: string;
  isEditing: boolean;
  lastSavedOutput: string;
}

interface Character {
  id: string;
  name: string;
  persona: string;
  icon?: string;
  controlledBy: 'user' | 'ai' | 'unassigned';
}

interface World {
  id: string;
  name: string;
  description: string;
}

type TabType = 'story' | 'characters' | 'worlds';

const StoryEditor = (): JSX.Element => {
  // Active story state
  const [activeStory, setActiveStory] = useState<Story | null>(() => {
    const savedStories = localStorage.getItem('openStories');
    const savedActiveTab = localStorage.getItem('activeTab');
    if (savedStories && savedActiveTab) {
      const stories = JSON.parse(savedStories);
      return stories.find((s: Story) => s.id === savedActiveTab) || null;
    }
    return null;
  });
  const [openStories, setOpenStories] = useState<Story[]>(() => {
    const savedStories = localStorage.getItem('openStories');
    return savedStories ? JSON.parse(savedStories) : [];
  });
  const [activeTab, setActiveTab] = useState<string | null>(() => {
    const savedActiveTab = localStorage.getItem('activeTab');
    return savedActiveTab || null;
  });
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Character and World state
  const [characters, setCharacters] = useState<Character[]>(() => {
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      const parsedCharacters = JSON.parse(savedCharacters);
      // Ensure all characters have the controlledBy property
      return parsedCharacters.map((char: any) => ({
        ...char,
        controlledBy: char.controlledBy || 'unassigned',
        persona: char.description || ''
      }));
    }
    return [];
  });
  const [worlds, setWorlds] = useState<World[]>(() => {
    const savedWorlds = localStorage.getItem('worlds');
    return savedWorlds ? JSON.parse(savedWorlds) : [];
  });

  // Update characters when they change in localStorage
  useEffect(() => {
    const checkForChanges = () => {
      const savedCharacters = localStorage.getItem('characters');
      if (savedCharacters) {
        const newCharacters = JSON.parse(savedCharacters);
        // Ensure all characters have the controlledBy property
        const updatedCharacters = newCharacters.map((char: any) => ({
          ...char,
          controlledBy: char.controlledBy || 'unassigned',
          persona: char.description || ''
        }));
        if (JSON.stringify(updatedCharacters) !== JSON.stringify(characters)) {
          console.log('Characters updated:', updatedCharacters);
          setCharacters(updatedCharacters);
        }
      }
    };

    // Check for changes every 100ms
    const interval = setInterval(checkForChanges, 100);
    return () => clearInterval(interval);
  }, [characters]);

  // Persist character and world state
  useEffect(() => {
    localStorage.setItem('characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('worlds', JSON.stringify(worlds));
  }, [worlds]);

  // Persist story state
  useEffect(() => {
    localStorage.setItem('openStories', JSON.stringify(openStories));
  }, [openStories]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab || '');
  }, [activeTab]);

  // Handle story selection from file structure
  useEffect(() => {
    const handleStorySelect = (event: CustomEvent) => {
      const { id, name } = event.detail;
      const story = openStories.find(s => s.id === id);
      
      if (story) {
        // Story is already open, switch to it
        setActiveStory(story);
        setActiveTab(id);
      } else {
        // Open new story
        const newStory: Story = {
          id,
          title: name,
          recap: '',
          instructions: '',
          panels: [{
            id: '1',
            userInput: '',
            aiOutput: '',
            characters: [],
            worldContext: '',
            isEdited: false,
            sectionInstructions: '',
            isEditing: false,
            lastSavedOutput: '',
          }],
          isEdited: false,
          selectedCharacters: [],
          selectedWorld: ''
        };
        setOpenStories(prev => [...prev, newStory]);
        setActiveStory(newStory);
        setActiveTab(id);
      }
    };

    window.addEventListener('storySelect', handleStorySelect as EventListener);
    return () => {
      window.removeEventListener('storySelect', handleStorySelect as EventListener);
    };
  }, [openStories]);

  // Handle story rename from file structure
  useEffect(() => {
    const handleStoryRename = (event: CustomEvent) => {
      const { id, name } = event.detail;
      setOpenStories(prev => 
        prev.map(story => 
          story.id === id 
            ? { ...story, title: name }
            : story
        )
      );
    };

    window.addEventListener('storyRename', handleStoryRename as EventListener);
    return () => {
      window.removeEventListener('storyRename', handleStoryRename as EventListener);
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    const story = openStories.find(s => s.id === newValue);
    setActiveStory(story || null);
  };

  const handleTabClose = (storyId: string) => {
    setOpenStories(prev => prev.filter(story => story.id !== storyId));
    if (activeTab === storyId) {
      const remainingStories = openStories.filter(story => story.id !== storyId);
      if (remainingStories.length > 0) {
        setActiveTab(remainingStories[0].id);
        setActiveStory(remainingStories[0]);
      } else {
        setActiveTab(null);
        setActiveStory(null);
      }
    }
  };

  const handleTabEdit = (storyId: string) => {
    const story = openStories.find(s => s.id === storyId);
    setEditingValue(story?.title || '');
    setEditingTab(storyId);
  };

  const handleTabEditComplete = (storyId: string) => {
    if (editingValue.trim()) {
      setOpenStories(stories => 
        stories.map(story => 
          story.id === storyId 
            ? { ...story, title: editingValue }
            : story
        )
      );
      // Dispatch event to update file name
      const event = new CustomEvent('tabRename', { 
        detail: { id: storyId, name: editingValue } 
      });
      window.dispatchEvent(event);
    }
    setEditingTab(null);
    setEditingValue('');
  };

  const handleStoryContentChange = (field: keyof Story, value: any) => {
    if (!activeStory) return;
    
    const updatedStory = { ...activeStory, [field]: value };
    setActiveStory(updatedStory);
    setOpenStories(stories => 
      stories.map(story => 
        story.id === activeStory.id ? updatedStory : story
      )
    );
  };

  // Initialize panels from localStorage or with one empty panel
  const [storyPanels, setStoryPanels] = useState<StoryPanel[]>(() => {
    if (!activeStory) return [];
    return activeStory.panels.length > 0 ? activeStory.panels : [{
      id: '1',
      userInput: '',
      aiOutput: '',
      characters: [],
      worldContext: '',
      isEdited: false,
      sectionInstructions: '',
      isEditing: false,
      lastSavedOutput: '',
    }];
  });

  // Update panels when active story changes
  useEffect(() => {
    if (activeStory) {
      setStoryPanels(activeStory.panels.length > 0 ? activeStory.panels : [{
        id: '1',
        userInput: '',
        aiOutput: '',
        characters: [],
        worldContext: '',
        isEdited: false,
        sectionInstructions: '',
        isEditing: false,
        lastSavedOutput: '',
      }]);
    }
  }, [activeStory]);

  // Save panels to active story whenever they change
  useEffect(() => {
    if (activeStory) {
      const updatedStory = {
        ...activeStory,
        panels: storyPanels
      };
      setActiveStory(updatedStory);
      setOpenStories(stories => 
        stories.map(story => 
          story.id === activeStory.id ? updatedStory : story
        )
      );
    }
  }, [storyPanels]);

  const [selectedWorld, setSelectedWorld] = useState('');
  const [editingPanels, setEditingPanels] = useState<Record<string, boolean>>({});
  const [storyTitle, setStoryTitle] = useState('');
  const [storyRecap, setStoryRecap] = useState('');
  const [globalInstructions, setGlobalInstructions] = useState('');
  const [recapExpanded, setRecapExpanded] = useState(false);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [sectionInstructionsOpen, setSectionInstructionsOpen] = useState<Record<string, boolean>>({});
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [deletedPanels, setDeletedPanels] = useState<StoryPanel[]>([]);
  const [lastEditedPanels, setLastEditedPanels] = useState<StoryPanel[]>([]);
  const [isWorldPanelCollapsed, setIsWorldPanelCollapsed] = useState(false);
  const [worldPanelWidth, setWorldPanelWidth] = useState(300);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(250);
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<string | null>(null);

  const handleAddPanel = (index: number) => {
    const newPanel: StoryPanel = {
      id: Date.now().toString(),
      userInput: '',
      aiOutput: '',
      characters: [],
      worldContext: '',
      isEdited: false,
      sectionInstructions: '',
      isEditing: false,
      lastSavedOutput: '',
    };

    setStoryPanels(prevPanels => {
      const newPanels = [...prevPanels];
      newPanels.splice(index + 1, 0, newPanel);
      return newPanels;
    });
  };

  const handleDeletePanel = (panelId: string) => {
    const panelToDelete = storyPanels.find(p => p.id === panelId);
    if (panelToDelete) {
      setLastEditedPanels([...storyPanels]);
      setDeletedPanels([...deletedPanels, panelToDelete]);
      setStoryPanels(storyPanels.filter(p => p.id !== panelId));
    }
  };

  const handleUndoDelete = () => {
    if (deletedPanels.length > 0) {
      const lastDeleted = deletedPanels[deletedPanels.length - 1];
      setStoryPanels([...storyPanels, lastDeleted]);
      setDeletedPanels(deletedPanels.slice(0, -1));
    }
  };

  const handleEditToggle = (id: string) => {
    setStoryPanels(panels => panels.map(panel => {
      if (panel.id === id) {
        return {
          ...panel,
          isEditing: !panel.isEditing,
          lastSavedOutput: panel.isEditing ? panel.aiOutput : panel.lastSavedOutput
        };
      }
      return panel;
    }));
  };

  const handleUndoEdit = (id: string) => {
    setStoryPanels(panels => panels.map(panel => {
      if (panel.id === id) {
        return {
          ...panel,
          aiOutput: panel.lastSavedOutput,
          isEditing: false
        };
      }
      return panel;
    }));
  };

  const handleRedoEdit = (id: string) => {
    const panel = storyPanels.find(p => p.id === id);
    if (!panel) return;

    const newPanels = storyPanels.map(p => {
      if (p.id === id) {
        return {
          ...p,
          aiOutput: p.lastSavedOutput,
          isEditing: true
        };
      }
      return p;
    });
    setStoryPanels(newPanels);
  };

  const handleSubmitEdit = (id: string) => {
    setStoryPanels(panels => panels.map(panel => {
      if (panel.id === id) {
        return {
          ...panel,
          isEditing: false,
          isEdited: true,
          lastSavedOutput: panel.aiOutput
        };
      }
      return panel;
    }));
  };

  const handleSubmit = (id: string) => {
    // TODO: Implement AI generation
    console.log('Submitting panel:', id);
  };

  const handleRegenerate = (id: string) => {
    // TODO: Implement regeneration for single panel
    console.log('Regenerating panel:', id);
  };

  const handleRegenerateBelow = (id: string) => {
    // TODO: Implement regeneration for all panels below
    console.log('Regenerating all panels below:', id);
  };

  const handleAISubmit = (id: string) => {
    setStoryPanels(panels => panels.map(panel => 
      panel.id === id ? { ...panel, isEdited: true } : panel
    ));
    setEditingPanels(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const handleCharacterControlChange = (characterId: string, newControl: 'user' | 'ai' | 'unassigned') => {
    setCharacters(characters.map(char => 
      char.id === characterId 
        ? { ...char, controlledBy: newControl }
        : char
    ));
  };

  const handleLoadStory = () => {
    // TODO: Implement story loading
    console.log('Loading story...');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;
    
    // If dropped in a different section, update the controlledBy property
    if (sourceDroppableId !== destinationDroppableId) {
      const characterId = result.draggableId;
      const newControlType = destinationDroppableId as 'user' | 'ai' | 'unassigned';
      
      // Update the character's control type first
      const updatedCharacters = characters.map(char => 
        char.id === characterId 
          ? { ...char, controlledBy: newControlType }
          : char
      );
      setCharacters(updatedCharacters);
    } else {
      // Reorder the characters within the same section
      const items = Array.from(characters);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setCharacters(items);
    }
  };

  const renderCharacterList = (controlType: 'user' | 'ai' | 'unassigned') => {
    console.log('Rendering characters:', characters);
    const filteredCharacters = characters.filter((char: Character) => char.controlledBy === controlType);
    return (
      <Droppable droppableId={controlType}>
        {(provided: DroppableProvided) => (
          <List 
            dense
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {filteredCharacters.map((char: Character, index: number) => (
              <Draggable key={char.id} draggableId={char.id} index={index}>
                {(provided: DraggableProvided) => (
                  <ListItem
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    secondaryAction={
                      controlType === 'unassigned' ? (
                        <Box>
                          <IconButton edge="end" onClick={() => handleCharacterControlChange(char.id, 'user')}>
                            <PersonIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleCharacterControlChange(char.id, 'ai')}>
                            <AutoAwesomeIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <IconButton 
                          edge="end" 
                          onClick={() => handleCharacterControlChange(char.id, 'unassigned')}
                        >
                          {controlType === 'user' ? <PersonIcon /> : <AutoAwesomeIcon />}
                        </IconButton>
                      )
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={char.icon}>
                        {!char.icon && (controlType === 'user' ? <PersonIcon /> : <AutoAwesomeIcon />)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={char.name} secondary={char.persona} />
                  </ListItem>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
    );
  };

  const handleSectionInstructionsToggle = (panelId: string) => {
    setSectionInstructionsOpen(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const handleCharacterAdd = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: 'New Character',
      persona: '',
      controlledBy: 'unassigned',
      icon: ''
    };
    setCharacters([...characters, newCharacter]);
    setEditingCharacter(newCharacter);
  };

  const handleCharacterDelete = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const handleCharacterDuplicate = (character: Character) => {
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      name: `${character.name} (Copy)`
    };
    setCharacters([...characters, newCharacter]);
  };

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    // Check for duplicate names
    const nameExists = characters.some(
      char => char.id !== updatedCharacter.id && char.name.toLowerCase() === updatedCharacter.name.toLowerCase()
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

  const handleWorldAdd = () => {
    const newWorld: World = {
      id: Date.now().toString(),
      name: 'New World',
      description: ''
    };
    setWorlds([...worlds, newWorld]);
    setEditingWorld(newWorld);
  };

  const handleWorldDelete = (id: string) => {
    setWorlds(worlds.filter(world => world.id !== id));
  };

  const handleWorldDuplicate = (world: World) => {
    const newWorld: World = {
      ...world,
      id: Date.now().toString(),
      name: `${world.name} (Copy)`
    };
    setWorlds([...worlds, newWorld]);
  };

  const handleWorldUpdate = (updatedWorld: World) => {
    // Check for duplicate names
    const nameExists = worlds.some(
      world => world.id !== updatedWorld.id && world.name.toLowerCase() === updatedWorld.name.toLowerCase()
    );
    if (nameExists) {
      alert('A world with this name already exists');
      return;
    }

    setWorlds(worlds.map(world => 
      world.id === updatedWorld.id ? updatedWorld : world
    ));
    setEditingWorld(null);
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

  const handleNewStory = () => {
    const newStory: Story = {
      id: Date.now().toString(),
      title: 'Untitled Story',
      recap: '',
      instructions: '',
      panels: [],
      isEdited: false,
      selectedCharacters: [],
      selectedWorld: ''
    };
    setActiveStory(newStory);
    setOpenStories([...openStories, newStory]);
  };

  const handleStoryAliasChange = (storyId: string, newAlias: string) => {
    setOpenStories(prevStories => 
      prevStories.map(story => 
        story.id === storyId 
          ? { ...story, alias: newAlias }
          : story
      )
    );
  };

  const handleFileNameChange = (newName: string) => {
    if (activeStory) {
      setOpenStories(prevStories =>
        prevStories.map(story =>
          story.id === activeStory.id
            ? { ...story, alias: newName }
            : story
        )
      );
    }
  };

  // Handle character selection changes
  const handleCharacterSelection = (characterId: string, isSelected: boolean) => {
    if (!activeStory) return;
    
    const updatedSelectedCharacters = isSelected
      ? [...activeStory.selectedCharacters, characterId]
      : activeStory.selectedCharacters.filter(id => id !== characterId);

    const updatedStory = {
      ...activeStory,
      selectedCharacters: updatedSelectedCharacters
    };

    setActiveStory(updatedStory);
    setOpenStories(stories => 
      stories.map(story => 
        story.id === activeStory.id ? updatedStory : story
      )
    );
  };

  // Handle world selection changes
  const handleWorldSelection = (worldId: string) => {
    if (!activeStory) return;
    
    const updatedStory = {
      ...activeStory,
      selectedWorld: worldId
    };

    setActiveStory(updatedStory);
    setOpenStories(stories => 
      stories.map(story => 
        story.id === activeStory.id ? updatedStory : story
      )
    );
  };

  // Handle title changes (completely separate from tab name)
  const handleTitleChange = (newTitle: string) => {
    if (!activeStory) return;
    
    // Only update the story's title, not the tab name
    const updatedStory = { ...activeStory, title: newTitle };
    setActiveStory(updatedStory);
    setOpenStories(stories => 
      stories.map(story => 
        story.id === activeStory.id ? updatedStory : story
      )
    );
  };

  const handleResizeStop = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
    setWorldPanelWidth(worldPanelWidth + data.size.width);
  };

  const handleLeftPanelResizeStop = (event: React.SyntheticEvent, data: ResizeCallbackData) => {
    setLeftPanelWidth(data.size.width);
  };

  const handlePanelResizeStart = (panelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(panelId);
    const startY = e.clientY;
    const startHeight = panelHeights[panelId] || 200;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(100, Math.min(500, startHeight + deltaY));
      setPanelHeights(prev => ({ ...prev, [panelId]: newHeight }));
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (resizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, [resizing]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <AppBar position="static" color="default" elevation={0}>
        <Tabs
          value={activeTab || false}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {openStories.map((story) => (
            <Tab
              key={story.id}
              value={story.id}
              label={
                editingTab === story.id ? (
                  <TextField
                    size="small"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => handleTabEditComplete(story.id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTabEditComplete(story.id);
                      }
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Box
                    sx={{ display: 'flex', alignItems: 'center' }}
                    onDoubleClick={() => handleTabEdit(story.id)}
                  >
                    {story.title}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTabClose(story.id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )
              }
            />
          ))}
        </Tabs>
      </AppBar>

      {/* Story Content */}
      {activeStory ? (
        <Box sx={{ flex: 1, p: 3, pl: 1.5, display: 'flex', gap: 2, position: 'relative' }}>
          {!isWorldPanelCollapsed && (
            <Box
              sx={{
                width: worldPanelWidth,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                pr: 2
              }}
            >
              {/* Resize Handle */}
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  cursor: 'col-resize',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = worldPanelWidth;

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const newWidth = Math.max(200, Math.min(500, startWidth + deltaX));
                    setWorldPanelWidth(newWidth);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />

              {/* Panel Content */}
              <Box sx={{ pl: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Typography variant="subtitle1">World & Characters</Typography>
                  <IconButton
                    onClick={() => setIsWorldPanelCollapsed(true)}
                    sx={{
                      width: 40,
                      height: 40,
                      padding: 0,
                      backgroundColor: 'background.paper',
                      color: 'primary.main',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <ChevronLeftIcon fontSize="large" />
                  </IconButton>
                </Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>World</InputLabel>
                  <Select
                    value={activeStory?.selectedWorld || ''}
                    onChange={(e) => handleWorldSelection(e.target.value)}
                    label="World"
                  >
                    {worlds.map(world => (
                      <MenuItem key={world.id} value={world.id}>{world.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="subtitle1" sx={{ mb: 1 }}>Character Assignment</Typography>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="user-controlled" type="characters">
                    {(provided: DroppableProvided) => (
                      <Paper 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          User Controlled
                        </Typography>
                        {renderCharacterList('user')}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>

                  <Droppable droppableId="ai-controlled" type="characters">
                    {(provided: DroppableProvided) => (
                      <Paper 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          AI Controlled
                        </Typography>
                        {renderCharacterList('ai')}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>

                  <Droppable droppableId="available-characters" type="characters">
                    {(provided: DroppableProvided) => (
                      <Paper 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ p: 2 }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          Available Characters
                        </Typography>
                        {renderCharacterList('unassigned')}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>
            </Box>
          )}

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

          {/* World Manager Dialog */}
          <Dialog 
            open={!!editingWorld} 
            onClose={() => setEditingWorld(null)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {editingWorld?.id === worlds[worlds.length - 1]?.id ? 'Add World' : 'Edit World'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Name"
                  value={editingWorld?.name || ''}
                  onChange={(e) => setEditingWorld({ ...editingWorld!, name: e.target.value })}
                  fullWidth
                  error={worlds.some(
                    world => world.id !== editingWorld?.id && 
                    world.name.toLowerCase() === editingWorld?.name.toLowerCase()
                  )}
                  helperText={
                    worlds.some(
                      world => world.id !== editingWorld?.id && 
                      world.name.toLowerCase() === editingWorld?.name.toLowerCase()
                    ) ? 'A world with this name already exists' : ''
                  }
                />
                <TextField
                  label="Description"
                  value={editingWorld?.description || ''}
                  onChange={(e) => setEditingWorld({ ...editingWorld!, description: e.target.value })}
                  multiline
                  rows={4}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingWorld(null)}>Cancel</Button>
              <Button 
                onClick={() => handleWorldUpdate(editingWorld!)}
                variant="contained"
                disabled={!editingWorld?.name || !editingWorld?.description}
              >
                {editingWorld?.id === worlds[worlds.length - 1]?.id ? 'Add' : 'Save'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Story Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Story Title and Actions */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Story Title"
                value={activeStory.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                sx={{ 
                  '& .MuiInputBase-input': {
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Load story">
                  <IconButton onClick={handleLoadStory}>
                    <FolderOpenIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Undo">
                  <IconButton>
                    <UndoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Redo">
                  <IconButton>
                    <RedoIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save story">
                  <IconButton>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Story Recap */}
            <Paper>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  bgcolor: 'background.default'
                }}
                onClick={() => setRecapExpanded(!recapExpanded)}
              >
                <Typography variant="subtitle1">Story Recap</Typography>
                {recapExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={recapExpanded}>
                <Box sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add a recap of the story so far..."
                    value={activeStory.recap}
                    onChange={(e) => handleStoryContentChange('recap', e.target.value)}
                  />
                </Box>
              </Collapse>
            </Paper>

            {/* Story Instructions */}
            <Paper>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  bgcolor: 'background.default'
                }}
                onClick={() => setInstructionsExpanded(!instructionsExpanded)}
              >
                <Typography variant="subtitle1">Instructions to AI</Typography>
                {instructionsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={instructionsExpanded}>
                <Box sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Add instructions for the AI about this chapter..."
                    value={activeStory.instructions}
                    onChange={(e) => handleStoryContentChange('instructions', e.target.value)}
                  />
                </Box>
              </Collapse>
            </Paper>

            {/* Story Panels */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="story-panels" type="panels">
                {(provided: DroppableProvided) => (
                  <Box 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}
                  >
                    {/* Undo Actions */}
                    <Box sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      top: -40,
                      display: 'flex',
                      gap: 1
                    }}>
                      {deletedPanels.length > 0 && (
                        <Tooltip title="Undo Delete">
                          <IconButton
                            size="small"
                            onClick={handleUndoDelete}
                          >
                            <UndoIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {lastEditedPanels.length > 0 && (
                        <Tooltip title="Undo Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleUndoEdit(lastEditedPanels[0].id)}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    {/* Add panel button at the top */}
                    <Box sx={{ 
                      position: 'absolute', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      top: -20,
                      zIndex: 1 
                    }}>
                      <IconButton
                        onClick={() => handleAddPanel(-1)}
                        sx={{
                          border: '1px solid',
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>

                    {storyPanels.map((panel, index) => (
                      <React.Fragment key={panel.id}>
                        <Draggable key={panel.id} draggableId={panel.id} index={index}>
                          {(provided: DraggableProvided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ p: 2, display: 'flex', gap: 2, position: 'relative' }}
                            >
                              {/* Drag handle */}
                              <Box sx={{ 
                                position: 'absolute', 
                                left: 4, 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                cursor: 'grab'
                              }}>
                                <DragIndicatorIcon />
                              </Box>

                              {/* User Input Box */}
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: 2, position: 'relative' }}>
                                <Box
                                  sx={{
                                    height: panelHeights[`${panel.id}-input`] || 200,
                                    minHeight: 100,
                                    maxHeight: 500,
                                    position: 'relative',
                                    marginBottom: 0,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    '&:hover .resize-handle': {
                                      opacity: 1
                                    }
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Enter your story input..."
                                    value={panel.userInput}
                                    onChange={(e) => {
                                      const newPanels = [...storyPanels];
                                      newPanels[index] = { ...panel, userInput: e.target.value };
                                      setStoryPanels(newPanels);
                                    }}
                                    sx={{ 
                                      height: '100%',
                                      '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        alignItems: 'flex-start',
                                        paddingBottom: '32px'
                                      }
                                    }}
                                  />
                                  <Box
                                    className="resize-handle"
                                    onMouseDown={(e) => handlePanelResizeStart(`${panel.id}-input`, e)}
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: 8,
                                      cursor: 'ns-resize',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      backgroundColor: 'action.hover',
                                      '&:hover': {
                                        opacity: 1,
                                        backgroundColor: 'action.selected'
                                      }
                                    }}
                                  />
                                  <Box sx={{ 
                                    position: 'absolute', 
                                    right: 8, 
                                    bottom: 8,
                                    display: 'flex',
                                    gap: 1
                                  }}>
                                    <Tooltip title="Submit">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleSubmit(panel.id)}
                                        disabled={!panel.userInput}
                                      >
                                        <SendIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </Box>

                              {/* AI Response Box */}
                              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: 0.33, position: 'relative' }}>
                                <Box
                                  sx={{
                                    height: panelHeights[`${panel.id}-output`] || 200,
                                    minHeight: 100,
                                    maxHeight: 500,
                                    position: 'relative',
                                    marginBottom: 0,
                                    border: '1px solid',
                                    borderColor: panel.isEdited ? 'primary.main' : 'divider',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    '&:hover .resize-handle': {
                                      opacity: 1
                                    }
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="AI response will appear here..."
                                    value={panel.aiOutput}
                                    onChange={(e) => {
                                      const newPanels = [...storyPanels];
                                      newPanels[index] = { ...panel, aiOutput: e.target.value };
                                      setStoryPanels(newPanels);
                                    }}
                                    disabled={!panel.isEditing}
                                    sx={{ 
                                      height: '100%',
                                      '& .MuiOutlinedInput-root': {
                                        height: '100%',
                                        alignItems: 'flex-start',
                                        paddingBottom: '32px'
                                      }
                                    }}
                                  />
                                  <Box
                                    className="resize-handle"
                                    onMouseDown={(e) => handlePanelResizeStart(`${panel.id}-output`, e)}
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: 8,
                                      cursor: 'ns-resize',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      backgroundColor: 'action.hover',
                                      '&:hover': {
                                        opacity: 1,
                                        backgroundColor: 'action.selected'
                                      }
                                    }}
                                  />
                                  <Box sx={{ 
                                    position: 'absolute', 
                                    right: 8, 
                                    bottom: 8,
                                    display: 'flex',
                                    gap: 1
                                  }}>
                                    {panel.isEditing ? (
                                      <>
                                        <Tooltip title="Save">
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              const newPanels = [...storyPanels];
                                              newPanels[index] = { 
                                                ...panel, 
                                                isEditing: false,
                                                isEdited: true,
                                                lastSavedOutput: panel.aiOutput
                                              };
                                              setStoryPanels(newPanels);
                                            }}
                                          >
                                            <SaveIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              const newPanels = [...storyPanels];
                                              newPanels[index] = { 
                                                ...panel, 
                                                isEditing: false,
                                                aiOutput: panel.lastSavedOutput
                                              };
                                              setStoryPanels(newPanels);
                                            }}
                                          >
                                            <UndoIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <>
                                        <Tooltip title="Edit">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleEditToggle(panel.id)}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Regenerate">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleRegenerate(panel.id)}
                                          >
                                            <RefreshIcon />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Regenerate All Below">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleRegenerateBelow(panel.id)}
                                          >
                                            <AutoAwesomeIcon />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}
                                  </Box>
                                </Box>
                              </Box>

                              {/* Section Instructions and Delete Buttons */}
                              <Box sx={{ 
                                position: 'absolute', 
                                right: 0, 
                                bottom: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                zIndex: 1,
                                marginLeft: 24
                              }}>
                                <Tooltip title="Section Instructions">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSectionInstructionsToggle(panel.id)}
                                    sx={{ 
                                      color: sectionInstructionsOpen[panel.id] ? 'primary.main' : 'inherit',
                                      transform: sectionInstructionsOpen[panel.id] ? 'rotate(180deg)' : 'none',
                                      transition: 'transform 0.2s'
                                    }}
                                  >
                                    <SettingsIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Panel">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeletePanel(panel.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              {/* Section Instructions Content */}
                              <Collapse in={sectionInstructionsOpen[panel.id]}>
                                <Box sx={{ 
                                  position: 'absolute', 
                                  right: 0, 
                                  bottom: 0,
                                  width: '100%',
                                  bgcolor: 'background.paper',
                                  p: 2,
                                  borderTop: '1px solid',
                                  borderColor: 'divider'
                                }}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="Add special instructions for this section..."
                                    value={panel.sectionInstructions}
                                    onChange={(e) => {
                                      const newPanels = [...storyPanels];
                                      newPanels[index] = { 
                                        ...panel, 
                                        sectionInstructions: e.target.value 
                                      };
                                      setStoryPanels(newPanels);
                                    }}
                                  />
                                </Box>
                              </Collapse>

                              {/* Add panel button at the bottom of each panel */}
                              <Box sx={{ 
                                position: 'absolute', 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                bottom: -20,
                                zIndex: 1 
                              }}>
                                <Tooltip title="Add new panel">
                                  <IconButton
                                    onClick={() => handleAddPanel(index)}
                                    sx={{
                                      border: '1px solid',
                                      borderRadius: '50%',
                                      width: 40,
                                      height: 40,
                                      backgroundColor: 'background.paper',
                                      '&:hover': {
                                        backgroundColor: 'action.hover',
                                      }
                                    }}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      </React.Fragment>
                    ))}

                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export default StoryEditor; 