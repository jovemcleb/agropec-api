/**
 * Converte uma data do formato dd/mm/yyyy para yyyy-mm-dd
 * @param date Data no formato dd/mm/yyyy
 * @returns Data no formato yyyy-mm-dd
 */
export function convertDateFormat(date: string): string {
  const [day, month, year] = date.split("/");
  return `${year}-${month}-${day}`;
}
