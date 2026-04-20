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
  HardHat,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useMasterData } from '../hooks/useMasterData';
import { masterDataService } from '../services/masterDataService';
import { Button, Card, Header, Badge } from '../components/ui/DesignSystem';
import { Table } from '../components/ui/Table';

type TabType = 'items' | 'suppliers' | 'buyers' | 'expenses' | 'workers' | 'grading' | 'sizing';

export const MasterDataPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEdit, setIsEdit] = useState(false);

  // For nested options management
  const [editingOptions, setEditingOptions] = useState<any[]>([]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (showModal && !isEdit) {
      setFormData({});
      setEditingOptions([]);
    }
    if (!showModal) {
      setTimeout(() => { 
        setFormData({}); 
        setIsEdit(false); 
        setEditingOptions([]);
      }, 300);
    }
  }, [showModal]);

  const handleSave = async () => {
    try {
      const collectionMapping: Record<TabType, string> = {
        items: 'items',
        grading: 'grade_profiles',
        sizing: 'size_profiles',
        suppliers: 'suppliers',
        buyers: 'buyers',
        expenses: 'expense_categories',
        workers: 'workers'
      };

      let docId = formData.id;
      let finalData = { ...formData };

      if (activeTab === 'items' && finalData.pricingMatrix) {
        // Cleanup orphaned data
        const validGrades = finalData.hasGrade && finalData.gradeProfileId ? grades.filter((g: any) => g.profileId === finalData.gradeProfileId).map((g: any) => g.id) : ['standard'];
        const validSizes = finalData.sizeProfileId ? sizes.filter((s: any) => s.profileId === finalData.sizeProfileId).map((s: any) => s.id) : ['standard'];
        
        const cleanedMatrix: any = {};
        for (const g of validGrades) {
          if (finalData.pricingMatrix[g]) {
            cleanedMatrix[g] = {};
            for (const s of validSizes) {
              if (finalData.pricingMatrix[g][s] !== undefined) {
                cleanedMatrix[g][s] = finalData.pricingMatrix[g][s];
              }
            }
          }
        }
        finalData.pricingMatrix = cleanedMatrix;
      }

      if (isEdit) {
        await masterDataService.update(collectionMapping[activeTab], finalData.id, finalData);
      } else {
        docId = await masterDataService.create(collectionMapping[activeTab], finalData);
      }

      // Handle nested options for grading/sizing
      if (activeTab === 'grading' || activeTab === 'sizing') {
        const optionCollection = activeTab === 'grading' ? 'grades' : 'sizes';
        for (const opt of editingOptions) {
          const optData = { ...opt, profileId: docId };
          if (opt.id) {
            await masterDataService.update(optionCollection, opt.id, optData);
          } else {
            await masterDataService.create(optionCollection, optData);
          }
        }
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
    
    // Load options if grading/sizing
    if (activeTab === 'grading') {
      setEditingOptions(grades.filter(g => g.profileId === item.id));
    } else if (activeTab === 'sizing') {
      setEditingOptions(sizes.filter(s => s.profileId === item.id));
    }
    
    setShowModal(true);
  };

  const updateForm = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    setEditingOptions(p => [...p, { name: '', active_status: true }]);
  };

  const updateOption = (idx: number, field: string, value: any) => {
    const next = [...editingOptions];
    next[idx] = { ...next[idx], [field]: value };
    setEditingOptions(next);
  };

  const removeOption = async (idx: number) => {
    const opt = editingOptions[idx];
    if (opt.id) {
      const optionCollection = activeTab === 'grading' ? 'grades' : 'sizes';
      await masterDataService.delete(optionCollection, opt.id);
    }
    setEditingOptions(p => p.filter((_, i) => i !== idx));
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm(t('Hapus data ini secara permanen?', 'Delete this data permanently?'))) {
      try {
        await masterDataService.delete(collectionName, id);
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete. It might be referenced by other data.');
      }
    }
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
  const { data: sales } = useMasterData('sales', true);
  const { data: receivings } = useMasterData('receivings', true);

  // Derived calculations for Buyers (Accounts Receivable)
  const getBuyerStats = (buyerId: string) => {
    const buyerSales = sales.filter((s: any) => s.buyerId === buyerId);
    const balance = buyerSales
      .filter((s: any) => s.status === 'Posted')
      .reduce((sum, s: any) => sum + (s.balanceDue !== undefined ? s.balanceDue : s.totalValue), 0);
      
    const allocatedStock = buyerSales
      .filter((s: any) => s.status === 'Draft')
      .reduce((sum, s: any) => sum + (s.totalQty || 0), 0);
    
    return { balance, allocatedStock };
  };

  // Derived calculations for Suppliers (Accounts Payable)
  const getSupplierStats = (supplierId: string) => {
    const supplierReceivings = receivings.filter((r: any) => r.supplierId === supplierId);
    const balance = supplierReceivings
      .filter((r: any) => r.status === 'Posted')
      .reduce((sum, r: any) => sum + (r.balanceDue !== undefined ? r.balanceDue : r.totalAmount), 0);
      
    return { balance };
  };

  const tabs = [
    { id: 'items', label: t('Barang', 'Items'), icon: Package },
    { id: 'grading', label: t('Grading', 'Grading'), icon: Layers },
    { id: 'sizing', label: t('Sizing', 'Sizing'), icon: Maximize },
    { id: 'suppliers', label: t('Pemasok', 'Suppliers'), icon: Truck },
    { id: 'buyers', label: t('Pembeli / Partner', 'Buyers / Partners'), icon: ShoppingBag },
    { id: 'expenses', label: t('Kategori Biaya', 'Expense Cat.'), icon: CreditCard },
    { id: 'workers', label: t('Pekerja', 'Workers'), icon: HardHat },
  ];

  const renderModal = () => {
    if (!showModal) return null;

    const titles = {
      items: isEdit ? t('Edit Barang', 'Edit Item') : t('Tambah Barang', 'Add New Item'),
      grading: isEdit ? t('Edit Grading Group', 'Edit Grading Group') : t('Tambah Grading Group', 'Add Grading Group'),
      sizing: isEdit ? t('Edit Sizing Group', 'Edit Sizing Group') : t('Tambah Sizing Group', 'Add Sizing Group'),
      suppliers: isEdit ? t('Edit Pemasok', 'Edit Supplier') : t('Tambah Pemasok', 'Add New Supplier'),
      buyers: isEdit ? t('Edit Pembeli / Partner', 'Edit Buyer / Partner') : t('Tambah Pembeli / Partner', 'Add New Buyer / Partner'),
      expenses: isEdit ? t('Edit Kategori Biaya', 'Edit Expense Category') : t('Tambah Kategori Biaya', 'Add Expense Category'),
      workers: isEdit ? t('Edit Pekerja', 'Edit Worker') : t('Tambah Pekerja', 'Add New Worker'),
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{titles[activeTab as keyof typeof titles]}</h3>
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

                    {/* Pricing Matrix Section */}
                    {(formData.gradeProfileId || formData.sizeProfileId) && (
                      <div className="pt-6 border-t border-slate-100">
                        <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                          <CreditCard size={16} className="text-ocean-800" />
                          {t('Matriks Harga (Standard)', 'Pricing Matrix (Standard)')}
                        </h4>
                        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100">
                              <tr>
                                <th className="p-3 text-left font-black text-slate-400">GRADE \ SIZE</th>
                                {sizes.filter((s: any) => s.profileId === formData.sizeProfileId).map((sz: any) => (
                                  <th key={sz.id} className="p-3 text-center font-black text-slate-700">{sz.name}</th>
                                ))}
                                {(!formData.sizeProfileId || sizes.filter((s: any) => s.profileId === formData.sizeProfileId).length === 0) && (
                                   <th className="p-3 text-center font-black text-slate-700">Standard Size</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {grades.filter(g => g.profileId === formData.gradeProfileId).length > 0 ? (
                                grades.filter(g => g.profileId === formData.gradeProfileId).map((gr: any) => (
                                  <tr key={gr.id} className="border-b border-slate-50 last:border-0">
                                    <td className="p-3 font-bold text-slate-600 bg-slate-50/50">{gr.name}</td>
                                    {sizes.filter((s: any) => s.profileId === formData.sizeProfileId).map((sz: any) => {
                                      const currentPrice = formData.pricingMatrix?.[gr.id]?.[sz.id] || '';
                                      return (
                                        <td key={sz.id} className="p-1">
                                          <input 
                                            type="number" 
                                            className="w-full px-2 py-2 bg-transparent text-center font-black text-ocean-800 placeholder:text-slate-200 outline-none focus:bg-white"
                                            placeholder="0"
                                            value={currentPrice}
                                            onChange={(e) => {
                                              const matrix = { ...(formData.pricingMatrix || {}) };
                                              if (!matrix[gr.id]) matrix[gr.id] = {};
                                              matrix[gr.id][sz.id] = Number(e.target.value);
                                              updateForm('pricingMatrix', matrix);
                                            }}
                                          />
                                        </td>
                                      );
                                    })}
                                    {(!formData.sizeProfileId || sizes.filter((s: any) => s.profileId === formData.sizeProfileId).length === 0) && (
                                       <td className="p-1">
                                         <input 
                                            type="number" 
                                            className="w-full px-2 py-2 bg-transparent text-center font-black text-ocean-800 placeholder:text-slate-200 outline-none focus:bg-white"
                                            placeholder="0"
                                            value={formData.pricingMatrix?.[gr.id]?.['standard'] || ''}
                                            onChange={(e) => {
                                              const matrix = { ...(formData.pricingMatrix || {}) };
                                              if (!matrix[gr.id]) matrix[gr.id] = {};
                                              matrix[gr.id]['standard'] = Number(e.target.value);
                                              updateForm('pricingMatrix', matrix);
                                            }}
                                          />
                                       </td>
                                    )}
                                  </tr>
                                ))
                              ) : (
                                <tr className="border-b border-slate-50 last:border-0">
                                   <td className="p-3 font-bold text-slate-600 bg-slate-50/50">Standard</td>
                                   {sizes.filter((s: any) => s.profileId === formData.sizeProfileId).map((sz: any) => {
                                      const currentPrice = formData.pricingMatrix?.['standard']?.[sz.id] || '';
                                      return (
                                        <td key={sz.id} className="p-1">
                                          <input 
                                            type="number" 
                                            className="w-full px-2 py-2 bg-transparent text-center font-black text-ocean-800 placeholder:text-slate-200 outline-none focus:bg-white"
                                            placeholder="0"
                                            value={currentPrice}
                                            onChange={(e) => {
                                              const matrix = { ...(formData.pricingMatrix || {}) };
                                              if (!matrix['standard']) matrix['standard'] = {};
                                              matrix['standard'][sz.id] = Number(e.target.value);
                                              updateForm('pricingMatrix', matrix);
                                            }}
                                          />
                                        </td>
                                      );
                                    })}
                                    {(!formData.sizeProfileId || sizes.filter((s: any) => s.profileId === formData.sizeProfileId).length === 0) && (
                                       <td className="p-1">
                                         <input 
                                            type="number" 
                                            className="w-full px-2 py-2 bg-transparent text-center font-black text-ocean-800 placeholder:text-slate-200 outline-none focus:bg-white"
                                            placeholder="0"
                                            value={formData.pricingMatrix?.['standard']?.['standard'] || ''}
                                            onChange={(e) => {
                                              const matrix = { ...(formData.pricingMatrix || {}) };
                                              if (!matrix['standard']) matrix['standard'] = {};
                                              matrix['standard']['standard'] = Number(e.target.value);
                                              updateForm('pricingMatrix', matrix);
                                            }}
                                          />
                                       </td>
                                    )}
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
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

            {(activeTab === 'grading' || activeTab === 'sizing') && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {activeTab === 'grading' ? t('NAMA GRADING GROUP', 'GRADING GROUP NAME') : t('NAMA SIZING GROUP', 'SIZING GROUP NAME')}
                  </label>
                  <input 
                    type="text" 
                    placeholder={activeTab === 'grading' ? "Tuna Grading" : "Tuna Sizing"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-ocean-800/10 focus:border-ocean-800 outline-none transition-all font-bold"
                    value={formData.name || ''}
                    onChange={(e) => updateForm('name', e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-slate-900">{t('Daftar Opsi', 'Options List')}</h4>
                    <Button variant="secondary" size="sm" onClick={addOption}><Plus size={16} /> {t('Tambah Opsi', 'Add Option')}</Button>
                  </div>
                  <div className="space-y-2">
                    {editingOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <input 
                          type="text" 
                          placeholder={activeTab === 'grading' ? "Grade A" : "200-300g"}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                          value={opt.name || ''}
                          onChange={(e) => updateOption(idx, 'name', e.target.value)}
                        />
                        <button onClick={() => removeOption(idx)} className="p-2 text-red-300 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {editingOptions.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        {t('Belum ada opsi', 'No options added yet')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'buyers' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('NAMA PEMBELI / PARTNER', 'BUYER / PARTNER NAME')}</label>
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
        className={`p-2 transition-colors ${item.active_status ? 'text-slate-300 hover:text-amber-500' : 'text-slate-300 hover:text-emerald-500'}`}
        title={item.active_status ? t('Nonaktifkan', 'Deactivate') : t('Aktifkan', 'Activate')}
      >
        <div className={`w-2 h-2 rounded-full ${item.active_status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
      </button>
      <button className="p-2 text-slate-300 hover:text-ocean-800" onClick={() => handleEdit(item)}><Edit2 size={16} /></button>
      <button className="p-2 text-slate-300 hover:text-red-500" onClick={() => handleDelete(collectionName, item.id)}><Trash2 size={16} /></button>
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

        {activeTab === 'grading' && (
          <Table 
            data={grade_profiles}
            columns={[
              { header: t('NAMA GROUP', 'GROUP NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('OPSI', 'OPTIONS'), accessor: (p) => {
                const opts = grades.filter(g => g.profileId === p.id);
                return (
                  <div className="flex flex-wrap gap-1">
                    {opts.map((o: any) => <Badge key={o.id} variant="draft">{o.name}</Badge>)}
                    {opts.length === 0 && <span className="text-slate-300 italic text-[10px]">No options</span>}
                  </div>
                );
              }},
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('grade_profiles', item),
                className: 'text-right'
              }
            ]}
          />
        )}

        {activeTab === 'sizing' && (
          <Table 
            data={size_profiles}
            columns={[
              { header: t('NAMA GROUP', 'GROUP NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('OPSI', 'OPTIONS'), accessor: (p) => {
                const opts = sizes.filter(s => s.profileId === p.id);
                return (
                  <div className="flex flex-wrap gap-1">
                    {opts.map((o: any) => <Badge key={o.id} variant="draft">{o.name}</Badge>)}
                    {opts.length === 0 && <span className="text-slate-300 italic text-[10px]">No options</span>}
                  </div>
                );
              }},
              { header: t('STATUS', 'STATUS'), accessor: (item) => renderStatusBadge(item.active_status) },
              { 
                header: '', 
                accessor: (item) => renderActions('size_profiles', item),
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
              { 
                header: t('SISA HUTANG', 'OUTSTANDING PAYABLE'), 
                accessor: (s: any) => {
                  const stats = getSupplierStats(s.id);
                  return <span className="font-bold text-red-600">Rp {stats.balance.toLocaleString()}</span>;
                },
                className: 'text-right'
              },
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
              { header: t('NAMA PEMBELI / PARTNER', 'BUYER / PARTNER NAME'), accessor: 'name', className: 'font-bold text-slate-900' },
              { header: t('KONTAK', 'CONTACT'), accessor: 'phone', className: 'text-slate-400' },
              { 
                header: t('SISA PIUTANG', 'OUTSTANDING RECEIVABLE'), 
                accessor: (b: any) => {
                  const stats = getBuyerStats(b.id);
                  return <span className="font-bold text-emerald-600">Rp {stats.balance.toLocaleString()}</span>;
                },
                className: 'text-right'
              },
              { 
                header: t('STOK ALOKASI', 'ALLOCATED STOCK'), 
                accessor: (b: any) => {
                  const stats = getBuyerStats(b.id);
                  return <span className="font-bold text-ocean-700">{stats.allocatedStock.toLocaleString()} kg</span>;
                },
                className: 'text-right'
              },
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
          (activeTab === 'grading' && grade_profiles.length === 0) || 
          (activeTab === 'sizing' && size_profiles.length === 0) || 
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
