import { useEffect, useState } from "react";
import api from "../api/api";

// MUI
import { Box, Typography, Chip } from "@mui/material";

export default function TagFilter({ setFilterTag }) {
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await api.get("/tags/");
        setTags(res.data);
      } catch (err) {
        console.error("❌ Failed to load tags", err);
      }
    }
    fetchTags();
  }, []);

  const handleTagClick = (tag) => {
    const selected = tag === activeTag ? "" : tag;
    setActiveTag(selected);
    setFilterTag(selected);
  };

  return (
    <Box mt={3} mb={4}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        🏷️ Filter by Tag
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={1}>
        <Chip
          label="All"
          clickable
          color={activeTag === "" ? "primary" : "default"}
          variant={activeTag === "" ? "filled" : "outlined"}
          onClick={() => handleTagClick("")}
        />

        {tags.map((t) => (
          <Chip
            key={t.id}
            label={`#${t.name}`}
            clickable
            color={activeTag === t.name ? "primary" : "default"}
            variant={activeTag === t.name ? "filled" : "outlined"}
            onClick={() => handleTagClick(t.name)}
          />
        ))}
      </Box>
    </Box>
  );
}
