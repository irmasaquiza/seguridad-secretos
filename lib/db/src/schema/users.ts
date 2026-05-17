import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rolEnum = pgEnum("rol", ["USUARIO", "ADMIN"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  correo: text("correo").notNull().unique(),
  password: text("password").notNull(),
  rol: rolEnum("rol").notNull().default("USUARIO"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
