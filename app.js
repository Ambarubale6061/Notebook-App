// Notebook app with simple auth using localStorage and password hashing (Web Crypto).
// Not for production use — client-side only authentication.

const $ = sel => document.querySelector(sel);
const qs = sel => document.querySelectorAll(sel);

const authDiv = $('#auth');
const appDiv = $('#app');

const loginForm = $('#login-form');
const signupForm = $('#signup-form');
const toSignup = $('#to-signup');
const toLogin = $('#to-login');
const authMsg = $('#auth-msg');

const loginBtn = $('#login-btn');
const signupBtn = $('#signup-btn');

const logoutBtn = $('#logout-btn');

const usernameInputLogin = $('#login-username');
const passwordInputLogin = $('#login-password');
const usernameInputSignup = $('#signup-username');
const passwordInputSignup = $('#signup-password');

const noteTitle = $('#note-title');
const noteContent = $('#note-content');
const saveNoteBtn = $('#save-note');
const clearNoteBtn = $('#clear-note');
const notesContainer = $('#notes-container');
const noteTemplate = document.getElementById('note-template');

const searchInput = $('#search');
const sortSelect = $('#sort');

let currentUser = null;
let editingId = null;

// Utility: SHA-256 hash for passwords (Web Crypto)
async function sha256(str){
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(hashBuffer));
  return arr.map(b => b.toString(16).padStart(2,'0')).join('');
}

function saveUsers(users){
  localStorage.setItem('notebook_users', JSON.stringify(users));
}
function loadUsers(){
  const raw = localStorage.getItem('notebook_users');
  return raw ? JSON.parse(raw) : {};
}

function saveNotesForUser(username, notes){
  localStorage.setItem('notes_' + username, JSON.stringify(notes));
}
function loadNotesForUser(username){
  const raw = localStorage.getItem('notes_' + username);
  return raw ? JSON.parse(raw) : [];
}

function showAuth(){
  authDiv.classList.remove('hidden');
  appDiv.classList.add('hidden');
}
function showApp(){
  authDiv.classList.add('hidden');
  appDiv.classList.remove('hidden');
}

toSignup.addEventListener('click', (e)=>{
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  authMsg.textContent = '';
});
toLogin.addEventListener('click', (e)=>{
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  authMsg.textContent = '';
});

signupBtn.addEventListener('click', async ()=>{
  const u = usernameInputSignup.value.trim();
  const p = passwordInputSignup.value;
  if(!u || !p){ authMsg.textContent = 'Enter username and password'; return; }
  const users = loadUsers();
  if(users[u]){ authMsg.textContent = 'Username taken'; return; }
  const hashed = await sha256(p);
  users[u] = { password: hashed, created: Date.now() };
  saveUsers(users);
  authMsg.textContent = 'Account created. Please login.';
  usernameInputSignup.value = '';
  passwordInputSignup.value = '';
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

loginBtn.addEventListener('click', async ()=>{
  const u = usernameInputLogin.value.trim();
  const p = passwordInputLogin.value;
  if(!u || !p){ authMsg.textContent = 'Enter username and password'; return; }
  const users = loadUsers();
  if(!users[u]){ authMsg.textContent = 'No such user'; return; }
  const hashed = await sha256(p);
  if(hashed !== users[u].password){ authMsg.textContent = 'Invalid password'; return; }
  // success
  currentUser = u;
  usernameInputLogin.value = '';
  passwordInputLogin.value = '';
  authMsg.textContent = '';
  renderNotes();
  showApp();
});

logoutBtn.addEventListener('click', ()=>{
  currentUser = null;
  editingId = null;
  showAuth();
});

// Notes CRUD
function renderNotes(){
  if(!currentUser) return;
  const notes = loadNotesForUser(currentUser);
  const q = searchInput.value.trim().toLowerCase();
  const sorted = notes.slice().sort((a,b)=>{
    if(sortSelect.value === 'new') return b.updatedAt - a.updatedAt;
    return a.updatedAt - b.updatedAt;
  }).filter(n => {
    if(!q) return true;
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  notesContainer.innerHTML = '';
  if(sorted.length === 0){
    notesContainer.innerHTML = '<p class="small">No notes yet — create your first note.</p>';
    return;
  }
  sorted.forEach(note => {
    const el = noteTemplate.content.cloneNode(true);
    const $note = el.querySelector('.note');
    $note.querySelector('.note-title').textContent = note.title || '(no title)';
    $note.querySelector('.note-body').textContent = note.content || '';
    $note.querySelector('.note-time').textContent = new Date(note.updatedAt).toLocaleString();
    $note.querySelector('.edit').addEventListener('click', () => {
      editingId = note.id;
      noteTitle.value = note.title;
      noteContent.value = note.content;
      window.scrollTo({top:0,behavior:'smooth'});
    });
    $note.querySelector('.delete').addEventListener('click', () => {
      if(!confirm('Delete this note?')) return;
      deleteNote(note.id);
    });
    notesContainer.appendChild(el);
  });
}

function generateId(){
  return 'n_' + Math.random().toString(36).slice(2,9);
}

function saveNote(){
  if(!currentUser) return alert('Not logged in');
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  if(!title && !content){ alert('Enter title or content'); return; }
  const notes = loadNotesForUser(currentUser);
  if(editingId){
    const idx = notes.findIndex(n => n.id === editingId);
    if(idx !== -1){
      notes[idx].title = title;
      notes[idx].content = content;
      notes[idx].updatedAt = Date.now();
    }
    editingId = null;
  }else{
    notes.push({ id: generateId(), title, content, createdAt: Date.now(), updatedAt: Date.now() });
  }
  saveNotesForUser(currentUser, notes);
  noteTitle.value = '';
  noteContent.value = '';
  renderNotes();
}

function deleteNote(id){
  const notes = loadNotesForUser(currentUser).filter(n => n.id !== id);
  saveNotesForUser(currentUser, notes);
  if(editingId === id) { editingId = null; noteTitle.value=''; noteContent.value=''; }
  renderNotes();
}

saveNoteBtn.addEventListener('click', saveNote);
clearNoteBtn.addEventListener('click', ()=>{
  editingId = null;
  noteTitle.value = '';
  noteContent.value = '';
});

searchInput.addEventListener('input', renderNotes);
sortSelect.addEventListener('change', renderNotes);

// On load: show auth or app depending on session (no persistent session to keep it simple)
showAuth();
