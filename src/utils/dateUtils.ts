// src/utils/dateUtils.ts
export const DateUtils = {
    /**
     * Převede řetězec na objekt Date
     */
    parseDate: (dateStr: string): Date => {
      // Podpora pro formáty: YYYY-MM-DD, DD.MM.YYYY, MM/DD/YYYY
      let date: Date;
      
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        // ISO formát: YYYY-MM-DD
        date = new Date(dateStr);
      } else if (/^\d{2}\.\d{2}\.\d{4}/.test(dateStr)) {
        // Evropský formát: DD.MM.YYYY
        const [day, month, year] = dateStr.split(".");
        date = new Date(`${year}-${month}-${day}`);
      } else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        // Americký formát: MM/DD/YYYY
        const [month, day, year] = dateStr.split("/");
        date = new Date(`${year}-${month}-${day}`);
      } else {
        // Pokus o přímé parsování
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        throw new Error(`Neplatný formát data: ${dateStr}`);
      }
      
      return date;
    },
    
    /**
     * Formátuje datum pro SQL dotaz (YYYY-MM-DD)
     */
    formatDateForSQL: (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    
    /**
     * Vytvoří datum pro začátek dne (00:00:00)
     */
    startOfDay: (date: Date): Date => {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    },
    
    /**
     * Vytvoří datum pro konec dne (23:59:59.999)
     */
    endOfDay: (date: Date): Date => {
      const newDate = new Date(date);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    },
    
    /**
     * Získá první den v týdnu (pondělí) pro dané datum
     */
    startOfWeek: (date: Date): Date => {
      const newDate = new Date(date);
      const day = newDate.getDay();
      const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Upraveno pro pondělí jako první den
      newDate.setDate(diff);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    },
    
    /**
     * Získá poslední den v týdnu (neděle) pro dané datum
     */
    endOfWeek: (date: Date): Date => {
      const newDate = DateUtils.startOfWeek(date);
      newDate.setDate(newDate.getDate() + 6);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    },
    
    /**
     * Získá první den v měsíci pro dané datum
     */
    startOfMonth: (date: Date): Date => {
      const newDate = new Date(date);
      newDate.setDate(1);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    },
    
    /**
     * Získá poslední den v měsíci pro dané datum
     */
    endOfMonth: (date: Date): Date => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 1);
      newDate.setDate(0);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    },
    
    /**
     * Získá první den v roce pro dané datum
     */
    startOfYear: (date: Date): Date => {
      const newDate = new Date(date);
      newDate.setMonth(0, 1);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    },
    
    /**
     * Získá poslední den v roce pro dané datum
     */
    endOfYear: (date: Date): Date => {
      const newDate = new Date(date);
      newDate.setMonth(11, 31);
      newDate.setHours(23, 59, 59, 999);
      return newDate;
    },
    
    /**
     * Vrátí dnešní datum (začátek dne)
     */
    today: (): Date => {
      return DateUtils.startOfDay(new Date());
    },
    
    /**
     * Vrátí včerejší datum (začátek dne)
     */
    yesterday: (): Date => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return DateUtils.startOfDay(date);
    },
  };