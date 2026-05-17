import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, count, gte } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      nombre: usersTable.nombre,
      correo: usersTable.correo,
      rol: usersTable.rol,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.json(users);
});

router.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  const [totalResult] = await db.select({ total: count() }).from(usersTable);
  const [adminResult] = await db
    .select({ total: count() })
    .from(usersTable)
    .where(eq(usersTable.rol, "ADMIN"));

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [recentResult] = await db
    .select({ total: count() })
    .from(usersTable)
    .where(gte(usersTable.createdAt, sevenDaysAgo));

  res.json({
    totalUsuarios: totalResult?.total ?? 0,
    totalAdmins: adminResult?.total ?? 0,
    registrosRecientes: recentResult?.total ?? 0,
  });
});

export default router;
