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
  Menu,
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
import { config } from '../config';
import { getTaskColor } from '../constants/colors';

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
  fileName: string;
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
  task?: string;
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

interface Engine {
  id: string;
  name: string;
  provider: string;
  version: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  borderColor: string;
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
        setStoryPanels(story.panels);
      } else {
        // Open new story with no panels
        const newStory: Story = {
          id,
          title: 'Untitled Story',
          fileName: name,
          recap: '',
          instructions: '',
          panels: [],
          isEdited: false,
          selectedCharacters: [],
          selectedWorld: ''
        };
        setOpenStories(prev => [...prev, newStory]);
        setActiveStory(newStory);
        setActiveTab(id);
        setStoryPanels([]); // Ensure storyPanels is empty
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
      
      // Update both fileName and title in openStories
      setOpenStories(prev => 
        prev.map(story => 
          story.id === id 
            ? { ...story, fileName: name, title: name }
            : story
        )
      );

      // Update active story if it's the one being renamed
      if (activeStory?.id === id) {
        setActiveStory(prev => prev ? { ...prev, fileName: name, title: name } : null);
      }
    };

    window.addEventListener('storyRename', handleStoryRename as EventListener);
    return () => {
      window.removeEventListener('storyRename', handleStoryRename as EventListener);
    };
  }, [activeStory]);

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

  const handleStoryContentChange = (field: keyof Story, value: any) => {
    if (!activeStory) return;
    
    // Only update the specified field, preserving fileName
    const updatedStory = { 
      ...activeStory, 
      [field]: value,
      fileName: activeStory.fileName // Explicitly preserve fileName
    };
    
    setActiveStory(updatedStory);
    setOpenStories(stories => 
      stories.map(story => 
        story.id === activeStory.id ? updatedStory : story
      )
    );
  };

  // Initialize panels from localStorage or with empty array
  const [storyPanels, setStoryPanels] = useState<StoryPanel[]>(() => {
    if (!activeStory) return [];
    return activeStory.panels || [];
  });

  // Update panels when active story changes
  useEffect(() => {
    if (activeStory) {
      setStoryPanels(activeStory.panels || []);
    } else {
      setStoryPanels([]);
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
  const [panelHeights, setPanelHeights] = useState<Record<string, number>>(() => {
    const heights: Record<string, number> = {};
    storyPanels.forEach(panel => {
      heights[`${panel.id}-input`] = 200;
      heights[`${panel.id}-output`] = 200;
    });
    return heights;
  });
  const [resizingPanel, setResizingPanel] = useState<string | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [resizeStartHeight, setResizeStartHeight] = useState<number>(0);
  const [selectedEngine, setSelectedEngine] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>(() => {
    const savedTask = localStorage.getItem('selectedTask');
    return savedTask || '';
  });
  const [engines, setEngines] = useState<Engine[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [taskMenuAnchor, setTaskMenuAnchor] = useState<{
    element: HTMLElement | null;
    panelIndex: number;
  }>({ element: null, panelIndex: -1 });

  const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setTaskMenuAnchor({
      element: event.currentTarget,
      panelIndex: index
    });
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchor({ element: null, panelIndex: -1 });
  };

  const handleTaskSelect = (taskId: string) => {
    if (!activeStory) return;

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
      task: taskId
    };

    // Update both storyPanels and the story in openStories
    const updatedPanels = taskMenuAnchor.panelIndex === -1 
      ? [newPanel, ...storyPanels]
      : [...storyPanels.slice(0, taskMenuAnchor.panelIndex + 1), newPanel, ...storyPanels.slice(taskMenuAnchor.panelIndex + 1)];
    
    setStoryPanels(updatedPanels);
    
    // Update the story in openStories
    setOpenStories(stories => 
      stories.map(story => 
        story.id === activeStory.id 
          ? { ...story, panels: updatedPanels }
          : story
      )
    );

    // Update active story
    setActiveStory(prev => prev ? { ...prev, panels: updatedPanels } : null);

    setPanelHeights(prev => ({
      ...prev,
      [`${newPanel.id}-input`]: 200,
      [`${newPanel.id}-output`]: 200
    }));

    handleTaskMenuClose();
  };

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      const [tasksResponse, enginesResponse] = await Promise.all([
        fetch(`${config.apiUrl}/api/tasks`),
        fetch(`${config.apiUrl}/api/engines`)
      ]);

      if (!tasksResponse.ok || !enginesResponse.ok) {
        throw new Error('Failed to fetch configurations');
      }

      const [tasksData, enginesData] = await Promise.all([
        tasksResponse.json(),
        enginesResponse.json()
      ]);

      console.log('Fetched tasks:', tasksData); // For debugging
      console.log('Fetched engines:', enginesData); // For debugging
      
      setTasks(tasksData);
      setEngines(enginesData);
      
      // Set the first engine as default if none is selected
      if (!selectedEngine && enginesData.length > 0) {
        setSelectedEngine(enginesData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
      // Set default empty state
      setTasks([]);
      setEngines([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure we fetch configurations on component mount
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleAddPanel = (index: number) => {
    const newPanel: StoryPanel = {
      id: Date.now().toString(),
      userInput: '',
      aiOutput: '',
      characters: index >= 0 ? storyPanels[index].characters : [],
      worldContext: index >= 0 ? storyPanels[index].worldContext : '',
      isEdited: false,
      sectionInstructions: '',
      isEditing: false,
      lastSavedOutput: '',
      task: index >= 0 ? storyPanels[index].task : 
            storyPanels.length > 0 ? storyPanels[0].task : 
            tasks.length > 0 ? tasks[0].id : undefined
    };

    setStoryPanels(prevPanels => {
      const newPanels = [...prevPanels];
      const insertIndex = index === -1 ? 0 : index + 1;
      newPanels.splice(insertIndex, 0, newPanel);
      return newPanels;
    });

    setPanelHeights(prev => ({
      ...prev,
      [`${newPanel.id}-input`]: 200,
      [`${newPanel.id}-output`]: 200
    }));
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

  const handleSubmit = async (panelId: string) => {
    try {
      const panel = storyPanels.find(p => p.id === panelId);
      if (!panel || !activeStory) return;

      // Get the index of the current panel
      const currentPanelIndex = storyPanels.findIndex(p => p.id === panelId);

      // Find the selected world if any
      const selectedWorld = activeStory.selectedWorld ? worlds.find(w => w.id === activeStory.selectedWorld) : null;

      const requestData = {
        engine: selectedEngine,
        task: panel.task,
        world: selectedWorld,
        characters: characters.filter(c => 
          c.controlledBy === 'user' || c.controlledBy === 'ai'
        ).map(c => ({
          id: c.id,
          name: c.name,
          persona: c.persona,
          controlled_by: c.controlledBy
        })),
        story_recap: activeStory.recap || "",
        instructions: activeStory.instructions || "",
        current_panel_index: currentPanelIndex,
        panels: storyPanels.map(p => ({
          user_input: p.userInput || "",
          ai_output: p.aiOutput || "",
          is_edited: p.isEdited || false,
          section_instructions: p.sectionInstructions || ""
        }))
      };

      console.log('Submitting request data:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`${config.apiUrl}/api/story/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(
          errorData.detail && typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData, null, 2)
        );
      }

      const data = await response.json();
      
      setStoryPanels(panels => 
        panels.map(p => 
          p.id === panelId 
            ? { ...p, aiOutput: data.content }
            : p
        )
      );
    } catch (error) {
      console.error('Error generating story:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unknown error occurred');
      }
    }
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
    const filteredCharacters = characters
      .filter((char: Character) => char.controlledBy === controlType)
      .sort((a, b) => a.name.localeCompare(b.name));  // Sort alphabetically by name
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
      fileName: 'Untitled Story',
      recap: '',
      instructions: '',
      panels: [],
      isEdited: false,
      selectedCharacters: [],
      selectedWorld: ''
    };
    setActiveStory(newStory);
    setOpenStories([...openStories, newStory]);
    setActiveTab(newStory.id);
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

  // Handle title changes (completely separate from tab name)
  const handleTitleChange = (newTitle: string) => {
    if (!activeStory) return;
    
    // Only update the title in the story object, preserving fileName
    const updatedStory = { 
      ...activeStory, 
      title: newTitle,
      fileName: activeStory.fileName // Explicitly preserve fileName
    };

    // Update the active story and the story in openStories
    setActiveStory(updatedStory);
    setOpenStories(prevStories => 
      prevStories.map(story => 
        story.id === activeStory.id ? updatedStory : story
      )
    );

    // No event dispatch for tab/file name update
  };

  const handleFileNameChange = (event: CustomEvent<{ id: string; name: string }>) => {
    const { id, name } = event.detail;
    setOpenStories(stories => 
      stories.map(story => 
        story.id === id 
          ? { ...story, fileName: name }
          : story
      )
    );

    // Update active story if it's the one being renamed
    if (activeStory?.id === id) {
      setActiveStory(prev => prev ? { ...prev, fileName: name } : null);
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

  const handleResizeStart = (panelId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingPanel(panelId);
    setResizeStartY(e.clientY);
    setResizeStartHeight(panelHeights[`${panelId}-input`] || 200);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingPanel) return;
    const deltaY = e.clientY - resizeStartY;
    const newHeight = Math.max(100, Math.min(500, resizeStartHeight + deltaY));
    
    setPanelHeights(prev => ({
      ...prev,
      [`${resizingPanel}-input`]: newHeight,
      [`${resizingPanel}-output`]: newHeight
    }));
  };

  const handleResizeEnd = () => {
    setResizingPanel(null);
  };

  useEffect(() => {
    if (resizingPanel) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingPanel, resizeStartY, resizeStartHeight]);

  useEffect(() => {
    localStorage.setItem('selectedEngine', selectedEngine);
  }, [selectedEngine]);

  useEffect(() => {
    localStorage.setItem('selectedTask', selectedTask);
  }, [selectedTask]);

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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {story.fileName}
                  <span>
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
                  </span>
                </Box>
              }
            />
          ))}
        </Tabs>
      </AppBar>

      {/* Task Selection Menu - Moved to root level */}
      <Menu
        open={taskMenuAnchor.element !== null}
        onClose={handleTaskMenuClose}
        anchorEl={taskMenuAnchor.element}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            marginTop: 1,
            width: 200,
            maxHeight: 300,
            overflowY: 'auto'
          }
        }}
      >
        {tasks.map(task => (
          <MenuItem
            key={task.id}
            onClick={() => handleTaskSelect(task.id)}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                backgroundColor: `${getTaskColor(task.id)}15`
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: getTaskColor(task.id),
                  border: '2px solid',
                  borderColor: 'divider'
                }}
              />
              <Typography>{task.name}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Story Content */}
      {activeStory ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          {isWorldPanelCollapsed && (
            <IconButton
              onClick={() => setIsWorldPanelCollapsed(false)}
              sx={{
                position: 'absolute',
                left: -30,
                top: 76,
                zIndex: 1000,
                width: 40,
                height: 40,
                padding: 0,
                backgroundColor: 'white',
                color: 'primary.main',
                borderRadius: '0 20px 20px 0',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          )}
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
                    <Typography variant="subtitle1">Story Settings</Typography>
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
                    <InputLabel>Engine</InputLabel>
                    <Select
                      value={selectedEngine}
                      onChange={(e) => setSelectedEngine(e.target.value)}
                      label="Engine"
                      disabled={isLoading}
                    >
                      {engines.map(engine => (
                        <MenuItem key={engine.id} value={engine.id}>{engine.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>World</InputLabel>
                    <Select
                      value={activeStory?.selectedWorld || ''}
                      onChange={(e) => handleWorldSelection(e.target.value)}
                      label="World"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
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
                  inputProps={{
                    onFocus: (e) => e.target.select()
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Load story">
                    <span>
                      <IconButton onClick={handleLoadStory}>
                        <FolderOpenIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Undo">
                    <span>
                      <IconButton>
                        <UndoIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Redo">
                    <span>
                      <IconButton>
                        <RedoIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Save story">
                    <span>
                      <IconButton>
                        <SaveIcon />
                      </IconButton>
                    </span>
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
                            <span>
                              <IconButton
                                size="small"
                                onClick={handleUndoDelete}
                              >
                                <UndoIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {lastEditedPanels.length > 0 && (
                          <Tooltip title="Undo Edit">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleUndoEdit(lastEditedPanels[0].id)}
                              >
                                <RestoreIcon />
                              </IconButton>
                            </span>
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
                          onClick={(e) => {
                            if (storyPanels.length === 0) {
                              handleTaskMenuOpen(e, -1);
                            } else {
                              const firstPanelTask = storyPanels[0]?.task;
                              if (firstPanelTask) {
                                handleTaskSelect(firstPanelTask);
                              } else {
                                handleTaskMenuOpen(e, -1);
                              }
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleTaskMenuOpen(e, -1);
                          }}
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
                      </Box>

                      {storyPanels.map((panel, index) => (
                        <React.Fragment key={panel.id}>
                          <Draggable key={panel.id} draggableId={panel.id} index={index}>
                            {(provided: DraggableProvided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{ 
                                  p: 2, 
                                  display: 'flex', 
                                  gap: 2, 
                                  position: 'relative',
                                  border: '2px solid',
                                  borderColor: getTaskColor(panel.task),
                                  borderLeft: '6px solid',
                                  borderLeftColor: getTaskColor(panel.task),
                                  '&:hover': {
                                    borderColor: getTaskColor(panel.task),
                                    boxShadow: 2
                                  }
                                }}
                              >
                                {/* Drag handle - only for reordering */}
                                <Box 
                                  {...provided.dragHandleProps}
                                  sx={{ 
                                    position: 'absolute', 
                                    left: 4, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    cursor: 'grab',
                                    zIndex: 1
                                  }}
                                >
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
                                      border: '2px solid',
                                      borderColor: getTaskColor(panel.task),
                                      borderRadius: 1,
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <textarea
                                      placeholder="Enter your story input..."
                                      value={panel.userInput}
                                      onChange={(e) => {
                                        const newPanels = [...storyPanels];
                                        newPanels[index] = { ...panel, userInput: e.target.value };
                                        setStoryPanels(newPanels);
                                      }}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: '8px',
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'inherit',
                                        fontSize: 'inherit',
                                        backgroundColor: 'transparent',
                                        color: 'black'
                                      }}
                                    />
                                    <Box sx={{ 
                                      position: 'absolute', 
                                      right: 20, 
                                      top: 2,
                                      opacity: 0.7,
                                      '&:hover': {
                                        opacity: 1
                                      }
                                    }}>
                                      <Tooltip title="Submit">
                                        <span>
                                          <IconButton
                                            size="small"
                                            onClick={() => handleSubmit(panel.id)}
                                            sx={{ 
                                              padding: '4px',
                                              '& .MuiSvgIcon-root': {
                                                fontSize: '1.2rem'
                                              },
                                              '&:hover': {
                                                color: 'primary.main'
                                              }
                                            }}
                                          >
                                            <SendIcon />
                                          </IconButton>
                                        </span>
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
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <textarea
                                      placeholder="AI response will appear here..."
                                      value={panel.aiOutput}
                                      onChange={(e) => {
                                        const newPanels = [...storyPanels];
                                        newPanels[index] = { ...panel, aiOutput: e.target.value };
                                        setStoryPanels(newPanels);
                                      }}
                                      disabled={!panel.isEditing}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: '8px',
                                        border: 'none',
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'inherit',
                                        fontSize: 'inherit',
                                        backgroundColor: 'transparent',
                                        color: 'black'
                                      }}
                                    />
                                    <Box sx={{ 
                                      position: 'absolute', 
                                      right: 20, 
                                      top: 2,
                                      display: 'flex', 
                                      gap: 0.1,
                                      opacity: 0.7,
                                      '&:hover': {
                                        opacity: 1,
                                        '& .MuiIconButton-root': {
                                          color: 'primary.main'
                                        }
                                      }
                                    }}>
                                      {panel.isEditing ? (
                                        <>
                                          <Tooltip title="Save">
                                            <span>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleSubmitEdit(panel.id)}
                                                sx={{ 
                                                  padding: '4px',
                                                  '& .MuiSvgIcon-root': {
                                                    fontSize: '1.2rem'
                                                  }
                                                }}
                                              >
                                                <SaveIcon />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                          <Tooltip title="Cancel">
                                            <span>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleUndoEdit(panel.id)}
                                                sx={{ 
                                                  padding: '4px',
                                                  '& .MuiSvgIcon-root': {
                                                    fontSize: '1.2rem'
                                                  }
                                                }}
                                              >
                                                <UndoIcon />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                        </>
                                      ) : (
                                        <>
                                          <Tooltip title="Edit">
                                            <span>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleEditToggle(panel.id)}
                                                sx={{ 
                                                  padding: '4px',
                                                  '& .MuiSvgIcon-root': {
                                                    fontSize: '1.2rem'
                                                  }
                                                }}
                                              >
                                                <EditIcon />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                          <Tooltip title="Regenerate">
                                            <span>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleRegenerate(panel.id)}
                                                sx={{ 
                                                  padding: '4px',
                                                  '& .MuiSvgIcon-root': {
                                                    fontSize: '1.2rem'
                                                  }
                                                }}
                                              >
                                                <RefreshIcon />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                          <Tooltip title="Regenerate All Below">
                                            <span>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleRegenerateBelow(panel.id)}
                                                sx={{ 
                                                  padding: '4px',
                                                  '& .MuiSvgIcon-root': {
                                                    fontSize: '1.2rem'
                                                  }
                                                }}
                                              >
                                                <AutoAwesomeIcon />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                        </>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Resize Handle */}
                                <Box
                                  onMouseDown={(e) => handleResizeStart(panel.id, e)}
                                  sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    backgroundColor: 'divider',
                                    opacity: 0.5,
                                    transition: 'opacity 0.2s',
                                    '&:hover': {
                                      opacity: 1,
                                      backgroundColor: 'primary.main',
                                      height: 6,
                                      cursor: 'ns-resize'
                                    }
                                  }}
                                />

                                {/* Section Instructions and Delete Buttons */}
                                <Box sx={{ 
                                  position: 'absolute', 
                                  right: 2, 
                                  bottom: 15,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 1,
                                  zIndex: 1,
                                  marginLeft: 24
                                }}>
                                  <Tooltip title="Section Instructions">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleSectionInstructionsToggle(panel.id)}
                                        sx={{ 
                                          color: sectionInstructionsOpen[panel.id] ? 'primary.main' : 'inherit',
                                          transform: sectionInstructionsOpen[panel.id] ? 'rotate(180deg)' : 'none',
                                          transition: 'transform 0.2s',
                                          padding: '4px',
                                          '& .MuiSvgIcon-root': {
                                            fontSize: '1.2rem'
                                          },
                                          '&:hover': {
                                            color: 'primary.main'
                                          }
                                        }}
                                      >
                                        <SettingsIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title="Delete Panel">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeletePanel(panel.id)}
                                        sx={{ 
                                          color: 'error.main',
                                          padding: '4px',
                                          '& .MuiSvgIcon-root': {
                                            fontSize: '1.2rem'
                                          }
                                        }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </span>
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
                                    <span>
                                      <IconButton
                                        onContextMenu={(e) => handleTaskMenuOpen(e, index)}
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
                                    </span>
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
        </Box>
      ) : null}

      {/* Add Settings button to the toolbar */}
      <AppBar position="static" color="default" elevation={0}>
        {/* ... existing toolbar content ... */}
      </AppBar>
    </Box>
  );
};

export default StoryEditor; 