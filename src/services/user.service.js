// services/user.service.js

import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

export class UserService {
  /**
   * Get users with pagination, search, and filters
   */
  async getUsers(params) {
    const { page, limit, search, role } = params;
    const skip = (page - 1) * limit;

    const where = {
      AND: [],
    };

    // Search filter
    if (search && search.trim() !== "") {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Role filter
    if (role) {
      where.AND.push({ role });
    }

    // If no filters, remove AND
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Create new user
   */
  async createUser(data) {
    const { name, email, password, role = "MEMBER" } = data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Reset user password
   */
  async resetPassword(id, newPassword) {
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Export users to CSV
   */
  async exportUsers(params) {
    const { search, role } = params;

    const where = {
      AND: [],
    };

    // Search filter
    if (search && search.trim() !== "") {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Role filter
    if (role) {
      where.AND.push({ role });
    }

    // If no filters, remove AND
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate CSV
    const headers = ["ID", "Name", "Email", "Role", "Created At", "Updated At"];
    const csvRows = [headers.join(",")];

    for (const user of users) {
      const row = [
        user.id,
        user.name || "",
        user.email,
        user.role,
        new Date(user.createdAt).toISOString(),
        new Date(user.updatedAt).toISOString(),
      ];
      csvRows.push(row.map((field) => `"${field}"`).join(","));
    }

    return csvRows.join("\n");
  }
}
