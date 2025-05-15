import { Supplier } from "../models/Supplier";
import { EntityTarget } from "typeorm";
import { CreateSupplierDto, UpdateSupplierDto } from "../models/dto/SupplierDto";
import { AbstractService } from "../../../../services/AbstractService";
import { DbErrorResponse } from "../../../../services/AbstractService";

// Testovací data pro dodavatele
export const suppliersDto: CreateSupplierDto[] = [
  {
    name: "ElektroTech s.r.o.",
    contactName: "Jan Novák",
    contactEmail: "jan.novak@elektrotech.cz",
    contactPhone: "+420 123 456 789",
    address: "Technická 1234",
    city: "Praha",
    postalCode: "160 00",
    country: "Česká republika",
    isActive: true
  },
  {
    name: "IT Solutions a.s.",
    contactName: "Petr Svoboda",
    contactEmail: "petr.svoboda@itsolutions.cz",
    contactPhone: "+420 987 654 321",
    address: "Softwarová 42",
    city: "Brno",
    postalCode: "602 00",
    country: "Česká republika",
    isActive: true
  },
  {
    name: "Hardware Components Ltd.",
    contactName: "John Smith",
    contactEmail: "john.smith@hwcomponents.com",
    contactPhone: "+44 20 7946 0958",
    address: "Tech Street 123",
    city: "London",
    postalCode: "SW1A 1AA",
    country: "United Kingdom",
    isActive: true
  },
  {
    name: "Global Electronics GmbH",
    contactName: "Hans Müller",
    contactEmail: "hans.mueller@global-electronics.de",
    contactPhone: "+49 30 12345678",
    address: "Elektronikstraße 87",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
    isActive: true
  },
  {
    name: "Asia Tech Co., Ltd.",
    contactName: "Lee Min-ho",
    contactEmail: "lee.minho@asiatech.kr",
    contactPhone: "+82 2 1234 5678",
    address: "Tech Tower 456",
    city: "Seoul",
    postalCode: "04523",
    country: "South Korea",
    isActive: true
  }
];

/**
 * Servisní třída pro správu dodavatelů
 * Rozšiřuje AbstractService pro využití obecné CRUD funkcionality
 */
class SupplierService extends AbstractService<Supplier> {
  constructor() {
    // Explicitně definujeme sloupec 'id' jako primární klíč
    super(Supplier as EntityTarget<Supplier>, "supplier", "id","etlowner");
  }

  /**
   * Vytvoření více dodavatelů najednou
   * Využívá createMany metodu z AbstractService
   */
  async createBulk(suppliersData: CreateSupplierDto[]): Promise<Supplier[] | DbErrorResponse> {
    return this.createMany(suppliersData);
  }

  /**
   * Naplnění databáze testovacími daty
   */
  async seedTestData(): Promise<Supplier[] | DbErrorResponse> {
    // Nejprve zkontrolujeme, zda již existují nějací dodavatelé
    const existingCount = await this.repository.count();
    if (existingCount > 0) {
      console.log("Databáze již obsahuje dodavatele, přeskakuji seed.");
      return [];
    }
    
    // Uložení testovacích dat do databáze
    return await this.createBulk(suppliersDto);
  }

}

// Exportujeme třídu místo instance
export { SupplierService };

// Proměnná pro uchování instance služby
let _supplierServiceInstance: SupplierService | null = null;

/**
 * Funkce pro získání instance SupplierService
 * Instance se vytvoří až při prvním volání této funkce
 */
export function getSupplierService(): SupplierService {
  if (!_supplierServiceInstance) {
    _supplierServiceInstance = new SupplierService();
  }
  return _supplierServiceInstance;
}