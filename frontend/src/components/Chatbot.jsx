import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import axios from 'axios';

import '../styles/Chatbot.css';

// Simple floating chatbot that understands basic intents:
// - "summarize <plant>" -> POST /api/notes/summary
// - "create note: <title> | <content> [| plant=<plantName>]"
// - "update note <id>: <title?> | <content?>"
// - "delete note <id>"
// - "go to <route>" or "open <route>" e.g. go to /notes, go to model tulasi
// Requires auth to save notes; if not logged in, prompts to login.

const API_BASE = '';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I can help with plants, notes, and navigation. Try: "summary tulasi", "add note: Title | Content", or "open notes".' }
  ]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState({ _id: 'default-user', name: 'Guest' });
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const [flow, setFlow] = useState({ type: 'idle', step: 0, data: {} });

  useEffect(() => {
    // auto-scroll on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    // If your app later stores a logged-in user in localStorage, pick it up
    try {
      const storedId = localStorage.getItem('userId');
      const storedName = localStorage.getItem('username');
      if (storedId || storedName) {
        setUser({ _id: storedId || 'default-user', name: storedName || 'User' });
      }
    } catch { /* ignore */ }
  }, []);

  const addMsg = (role, text) => setMessages(m => [...m, { role, text }]);

  // --- Helpers ---
  const normalizeRoute = (phrase) => {
    const p = phrase.toLowerCase().trim()
      .replace(/page$/,'')
      .replace(/\s+/g, ' ')
      .trim();
    const map = {
      home: '/',
      '/home': '/',
      browse: '/browse',
      '/browse': '/browse',
      notes: '/notes',
      '/notes': '/notes',
      bookmarks: '/bookmarks',
      '/bookmarks': '/bookmarks',
      quiz: '/quiz',
      '/quiz': '/quiz',
      settings: '/settings',
      '/settings': '/settings'
    };
    return map[p] || (p.startsWith('/') ? p : null);
  };

  const fetchUserNotes = async () => {
    const res = await axios.get(`${API_BASE}/notes`, { params: { userId: user?._id || 'default-user', limit: 100 } });
    return Array.isArray(res.data) ? res.data : [];
  };

  const findNotesByTitle = (notes, title) => {
    const t = (title || '').toLowerCase().trim();
    if (!t) return [];
    // exact title first
    let matches = notes.filter(n => (n.title || '').toLowerCase().trim() === t);
    if (matches.length) return matches;
    // contains title
    matches = notes.filter(n => (n.title || '').toLowerCase().includes(t));
    if (matches.length) return matches;
    // fallback: match by plantName
    matches = notes.filter(n => (n.plantName || '').toLowerCase().includes(t));
    return matches;
  };

  const resetFlow = () => setFlow({ type: 'idle', step: 0, data: {} });

  const handleFlowAnswer = async (raw) => {
    try {
      // CREATE FLOW: ask title -> content -> plant
      if (flow.type === 'create') {
        if (flow.step === 0) {
          const title = raw || 'Untitled';
          setFlow({ type: 'create', step: 1, data: { title } });
          return addMsg('assistant', 'Content?');
        }
        if (flow.step === 1) {
          const content = raw || '';
          setFlow({ type: 'create', step: 2, data: { ...flow.data, content } });
          return addMsg('assistant', 'Plant name? (or skip)');
        }
        if (flow.step === 2) {
          const plantName = raw && raw.toLowerCase() !== 'skip' ? raw : 'General';
          setBusy(true);
          const res = await axios.post(`${API_BASE}/notes`, {
            user: user?._id || 'default-user',
            plantName,
            title: flow.data.title,
            content: flow.data.content,
            category: 'general',
            tags: []
          });
          setBusy(false);
          resetFlow();
          return addMsg('assistant', `Note created: ${res.data?.title || flow.data.title}`);
        }
      }

      // UPDATE FLOW: ask note title -> ask fields -> apply
      if (flow.type === 'update') {
        if (flow.step === 0) {
          const title = raw;
          setBusy(true);
          const notes = await fetchUserNotes();
          setBusy(false);
          const matches = findNotesByTitle(notes, title);
          if (!matches.length) {
            resetFlow();
            return addMsg('assistant', 'No note found by that name.');
          }
          if (matches.length > 1) {
            const list = matches.slice(0, 5).map(n => `${n._id} - ${n.title}`).join('\n');
            setFlow({ type: 'update_pick', step: 0, data: { candidates: matches } });
            return addMsg('assistant', `Multiple notes found. Reply with the ID to update:\n${list}`);
          }
          setFlow({ type: 'update_fields', step: 0, data: { id: matches[0]._id } });
          return addMsg('assistant', 'New title? (or skip)');
        }
      }

      if (flow.type === 'update_pick') {
        const id = raw.trim();
        const found = (flow.data.candidates || []).find(n => n._id === id);
        if (!found) return addMsg('assistant', 'Please send a valid ID from the list.');
        setFlow({ type: 'update_fields', step: 0, data: { id } });
        return addMsg('assistant', 'New title? (or skip)');
      }

      if (flow.type === 'update_fields') {
        if (flow.step === 0) {
          const newTitle = raw.toLowerCase() === 'skip' ? '' : raw;
          setFlow({ type: 'update_fields', step: 1, data: { ...flow.data, newTitle } });
          return addMsg('assistant', 'New content? (or skip)');
        }
        if (flow.step === 1) {
          const newContent = raw.toLowerCase() === 'skip' ? '' : raw;
          const body = {};
          if (flow.data.newTitle) body.title = flow.data.newTitle;
          if (newContent) body.content = newContent;
          if (!Object.keys(body).length) {
            resetFlow();
            return addMsg('assistant', 'Nothing to update.');
          }
          setBusy(true);
          await axios.put(`${API_BASE}/notes/${flow.data.id}`, body);
          setBusy(false);
          resetFlow();
          return addMsg('assistant', 'Note updated.');
        }
      }

      // DELETE FLOW: ask title -> confirm -> delete
      if (flow.type === 'delete') {
        if (flow.step === 0) {
          const title = raw;
          setBusy(true);
          const notes = await fetchUserNotes();
          setBusy(false);
          const matches = findNotesByTitle(notes, title);
          if (!matches.length) {
            resetFlow();
            return addMsg('assistant', 'No note found by that name.');
          }
          if (matches.length > 1) {
            const list = matches.slice(0, 5).map(n => `${n._id} - ${n.title}`).join('\n');
            setFlow({ type: 'delete_pick', step: 0, data: { candidates: matches } });
            return addMsg('assistant', `Multiple notes found. Reply with the ID to delete:\n${list}`);
          }
          setFlow({ type: 'delete_confirm', step: 0, data: { id: matches[0]._id, title: matches[0].title } });
          return addMsg('assistant', `Delete "${matches[0].title}"? (yes/no)`);
        }
      }

      if (flow.type === 'delete_pick') {
        const id = raw.trim();
        const found = (flow.data.candidates || []).find(n => n._id === id);
        if (!found) return addMsg('assistant', 'Please send a valid ID from the list.');
        setFlow({ type: 'delete_confirm', step: 0, data: { id, title: found.title } });
        return addMsg('assistant', `Delete "${found.title}"? (yes/no)`);
      }

      if (flow.type === 'delete_confirm') {
        const ans = raw.toLowerCase();
        if (ans === 'yes' || ans === 'y') {
          setBusy(true);
          await axios.delete(`${API_BASE}/notes/${flow.data.id}`);
          setBusy(false);
          resetFlow();
          return addMsg('assistant', 'Note deleted.');
        } else {
          resetFlow();
          return addMsg('assistant', 'Cancelled.');
        }
      }
    } catch (e) {
      console.error(e);
      setBusy(false);
      resetFlow();
      const msg = e?.response?.data?.message || 'Sorry, that did not work. Please try again.';
      return addMsg('assistant', msg);
    }
  };

  const parseAndExecute = async (text) => {
    const raw = text.trim();
    if (!raw) return;
    addMsg('user', raw);

    // intents
    const lower = raw.toLowerCase();

    try {
      // If in a flow, allow cancel
      if (flow.type !== 'idle') {
        if (lower === 'cancel' || lower === 'stop') {
          resetFlow();
          return addMsg('assistant', 'Cancelled.');
        }
        return await handleFlowAnswer(raw);
      }

      // Simple help
      if (lower === 'help' || lower === '?') {
        return addMsg('assistant', 'Examples:\n- summary tulasi\n- add note: Title | Content | plant=Neem\n- update note <id>: New title | New content\n- delete note <id>\n- open notes | open /browse | model tulasi');
      }

      // List notes (quick debug aid)
      if (lower === 'list notes' || lower === 'show notes') {
        setBusy(true);
        const notes = await fetchUserNotes();
        setBusy(false);
        if (!notes.length) return addMsg('assistant', 'No notes yet.');
        const list = notes.slice(0, 10).map(n => `${n._id} - ${n.title} [${n.plantName || 'General'}]`).join('\n');
        return addMsg('assistant', list + (notes.length > 10 ? `\n...and ${notes.length - 10} more` : ''));
      }

      // Navigation: go to/open
      if (lower.startsWith('go to ') || lower.startsWith('open ') || lower.startsWith('navigate to ') || lower.startsWith('take me to ')) {
        const destRaw = raw.replace(/^(go to|open|navigate to|take me to)\s+/i, '').trim();
        const route = normalizeRoute(destRaw.replace(/\s*page$/i, ''));
        if (route) {
          navigate(route);
          return addMsg('assistant', `Going to ${route}`);
        }
        // model navigation by name
        const modelMatch = destRaw.match(/model\s+(.*)$/i);
        if (modelMatch) {
          const name = (modelMatch[1] || '').replace(/\s+/g, '').toLowerCase();
          navigate(`/model/${name}`);
          return addMsg('assistant', `Opening model page for ${modelMatch[1]}`);
        }
        return addMsg('assistant', 'Unknown destination. Try "/notes" or "model tulasi".');
      }

      // Summarize plant (accept "summary", "summarize")
      if (lower.startsWith('summarize ') || lower.startsWith('summary ')) {
        const plantName = raw.replace(/^summar(y|ize)\s+/i, '').trim();
        setBusy(true);
        const res = await axios.post(`${API_BASE}/notes/summary`, {
          user: user?._id || 'default-user',
          plantName,
          category: 'general',
        });
        setBusy(false);
        return addMsg('assistant', `Saved summary note: ${res.data?.title || 'Summary created'}`);
      }

      // Create note flow
      if (lower === 'create note' || lower === 'add note') {
        setFlow({ type: 'create', step: 0, data: {} });
        return addMsg('assistant', 'Title?');
      }
      // Also support one-line create for power users
      if (lower.startsWith('create note') || lower.startsWith('add note')) {
        const payload = raw.split(':')[1] || '';
        const parts = payload.split('|').map(s => s.trim()).filter(Boolean);
        const title = parts[0] || 'Untitled';
        const content = parts[1] || '';
        const plantPart = parts.find(p => p.toLowerCase().startsWith('plant='));
        const plantName = plantPart ? plantPart.split('=')[1] : 'General';
        setBusy(true);
        const res = await axios.post(`${API_BASE}/notes`, {
          user: user?._id || 'default-user',
          plantName,
          title,
          content,
          category: 'general',
          tags: [],
        });
        setBusy(false);
        return addMsg('assistant', `Created note: ${res.data?.title}`);
      }

      // Update note by conversation
      if (lower === 'update note') {
        setFlow({ type: 'update', step: 0, data: {} });
        return addMsg('assistant', 'Note title to update?');
      }
      // Power users: update by id inline
      if (lower.startsWith('update note')) {
        const idMatch = raw.match(/^update note\s+(\w+):/i);
        if (!idMatch) return addMsg('assistant', 'Usage: update note <id>: <title?> | <content?>');
        const id = idMatch[1];
        const payload = raw.split(':')[1] || '';
        const parts = payload.split('|').map(s => s.trim());
        const body = {};
        if (parts[0]) body.title = parts[0];
        if (parts[1]) body.content = parts[1];
        setBusy(true);
        await axios.put(`${API_BASE}/notes/${id}`, body);
        setBusy(false);
        return addMsg('assistant', `Updated note ${id}.`);
      }

      // Delete note by conversation
      if (lower === 'delete note') {
        setFlow({ type: 'delete', step: 0, data: {} });
        return addMsg('assistant', 'Note title to delete?');
      }
      // Power users: delete by id inline
      if (lower.startsWith('delete note')) {
        const idMatch = raw.match(/^delete note\s+(\w+)/i);
        if (!idMatch) return addMsg('assistant', 'Usage: delete note <id>');
        const id = idMatch[1];
        setBusy(true);
        await axios.delete(`${API_BASE}/notes/${id}`);
        setBusy(false);
        return addMsg('assistant', `Deleted note ${id}.`);
      }

      return addMsg('assistant', 'Not sure yet. Type "help" for examples.');
    } catch (err) {
      console.error(err);
      setBusy(false);
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      addMsg('assistant', msg);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    parseAndExecute(input);
    setInput('');
  };

  return (
    <>
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}>
        {open && (
          <div style={{ width: 320, height: 420, background: '#fff', borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#28a745', color: '#fff', padding: '10px 12px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Garden Assistant</span>
              <span style={{ fontSize: 12, opacity: 0.9 }}>{busy ? 'Working…' : (user?._id === 'default-user' ? 'Guest' : 'Signed in')}</span>
            </div>
            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid #eee', flexWrap: 'wrap' }}>
              <button disabled={busy} onClick={() => parseAndExecute('summary tulasi')} style={{ padding: '6px 10px', borderRadius: 16, border: '1px solid #cfe8d3', background: '#eaf7ed', cursor: 'pointer' }}>Summary Tulasi</button>
              <button disabled={busy} onClick={() => parseAndExecute('open /notes')} style={{ padding: '6px 10px', borderRadius: 16, border: '1px solid #cfe8d3', background: '#eaf7ed', cursor: 'pointer' }}>Open Notes</button>
              <button disabled={busy} onClick={() => parseAndExecute('model tulasi')} style={{ padding: '6px 10px', borderRadius: 16, border: '1px solid #cfe8d3', background: '#eaf7ed', cursor: 'pointer' }}>Model Tulasi</button>
              <button disabled={busy} onClick={() => parseAndExecute('add note: My Note | This is a note | plant=Neem')} style={{ padding: '6px 10px', borderRadius: 16, border: '1px solid #cfe8d3', background: '#eaf7ed', cursor: 'pointer' }}>Add Sample Note</button>
            </div>
            <div ref={listRef} style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 8, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  <div style={{ display: 'inline-block', padding: '8px 10px', borderRadius: 8, background: m.role === 'user' ? '#e6f4ea' : '#f7f7f7', color: '#333', maxWidth: '85%' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={onSubmit} style={{ display: 'flex', padding: 10, borderTop: '1px solid #eee' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={'Type here (try "help")'}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
              />
              <button type="submit" disabled={!input.trim() || busy} style={{ marginLeft: 8, background: '#28a745', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', opacity: (!input.trim() || busy) ? 0.7 : 1 }}>Send</button>
            </form>
          </div>
        )}
        <button onClick={() => setOpen(o => !o)} style={{ background: '#28a745', color: '#fff', border: 'none', borderRadius: '999px', width: 56, height: 56, boxShadow: '0 4px 14px rgba(0,0,0,0.18)', cursor: 'pointer' }}>
          {open ? '×' : '💬'}
        </button>
      </div>
    </>
  );
}
