import { useState } from "react";
import api from "../api/api";
import { toast } from "react-hot-toast";

// MUI
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Chip,
  Stack,
} from "@mui/material";

export default function NoteEditor({ refresh }) {
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isTodo, setIsTodo] = useState(false);

  const steps = ["Title", "Content", "Tags", "Confirm"];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCreate = async () => {
    if (!title || !content) {
      toast.error("⚠️ Title and content are required");
      return;
    }

    let finalContent = content;
    if (isTodo) {
      finalContent = JSON.stringify({
        type: "todo",
        items: content.split(",").map((t) => ({ task: t.trim(), done: false })),
      });
    }

    try {
      await api.post("/notes/", {
        title,
        content: finalContent,
        tags,
        is_checklist: isTodo,
      });

      toast.success("✅ Note created");

      setTitle("");
      setContent("");
      setTags([]);
      setIsTodo(false);
      setActiveStep(0);
      refresh();
    } catch (err) {
      console.error("❌ Failed to create note", err);
      toast.error("❌ Failed to create note");
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "background.paper",
        mb: 4,
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
        ✍️ Create a New Note
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Title */}
      {activeStep === 0 && (
        <Box>
          <TextField
            fullWidth
            label="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Box mt={2} textAlign="right">
            <Button variant="contained" disabled={!title} onClick={() => setActiveStep(1)}>
              Next →
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 1: Content */}
      {activeStep === 1 && (
        <Box>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={isTodo ? "Comma-separated tasks" : "Note Content"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isTodo}
                onChange={(e) => setIsTodo(e.target.checked)}
              />
            }
            label="Convert into Todo List?"
            sx={{ mt: 1 }}
          />

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={() => setActiveStep(0)}>← Back</Button>
            <Button variant="contained" disabled={!content} onClick={() => setActiveStep(2)}>
              Next →
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Tags */}
      {activeStep === 2 && (
        <Box>
          <TextField
            fullWidth
            label="Add a Tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            {tags.map((t, idx) => (
              <Chip
                key={idx}
                label={t}
                color="secondary"
                onDelete={() => handleRemoveTag(t)}
              />
            ))}
          </Box>
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={() => setActiveStep(1)}>← Back</Button>
            <Button variant="contained" onClick={() => setActiveStep(3)}>
              Next →
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 3: Confirm */}
      {activeStep === 3 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            ✅ Review your note before saving:
          </Typography>

          <Paper elevation={1} sx={{ p: 2, background: "#f8f9fa", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {isTodo
                ? content.split(",").map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))
                : content}
            </Typography>

            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
              {tags.map((t, idx) => (
                <Chip key={idx} label={t} />
              ))}
            </Stack>

            {isTodo && (
              <Typography variant="body2" color="secondary">
                ✔️ This note will be saved as a Todo Checklist
              </Typography>
            )}
          </Paper>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={() => setActiveStep(2)}>← Back</Button>
            <Button variant="contained" color="success" onClick={handleCreate}>
              🚀 Save Note
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
