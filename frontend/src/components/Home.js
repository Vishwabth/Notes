import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  CssBaseline,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useMemo, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#6C63FF" },
          background: {
            default: darkMode ? "#121212" : "#f9f9f9",
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: darkMode
            ? "linear-gradient(-45deg, #1e1e1e, #2c2c2c, #3a3a3a, #1a1a1a)"
            : "linear-gradient(-45deg, #ff9a9e, #fad0c4, #fbc2eb, #a6c1ee)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
        }}
      >
        <style>
          {`
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>

        {/* Top Navbar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: "bold", color: "white" }}
            >
              📒 Notes App
            </Typography>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Button color="inherit" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              sx={{ ml: 2 }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Container
          sx={{
            position: "relative",
            zIndex: 2,
            minHeight: "80vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                color: "white",
              }}
            >
              Welcome to <span style={{ color: "#FFD700" }}>Notes App</span> 🚀
            </Typography>
            <Typography variant="h6" sx={{ color: "#f0f0f0", mb: 4 }}>
              Organize your thoughts, manage tasks, and collaborate with family.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: "30px",
                fontSize: "1.1rem",
                px: 4,
                background: "linear-gradient(45deg, #ff6b6b, #f06595)",
              }}
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </Box>
        </Container>

        {/* Feature Grid */}
        <Container sx={{ pb: 6, zIndex: 2, position: "relative" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={3}
            mt={6}
          >
            {[
              {
                emoji: "📝",
                title: "Smart Notes",
                desc: "Create rich text notes and checklists with tags.",
              },
              {
                emoji: "📅",
                title: "Daily Tasks",
                desc: "Track your todos and stay productive every day.",
              },
              {
                emoji: "👨‍👩‍👧",
                title: "Shared Access",
                desc: "Let parents and children collaborate seamlessly.",
              },
            ].map((f, i) => (
              <Box
                key={i}
                flex={1}
                minWidth={250}
                p={3}
                sx={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  color: "white",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                }}
              >
                <Typography variant="h4" gutterBottom>
                  {f.emoji} {f.title}
                </Typography>
                <Typography variant="body1" color="#ddd">
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>

        {/* Footer */}
        <Box
          textAlign="center"
          py={3}
          sx={{
            backgroundColor: "rgba(0,0,0,0.3)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            zIndex: 3,
            position: "relative",
          }}
        >
          <Typography variant="body2" color="white">
            © {new Date().getFullYear()} Notes App — Built with ❤️
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
