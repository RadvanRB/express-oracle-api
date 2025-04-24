import { z } from "zod";

// Validační schéma pro vytvoření uživatele
export const createUserSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Heslo musí obsahovat alespoň 8 znaků, včetně velkého písmena, malého písmena, čísla a speciálního znaku",
    }),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
});

// Validační schéma pro aktualizaci uživatele
export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Validační schéma pro změnu hesla
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Heslo musí obsahovat alespoň 8 znaků, včetně velkého písmena, malého písmena, čísla a speciálního znaku",
    }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

// Typy odvozené ze schématu
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;