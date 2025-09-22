import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { alpha } from "@mui/system";
import { motion } from "framer-motion";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Tooltip from "@mui/material/Tooltip";

import NoteEditor from "./NoteEditor";
import FolderList from "./FolderList";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6C63FF" },
    background: { default: "#f9f9fb" },
  },
  typography: { fontFamily: "Inter, sans-serif" },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6C63FF" },
    background: { default: "#121212" },
  },
  typography: { fontFamily: "Inter, sans-serif" },
});
export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [filterTag, setFilterTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const me = await api.get("/users/me");
      setUser(me.data);
      const res = await api.get("/notes/");
      setNotes(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleChecklistItem = async (note, idx) => {
    if (user.role !== "child") return;
    const updatedItems = note.checklist_items.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    );
    try {
      await api.patch(`/notes/${note.id}/checklist`, updatedItems);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === note.id ? { ...n, checklist_items: updatedItems } : n
        )
      );
    } catch (err) {
      console.error("❌ Checklist update failed", err);
    }
  };

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];
  const filteredNotes = filterTag
    ? notes.filter((n) => n.tags.includes(filterTag))
    : notes;

  const getCardStyle = (role) => ({
    borderRadius: 4,
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: role === "child" ? "scale(1.02)" : "none",
      boxShadow:
        role === "child"
          ? "0 10px 30px rgba(108, 99, 255, 0.25)"
          : "0 6px 15px rgba(0,0,0,0.2)",
    },
    background: role === "child" ? "#fef6ff" : "white",
  });

  if (loading) {
    return (
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress size={70} />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) return <p>Failed to load user</p>;

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />

      {/* Topbar */}
      <AppBar position="sticky" elevation={0} sx={{
        backdropFilter: "blur(12px)",
        backgroundColor: alpha(user.role === 'child' ? '#6C63FF' : '#1e1e1e', 0.85),
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 1200,
      }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <NoteAltIcon sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
              {user.role === "child" ? "Fun Notes" : "Parent Dashboard"}
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography variant="body2" color="#ddd">
              Role: {user.role}
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Toggle Theme">
              <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: "#fff" }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout">
              <Button
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 500,
                  px: 2,
                  "&:hover": {
                    backgroundColor: alpha("#ffffff", 0.1),
                    borderRadius: 2,
                  },
                }}
              >
                Logout
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box px={{ xs: 2, md: 4 }} py={4}>
        <Typography variant="h5" gutterBottom>
          👋 Welcome, <b>{user.username}</b> ({user.role})
        </Typography>

        {user.role === "child" && (
          <>
            <FolderList refresh={fetchData} />
            <NoteEditor refresh={fetchData} />
          </>
        )}

        {allTags.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              🏷️ Filter by Tag
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label="All"
                variant="outlined"
                color={filterTag === "" ? "primary" : "default"}
                onClick={() => setFilterTag("")}
                clickable
              />
              {allTags.map((t) => (
                <Chip
                  key={t}
                  label={`#${t}`}
                  variant="outlined"
                  color={filterTag === t ? "primary" : "default"}
                  onClick={() => setFilterTag(t)}
                  clickable
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={3}>
          {/* Notes */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              📝 Your Notes
            </Typography>

            {filteredNotes.length === 0 ? (
              <Box textAlign="center" mt={5} color="gray">
                <Typography variant="h6">No notes yet</Typography>
                <Typography variant="body2">
                  Start by creating your first note! ✨
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredNotes.map((n) => (
                  <Grid item xs={12} sm={6} md={4} key={n.id}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Card elevation={4} sx={getCardStyle(user.role)}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {n.title}
                          </Typography>

                          {n.is_checklist ? (
                            <List dense>
                              {n.checklist_items.map((item, idx) => (
                                <ListItem key={idx} disableGutters>
                                  <ListItemIcon>
                                    <Checkbox
                                      edge="start"
                                      checked={item.done}
                                      disabled={user.role !== "child"}
                                      onChange={() => toggleChecklistItem(n, idx)}
                                    />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        sx={{
                                          fontSize: "1rem",
                                          fontWeight: "bold",
                                          color: item.done ? "#aaa" : "#333",
                                          textDecoration: item.done ? "line-through" : "none",
                                        }}
                                      >
                                        ✅ {item.task}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, mb: 1, color: "text.secondary" }}
                            >
                              {n.content}
                            </Typography>
                          )}

                          <Box mt={2}>
                            {n.tags.map((t, idx) => (
                              <Chip
                                key={idx}
                                label={t}
                                size="small"
                                sx={{ mr: 0.5, mt: 0.5 }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              📅 Upcoming Days
            </Typography>
            {[...Array(5)].map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const label = date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return (
                <Box
                  key={i}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                  borderBottom="1px dashed #ccc"
                >
                  <Typography>{label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {i === 0 ? "Today" : ""}
                  </Typography>
                </Box>
              );
            })}
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
