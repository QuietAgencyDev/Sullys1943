"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@sullys/ui";
import { ApiError, get, patch, post } from "@/lib/api";
import styles from "../ui.module.css";

type NutritionMe = {
  profile: {
    goal?: string | null;
    allergens: string[];
    notes?: string | null;
  } | null;
  plan: {
    id: string;
    name: string;
    description?: string | null;
    days: { day: string; meals: { name: string; calories: number; tags: string[] }[] }[];
  } | null;
};

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  allergens: string[];
};

export default function NutritionPage() {
  const [data, setData] = useState<NutritionMe | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [goal, setGoal] = useState("");
  const [allergens, setAllergens] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [orderMsg, setOrderMsg] = useState<string | null>(null);

  async function load() {
    const [n, m] = await Promise.all([
      get<NutritionMe>("/api/v1/nutrition/me"),
      get<{ items: MenuItem[] }>("/api/v1/kitchen/menu"),
    ]);
    setData(n);
    setMenu(m.items);
    setGoal(n.profile?.goal ?? "");
    setAllergens((n.profile?.allergens ?? []).join(", "));
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message ?? "Failed to load"));
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await patch("/api/v1/nutrition/profile", {
        goal,
        allergens: allergens
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setMsg("Profile saved");
      await load();
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Save failed");
    }
  }

  async function orderItem(id: string) {
    setOrderMsg(null);
    try {
      const res = await post<{ allergenWarnings: string[] }>(
        "/api/v1/kitchen/orders",
        { items: [{ menuItemId: id, quantity: 1 }] },
      );
      setOrderMsg(
        res.allergenWarnings.length
          ? `Ordered with allergen warning: ${res.allergenWarnings.join("; ")}`
          : "Order placed — kitchen ticket opened",
      );
    } catch (err) {
      setOrderMsg(err instanceof ApiError ? err.message : "Order failed");
    }
  }

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Nutrition & Kitchen</p>
      <h1 className={styles.title}>Fuel the work</h1>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Your plan</h2>
        {data?.plan ? (
          <>
            <p>
              <strong>{data.plan.name}</strong>
            </p>
            <p className={styles.muted}>{data.plan.description}</p>
            <ul className={styles.list}>
              {data.plan.days.map((d) => (
                <li key={d.day}>
                  <strong>{d.day}</strong>:{" "}
                  {d.meals.map((m) => m.name).join(" · ")}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.muted}>No meal plan assigned yet.</p>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Allergens & goals</h2>
        <form onSubmit={saveProfile} className={styles.form}>
          <label className={styles.field}>
            <span>Goal</span>
            <input
              className={styles.input}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="cut / maintain / bulk"
            />
          </label>
          <label className={styles.field}>
            <span>Allergens (comma-separated)</span>
            <input
              className={styles.input}
              value={allergens}
              onChange={(e) => setAllergens(e.target.value)}
              placeholder="peanuts, dairy"
            />
          </label>
          {msg ? <p className={styles.muted}>{msg}</p> : null}
          <Button type="submit">Save profile</Button>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Kitchen menu</h2>
        {orderMsg ? <p className={styles.muted}>{orderMsg}</p> : null}
        <ul className={styles.list}>
          {menu.map((item) => (
            <li key={item.id} className={styles.row}>
              <div>
                <strong>{item.name}</strong>
                <div className={styles.muted}>
                  ${(item.priceCents / 100).toFixed(2)}
                  {item.allergens.length
                    ? ` · contains ${item.allergens.join(", ")}`
                    : ""}
                </div>
              </div>
              <Button type="button" onClick={() => orderItem(item.id)}>
                Pre-order
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
