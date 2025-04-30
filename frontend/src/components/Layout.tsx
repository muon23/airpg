import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Collapse,
  ListItemButton,
  ListItemSecondaryAction,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Public as PublicIcon,
  Folder as FolderIcon,
  Description as DescriptionIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FolderOpen as FolderOpenIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

interface StoryNode {
  id: string;
  name: string;
  type: 'folder' | 'story';
  children?: StoryNode[];
}

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const navigate = useNavigate();

  const [storyTree, setStoryTree] = useState<StoryNode[]>(() => {
    const savedTree = localStorage.getItem('storyTree');
    return savedTree ? JSON.parse(savedTree) : [
      {
        id: 'root',
        name: 'Stories',
        type: 'folder',
        children: []
      }
    ];
  });

  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node: StoryNode;
  } | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNodeClick = (node: StoryNode) => {
    if (node.id === 'root') {
      // Root folder (Stories) should always be expanded
      const newExpanded = new Set(expandedNodes);
      newExpanded.add('root');
      setExpandedNodes(newExpanded);
      return;
    }

    if (node.type === 'folder') {
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(node.id)) {
        newExpanded.delete(node.id);
      } else {
        newExpanded.add(node.id);
      }
      setExpandedNodes(newExpanded);
    } else {
      // Dispatch storySelect event for the StoryEditor to handle
      const event = new CustomEvent('storySelect', { 
        detail: { 
          id: node.id,
          name: node.name 
        } 
      });
      window.dispatchEvent(event);
      // Navigate to the root path to ensure StoryEditor is mounted
      navigate('/');
      setMobileOpen(false);
    }
  };

  const handleAddFolder = (parentId: string) => {
    const newFolder: StoryNode = {
      id: Date.now().toString(),
      name: 'New Folder',
      type: 'folder',
      children: []
    };

    const updateNode = (nodes: StoryNode[]): StoryNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newFolder]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateNode(node.children)
          };
        }
        return node;
      });
    };

    setStoryTree(prevTree => updateNode(prevTree));
    // Automatically expand the parent folder
    const newExpanded = new Set(expandedNodes);
    newExpanded.add(parentId);
    setExpandedNodes(newExpanded);
    // Start editing the new folder name
    setEditingNode(newFolder.id);
    setEditingName(newFolder.name);
  };

  const handleAddStory = (parentId: string) => {
    const newStory: StoryNode = {
      id: Date.now().toString(),
      name: 'Untitled Story',
      type: 'story'
    };

    const updateNode = (nodes: StoryNode[]): StoryNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          return {
            ...node,
            children: [...(node.children || []), newStory]
          };
        }
        if (node.children) {
          return {
            ...node,
            children: updateNode(node.children)
          };
        }
        return node;
      });
    };

    setStoryTree(prevTree => updateNode(prevTree));
    // Automatically expand the parent folder
    const newExpanded = new Set(expandedNodes);
    newExpanded.add(parentId);
    setExpandedNodes(newExpanded);
    // Start editing the new story name
    setEditingNode(newStory.id);
    setEditingName(newStory.name);
    // Open the new story
    const event = new CustomEvent('storySelect', { 
      detail: { 
        id: newStory.id,
        name: newStory.name 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleRename = (node: StoryNode) => {
    setEditingNode(node.id);
    setEditingName(node.name);
    handleCloseContextMenu();
  };

  const handleRenameComplete = (nodeId: string) => {
    if (editingName.trim()) {
      setStoryTree(prevTree => {
        const updateNode = (nodes: StoryNode[]): StoryNode[] => {
          return nodes.map(node => {
            if (node.id === nodeId) {
              return { ...node, name: editingName };
            }
            if (node.children) {
              return { ...node, children: updateNode(node.children) };
            }
            return node;
          });
        };
        return updateNode(prevTree);
      });
      // Dispatch event to update tab name
      const event = new CustomEvent('storyRename', { 
        detail: { id: nodeId, name: editingName } 
      });
      window.dispatchEvent(event);
    }
    setEditingNode(null);
    setEditingName('');
  };

  const handleContextMenu = (event: React.MouseEvent, node: StoryNode) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      node,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = (node: StoryNode) => {
    setStoryTree(prevTree => {
      const removeNode = (nodes: StoryNode[]): StoryNode[] => {
        return nodes.filter(n => {
          if (n.id === node.id) return false;
          if (n.children) {
            n.children = removeNode(n.children);
          }
          return true;
        });
      };
      return removeNode(prevTree);
    });
    handleCloseContextMenu();
  };

  const renderStoryNode = (node: StoryNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const Icon = node.type === 'folder' ? FolderIcon : DescriptionIcon;

    return (
      <React.Fragment key={node.id}>
        <ListItemButton
          onClick={() => handleNodeClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
          sx={{ pl: level * 2 }}
        >
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {editingNode === node.id ? (
              <TextField
                size="small"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameComplete(node.id)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameComplete(node.id);
                  }
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                sx={{ flex: 1 }}
              />
            ) : (
              <Typography 
                sx={{ flex: 1 }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingNode(node.id);
                  setEditingName(node.name);
                }}
              >
                {node.name}
              </Typography>
            )}
          </Box>
          {node.type === 'folder' && (
            <ListItemSecondaryAction>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemSecondaryAction>
          )}
        </ListItemButton>
        {node.children && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map(child => renderStoryNode(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {storyTree.map(node => renderStoryNode(node))}
        <ListItem button onClick={() => {
          // Save current state before navigating
          const event = new CustomEvent('saveState');
          window.dispatchEvent(event);
          navigate('/characters');
          setMobileOpen(false);
        }} sx={{ pl: 0 }}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Character Manager" />
        </ListItem>
        <ListItem button onClick={() => {
          // Save current state before navigating
          const event = new CustomEvent('saveState');
          window.dispatchEvent(event);
          navigate('/world');
          setMobileOpen(false);
        }} sx={{ pl: 0 }}>
          <ListItemIcon><PublicIcon /></ListItemIcon>
          <ListItemText primary="World Builder" />
        </ListItem>
      </List>
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.node.type === 'folder' ? (
          <>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleNodeClick(contextMenu.node);
                handleCloseContextMenu();
              }
            }}>
              <ListItemIcon>
                <FolderOpenIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Open</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleAddStory(contextMenu.node.id);
                handleCloseContextMenu();
              }
            }}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Story</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleAddFolder(contextMenu.node.id);
                handleCloseContextMenu();
              }
            }}>
              <ListItemIcon>
                <CreateNewFolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Subfolder</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleRename(contextMenu.node);
              }
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Rename</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleDelete(contextMenu.node);
              }
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleNodeClick(contextMenu.node);
                handleCloseContextMenu();
              }
            }}>
              <ListItemIcon>
                <DescriptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Open</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleRename(contextMenu.node);
              }
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Rename</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (contextMenu) {
                handleDelete(contextMenu.node);
              }
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );

  // Handle tab rename events
  useEffect(() => {
    const handleTabRename = (event: CustomEvent) => {
      const { id, name } = event.detail;
      setStoryTree(prevTree => {
        const updateNode = (nodes: StoryNode[]): StoryNode[] => {
          return nodes.map(node => {
            if (node.id === id) {
              return { ...node, name };
            }
            if (node.children) {
              return { ...node, children: updateNode(node.children) };
            }
            return node;
          });
        };
        return updateNode(prevTree);
      });
    };

    window.addEventListener('tabRename', handleTabRename as EventListener);
    return () => {
      window.removeEventListener('tabRename', handleTabRename as EventListener);
    };
  }, []);

  // Persist story tree to localStorage
  useEffect(() => {
    localStorage.setItem('storyTree', JSON.stringify(storyTree));
  }, [storyTree]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Storytelling Editor
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 