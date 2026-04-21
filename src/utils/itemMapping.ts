/**
 * Standardizes item label resolution across the application.
 * Priority: nameEn -> nameId -> item_code -> doc.id
 */
export const getItemLabel = (item: any): string => {
  if (!item) return 'UNKNOWN';
  
  const label = (
    item.nameEn?.trim() || 
    item.nameId?.trim() || 
    item.item_code?.trim() || 
    (item.id ? `ID-${item.id.slice(0, 6)}` : 'UNKNOWN')
  );
  
  return label;
};

/**
 * Returns a short code or fallback for item identification
 */
export const getItemCodeLabel = (item: any): string => {
  if (!item) return '-';
  return item.item_code?.trim() || (item.id ? item.id.slice(0, 8) : '-');
};
