// Import necessary modules and styles
import React, { useState, useEffect } from "react";
import { getAccountDetails } from "../Services/localStorage";
import { MoreVert } from "@mui/icons-material";
import "./NotesListScreen.css";
import NewNote from "../NewNote/NewNote";
import ViewNote from "../ViewNote/ViewNote";
import { config } from "../../config";
import axios from "../../APIs/axios";

// NotesListScreen component
const NotesListScreen = ({ allData, hseAllData,setLoading }) => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [openAddNote, setOpenAddNote] = useState(false);
  const [openViewNote, setOpenViewNote] = useState(false);
  const [selectedNoteData, setSelectedNoteData] = useState(null);
  const [mode, setMode] = useState(null);
  const userId = getAccountDetails().userId;
  const [selectedNoteType, setSelectedNoteType] = useState(null);

  useEffect(() => {
    getAllNotes();
  }, []);

  useEffect(() => {
    const handleBodyClick = (event) => {
      // Check if the clicked element is outside the options menu
      if (
        !event.target.closest(".options") &&
        !event.target.closest(".ellipsis")
      ) {
        // Clicked outside the options menu, close it
        setSelectedNote(null);
      }
    };

    // Attach the event listener to the body
    document.body.addEventListener("click", handleBodyClick);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const getAllNotes = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${config.PATH}/api/get-all-notes/${userId}`
      );
      setNotes(response.data);
      setLoading(false)
    } catch (err) {
      console.log(err);
    }
  };

  const handleEllipsisClick = (note) => {
    setSelectedNote(note);
  };

  const handleViewClick = async (note) => {
    setMode("view");
    const response = await axios.get(
      `${config.PATH}/api/get-note/${note.id}/view`
    );
    setSelectedNoteData(response.data);
    toggleOpenViewNote();
  };

  const handleEditClick = async (note) => {
    setMode("edit");
    const response = await axios.get(
      `${config.PATH}/api/get-note/${note.id}/view`
    );
    setSelectedNoteData(response.data);
    toggleOpenViewNote();
  };

  const handleDeleteClick = (note) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (shouldDelete) {
      axios
        .delete(`${config.PATH}/api/delete-note/${note.id}/delete`)
        .then(() => {
          getAllNotes(); // Update the list of notes
        })
        .catch((error) => {
          console.error("Error deleting note:", error);
        });
    }
  };

  const filteredNotes = notes.filter((note) => {
    // Check if the note matches the search term
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.observation.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if the note matches the selected note type
    const matchesNoteType =
      !selectedNoteType || note.note_type === selectedNoteType;

    // Return true if both conditions are met
    return matchesSearch && matchesNoteType;
  });

  const truncateDescription = (description) => {
    const maxLength = 100;
    if (description.length > maxLength) {
      return description.substring(0, maxLength) + "...";
    }
    return description;
  };

  const truncateTitle = (title) => {
    const maxLength = 100;
    if (title.length > maxLength) {
      return title.substring(0, maxLength) + "...";
    }
    return title;
  };

  const toggleOpenNewNote = () => {
    setOpenAddNote(!openAddNote);
  };

  const toggleOpenViewNote = () => {
    setOpenViewNote(!openViewNote);
  };

  return (
    <>
      <div className="notes">
        <div className="heading">Notes</div>
        <div className="notes-holder">
          <div className="notes-list-heading">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search Notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="note-type-switch">
              Filter By Note Type: 
              <label>
                <input
                  type="checkbox"
                  checked={selectedNoteType === "electrical"}
                  onChange={() =>
                    setSelectedNoteType((prevType) =>
                      prevType === "electrical" ? null : "electrical"
                    )
                  }
                />
                Electrical
              </label>
              &nbsp;&nbsp;
              <label>
                <input
                  type="checkbox"
                  checked={selectedNoteType === "hse"}
                  onChange={() =>
                    setSelectedNoteType((prevType) =>
                      prevType === "hse" ? null : "hse"
                    )
                  }
                />
                HSE
              </label>
            </div>
            <button
              onClick={() => toggleOpenNewNote()}
              className="add-note-btn"
            >
              + Add Note
            </button>
          </div>


          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="no-notes-message">No notes found</div>
            ) : (
              filteredNotes.map((note, index) => (
                <div key={index} className="note-bar">
                  <div className="note-content">
                    <div className="note-title">{truncateTitle(note.title)}</div>
                    <div className="note-description">
                      {truncateDescription(note.observation)}
                    </div>
                  </div>
                  <MoreVert
                    className="ellipsis"
                    onClick={() => handleEllipsisClick(note)}
                  />
                  {selectedNote === note && (
                    <div className="options">
                      <div
                        className="option"
                        onClick={() => handleViewClick(note)}
                      >
                        View
                      </div>
                      <div
                        className="option"
                        onClick={() => handleEditClick(note)}
                      >
                        Edit
                      </div>
                      <div
                        className="option"
                        onClick={() => handleDeleteClick(note)}
                      >
                        Delete
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <NewNote
        open={openAddNote}
        onClose={toggleOpenNewNote}
        allData={allData}
        getAllNotes={getAllNotes}
        hseAllData={hseAllData}
      />
      <ViewNote
        open={openViewNote}
        onClose={toggleOpenViewNote}
        selectedNoteData={selectedNoteData}
        mode={mode}
        allData={allData}
        getAllNotes={getAllNotes}
        hseAllData={hseAllData}
      />
    </>
  );
};

export default NotesListScreen;
