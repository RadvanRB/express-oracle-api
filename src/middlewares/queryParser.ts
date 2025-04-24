import { Request, Response, NextFunction } from "express";
import { 
  ComparisonOperator, 
  LogicalOperator, 
  QueryOptions, 
  Filter,
  SortDirection
} from "../types/filters"; // Upravte cestu podle vaší struktury projektu

/**
 * Middleware pro parsování URL parametrů a vytváření objektu s možnostmi dotazu
 */
// src/middlewares/queryParser.ts
export const parseQueryParams = (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryOptions: QueryOptions = {};
    const filters: any[] = [];
    console.log("Přijaté parametry:", req.query);


    // Procházíme všechny URL parametry
    for (const [key, value] of Object.entries(req.query)) {
      // Přeskočíme standardní parametry pro stránkování a řazení
      if (['page', 'limit', 'sortBy', 'sortDirection'].includes(key)) {
        continue;
      }
      
      // Kontrola, zda parametr obsahuje specifikaci operátoru pomocí '@'
      if (key.includes('@')) {
        const [field, operatorStr] = key.split('@');
        console.log("Field:", field, "Operator:", operatorStr, "Value:", value);
        if (!field || !operatorStr) continue;
        
        const operator = operatorStrToEnum(operatorStr.toUpperCase());
        if (!operator) continue;
        
        // Hodnota zůstává jako string, ale zpracujeme ji podle operátoru při tvorbě filtru
        const stringValue = value as string;
        
        // Vytvoření správného filtru podle typu operátoru
        if (operatorStr.toUpperCase() === 'BETWEEN' || operatorStr.toUpperCase() === 'NOT_BETWEEN') {
          const [startStr, endStr] = stringValue.split(',');
          if (startStr && endStr) {
            filters.push({
              field,
              operator,
              value: {
                start: new Date(startStr),
                end: new Date(endStr)
              }
            });
          }
        } 
        else if (operatorStr.toUpperCase().startsWith('DATE_') || 
                ['AFTER', 'BEFORE'].includes(operatorStr.toUpperCase())) {
          // Pro datumové operátory převádíme hodnotu na Date
          filters.push({
            field,
            operator,
            value: new Date(stringValue)
          });
        }
        else if (['IN', 'NOT_IN'].includes(operatorStr.toUpperCase())) {
          // Pro operátory seznamu rozdělit na pole
          filters.push({
            field,
            operator,
            value: stringValue.split(',')
          });
        }
        else if (['EQ', 'NE', 'GT', 'GTE', 'LT', 'LTE'].includes(operatorStr.toUpperCase())) {
          // Pro číselné operátory převedeme na číslo, pokud je to možné
          const numValue = !isNaN(Number(stringValue)) ? Number(stringValue) : stringValue;
          filters.push({
            field,
            operator,
            value: numValue
          });
        }
        else {
          // Pro ostatní operátory ponecháme hodnotu jako string
          filters.push({
            field,
            operator,
            value: stringValue
          });
        }
      } 
      // Standardní jednoduchý filtr (rovnost)
      else {
        filters.push({
          field: key,
          operator: ComparisonOperator.EQ,
          value: value
        });
      }
    }
    
    // Vytvoření finálního filtru s logickým operátorem AND
    if (filters.length > 0) {
      if (filters.length === 1) {
        queryOptions.filter = filters[0];
      } else {
        queryOptions.filter = {
          operator: LogicalOperator.AND,
          filters
        };
      }
    }
    
    // Parsování stránkování
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    queryOptions.pagination = {
      page,
      limit,
    };
    
    // Parsování řazení
    if (req.query.sortBy) {
      const sortField = req.query.sortBy as string;
      const sortDirection = (req.query.sortDirection as string)?.toLowerCase() === 'desc' ? 
        SortDirection.DESC : SortDirection.ASC;
      
      queryOptions.sort = [{
        field: sortField,
        direction: sortDirection
      }];
    }
    
    // Přidání parsovaných parametrů do požadavku
    (req as any).queryOptions = queryOptions;
    console.log("Vytvořené queryOptions:", queryOptions);
    next();
  } catch (error) {
    console.error("Chyba při parsování URL parametrů:", error);
    res.status(400).json({
      status: "error",
      message: "Neplatné parametry dotazu",
      details: (error as Error).message,
    });
  }
};

// Pomocná funkce pro převod textového operátoru na enum
function operatorStrToEnum(operatorStr: string): ComparisonOperator | undefined {
  const operatorMap: Record<string, ComparisonOperator> = {
    'EQ': ComparisonOperator.EQ,
    'NE': ComparisonOperator.NE,
    'GT': ComparisonOperator.GT,
    'GTE': ComparisonOperator.GTE,
    'LT': ComparisonOperator.LT,
    'LTE': ComparisonOperator.LTE,
    'LIKE': ComparisonOperator.LIKE,
    'ILIKE': ComparisonOperator.ILIKE,
    'IN': ComparisonOperator.IN,
    'NOT_IN': ComparisonOperator.NOT_IN,
    'IS_NULL': ComparisonOperator.IS_NULL,
    'IS_NOT_NULL': ComparisonOperator.IS_NOT_NULL,
    
    // Datumové operátory
    'DATE_EQ': ComparisonOperator.DATE_EQUALS,
    'DATE_EQUALS': ComparisonOperator.DATE_EQUALS,
    'DATE_NE': ComparisonOperator.DATE_NOT_EQUALS,
    'DATE_NOT_EQUALS': ComparisonOperator.DATE_NOT_EQUALS,
    'DATE_BEFORE': ComparisonOperator.DATE_BEFORE,
    'DATE_AFTER': ComparisonOperator.DATE_AFTER,
    'DATE_BETWEEN': ComparisonOperator.DATE_BETWEEN,
    'DATE_NOT_BETWEEN': ComparisonOperator.DATE_NOT_BETWEEN,
    'DATE_TODAY': ComparisonOperator.DATE_TODAY,
    'DATE_YESTERDAY': ComparisonOperator.DATE_YESTERDAY,
    'DATE_THIS_WEEK': ComparisonOperator.DATE_THIS_WEEK,
    'DATE_LAST_WEEK': ComparisonOperator.DATE_LAST_WEEK,
    'DATE_THIS_MONTH': ComparisonOperator.DATE_THIS_MONTH,
    'DATE_LAST_MONTH': ComparisonOperator.DATE_LAST_MONTH,
    'DATE_THIS_YEAR': ComparisonOperator.DATE_THIS_YEAR,
    'DATE_LAST_YEAR': ComparisonOperator.DATE_LAST_YEAR,
    
    // Běžné aliasy pro operátory
    'BETWEEN': ComparisonOperator.DATE_BETWEEN,
    'NOT_BETWEEN': ComparisonOperator.DATE_NOT_BETWEEN,
    'AFTER': ComparisonOperator.DATE_AFTER,
    'BEFORE': ComparisonOperator.DATE_BEFORE,
    'EQUALS': ComparisonOperator.EQ,
    'NOT_EQUALS': ComparisonOperator.NE
  };
  
  return operatorMap[operatorStr];
}

