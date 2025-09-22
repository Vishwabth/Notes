import { useState, useEffect } from "react";
import api from "../api/api";

// MUI
import {
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  ListItemIcon,
  Typography,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Stack,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Description,
  Add as AddIcon,
} from "@mui/icons-material";

const folderEmojis = ["📁", "🧠", "📚", "🏫", "🎯", "💡", "📓", "🗂️"];

export default function FolderList({ refresh, onFilterByFolder }) {
  const [folders, setFolders] = useState([]);
  const [open, setOpen] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFolders = async () => {
    try {
      const res = await api.get("/folders/");
      setFolders(res.data);
      const init = {};
      res.data.forEach((f) => (init[f.id] = false));
      setOpen(init);
    } catch (err) {
      console.error("❌ Failed to fetch folders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const toggleFolder = (id) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateFolder = async () => {
    const name = prompt("Enter new folder name:");
    if (!name) return;
    try {
      await api.post("/folders/", { name });
      refresh();
      fetchFolders();
    } catch (err) {
      console.error("❌ Failed to create folder", err);
    }
  };

  const handleFolderClick = (folder) => {
    if (onFilterByFolder) {
      onFilterByFolder(folder.notes.map((n) => n.id)); // pass list of note IDs
    }
    toggleFolder(folder.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!folders.length) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No folders yet.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleCreateFolder}
        >
          Create Folder
        </Button>
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          📂 Your Folders
        </Typography>
        <Tooltip title="Add Folder">
          <IconButton size="small" onClick={handleCreateFolder}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <List sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 2 }}>
        {folders.map((folder, i) => {
          const emoji = folderEmojis[i % folderEmojis.length];
          return (
            <Box key={folder.id}>
              <ListItemButton
                onClick={() => handleFolderClick(folder)}
                sx={{
                  borderRadius: 2,
                  my: 1,
                  bgcolor: open[folder.id] ? "action.hover" : "inherit",
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemIcon>
                  <Typography fontSize="1.3rem">{emoji}</Typography>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography fontWeight={500} variant="body1">
                      {folder.name}
                    </Typography>
                  }
                />
                {open[folder.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={open[folder.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 5 }}>
                  {folder.notes.length > 0 ? (
                    folder.notes.map((note) => (
                      <ListItemButton
                        key={note.id}
                        sx={{
                          borderRadius: 2,
                          my: 0.5,
                          ml: 1,
                          px: 2,
                          py: 1,
                          transition: "0.2s",
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Description fontSize="small" sx={{ color: "text.secondary" }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={500}>
                              {note.title}
                            </Typography>
                          }
                          secondary={note.is_checklist ? "Checklist" : "Note"}
                        />
                      </ListItemButton>
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ pl: 6, py: 1 }}
                    >
                      (No notes inside)
                    </Typography>
                  )}
                </List>
              </Collapse>
              <Divider sx={{ my: 1 }} />
            </Box>
          );
        })}
      </List>
    </Box>
  );
}
