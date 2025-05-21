import React, { useState, useEffect } from 'react';

// Main App component
function App() {
  // State to hold the list of notes
  // Initialize from local storage or with an empty array if no notes are found
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('react-notes-app');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // State to hold the current note input
  const [newNote, setNewNote] = useState('');

  // useEffect hook to save notes to local storage whenever the 'notes' state changes
  useEffect(() => {
    localStorage.setItem('react-notes-app', JSON.stringify(notes));
  }, [notes]);

  // Function to handle adding a new note
  const handleAddNote = () => {
    if (newNote.trim() !== '') { // Ensure the note is not empty
      const note = {
        id: Date.now(), // Unique ID for the note
        text: newNote.trim(),
        date: new Date().toLocaleDateString(), // Current date
      };
      setNotes([...notes, note]); // Add the new note to the notes array
      setNewNote(''); // Clear the input field
    }
  };

  // Function to handle deleting a note
  const handleDeleteNote = (id) => {
    // Filter out the note with the given ID
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-6">
          My Notes
        </h1>

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

        {/* Notes list section */}
        {notes.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-8">No notes yet. Start by adding one!</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-start justify-between break-words"
              >
                <div className="flex-1 pr-4">
                  <p className="text-gray-800 text-base mb-1 leading-relaxed">{note.text}</p>
                  <span className="text-gray-500 text-xs">{note.date}</span>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-110 flex-shrink-0"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
