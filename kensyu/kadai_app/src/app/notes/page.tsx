import { supabase } from '../../lib/supabaseClient';

export default async function Notes() {
  if (!supabase) {
    return (
      <main className="container">
        <div className="card">
          <h1>Supabase notes</h1>
          <div style={{ color: '#ffb3c0' }}>Supabase is not configured.</div>
        </div>
      </main>
    );
  }

  const { data: notes, error } = await supabase.from('notes').select('id, title');

  if (error) {
    return (
      <main className="container">
        <div className="card">
          <h1>Supabase notes</h1>
          <div style={{ color: '#ffb3c0' }}>エラー: {error.message}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Supabase notes</h1>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(notes ?? [], null, 2)}
        </pre>
      </div>
    </main>
  );
}

