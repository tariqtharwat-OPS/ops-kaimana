import React, { useMemo, useState } from 'react';
import { Shield, Search, Clock, User, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { Card, Header, Badge } from '../components/ui/DesignSystem';

export const AuditLogPage: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const { data: logs } = useMasterData('auditLog', true);

  const sorted = useMemo(() =>
    [...logs]
      .sort((a: any, b: any) => {
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp || a.created_at || 0).getTime();
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp || b.created_at || 0).getTime();
        return tB - tA;
      })
      .filter((l: any) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          (l.docId || '').toLowerCase().includes(s) ||
          (l.action || '').toLowerCase().includes(s) ||
          (l.collection || '').toLowerCase().includes(s) ||
          (l.userId || '').toLowerCase().includes(s)
        );
      }),
  [logs, search]);

  const actionColor = (action: string) => {
    if (action === 'POST') return 'posted';
    if (action === 'VOID') return 'pending';
    if (action === 'CREATE') return 'draft';
    return 'draft';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <Header
        title={t('Log Audit', 'Audit Log')}
        subtitle={t('Rekam jejak semua aksi sistem', 'Full trail of all system actions')}
      />

      <Card noPadding>
        <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
          <Shield className="text-slate-300" size={20} />
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input
              type="text"
              placeholder={t('Cari doc ID, aksi, koleksi...', 'Search doc ID, action, collection...')}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-ocean-800/10 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs font-black text-slate-400">{sorted.length} {t('entri', 'entries')}</span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-20 text-center">
            <Clock className="mx-auto text-slate-200 mb-3" size={40} />
            <p className="text-slate-300 font-bold">{t('Belum ada log audit', 'No audit logs yet')}</p>
            <p className="text-slate-200 text-xs font-bold mt-1">{t('Log akan muncul saat admin melakukan aksi POST atau VOID', 'Logs appear when admins post or void documents')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sorted.slice(0, 100).map((log: any, i: number) => {
              const ts = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || log.created_at || 0);
              return (
                <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                  <Badge variant={actionColor(log.action)}>{log.action || 'ACTION'}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-black text-slate-900">#{(log.docId || '').substring(0, 16)}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{log.collection || '—'}</span>
                    </div>
                    {log.reason && <p className="text-xs font-bold text-slate-500 italic">"{log.reason}"</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><User size={9} /> {log.userId || 'System'}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><FileText size={9} /> {log.userEmail || ''}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-500">{ts.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[10px] font-bold text-slate-400">{ts.toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
