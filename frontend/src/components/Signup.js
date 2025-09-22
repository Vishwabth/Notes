import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-hot-toast";

import {
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "child",
    parent_id: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!form.username || !form.email || !form.password) {
      toast.error("⚠️ All fields except Parent ID are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      if (form.role === "child" && form.parent_id.trim() !== "") {
        payload.parent_id = parseInt(form.parent_id, 10);
      }

      await api.post("/auth/signup", payload);
      toast.success("✅ Signup successful. Please login!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "❌ Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: form.role === "child" ? "#f3f0ff" : "#f5f5f5",
        transition: "all 0.3s",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 420,
          p: 4,
          width: "100%",
          borderRadius: 3,
          background: "#ffffff",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: form.role === "child" ? "#6C63FF" : "primary.main",
          }}
        >
          {form.role === "child" ? "🎨 Join as Child" : "👨‍👩‍👧 Parent Registration"}
        </Typography>

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          fullWidth
          label="Password"
          margin="normal"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <MenuItem value="child">Child</MenuItem>
          <MenuItem value="parent">Parent</MenuItem>
        </TextField>

        {form.role === "child" && (
          <TextField
            fullWidth
            margin="normal"
            label="Parent ID (optional)"
            value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
          />
        )}

        <Box mt={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSignup}
            disabled={loading}
            sx={{ fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} /> : "Signup"}
          </Button>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, cursor: "pointer", color: "primary.main" }}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </Typography>
      </Paper>
    </Box>
  );
}
