import { User } from "../models/User";
import { AppDataSource } from "../config/database";
import { limiter } from "../index";
import { CreateUserInput, UpdateUserInput } from "../types/schemas/userSchema";
import { PaginatedResult, QueryOptions } from "../types/filters";
import { buildWhereCondition } from "../utils/filterBuilder";

class UserService {
  private repository = AppDataSource.getRepository(User);

  /**
   * Najde všechny uživatele s podporou filtrování, řazení a stránkování
   */
  async findAll(queryOptions?: QueryOptions): Promise<PaginatedResult<User>> {
    const { filter, sort, pagination } = queryOptions || {};

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Vytvoření podmínky WHERE z filtru
    const where = filter ? buildWhereCondition(filter) : {};

    // Vytvoření možností řazení
    const order: Record<string, "ASC" | "DESC"> = {};
    if (sort && sort.length > 0) {
      sort.forEach((s) => {
        order[s.field] = s.direction === "asc" ? "ASC" : "DESC";
      });
    } else {
      // Výchozí řazení
      order["createdAt"] = "DESC";
    }

    // Dotaz na celkový počet záznamů
    const total = await this.repository.count({ where });

    // Dotaz na data s použitím filtrů, řazení a stránkování
    const data = await this.repository.find({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

 /**
 * Najde uživatele podle ID
 */
async findById(id: number): Promise<User | null> {
  try {
    const user = await this.repository.findOneBy({ id });
    return user;
  } catch (error) {
    console.error(`Chyba při hledání uživatele s ID ${id}:`, error);
    throw error;
  }
}

  /**
   * Paralelní zpracování více uživatelů
   */
  async processBatchOfUsers(userIds: number[], operation: (user: User) => Promise<void>): Promise<void> {
    // Získání uživatelů podle ID
    const users = await this.repository.findByIds(userIds);

    // Paralelní zpracování každého uživatele s omezením na maximální počet souběžných operací
    await Promise.all(
      users.map((user) =>
        limiter(async () => {
          try {
            await operation(user);
          } catch (error) {
            console.error(`Chyba při zpracování uživatele ${user.id}:`, error);
            throw error;
          }
        })
      )
    );
  }

  /**
   * Vytvoření nového uživatele
   */
  async create(userData: CreateUserInput): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  /**
   * Aktualizace uživatele
   */
  async update(id: number, userData: UpdateUserInput): Promise<User> {
    const user = await this.repository.findOneOrFail({ where: { id } });
    this.repository.merge(user, userData);
    return await this.repository.save(user);
  }

  /**
   * Smazání uživatele
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined &&  result.affected !== null  && result.affected > 0;
  }
}

export const userService = new UserService();