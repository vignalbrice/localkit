import { pgTable, text, timestamp, uuid, uniqueIndex, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // from Auth.js adapter (we'll keep simple)
    email: text("email"),
    name: text("name"),
    image: text("image"),
    passwordHash: text("password_hash"),
    plan: text("plan").notNull().default("free"), // "free", "pro", "enterprise"
    planUpdatedAt: timestamp("plan_updated_at").defaultNow()
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email)
  })
);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  localesPath: text("locales_path").notNull().default("locales"),
  defaultBranch: text("default_branch").notNull().default("main"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // "owner", "admin", "member"
    addedAt: timestamp("added_at").notNull().defaultNow()
  },
  (t) => ({
    uniq: uniqueIndex("team_members_uniq").on(t.userId, t.projectId)
  })
);

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    namespace: text("namespace").notNull(),
    dotKey: text("dot_key").notNull(),
    value: text("value").notNull(),
    placeholders: jsonb("placeholders").$type<string[]>().notNull().default([]),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
  },
  (t) => ({
    uniq: uniqueIndex("entries_uniq").on(t.projectId, t.locale, t.namespace, t.dotKey)
  })
);

export const githubInstallations = pgTable("github_installations", {
  projectId: uuid("project_id")
    .primaryKey()
    .references(() => projects.id, { onDelete: "cascade" }),
  installationId: text("installation_id").notNull(),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  defaultBranch: text("default_branch").notNull().default("main"),
  localesPath: text("locales_path").notNull().default("locales"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const autoSyncConfig = pgTable("auto_sync_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(true),
  syncIntervalMinutes: integer("sync_interval_minutes").notNull().default(30),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (t) => ({
  uniq: uniqueIndex("auto_sync_config_project_id_unique").on(t.projectId)
}));

// Relations (optionnel mais utile pour les requêtes)
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  teamMemberships: many(teamMembers)
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerUserId],
    references: [users.id]
  }),
  entries: many(entries),
  teamMembers: many(teamMembers),
  githubInstallation: one(githubInstallations),
  autoSyncConfig: one(autoSyncConfig)
}));

export const entriesRelations = relations(entries, ({ one }) => ({
  project: one(projects, {
    fields: [entries.projectId],
    references: [projects.id]
  })
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [teamMembers.projectId],
    references: [projects.id]
  })
}));

export const githubInstallationsRelations = relations(githubInstallations, ({ one }) => ({
  project: one(projects, {
    fields: [githubInstallations.projectId],
    references: [projects.id]
  })
}));

export const autoSyncConfigRelations = relations(autoSyncConfig, ({ one }) => ({
  project: one(projects, {
    fields: [autoSyncConfig.projectId],
    references: [projects.id]
  })
}));
