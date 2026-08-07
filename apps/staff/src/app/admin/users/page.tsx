"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, patch, post } from "@/lib/api";
import { me } from "@/lib/auth";
import styles from "../../staff.module.css";

type StaffUser = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  disabled: boolean;
  invitedAt: string | null;
  createdAt: string;
};

const ROLES = [
  { value: "front_desk", label: "Front desk" },
  { value: "coach", label: "Coach" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("front_desk");
  const [password, setPassword] = useState("password123");

  const refresh = useCallback(async () => {
    const res = await get<{ users: StaffUser[] }>("/api/v1/admin/users");
    setUsers(res.users);
  }, []);

  useEffect(() => {
    me()
      .then((data) => {
        const roleName = data?.user?.role ?? data?.role ?? null;
        setViewerRole(roleName);
        if (roleName !== "owner" && roleName !== "admin") {
          setError("Owner or admin login required.");
          return;
        }
        return refresh();
      })
      .catch(() => setError("Sign in as owner@ or admin@ from Staff home."));
  }, [refresh]);

  async function invite(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await post<{
        user: StaffUser;
        temporaryPassword: string;
      }>("/api/v1/admin/users", {
        name: name.trim(),
        email: email.trim(),
        role,
        password: password.trim(),
      });
      setMessage(
        `Invited ${res.user.name} (${res.user.role}). Temp password: ${res.temporaryPassword}`,
      );
      setName("");
      setEmail("");
      setPassword("password123");
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invite failed");
    } finally {
      setPending(false);
    }
  }

  async function setDisabled(user: StaffUser, disabled: boolean) {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      await patch(`/api/v1/admin/users/${user.id}`, { disabled });
      setMessage(
        `${disabled ? "Disabled" : "Re-enabled"} ${user.name} (${user.email})`,
      );
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  async function changeRole(user: StaffUser, nextRole: string) {
    if (nextRole === user.role) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      await patch(`/api/v1/admin/users/${user.id}`, { role: nextRole });
      setMessage(`Updated ${user.name} → ${nextRole}`);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Role update failed");
    } finally {
      setPending(false);
    }
  }

  const canManage = viewerRole === "owner" || viewerRole === "admin";

  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>ADMIN</p>
      <h1 className={styles.title}>Staff users</h1>
      <p className={styles.copy}>
        Invite desk/coach/admin accounts, change roles, and disable access
        without reseeding.
      </p>
      <p>
        <Link href="/">← Staff home</Link>
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.hint}>{message}</p> : null}

      {canManage ? (
        <>
          <section className={styles.panel} style={{ maxWidth: 520 }}>
            <h2 className={styles.sectionTitle}>Invite staff</h2>
            <form className={styles.panel} onSubmit={invite}>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Role</span>
                <select
                  className={styles.input}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Temporary password</span>
                <input
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Invite staff"}
              </Button>
            </form>
          </section>

          <section className={styles.panel} style={{ maxWidth: 720, marginTop: "1.5rem" }}>
            <h2 className={styles.sectionTitle}>Directory</h2>
            {users.length === 0 ? (
              <p className={styles.hint}>No staff users found.</p>
            ) : (
              <ul className={styles.list}>
                {users.map((u) => (
                  <li key={u.id} className={styles.listRow}>
                    <div>
                      <strong>
                        {u.name}{" "}
                        {u.disabled ? (
                          <span className={styles.badgeWarn}>disabled</span>
                        ) : null}
                      </strong>
                      <p className={styles.hint}>
                        {u.email} · {u.role}
                        {u.invitedAt
                          ? ` · invited ${new Date(u.invitedAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <div className={styles.row}>
                      <select
                        className={styles.input}
                        style={{ minHeight: 36, width: "auto" }}
                        value={u.role}
                        disabled={pending}
                        onChange={(e) => changeRole(u, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => setDisabled(u, !u.disabled)}
                      >
                        {u.disabled ? "Enable" : "Disable"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </main>
  );
}
