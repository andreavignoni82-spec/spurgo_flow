export function readReportForm(form) {
  const data = new FormData(form);
  return { relation:String(data.get('relation')??''), activities:String(data.get('activities')??'').split('\n').filter(Boolean), anomaly:String(data.get('anomaly')??''), materials:String(data.get('materials')??'').split('\n').filter(Boolean), notes:String(data.get('notes')??'') };
}
