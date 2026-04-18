import React, { useState } from 'react';
import { Plus, Edit2, X, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { masterDataService } from '../services/masterDataService';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

export const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const { data: users } = useMasterData('users', true);
  const { data: buyers } = useMasterData('buyers', true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEdit, setIsEdit] = useState(false);

  const handleSeed = async () => {
    try {
      const usersToSeed = [
        { fullName: 'Admin Test', position: 'System Admin', email: 'admin@test.com', role: 'Admin', languagePreference: 'id', isActive: true, active_status: true },
        { fullName: 'Operator Test', position: 'Receiving Operator', email: 'operator@test.com', role: 'Operator', languagePreference: 'id', isActive: true, active_status: true },
        { fullName: 'Buyer Test', position: 'External Buyer', email: 'buyer@test.com', role: 'Buyer', languagePreference: 'id', isActive: true, active_status: true }
      ];
      for (const u of usersToSeed) {
        await masterDataService.create('users', u);
      }
      alert('Seeded test users!');
    } catch(e) {
      console.error(e);
      alert('Error seeding users');
    }
  };

  React.useEffect(() => {
    if (!showModal) {
      setFormData({});
      setIsEdit(false);
    }
  }, [showModal]);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await masterDataService.update('users', formData.id, formData);
      } else {
        await masterDataService.create('users', formData);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user.');
    }
  };

  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (user: any) => {
    setFormData(user);
    setIsEdit(true);
    setShowModal(true);
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isEdit ? t('Edit Pengguna', 'Edit User') : t('Tambah Pengguna', 'Add New User')}
            </h3>
            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8 space-y-4 overflow-y-auto max-h-[70vh]">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA LENGKAP', 'FULL NAME')}</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                value={formData.fullName || ''}
                onChange={(e) => updateForm('fullName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('POSISI', 'POSITION')}</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                  value={formData.position || ''}
                  onChange={(e) => updateForm('position', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EMAIL</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                  value={formData.email || ''}
                  onChange={(e) => updateForm('email', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ROLE', 'ROLE')}</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                  value={formData.role || ''}
                  onChange={(e) => updateForm('role', e.target.value)}
                >
                  <option value="">--</option>
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Buyer">Buyer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('BAHASA', 'LANGUAGE')}</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                  value={formData.languagePreference || ''}
                  onChange={(e) => updateForm('languagePreference', e.target.value)}
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {formData.role === 'Buyer' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('LINK PEMBELI (BUYER)', 'LINKED BUYER')}</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                  value={formData.linkedBuyerId || ''}
                  onChange={(e) => updateForm('linkedBuyerId', e.target.value)}
                >
                  <option value="">-- {t('Pilih Pembeli', 'Select Buyer')} --</option>
                  {buyers.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}
            
            <div className="pt-4 flex items-center gap-4">
               <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                 <input 
                   type="checkbox" 
                   checked={formData.isActive !== false} 
                   onChange={(e) => updateForm('isActive', e.target.checked)}
                   className="w-5 h-5 rounded border-slate-300 text-ocean-800 focus:ring-ocean-800"
                 />
                 {t('Pengguna Aktif', 'Active User')}
               </label>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>{t('Batal', 'Cancel')}</Button>
            <Button className="flex-1" onClick={handleSave}>{t('Simpan', 'Save')}</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <Header 
        title={t('Pengguna Sistem', 'System Users')} 
        subtitle={t('Kelola akses pengguna dan peran', 'Manage user access and roles')}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSeed}>Seed Test Users</Button>
            <Button onClick={() => { setIsEdit(false); setFormData({ isActive: true }); setShowModal(true); }}>
              <Plus size={20} /> {t('Tambah Pengguna', 'Add New User')}
            </Button>
          </div>
        }
      />

      <Card noPadding>
        <Table 
          data={users}
          columns={[
            { header: t('NAMA LENGKAP', 'FULL NAME'), accessor: 'fullName', className: 'font-black text-slate-900' },
            { header: t('POSISI', 'POSITION'), accessor: 'position', className: 'font-bold text-slate-600' },
            { header: 'EMAIL', accessor: 'email', className: 'text-slate-500' },
            { header: t('ROLE', 'ROLE'), accessor: (u: any) => <Badge variant="posted">{u.role}</Badge> },
            { 
              header: t('STATUS', 'STATUS'), 
              accessor: (u: any) => (
                <Badge variant={u.isActive !== false ? 'posted' : 'draft'}>
                  {u.isActive !== false ? t('Aktif', 'Active') : t('Nonaktif', 'Inactive')}
                </Badge>
              ) 
            },
            { 
              header: '', 
              accessor: (u: any) => (
                <div className="flex gap-2 justify-end">
                   <button 
                    onClick={() => {
                      // Custom toggle active wrapper for users
                      const newStatus = u.isActive !== false ? false : true;
                      masterDataService.update('users', u.id, { isActive: newStatus, active_status: newStatus });
                    }}
                    className={`p-2 transition-colors ${u.isActive !== false ? 'text-slate-300 hover:text-red-500' : 'text-slate-300 hover:text-emerald-500'}`}
                    title={u.isActive !== false ? t('Nonaktifkan', 'Deactivate') : t('Aktifkan', 'Activate')}
                  >
                    <X size={16} />
                  </button>
                  <button onClick={() => handleEdit(u)} className="p-2 text-slate-300 hover:text-ocean-800"><Edit2 size={16} /></button>
                </div>
              ),
              className: 'text-right'
            }
          ]}
        />
        {users.length === 0 && (
           <div className="p-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
               <UserIcon size={32} className="text-slate-200" />
             </div>
             <div>
               <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Belum Ada Pengguna', 'No Users Yet')}</h3>
               <p className="text-slate-400 font-medium">{t('Klik "Tambah Pengguna" untuk memasukkan data pertama.', 'Click "Add User" to enter the first record.')}</p>
             </div>
           </div>
        )}
      </Card>
      {renderModal()}
    </div>
  );
};
