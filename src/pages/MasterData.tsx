import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Filter, 
  Package, 
  Users, 
  Truck, 
  ShoppingBag, 
  CreditCard,
  UserPlus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MOCK_ITEMS, 
  MOCK_SUPPLIERS, 
  MOCK_USERS, 
  MOCK_EXPENSES,
  MOCK_GRADES,
  MOCK_SIZES 
} from '../mockData';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

type TabType = 'items' | 'suppliers' | 'buyers' | 'expenses' | 'users';

export const MasterDataPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { id: 'items', label: t('Ikan & Barang', 'Items & Fish'), icon: Package },
    { id: 'suppliers', label: t('Pemasok', 'Suppliers'), icon: Truck },
    { id: 'buyers', label: t('Pembeli', 'Buyers'), icon: ShoppingBag },
    { id: 'expenses', label: t('Jenis Biaya', 'Expense Types'), icon: CreditCard },
    { id: 'users', label: t('Pengguna', 'Users'), icon: Users },
  ];

  const renderModal = () => {
    if (!showModal) return null;

    const titles = {
      items: t('Tambah Ikan Baru', 'Add New Fish/Item'),
      suppliers: t('Tambah Pemasok Baru', 'Add New Supplier'),
      buyers: t('Tambah Pembeli Baru', 'Add New Buyer'),
      expenses: t('Tambah Jenis Biaya', 'Add Expense Category'),
      users: t('Tambah Pengguna Baru', 'Add New User'),
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{titles[activeTab]}</h3>
            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8 space-y-6">
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KODE', 'CODE')}</label>
                    <input type="text" placeholder="FISH-001" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KATEGORI', 'CATEGORY')}</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                      <option>Raw</option>
                      <option>Processed</option>
                      <option>Packaging</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA (EN)', 'NAME (EN)')}</label>
                  <input type="text" placeholder="Whole Tuna" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA (ID)', 'NAME (ID)')}</label>
                  <input type="text" placeholder="Tuna Utuh" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PEMASOK', 'SUPPLIER NAME')}</label>
                  <input type="text" placeholder="Nelayan Kaimana" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ALAMAT', 'ADDRESS')}</label>
                  <textarea rows={3} placeholder="Jl. Pelabuhan Kaimana..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KONTAK', 'CONTACT')}</label>
                  <input type="text" placeholder="+62..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA LENGKAP', 'FULL NAME')}</label>
                  <input type="text" placeholder="Tariq Tharwat" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ROLE', 'ROLE')}</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold">
                      <option>Admin</option>
                      <option>Operator</option>
                      <option>Buyer</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('JABATAN', 'POSITION')}</label>
                    <input type="text" placeholder="Plant Manager" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                  </div>
                </div>
              </div>
            )}

            {/* General placeholder for others */}
            {(activeTab === 'buyers' || activeTab === 'expenses') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA', 'NAME')}</label>
                  <input type="text" placeholder={activeTab === 'buyers' ? "PT. Export Maju" : "Biaya Listrik"} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KETERANGAN', 'DESCRIPTION')}</label>
                  <input type="text" placeholder="..." className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold" />
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>{t('Batal', 'Cancel')}</Button>
            <Button className="flex-1" onClick={() => setShowModal(false)}>{t('Simpan', 'Save')}</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <Header 
        title={t('Master Data', 'Master Data')} 
        subtitle={t('Kelola entitas inti sistem OPS Kaimana', 'Manage core entities of OPS Kaimana system')}
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={20} /> {t('Tambah Baru', 'Add New')}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap border-2 font-bold ${
                isActive 
                  ? 'bg-white border-ocean-800 text-ocean-800 shadow-md shadow-ocean-800/5' 
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-ocean-800' : 'text-slate-300'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Card noPadding>
        {activeTab === 'items' && (
          <Table 
            data={MOCK_ITEMS}
            columns={[
              { header: t('KODE', 'CODE'), accessor: 'id', className: 'font-black text-slate-900' },
              { header: t('KATEGORI', 'CATEGORY'), accessor: (item) => <Badge variant="draft">{item.category}</Badge> },
              { header: t('NAMA (EN)', 'NAME (EN)'), accessor: 'nameEn', className: 'font-bold text-slate-600' },
              { header: t('NAMA (ID)', 'NAME (ID)'), accessor: 'nameId', className: 'font-medium text-slate-400 italic' },
              { 
                header: '', 
                accessor: () => (
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 text-slate-300 hover:text-ocean-800"><Edit2 size={16} /></button>
                    <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'suppliers' && (
          <Table 
            data={MOCK_SUPPLIERS}
            columns={[
              { header: t('ID', 'ID'), accessor: 'id', className: 'font-black text-slate-900' },
              { header: t('NAMA PEMASOK', 'SUPPLIER NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('ALAMAT', 'ADDRESS'), accessor: (s) => s.address || '-', className: 'text-slate-400 truncate max-w-xs' },
              { 
                header: '', 
                accessor: () => (
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 text-slate-300 hover:text-ocean-800"><Edit2 size={16} /></button>
                    <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'users' && (
          <Table 
            data={MOCK_USERS}
            columns={[
              { header: t('NAMA', 'NAME'), accessor: 'name', className: 'font-black text-slate-900' },
              { header: t('ROLE', 'ROLE'), accessor: (u) => <Badge variant="posted">{u.role}</Badge> },
              { header: t('JABATAN', 'POSITION'), accessor: 'position', className: 'font-bold text-slate-400' },
              { 
                header: '', 
                accessor: () => (
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 text-slate-300 hover:text-ocean-800"><Edit2 size={16} /></button>
                    <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                ),
                className: 'text-right'
              }
            ]}
          />
        )}

        {(activeTab === 'buyers' || activeTab === 'expenses') && (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Plus size={32} className="text-slate-200" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{t('Belum Ada Data', 'No Data Yet')}</h3>
              <p className="text-slate-400 font-medium">{t('Klik "Tambah Baru" untuk memasukkan data pertama.', 'Click "Add New" to enter the first record.')}</p>
            </div>
          </div>
        )}
      </Card>

      {renderModal()}
    </div>
  );
};
