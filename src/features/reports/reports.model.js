export const reportArchive = interventions => (interventions ?? []).filter(item => item.reportData != null).sort((a,b)=>String(b.closedAt??b.date??'').localeCompare(String(a.closedAt??a.date??'')));
