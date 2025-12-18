import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, TrendingUp, Plus, Trash2, Pencil, StickyNote, Check, X } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

interface Note {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/30 border-amber-200/50 dark:border-amber-700/50 shadow-amber-100/50 dark:shadow-amber-900/20',
  'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-900/30 border-sky-200/50 dark:border-sky-700/50 shadow-sky-100/50 dark:shadow-sky-900/20',
  'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 border-emerald-200/50 dark:border-emerald-700/50 shadow-emerald-100/50 dark:shadow-emerald-900/20',
  'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/30 border-rose-200/50 dark:border-rose-700/50 shadow-rose-100/50 dark:shadow-rose-900/20',
  'bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/30 border-violet-200/50 dark:border-violet-700/50 shadow-violet-100/50 dark:shadow-violet-900/20',
];

const Dashboard = () => {
  const { user } = useAuth();
  const [offerCount, setOfferCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (user) {
      fetchStats();
      loadNotes();
    }
  }, [user]);

  const fetchStats = async () => {
    const { count, error } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    if (!error) {
      setOfferCount(count || 0);
    }
    setLoading(false);
  };

  const loadNotes = () => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`notes_${user.id}`);
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  };

  const saveNotes = (newNotes: Note[]) => {
    if (!user?.id) return;
    localStorage.setItem(`notes_${user.id}`, JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      text: newNote,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    saveNotes([...notes, note]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) return;
    const updatedNotes = notes.map(n => 
      n.id === editingId ? { ...n, text: editText } : n
    );
    saveNotes(updatedNotes);
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Pregled vaše aktivnosti</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ukupno ponuda
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? '...' : offerCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Kreiranih ponuda
              </p>
            </CardContent>
          </Card>

          {/* Placeholder za buduće analitike */}
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ukupna vrijednost
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">—</div>
              <p className="text-xs text-muted-foreground mt-1">
                Uskoro dostupno
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Bilješke
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Dodaj novu bilješku..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <Button onClick={addNote} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nema bilješki. Dodajte prvu!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`${note.color} border rounded-xl p-4 relative group min-h-[100px] overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
                  >
                    {editingId === note.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          className="text-sm bg-background/80 backdrop-blur-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} className="h-8 px-3">
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            Spremi
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8 px-3 bg-background/50">
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Odustani
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                          <button
                            onClick={() => startEdit(note)}
                            className="p-2 hover:bg-background/60 rounded-lg backdrop-blur-sm transition-colors"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg backdrop-blur-sm transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                          </button>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed pr-12 break-words overflow-hidden font-medium">{note.text}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;