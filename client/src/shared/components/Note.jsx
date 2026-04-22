import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Note({ user, leagueId }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(""); 
  const debounceTimer = useRef(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await axios.get(`/generalNote/${leagueId}/${user._id}`);
        setNote(res.data.note || "");
      } catch (err) {
        console.error("Failed to fetch note:", err);
      }
    }
    if (user?._id && leagueId) {
      fetchNote();
    }
  }, [user, leagueId]);

  function handleChange(e) {
    const value = e.target.value;
    setNote(value);
    setStatus("Saving...");

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await axios.post("/generalNote/save", {
          userId: user._id,
          leagueId,
          note: value,
        });
        setStatus("Saved!");
        setTimeout(() => setStatus(""), 2000);
      } catch (err) {
        console.error("Failed to save note:", err);
        setStatus("Error saving");
      }
    }, 1000);
  }

  //AI-generated with some changes 
  return (
    <div className="note" style={{
      border: "1px solid #ccc",
      borderRadius: "6px",
      padding: "10px",
      marginBottom: "16px",
      backgroundColor: "#d9d9d9",
    }}>
      <h2>Note</h2>
      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Type your draft notes here..."
        rows={6}
        style={{
          width: "100%",
          resize: "vertical",
          boxSizing: "border-box",
          padding: "10px",
          backgroundColor: "#d9d9d9",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "16px",
          color: "#1d3a28",
        }}
      />
    </div>
  );
}

export default Note;