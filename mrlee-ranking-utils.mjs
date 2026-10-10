// Competition ranks: equal points share a rank (1, 1, 3).
export function rankEntries(entries) {
  const rows = entries.filter(x => Number.isSafeInteger(x.points) && x.points >= 0)
    .map(x => ({...x, alias: String(x.alias || 'Học viên').slice(0,80)}))
    .sort((a,b) => b.points-a.points || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  let rank = 0;
  return rows.map((row,i) => {
    if (!i || row.points !== rows[i-1].points) rank = i+1;
    return {...row,rank};
  });
}
export const searchable = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
