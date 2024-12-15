import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/notes").then((response) => {
      setNotes(response.data);
    });
  }, []);

  useEffect(() => {
    if (currentNote) {
      socket.emit("join-note", currentNote._id);

      socket.on("note-updated", (updatedContent) => {
        setContent(updatedContent);
      });
    }

    return () => {
      socket.off("note-updated");
    };
  }, [currentNote]);

  const handleEdit = (e) => {
    const updatedContent = e.target.value;
    setContent(updatedContent);
    socket.emit("edit-note", { noteId: currentNote._id, content: updatedContent });
  };

  return (
    <div>
      <h1>Collaborative Notes</h1>
      <div>
        <ul>
          {notes.map((note) => (
            <li key={note._id} onClick={() => setCurrentNote(note)}>
              {note.title}
            </li>
          ))}
        </ul>
      </div>
      {currentNote && (
        <div>
          <h2>{currentNote.title}</h2>
          <textarea value={content} onChange={handleEdit} />
        </div>
      )}
    </div>
  );
}

export default App;
