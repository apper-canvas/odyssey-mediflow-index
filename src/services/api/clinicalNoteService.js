import clinicalNoteData from "../mockData/clinicalNotes.json";

let clinicalNotes = [...clinicalNoteData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const clinicalNoteService = {
  async getAll() {
    await delay(300);
    return [...clinicalNotes];
  },

  async getById(id) {
    await delay(200);
    return clinicalNotes.find(note => note.Id === id) || null;
  },

  async create(noteData) {
    await delay(400);
    const newNote = {
      ...noteData,
      Id: Math.max(...clinicalNotes.map(n => n.Id)) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    clinicalNotes.unshift(newNote);
    return newNote;
  },

  async update(id, noteData) {
    await delay(400);
    const index = clinicalNotes.findIndex(note => note.Id === id);
    if (index !== -1) {
      clinicalNotes[index] = { ...clinicalNotes[index], ...noteData };
      return clinicalNotes[index];
    }
    throw new Error("Clinical note not found");
  },

  async delete(id) {
    await delay(300);
    const index = clinicalNotes.findIndex(note => note.Id === id);
    if (index !== -1) {
      const deleted = clinicalNotes.splice(index, 1)[0];
      return deleted;
    }
    throw new Error("Clinical note not found");
  }
};