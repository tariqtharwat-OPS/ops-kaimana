import React, { useState } from 'react';
import { Plus, Edit2, X, User as UserIcon, Loader2, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { masterDataService } from '../services/masterDataService';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseConfig, db } from '../firebase/config';

export const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: users } = useMasterData('users', true);
  const { data: buyers } = useMasterData('buyers', true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  React.useEffect(() => {
    if (!showModal) {
      setFormData({});
      setIsEdit(false);
      setSaveError('');
    }
  }, [showModal]);

  const handleSave = async () => {
    setSaveError('');
    if (!formData.fullName || !formData.email || !formData.role) {
      setSaveError(t('Harap lengkapi nama, email, dan role', 'Please fill name, email, and role'));
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        // Update Firestore profile
        const { password, ...profileData } = formData;
        await masterDataService.update('users', formData.id, profileData);
      } else {
        // Create Auth + Firestore
        if (!formData.password || formData.password.length < 6) {
          setSaveError(t('Password minimal 6 karakter', 'Password must be at least 6 characters'));
          setSaving(false);
          return;
        }

        // Secondary app trick to create user without logout
        const tempAppName = 'temp-create-' + Date.now();
        const tempApp = initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);
        
        try {
          const cred = await createUserWithEmailAndPassword(tempAuth, formData.email, formData.password);
          await setDoc(doc(db, 'users', cred.user.uid), {
            fullName: formData.fullName,
            position: formData.position || '',
            email: formData.email,
            role: formData.role,
            languagePreference: formData.languagePreference || 'id',
            isActive: true,
            active_status: true,
            linkedBuyerId: formData.linkedBuyerId || null,
            created_at: new Date().toISOString(),
          });
        } finally {
          await deleteApp(tempApp);
        }
      }
      setShowModal(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field: string, value: any) => setFormData((p: any) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <Header 
        title={t('Pengguna Sistem', 'System Users')} 
        subtitle={t('Kelola akses pengguna dan peran', 'Manage user access and roles')}
        action={
          <Button onClick={() => { setIsEdit(false); setFormData({ isActive: true }); setShowModal(true); }}>
            <Plus size={20} /> {t('Tambah Pengguna', 'Add New User')}
          </Button>
        }
      />

      <Card noPadding>
        <Table 
          data={users}
          columns={[
            { header: t('NAMA LENGKAP', 'FULL NAME'), accessor: 'fullName', className: 'font-black text-slate-900' },
            { header: t('POSISI', 'POSITION'), accessor: 'position', className: 'font-bold text-slate-600' },
            { header: 'EMAIL', accessor: 'email', className: 'text-slate-500' },
            { header: t('ROLE', 'ROLE'), accessor: (u: any) => (
              <Badge variant={u.role === 'Admin' ? 'posted' : 'draft'}>{u.role}</Badge>
            )},
            { header: t('STATUS', 'STATUS'), accessor: (u: any) => (
              <Badge variant={u.isActive !== false ? 'posted' : 'draft'}>
                {u.isActive !== false ? t('Aktif', 'Active') : t('Nonaktif', 'Inactive')}
              </Badge>
            )},
            { header: '', accessor: (u: any) => (
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => masterDataService.update('users', u.id, { isActive: !(u.isActive !== false), active_status: !(u.isActive !== false) })}
                  className={`p-2 transition-colors ${u.isActive !== false ? 'text-slate-300 hover:text-red-500' : 'text-slate-300 hover:text-emerald-500'}`}
                >
                  <X size={16} />
                </button>
                <button onClick={() => { setFormData(u); setIsEdit(true); setShowModal(true); }} className="p-2 text-slate-300 hover:text-ocean-800"><Edit2 size={16} /></button>
              </div>
            ), className: 'text-right' }
          ]}
        />
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">{isEdit ? t('Edit Pengguna', 'Edit User') : t('Tambah Pengguna', 'Add New User')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA LENGKAP', 'FULL NAME')}</label>
                <input type="text" value={formData.fullName || ''} onChange={e => updateForm('fullName', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('POSISI', 'POSITION')}</label>
                  <input type="text" value={formData.position || ''} onChange={e => updateForm('position', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EMAIL</label>
                  <input type="email" disabled={isEdit} value={formData.email || ''} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold disabled:opacity-50" />
                </div>
              </div>
              
              {!isEdit && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PASSWORD</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="password" placeholder="Min. 6 characters" value={formData.password || ''} onChange={e => updateForm('password', e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ROLE</label>
                  <select value={formData.role || ''} onChange={e => updateForm('role', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold">
                    <option value="">--</option>
                    <option value="Admin">Admin</option>
                    <option value="Operator">Operator</option>
                    <option value="Buyer">Buyer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('BAHASA', 'LANGUAGE')}</label>
                  <select value={formData.languagePreference || 'id'} onChange={e => updateForm('languagePreference', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold">
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {formData.role === 'Buyer' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('LINK PEMBELI', 'LINKED BUYER')}</label>
                  <select value={formData.linkedBuyerId || ''} onChange={e => updateForm('linkedBuyerId', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold">
                    <option value="">-- Select Buyer --</option>
                    {buyers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}

              {saveError && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">{saveError}</p>}
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>{t('Batal', 'Cancel')}</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Simpan', 'Save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
