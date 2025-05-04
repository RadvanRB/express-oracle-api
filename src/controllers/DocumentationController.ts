import { Controller, Get, Route, Tags } from "tsoa";
import { ComparisonOperator, LogicalOperator } from "../types/filters";

/**
 * Controller pro dokumentaci API a ukázky pokročilého filtrování
 */
@Route("documentation")
@Tags("Documentation")
export class DocumentationController extends Controller {
  
  /**
   * Vrátí dostupné filtrační operátory s příklady použití
   */
  @Get("filter-operators")
  public getFilterOperators(): Record<string, { description: string; example: string }> {
    return {
      "eq": { 
        description: "Rovná se", 
        example: "name@eq=iPhone" 
      },
      "ne": { 
        description: "Nerovná se", 
        example: "category@ne=Příslušenství" 
      },
      "gt": { 
        description: "Větší než", 
        example: "price@gt=1000" 
      },
      "gte": { 
        description: "Větší nebo rovno", 
        example: "stock@gte=10" 
      },
      "lt": { 
        description: "Menší než", 
        example: "price@lt=5000" 
      },
      "lte": { 
        description: "Menší nebo rovno", 
        example: "weight@lte=0.5" 
      },
      "like": { 
        description: "Obsahuje (case-sensitive)", 
        example: "description@like=premium" 
      },
      "ilike": { 
        description: "Obsahuje (case-insensitive)", 
        example: "name@ilike=iphone" 
      },
      "in": { 
        description: "Je v seznamu hodnot", 
        example: "manufacturer@in=Apple,Samsung,Sony" 
      },
      "not_in": { 
        description: "Není v seznamu hodnot", 
        example: "category@not_in=Elektronika,Počítače" 
      },
      "is_null": { 
        description: "Je NULL", 
        example: "expiryDate@is_null" 
      },
      "is_not_null": { 
        description: "Není NULL", 
        example: "manufactureDate@is_not_null" 
      },
      "date_eq": { 
        description: "Datum se rovná (ignoruje čas)", 
        example: "manufactureDate@date_eq=2023-01-01" 
      },
      "date_ne": { 
        description: "Datum se nerovná (ignoruje čas)", 
        example: "expiryDate@date_ne=2023-12-31" 
      },
      "date_before": { 
        description: "Datum je před", 
        example: "manufactureDate@date_before=2023-01-01" 
      },
      "date_after": { 
        description: "Datum je po", 
        example: "manufactureDate@date_after=2022-12-31" 
      },
      "date_between": { 
        description: "Datum je mezi dvěma daty", 
        example: "manufactureDate@date_between=2022-01-01,2022-12-31" 
      },
      "date_not_between": { 
        description: "Datum není mezi dvěma daty", 
        example: "expiryDate@date_not_between=2023-01-01,2023-12-31" 
      }
    };
  }

  /**
   * Vrátí ukázku pokročilého filtrování s použitím logických operátorů
   */
  @Get("advanced-filter-examples")
  public getAdvancedFilterExamples(): Array<{ description: string; example: any }> {
    return [
      {
        description: "Produkty v cenovém rozmezí 1000-5000 Kč",
        example: {
          operator: LogicalOperator.AND,
          filters: [
            {
              field: "price",
              operator: ComparisonOperator.GTE,
              value: 1000
            },
            {
              field: "price",
              operator: ComparisonOperator.LTE,
              value: 5000
            }
          ]
        }
      },
      {
        description: "Produkty značky Apple nebo Samsung, které jsou na skladě",
        example: {
          operator: LogicalOperator.AND,
          filters: [
            {
              field: "manufacturer",
              operator: ComparisonOperator.IN,
              value: ["Apple", "Samsung"]
            },
            {
              field: "stock",
              operator: ComparisonOperator.GT,
              value: 0
            }
          ]
        }
      },
      {
        description: "Produkty, které obsahují v názvu nebo popisu 'iPhone'",
        example: {
          operator: LogicalOperator.OR,
          filters: [
            {
              field: "name",
              operator: ComparisonOperator.ILIKE,
              value: "iPhone"
            },
            {
              field: "description",
              operator: ComparisonOperator.ILIKE,
              value: "iPhone"
            }
          ]
        }
      },
      {
        description: "Komplexní filtr: Elektronika nebo Mobily v ceně do 20000 Kč a je na skladě",
        example: {
          operator: LogicalOperator.AND,
          filters: [
            {
              operator: LogicalOperator.OR,
              filters: [
                {
                  field: "category",
                  operator: ComparisonOperator.EQ,
                  value: "Elektronika"
                },
                {
                  field: "category",
                  operator: ComparisonOperator.EQ,
                  value: "Mobily"
                }
              ]
            },
            {
              field: "price",
              operator: ComparisonOperator.LTE,
              value: 20000
            },
            {
              field: "stock",
              operator: ComparisonOperator.GT,
              value: 0
            }
          ]
        }
      }
    ];
  }

  /**
   * Vrátí informace o stránkování a řazení
   */
  @Get("pagination-and-sort")
  public getPaginationAndSortInfo(): Record<string, string> {
    return {
      "page": "Číslo stránky (např. ?page=2)",
      "limit": "Počet záznamů na stránku (např. ?limit=20)",
      "sortBy": "Pole pro řazení (např. ?sortBy=name)",
      "sortDirection": "Směr řazení - asc nebo desc (např. ?sortDirection=desc)"
    };
  }

  /**
   * Vrátí příklady URL s použitím filtrů
   */
  @Get("filter-url-examples")
  public getFilterUrlExamples(): string[] {
    return [
      "/api/products?name@ilike=iphone&price@gte=10000&manufacturer@eq=Apple",
      "/api/products?category@in=Elektronika,Mobily&stock@gt=0&page=1&limit=20",
      "/api/products?manufactureDate@date_after=2023-01-01&sortBy=price&sortDirection=desc",
      "/api/products?price@between=1000,5000&manufacturer@in=Apple,Samsung,Sony&page=1&limit=10"
    ];
  }
}