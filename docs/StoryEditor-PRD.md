# Story Editor PRD

## Overview
The Story Editor is a React-based component that provides an interactive interface for creating and editing AI-assisted stories. It features a two-panel layout with character/world management and story content sections.

## Task System

### Task Management
- Tasks are fetched from the server API endpoint `/api/tasks`
- Each task has:
  - Unique ID
  - Display name
  - Description
  - Automatically assigned color from a predefined palette
- Colors are assigned sequentially from the palette when tasks are loaded
- No hardcoding of task names or colors in client code

### Task Selection
- Tasks are selected per story panel
- Selection is done via right-click menu on the "+" button between panels
- Visual indicators:
  - Colored bullet points in the task selection menu
  - Matching border colors on panels
- Default task inheritance:
  - New panels inherit task from panel above
  - If no panel above, uses first available task

### Task Data Flow
- Tasks are loaded at application startup
- Task data is included in API requests for panel generation
- Each panel stores its assigned task
- Task information is preserved in story save/load

## UI Components

### Story Header
- Story title input field (large, prominent)
- Action buttons in the top-right:
  - Load story
  - Undo
  - Redo
  - Save story

### World & Characters Panel (Left Side)
- Width: 300px (default), resizable between 200px and 500px
- Collapsible via chevron button
- When collapsed, shows an expand button (">") at fixed position
- Contains:
  - World selector dropdown
  - Character assignment sections:
    - User Controlled (drag & drop)
    - AI Controlled (drag & drop)
    - Available Characters (drag & drop)

### Settings Panel (Left Side)
- Width: 300px (default), resizable between 200px and 500px
- Collapsible via chevron button
- When collapsed, shows an expand button (">") at fixed position (left: -30px, top: 76px)
- Contains:
  - Engine selector dropdown (e.g., GPT-4, Claude)
  - World selector dropdown
  - Character assignment sections:
    - User Controlled (drag & drop)
    - AI Controlled (drag & drop)
    - Available Characters (drag & drop)

### Story Content Panel (Right Side)
- Expandable story recap section
- Expandable global instructions section
- Story sections arranged vertically with:
  - Reorder handle (left side)
  - User input box (left)
  - AI response box (right)
  - Gap between boxes: 0.33 units
  - Add section button between panels with right-click menu for task selection
  - Section-specific controls:
    - Section instructions button (bottom-right)
    - Delete button (bottom-right, below instructions)
    - Both buttons outside AI box but inside panel
  - Visual task indicator:
    - Border color changes based on selected task
    - Default task is inherited from panel above

### Story Section Features
- Resizable height (100px - 500px) with bottom handle
- Smooth resize transitions
- Visual feedback during resize (cursor change, hover effects)
- Task selection via right-click on "+" button
- Visual task indicator via border color

### User Input Box Features
- Full-height textarea that fills the container
- Submit button in upper-right corner (right: 20px, top: 2px)
- Button styling:
  - Default opacity: 0.7
  - Hover opacity: 1.0
  - Hover color: primary blue
  - Icon size: 1.2rem
  - Padding: 4px

### AI Response Box Features
- Full-height textarea that fills the container
- Control buttons in upper-right corner (right: 20px, top: 2px)
- Button styling:
  - Default opacity: 0.7
  - Hover opacity: 1.0
  - Hover color: primary blue
  - Icon size: 1.2rem
  - Padding: 4px
  - Gap between buttons: 0.1 units
- Border color changes when edited (primary theme color)
- Edit mode controls:
  - Edit/Save button
  - Cancel button (reverts to last saved state)
  - Regenerate button
  - Regenerate All Below button (with AutoAwesome icon)

### Section Controls
- Section Instructions button:
  - Position: bottom-right of panel (right: 20px, bottom: 20px)
  - Size: matches edit box buttons
  - Color: primary blue when hovered or section open
  - Icon size: 1.2rem
  - Padding: 4px
- Delete button:
  - Position: below section instructions (right: 20px, bottom: 60px)
  - Size: matches edit box buttons
  - Color: error color
  - Icon size: 1.2rem
  - Padding: 4px

### Character Management
- Drag and drop interface for character assignment
- Character cards show:
  - Avatar/icon
  - Name
  - Brief persona description
  - Control assignment buttons

## State Management
- Tracks edited state for AI responses
- Maintains history for undo/redo
- Preserves panel collapse states
- Stores panel dimensions
- Tracks character assignments
- Manages section instructions visibility
- Tracks task selection per panel

## Data Model
```typescript
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
  task: string;
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

interface Task {
  id: string;
  name: string;
  description: string;
  borderColor: string;
}
``` 