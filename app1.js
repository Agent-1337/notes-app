const storageKey = "clean-notes";

const noteForm = document.getElementById("noteForm");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const notesList = document.getElementById("notesList");
const searchInput = document.getElementById("searchInput");
const clearAllButton = document.getElementById("clearAll");
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editBody = document.getElementById("editBody");
const closeEdit = document.getElementById("closeEdit");
const noteTemplate = document.getElementById("noteTemplate");

let notes = loadNotes();
let editingId = null;

function loadNotes() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(storageKey, JSON.stringify(notes));
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function renderNotes(filter = "") {
  notesList.innerHTML = "";
  const query = filter.trim().toLowerCase();

  const filteredNotes = notes.filter((note) => {
    const haystack = `${note.title} ${note.body}`.toLowerCase();
    return haystack.includes(query);
  });

  if (filteredNotes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "note";
    empty.innerHTML =
      "<p class=\"note-body\">Les notes crées seront affichées ici.</p>";
    notesList.appendChild(empty);
    return;
  }

  filteredNotes
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((note) => {
      const card = noteTemplate.content.cloneNode(true);
      const article = card.querySelector(".note");
      const title = card.querySelector(".note-title");
      const date = card.querySelector(".note-date");
      const body = card.querySelector(".note-body");

      title.textContent = note.title || "Sans titre";
      date.textContent = formatDate(note.updatedAt);
      body.textContent = note.body;

      article.dataset.id = note.id;
      notesList.appendChild(card);
    });
}

function addNote({ title, body }) {
  const now = Date.now();
  notes.unshift({
    id: crypto.randomUUID(),
    title: title.trim(),
    body: body.trim(),
    createdAt: now,
    updatedAt: now,
  });
  saveNotes();
  renderNotes(searchInput.value);
}

function updateNote(id, data) {
  notes = notes.map((note) =>
    note.id === id
      ? {
          ...note,
          title: data.title.trim(),
          body: data.body.trim(),
          updatedAt: Date.now(),
        }
      : note
  );
  saveNotes();
  renderNotes(searchInput.value);
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  renderNotes(searchInput.value);
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!noteBody.value.trim()) return;
  addNote({ title: noteTitle.value, body: noteBody.value });
  noteForm.reset();
  noteTitle.focus();
});

noteBody.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    noteForm.requestSubmit();
  }
});

searchInput.addEventListener("input", (event) => {
  renderNotes(event.target.value);
});

notesList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  const card = button.closest(".note");
  if (!card) return;
  const id = card.dataset.id;
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  if (action === "delete") {
    deleteNote(id);
    return;
  }

  if (action === "edit") {
    editingId = id;
    editTitle.value = note.title;
    editBody.value = note.body;
    editDialog.showModal();
  }
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!editingId) return;
  updateNote(editingId, {
    title: editTitle.value,
    body: editBody.value,
  });
  editingId = null;
  editDialog.close();
});

closeEdit.addEventListener("click", () => {
  editingId = null;
  editDialog.close();
});

clearAllButton.addEventListener("click", () => {
  if (!notes.length) return;
  const confirmed = window.confirm("Supprimer toutes les notes ?");
  if (!confirmed) return;
  notes = [];
  saveNotes();
  renderNotes(searchInput.value);
});

window.addEventListener("load", () => {
  renderNotes();
});
