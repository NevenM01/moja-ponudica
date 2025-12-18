import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, TrendingUp, Plus, Trash2, Pencil, StickyNote, Check, X, Palette, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Note {
  id: string;
  text: string;
  color: string;
  createdAt: string;
}

interface MonthlyData {
  month: string;
  count: number;
}

const COLORS = [
  { class: 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/30 border-amber-200/50 dark:border-amber-700/50 shadow-amber-100/50 dark:shadow-amber-900/20', preview: 'bg-amber-200 dark:bg-amber-700' },
  { class: 'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-900/30 border-sky-200/50 dark:border-sky-700/50 shadow-sky-100/50 dark:shadow-sky-900/20', preview: 'bg-sky-200 dark:bg-sky-700' },
  { class: 'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/30 border-emerald-200/50 dark:border-emerald-700/50 shadow-emerald-100/50 dark:shadow-emerald-900/20', preview: 'bg-emerald-200 dark:bg-emerald-700' },
  { class: 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/30 border-rose-200/50 dark:border-rose-700/50 shadow-rose-100/50 dark:shadow-rose-900/20', preview: 'bg-rose-200 dark:bg-rose-700' },
  { class: 'bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/30 border-violet-200/50 dark:border-violet-700/50 shadow-violet-100/50 dark:shadow-violet-900/20', preview: 'bg-violet-200 dark:bg-violet-700' },
  { class: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-700/50 shadow-orange-100/50 dark:shadow-orange-900/20', preview: 'bg-orange-200 dark:bg-orange-700' },
];

const MONTH_NAMES = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];

const Dashboard = () => {
  const { user } = useAuth();
  const [offerCount, setOfferCount] = useState<number | null>(null);
  const [acceptedCount, setAcceptedCount] = useState<number | null>(null);
  const [rejectedCount, setRejectedCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchMonthlyData();
      loadNotes();
    }
  }, [user]);

  const fetchStats = async () => {
    const [totalResult, acceptedResult, rejectedResult, pendingResult] = await Promise.all([
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).eq('status', 'accepted'),
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).eq('status', 'rejected'),
      supabase.from('offers').select('*', { count: 'exact', head: true }).eq('user_id', user?.id).or('status.eq.pending,status.is.null'),
    ]);

    if (!totalResult.error) setOfferCount(totalResult.count || 0);
    if (!acceptedResult.error) setAcceptedCount(acceptedResult.count || 0);
    if (!rejectedResult.error) setRejectedCount(rejectedResult.count || 0);
    if (!pendingResult.error) setPendingCount(pendingResult.count || 0);
    
    setLoading(false);
  };

  const fetchMonthlyData = async () => {
    const { data: offers } = await supabase
      .from('offers')
      .select('created_at')
      .eq('user_id', user?.id);

    if (!offers) return;

    // Get last 12 months
    const now = new Date();
    const months: MonthlyData[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const count = offers.filter(o => {
        const offerDate = new Date(o.created_at);
        return offerDate.getFullYear() === date.getFullYear() && offerDate.getMonth() === date.getMonth();
      }).length;
      
      months.push({
        month: MONTH_NAMES[date.getMonth()],
        count
      });
    }

    setMonthlyData(months);
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
    const blueColor = COLORS[1]; // Always use blue color
    const note: Note = {
      id: crypto.randomUUID(),
      text: newNote,
      color: blueColor.class,
      createdAt: new Date().toISOString(),
    };
    saveNotes([...notes, note]);
    setNewNote('');
  };

  const changeNoteColor = (noteId: string, newColor: string) => {
    const updatedNotes = notes.map(n => 
      n.id === noteId ? { ...n, color: newColor } : n
    );
    saveNotes(updatedNotes);
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prihvaćene
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {loading ? '...' : acceptedCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Prihvaćenih ponuda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Odbijene
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {loading ? '...' : rejectedCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Odbijenih ponuda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Na čekanju
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {loading ? '...' : pendingCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ponuda na čekanju
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ponude po mjesecima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ponude" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-2 hover:bg-background/60 rounded-lg backdrop-blur-sm transition-colors">
                                <Palette className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2" align="end">
                              <div className="flex gap-1.5">
                                {COLORS.map((color, index) => (
                                  <button
                                    key={index}
                                    onClick={() => changeNoteColor(note.id, color.class)}
                                    className={`w-6 h-6 rounded-full ${color.preview} hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-foreground/20`}
                                  />
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
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
                        {note.createdAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(note.createdAt).toLocaleDateString('hr-HR')}
                          </p>
                        )}
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