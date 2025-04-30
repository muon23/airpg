# Story Editor PRD

## Overview
The Story Editor is the primary interface for collaborative storytelling between users and AI. It provides a structured environment for users to create and develop stories with AI assistance, manage characters, and build immersive worlds.

## Core Features

### 1. Navigation & Layout
- Story Editor is the default home page
- Side panel navigation for Character Manager and World Builder
- Two main scrollable panels: User Input (left) and AI Output (right)
- Responsive design that works on both desktop and mobile devices

### 2. World and Character Management
- World selection dropdown/selector
- Character selection interface
  - Multiple character selection support
  - Designation of user-controlled vs AI-controlled characters
  - Character status indicators (active/inactive)
- Character attributes display (from Character Manager)

### 3. Story Development Interface
#### Left Panel (User Input)
- Interactive text boxes for story input
- Features per text box:
  - Text input area
  - Submit button
  - Edit button
  - Delete button
  - Character selector (for dialogue/actions)
  - World context selector
- Box management:
  - Add new box button
  - Drag-and-drop reordering
  - Undo/redo functionality
  - Box history tracking

#### Right Panel (AI Output)
- Corresponding output boxes for each user input
- Features per output box:
  - Generated story text
  - Regenerate button
  - Edit button
  - Character attribution
  - World context display
- Box management:
  - One-to-one correspondence with input boxes
  - Version history
  - Undo/redo functionality

### 4. File Management
- Save functionality:
  - Save current progress
  - Auto-save feature
  - Save as new version
- Load functionality:
  - Load previous sessions
  - Version selection
- Publish functionality:
  - Export complete story to text file
  - Format options (plain text, markdown)
  - Include/exclude user inputs option

### 5. Undo/Redo System
- Track all modifications:
  - Text edits
  - Box additions/deletions
  - Character assignments
  - World selections
- Multi-level undo/redo
- Visual history timeline
- Snapshot recovery points

## User Interface Components

### 1. Top Navigation Bar
- Story title
- Save/Load buttons
- Publish button
- Undo/Redo buttons
- World selector
- Character manager toggle

### 2. Side Panel
- Character Manager access
- World Builder access
- Quick character selection
- World context display

### 3. Main Content Area
#### Left Panel
- Scrollable container
- Add new box button
- Individual input boxes
- Box management controls

#### Right Panel
- Scrollable container
- AI-generated content boxes
- Box management controls
- Version history access

### 4. Bottom Toolbar
- Character quick-select
- World context indicators
- Status messages
- Auto-save indicator

## Technical Requirements

### 1. State Management
- Track all user inputs
- Maintain AI outputs
- Store character assignments
- Track world context
- Manage version history

### 2. Data Structure
```typescript
interface StoryBox {
  id: string;
  userInput: string;
  aiOutput: string;
  characters: string[];
  worldContext: string;
  timestamp: Date;
  version: number;
  history: StoryBoxVersion[];
}

interface StoryBoxVersion {
  content: string;
  timestamp: Date;
  type: 'user' | 'ai';
}
```

### 3. File System Integration
- Local storage for quick saves
- File system access for full saves
- Version control system
- Export formats support

### 4. AI Integration
- Real-time generation
- Context awareness
- Character consistency
- World context integration

## User Experience

### 1. Workflow
1. Select world and characters
2. Create initial story input
3. Submit for AI generation
4. Review and edit AI output
5. Add new input or modify existing
6. Save progress
7. Publish final story

### 2. Error Handling
- Input validation
- Save/load error recovery
- AI generation fallbacks
- Version conflict resolution

### 3. Performance
- Smooth scrolling
- Quick response times
- Efficient state management
- Optimized AI requests

## Future Enhancements
1. Collaborative editing
2. Multiple AI model support
3. Advanced formatting options
4. Story branching support
5. Character relationship visualization
6. World map integration
7. Story timeline view
8. Export to multiple formats (PDF, EPUB, etc.) 