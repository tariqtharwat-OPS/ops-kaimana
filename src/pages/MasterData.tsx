import React, { useState } from 'react';
import { 
  Plus, 
  Package, 
  Truck, 
  ShoppingBag, 
  CreditCard,
  Edit2,
  X,
  Layers,
  Maximize,
  HardHat
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { masterDataService } from '../services/masterDataService';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

type TabType = 'items' | 'suppliers' | 'buyers' | 'expenses' | 'workers' | 'grades' | 'sizes' | 'grade_profiles' | 'size_profiles';

export const MasterDataPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const [isEdit, setIsEdit] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (showModal && !isEdit) {
      setFormData({});
    }
    if (!showModal) {
      setTimeout(() => { setFormData({}); setIsEdit(false); }, 300);
    }
  }, [showModal]);

  const handleSave = async () => {
    try {
      const collectionMapping: Record<TabType, string> = {
        items: 'items',
        grades: 'grades',
        sizes: 'sizes',
        grade_profiles: 'grade_profiles',
        size_profiles: 'size_profiles',
        suppliers: 'suppliers',
        buyers: 'buyers',
        expenses: 'expense_categories',
        workers: 'workers'
      };

      if (isEdit) {
        await masterDataService.update(collectionMapping[activeTab], formData.id, formData);
      } else {
        await masterDataService.create(collectionMapping[activeTab], formData);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save data. Check console.');
    }
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setIsEdit(true);
    setShowModal(true);
  };

  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Real data from Firestore
  const { data: items } = useMasterData('items', true);
  const { data: suppliers } = useMasterData('suppliers', true);
  const { data: buyers } = useMasterData('buyers', true);
  const { data: expenses } = useMasterData('expense_categories', true);
  const { data: workers } = useMasterData('workers', true);
  const { data: grade_profiles } = useMasterData('grade_profiles', true);
  const { data: size_profiles } = useMasterData('size_profiles', true);
  const { data: grades } = useMasterData('grades', true);
  const { data: sizes } = useMasterData('sizes', true);

  const tabs = [
    { id: 'items', label: t('Barang', 'Items'), icon: Package },
    { id: 'grade_profiles', label: t('Grade Profile', 'Grade Profiles'), icon: Layers },
    { id: 'grades', label: t('Grade Options', 'Grade Options'), icon: Layers },
    { id: 'size_profiles', label: t('Size Profile', 'Size Profiles'), icon: Maximize },
    { id: 'sizes', label: t('Size Options', 'Size Options'), icon: Maximize },
    { id: 'suppliers', label: t('Pemasok', 'Suppliers'), icon: Truck },
    { id: 'buyers', label: t('Pembeli', 'Buyers'), icon: ShoppingBag },
    { id: 'expenses', label: t('Kategori Biaya', 'Expense Cat.'), icon: CreditCard },
    { id: 'workers', label: t('Pekerja', 'Workers'), icon: HardHat },
  ];

  const renderModal = () => {
    if (!showModal) return null;

    const titles = {
      items: isEdit ? t('Edit Barang', 'Edit Item') : t('Tambah Barang', 'Add New Item'),
      grade_profiles: isEdit ? t('Edit Grade Profile', 'Edit Grade Profile') : t('Tambah Grade Profile', 'Add Grade Profile'),
      size_profiles: isEdit ? t('Edit Size Profile', 'Edit Size Profile') : t('Tambah Size Profile', 'Add Size Profile'),
      grades: isEdit ? t('Edit Grade', 'Edit Grade') : t('Tambah Grade Option', 'Add New Grade Option'),
      sizes: isEdit ? t('Edit Size', 'Edit Size') : t('Tambah Size Option', 'Add New Size Option'),
      suppliers: isEdit ? t('Edit Pemasok', 'Edit Supplier') : t('Tambah Pemasok', 'Add New Supplier'),
      buyers: isEdit ? t('Edit Pembeli', 'Edit Buyer') : t('Tambah Pembeli', 'Add New Buyer'),
      expenses: isEdit ? t('Edit Kategori Biaya', 'Edit Expense Category') : t('Tambah Kategori Biaya', 'Add Expense Category'),
      workers: isEdit ? t('Edit Pekerja', 'Edit Worker') : t('Tambah Pekerja', 'Add New Worker'),
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
          
          <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
            {activeTab === 'items' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KODE', 'CODE')}</label>
                    <input 
                      type="text" 
                      placeholder="FISH-001" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                      value={formData.item_code || ''}
                      onChange={(e) => updateForm('item_code', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KATEGORI', 'CATEGORY')}</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                      value={formData.category || ''}
                      onChange={(e) => updateForm('category', e.target.value)}
                    >
                      <option value="">--</option>
                      <option>Raw</option>
                      <option>Semi</option>
                      <option>Finished</option>
                      <option>Packaging</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA (EN)', 'NAME (EN)')}</label>
                    <input 
                      type="text" 
                      placeholder="Whole Tuna" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                      value={formData.nameEn || ''}
                      onChange={(e) => updateForm('nameEn', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA (ID)', 'NAME (ID)')}</label>
                    <input 
                      type="text" 
                      placeholder="Tuna Utuh" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                      value={formData.nameId || ''}
                      onChange={(e) => updateForm('nameId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 mb-4">{t('Konfigurasi Cerdas', 'Smart Configuration')}</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.hasGrade || false} 
                        onChange={(e) => updateForm('hasGrade', e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-ocean-800 focus:ring-ocean-800"
                      />
                      <span className="text-sm font-bold text-slate-700">{t('Gunakan Sistem Grading', 'Use Grading System')}</span>
                    </label>

                    {formData.hasGrade && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('GRADE PROFILE', 'GRADE PROFILE')}</label>
                        <select 
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                          value={formData.gradeProfileId || ''}
                          onChange={(e) => updateForm('gradeProfileId', e.target.value)}
                        >
                          <option value="">-- {t('Pilih Grade Profile', 'Select Grade Profile')} --</option>
                          {grade_profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SIZE PROFILE', 'SIZE PROFILE')}</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                        value={formData.sizeProfileId || ''}
                        onChange={(e) => updateForm('sizeProfileId', e.target.value)}
                      >
                        <option value="">-- {t('Pilih Size Profile', 'Select Size Profile')} --</option>
                        {size_profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PEMASOK', 'SUPPLIER NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="Nelayan Kaimana" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('ALAMAT', 'ADDRESS')}</label>
                  <textarea 
                    rows={3} 
                    placeholder="Jl. Pelabuhan Kaimana..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold resize-none"
                    value={formData.address || ''}
                    onChange={(e) => updateForm('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KONTAK', 'CONTACT')}</label>
                  <input 
                    type="text" 
                    placeholder="+62..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.phone || ''}
                    onChange={(e) => updateForm('phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'grade_profiles' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PROFILE', 'PROFILE NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="Tuna Grades" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'size_profiles' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PROFILE', 'PROFILE NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="Tuna Sizes" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('GRADE PROFILE', 'GRADE PROFILE')}</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.profileId || ''}
                    onChange={(e) => updateForm('profileId', e.target.value)}
                  >
                    <option value="">-- {t('Pilih Profile', 'Select Profile')} --</option>
                    {grade_profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA OPTION', 'OPTION NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="Grade A" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'sizes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('SIZE PROFILE', 'SIZE PROFILE')}</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.profileId || ''}
                    onChange={(e) => updateForm('profileId', e.target.value)}
                  >
                    <option value="">-- {t('Pilih Profile', 'Select Profile')} --</option>
                    {size_profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA OPTION', 'OPTION NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="3kg - 5kg" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'buyers' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PEMBELI', 'BUYER NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="PT. Export Maju" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KONTAK', 'CONTACT')}</label>
                  <input 
                    type="text" 
                    placeholder="+62..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.phone || ''}
                    onChange={(e) => updateForm('phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'workers' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PEKERJA', 'WORKER NAME')}</label>
                  <input 
                    type="text" 
                    placeholder="Ahmad Dhani" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('TIPE', 'TYPE')}</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                      value={formData.type || ''}
                      onChange={(e) => updateForm('type', e.target.value)}
                    >
                      <option value="">--</option>
                      <option>Monthly</option>
                      <option>Daily</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('GAJI / RATE', 'SALARY / RATE')}</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                      value={formData.salary || ''}
                      onChange={(e) => updateForm('salary', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('KATEGORI BIAYA', 'EXPENSE CATEGORY')}</label>
                  <input 
                    type="text" 
                    placeholder="Listrik & Air" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>{t('Batal', 'Cancel')}</Button>
            <Button className="flex-1" onClick={handleSave}>{t('Simpan', 'Save')}</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderStatusBadge = (active: boolean) => (
    <Badge variant={active ? 'posted' : 'draft'}>
      {active ? t('Aktif', 'Active') : t('Nonaktif', 'Inactive')}
    </Badge>
  );

  const renderActions = (collectionName: string, item: any) => (
    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
      <button 
        onClick={() => masterDataService.toggleStatus(collectionName, item.id, item.active_status)}
        className={`p-2 transition-colors ${item.active_status ? 'text-slate-300 hover:text-red-500' : 'text-slate-300 hover:text-emerald-500'}`}
        title={item.active_status ? t('Nonaktifkan', 'Deactivate') : t('Aktifkan', 'Activate')}
      >
        <X size={16} />
      </button>
      <button className="p-2 text-slate-300 hover:text-ocean-800" onClick={() => handleEdit(item)}><Edit2 size={16} /></button>
    </div>
  );

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
            data={items}
            columns={[
              { header: t('KODE', 'CODE'), accessor: 'item_code', className: 'font-black text-slate-900' },
              { header: t('KATEGORI', 'CATEGORY'), accessor: (item) => <Badge variant="draft">{item.category}</Badge> },
              { header: t('NAMA (EN)', 'NAME (EN)'), accessor: 'nameEn', className: 'font-bold text-slate-600' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('items', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'grade_profiles' && (
          <Table 
            data={grade_profiles}
            columns={[
              { header: t('NAMA PROFILE', 'PROFILE NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('grade_profiles', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'size_profiles' && (
          <Table 
            data={size_profiles}
            columns={[
              { header: t('NAMA PROFILE', 'PROFILE NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('size_profiles', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'grades' && (
          <Table 
            data={grades}
            columns={[
              { header: t('PROFILE', 'PROFILE'), accessor: (item) => grade_profiles.find(p => p.id === item.profileId)?.name || '-', className: 'text-slate-500' },
              { header: t('NAMA OPTION', 'OPTION NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('grades', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'sizes' && (
          <Table 
            data={sizes}
            columns={[
              { header: t('PROFILE', 'PROFILE'), accessor: (item) => size_profiles.find(p => p.id === item.profileId)?.name || '-', className: 'text-slate-500' },
              { header: t('NAMA OPTION', 'OPTION NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('sizes', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'suppliers' && (
          <Table 
            data={suppliers}
            columns={[
              { header: t('ID', 'ID'), accessor: 'id', className: 'font-black text-slate-900' },
              { header: t('NAMA PEMASOK', 'SUPPLIER NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('ALAMAT', 'ADDRESS'), accessor: (s) => s.address || '-', className: 'text-slate-400 truncate max-w-xs' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('suppliers', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'buyers' && (
          <Table 
            data={buyers}
            columns={[
              { header: t('ID', 'ID'), accessor: 'id', className: 'font-black text-slate-900' },
              { header: t('NAMA PEMBELI', 'BUYER NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('KONTAK', 'CONTACT'), accessor: 'phone', className: 'text-slate-400' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('buyers', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'workers' && (
          <Table 
            data={workers}
            columns={[
              { header: t('NAMA', 'NAME'), accessor: 'name', className: 'font-black text-slate-900' },
              { header: t('TIPE', 'TYPE'), accessor: (u: any) => <Badge variant="posted">{u.type}</Badge> },
              { header: t('GAJI / RATE', 'SALARY / RATE'), accessor: 'salary', className: 'font-bold text-slate-400' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('workers', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'expenses' && (
          <Table 
            data={expenses}
            columns={[
              { header: t('ID', 'ID'), accessor: 'id', className: 'font-black text-slate-900' },
              { header: t('KATEGORI', 'CATEGORY'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('expense_categories', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {/* Empty State */}
        {((activeTab === 'items' && items.length === 0) || 
          (activeTab === 'grades' && grades.length === 0) || 
          (activeTab === 'sizes' && sizes.length === 0) || 
          (activeTab === 'suppliers' && suppliers.length === 0) || 
          (activeTab === 'buyers' && buyers.length === 0) || 
          (activeTab === 'workers' && workers.length === 0) || 
          (activeTab === 'expenses' && expenses.length === 0)) && (
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
