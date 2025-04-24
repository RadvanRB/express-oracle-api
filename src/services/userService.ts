// src/services/userService.ts
import { AbstractService } from "./AbstractService";
import { User } from "../models/User";

class UserService extends AbstractService<User> {
  constructor() {
    super(User, "user");
  }

  // Specifické metody pro UserService
}

export const userService = new UserService();