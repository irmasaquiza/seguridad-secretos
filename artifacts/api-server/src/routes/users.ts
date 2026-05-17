import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/users/profile", requireAuth, async (req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.id))
    .limit(1);

  if (!user) {
    res.status(404).json({ mensaje: "Usuario no encontrado" });
    return;
  }

  res.json({
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    createdAt: user.createdAt,
  });
});

/**
 * INSECURE endpoint: acepta cualquier campo del JSON, incluyendo "rol".
 * Vulnerabilidad intencional para demostrar Mass Assignment / escalamiento de privilegios.
 */
router.put("/users/profile/unsafe", requireAuth, async (req, res) => {
  const body = req.body as Record<string, string>;

  type UserUpdate = {
    nombre?: string;
    correo?: string;
    password?: string;
    rol?: "USUARIO" | "ADMIN";
  };

  const update: UserUpdate = {};

  if (typeof body["nombre"] === "string") update.nombre = body["nombre"];
  if (typeof body["correo"] === "string") update.correo = body["correo"];
  if (typeof body["password"] === "string") {
    update.password = await bcrypt.hash(body["password"], 10);
  }

  // VULNERABILIDAD INTENCIONAL: acepta el campo "rol" del cliente sin validación
  if (body["rol"] === "ADMIN" || body["rol"] === "USUARIO") {
    update.rol = body["rol"];
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ mensaje: "No se proporcionaron campos para actualizar" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(update)
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  res.json({
    id: updated.id,
    nombre: updated.nombre,
    correo: updated.correo,
    rol: updated.rol,
    createdAt: updated.createdAt,
  });
});

/**
 * SECURE endpoint: solo permite nombre, correo, password.
 * Rechaza explícitamente campos sensibles como "rol".
 */
router.put("/users/profile/safe", requireAuth, async (req, res) => {
  const body = req.body as Record<string, string>;

  const forbiddenFields = ["rol", "estado", "permisos", "id_usuario", "id"];
  for (const field of forbiddenFields) {
    if (field in body) {
      res.status(400).json({
        mensaje: `Campo no permitido: ${field}`,
        campo: field,
      });
      return;
    }
  }

  type SafeUpdate = { nombre?: string; correo?: string; password?: string };
  const update: SafeUpdate = {};

  if (typeof body["nombre"] === "string") update.nombre = body["nombre"];
  if (typeof body["correo"] === "string") update.correo = body["correo"];
  if (typeof body["password"] === "string") {
    update.password = await bcrypt.hash(body["password"], 10);
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ mensaje: "No se proporcionaron campos permitidos para actualizar" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(update)
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  res.json({
    id: updated.id,
    nombre: updated.nombre,
    correo: updated.correo,
    rol: updated.rol,
    createdAt: updated.createdAt,
  });
});

export default router;
