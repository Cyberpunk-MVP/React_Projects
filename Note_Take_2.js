import React, { useState, useEffect } from 'react';

// Define predefined categories and their associated Tailwind background colors for studying
const STUDY_CATEGORIES = [
  { name: 'General', color: 'bg-gray-200' },
  { name: 'Lecture Notes', color: 'bg-blue-200' },
  { name: 'Textbook Summaries', color: 'bg-green-200' },
  { name: 'Revision Points', color: 'bg-yellow-200' },
  { name: 'Problem Solving', color: 'bg-purple-200' },
  { name: 'Important Concepts', color: 'bg-red-200' },
  { name: 'Research', color: 'bg-indigo-200' },
  { name: 'Brainstorming', color: 'bg-pink-200' },
];

// Main App component
function App() {
  // State to hold the list of notes
  // Initialize from local storage or with an empty array if no notes are found
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('react-notes-app');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // State to hold the current note input for adding new notes
  const [newNote, setNewNote] = useState('');
  // State to hold the currently selected category for a new note
  const [selectedCategory, setSelectedCategory] = useState(STUDY_CATEGORIES[0].name);

  // State to track which note is being edited and its current edited text
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNoteText, setEditedNoteText] = useState('');
  // State to track the category of the note being edited
  const [editedNoteCategory, setEditedNoteCategory] = useState('');


  // useEffect hook to save notes to local storage whenever the 'notes' state changes
  useEffect(() => {
    localStorage.setItem('react-notes-app', JSON.stringify(notes));
  }, [notes]);

  // Function to handle adding a new note
  const handleAddNote = () => {
    if (newNote.trim() !== '') { // Ensure the note is not empty
      const categoryObj = STUDY_CATEGORIES.find(cat => cat.name === selectedCategory);
      const note = {
        id: Date.now(), // Unique ID for the note
        text: newNote.trim(),
        date: new Date().toLocaleDateString(), // Current date
        category: selectedCategory, // Assign selected category
        color: categoryObj ? categoryObj.color : 'bg-gray-200', // Assign category color
      };
      setNotes([...notes, note]); // Add the new note to the notes array
      setNewNote(''); // Clear the input field
      setSelectedCategory(STUDY_CATEGORIES[0].name); // Reset category to default
    }
  };

  // Function to handle deleting a note
  const handleDeleteNote = (id) => {
    // Filter out the note with the given ID
    setNotes(notes.filter(note => note.id !== id));
  };

  // Function to activate edit mode for a specific note
  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
    setEditedNoteText(note.text);
    setEditedNoteCategory(note.category); // Set current category for editing
  };

  // Function to save the edited note text
  const handleSaveEdit = (id) => {
    if (editedNoteText.trim() !== '') { // Ensure edited text is not empty
      const categoryObj = STUDY_CATEGORIES.find(cat => cat.name === editedNoteCategory);
      setNotes(notes.map(note =>
        note.id === id ? {
          ...note,
          text: editedNoteText.trim(),
          category: editedNoteCategory,
          color: categoryObj ? categoryObj.color : 'bg-gray-200'
        } : note
      ));
      setEditingNoteId(null); // Exit edit mode
      setEditedNoteText(''); // Clear edited text state
      setEditedNoteCategory(''); // Clear edited category state
    } else {
      // Optionally, you could prevent saving an empty note or show a warning
      console.error("Note cannot be empty!"); // Using console.error instead of alert
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNoteText('');
    setEditedNoteCategory('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6">
          My Study Notes
        </h1>

        {/* Heading for Note-Taking Part */}
        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b-2 border-blue-300 pb-2">
          New Note
        </h2>

        {/* Category selection for new notes */}
        <div className="mb-4">
          <label htmlFor="note-category" className="block text-gray-700 text-sm font-semibold mb-2">
            Category:
          </label>
          <select
            id="note-category"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {STUDY_CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Note input and add button section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            placeholder="Write a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddNote();
              }
            }}
          />
          <button
            onClick={handleAddNote}
            className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Add Note
          </button>
        </div>

        {/* Heading for All Notes */}
        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b-2 border-blue-300 pb-2">
          All Notes
        </h2>

        {notes.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-8">No notes yet. Start by adding one!</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                // Dynamically apply background color based on note.color
                className={`p-4 rounded-lg shadow-sm border border-gray-200 flex items-start justify-between break-words ${note.color}`}
              >
                <div className="flex-1 pr-4">
                  {editingNoteId === note.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-y"
                        value={editedNoteText}
                        onChange={(e) => setEditedNoteText(e.target.value)}
                        rows="3"
                      />
                      <label htmlFor="edit-note-category" className="block text-gray-700 text-sm font-semibold mb-1">
                        Category:
                      </label>
                      <select
                        id="edit-note-category"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                        value={editedNoteCategory}
                        onChange={(e) => setEditedNoteCategory(e.target.value)}
                      >
                        {STUDY_CATEGORIES.map((cat) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-400 text-white text-sm rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200 ease-in-out"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 text-base mb-1 leading-relaxed">{note.text}</p>
                      <span className="text-gray-600 text-xs font-semibold">{note.category}</span>
                      <span className="text-gray-500 text-xs ml-2">{note.date}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {editingNoteId !== note.id && (
                    <button
                      onClick={() => handleEditClick(note)}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-110"
                      aria-label="Edit note"
                    >
                      {/* Edit icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-110"
                    aria-label="Delete note"
                  >
                    {/* Simple SVG for a trash can icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
