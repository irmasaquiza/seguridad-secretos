import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ mensaje: "Datos inválidos", campo: null });
    return;
  }

  const { nombre, correo, password } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.correo, correo)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ mensaje: "El correo ya está registrado", campo: "correo" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db.insert(usersTable).values({
    nombre,
    correo,
    password: hashedPassword,
    rol: "USUARIO",
  }).returning();

  const token = signToken({ id: user.id, correo: user.correo, rol: user.rol });

  res.status(201).json({
    token,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ mensaje: "Datos inválidos", campo: null });
    return;
  }

  const { correo, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.correo, correo)).limit(1);
  if (!user) {
    res.status(401).json({ mensaje: "Credenciales incorrectas" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ mensaje: "Credenciales incorrectas" });
    return;
  }

  const token = signToken({ id: user.id, correo: user.correo, rol: user.rol });

  res.json({
    token,
    usuario: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
      createdAt: user.createdAt,
    },
  });
});

export default router;
