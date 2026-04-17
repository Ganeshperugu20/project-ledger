'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const CATEGORIES = ['Tea', 'Food', 'Metro', 'Travel', 'Recharges', 'Groceries', 'Rent', 'Investment', 'Salary'];

export default function LedgerApp() {
  const [data, setData] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    const { data: logs, error } = await supabase
      .from('ledger')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('QA Error Log:', error.message);
    setData(logs || []);
    setLoading(false);
  }

  useEffect(() => { fetchLogs(); }, []);

  const handleSave = async () => {
    if (!amount || !category) return;
    
    // Logic: Salary/Income is always 'income'
    const finalType = (category === 'Salary') ? 'income' : type;

    const { error } = await supabase
      .from('ledger')
      .insert([{ 
        amount: parseFloat(amount), 
        category, 
        type: finalType 
      }]);

    if (!error) {
      setAmount('');
      setCategory('');
      fetchLogs();
    } else {
      alert("Push failed. Check console for details.");
    }
  };

  const totals = data.reduce((acc, curr) => {
    const val = Number(curr.amount);
    curr.type === 'income' ? acc.income += val : acc.expense += val;
    return acc;
  }, { income: 0, expense: 0 });

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-300 p-6">
      <div className="max-w-md mx-auto">
        {/* HEADER SECTION */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              Project <span className="text-amber-500">Ledger</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-600 uppercase">Available Balance</p>
            <p className={`text-xl font-black ${ (totals.income - totals.expense) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
              ₹{(totals.income - totals.expense).toLocaleString()}
            </p>
          </div>
        </header>

        {/* INPUT SECTION */}
        <section className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl mb-8">
          <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
            <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${type === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}>Expense</button>
            <button onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase ${type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Income</button>
          </div>

          <input 
            type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="₹ 0.00" className="w-full bg-transparent text-5xl font-black text-center text-white outline-none mb-8"
          />

          <div className="grid grid-cols-3 gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} 
                className={`py-3 rounded-xl text-[9px] font-bold uppercase border transition-all ${category === cat ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-slate-800/50 text-slate-600'}`}>
                {cat}
              </button>
            ))}
          </div>

          <button onClick={handleSave} disabled={!amount || !category}
            className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-20 active:scale-95 transition-all shadow-xl shadow-amber-900/20">
            Commit Transaction
          </button>
        </section>

        {/* HISTORICAL LOGS */}
        <div className="space-y-3 pb-10">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 mb-4">Activity Log</h3>
          {loading ? <div className="text-center text-[10px] animate-pulse">Syncing Database...</div> :
            data.map(item => (
              <div key={item.id} className="bg-slate-900/20 p-4 rounded-2xl border border-slate-800/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-5 rounded-full ${item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-300">{item.category}</p>
                    <p className="text-[9px] text-slate-600 italic">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-black ${item.type === 'income' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {item.type === 'income' ? '+' : '-'}₹{item.amount}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </main>
  );
}