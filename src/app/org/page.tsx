"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

// Plan color/label maps
const PLAN_LABELS: Record<string, string> = { trial: "Trial", starter: "Starter", professional: "Professional", enterprise: "Enterprise" };
const PLAN_COLORS: Record<string, string> = {
  trial: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  professional: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};
const ROLE_LABELS: Record<string, string> = { admin: "Administrat\u00f6r", member: "Medlem", viewer: "L\u00e4sbeh\u00f6righet" };

interface OrgMember {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  role: string;
  joinedAt: string;
}

interface OrgInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  maxUsers: number;
  memberCount: number;
  caseCount: number;
  members: OrgMember[];
  invitations: OrgInvitation[];
}

export default function OrgPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const isAdmin = userRole === "admin";

  const fetchOrg = () => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((data) => {
        setOrg(data.organization);
        setUserRole(data.userRole);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrg(); }, []);

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await fetch("/api/org/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviteEmail("");
    setInviting(false);
    fetchOrg();
  };

  const revokeInvite = async (invitationId: string) => {
    await fetch("/api/org/invitations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
    });
    fetchOrg();
  };

  const removeMember = async (userId: string) => {
    await fetch("/api/org/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    fetchOrg();
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Laddar...</p></div>;
  if (!org) return <div className="flex h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Du tillh\u00f6r ingen organisation.</p></div>;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Hem</Link>
            <span>/</span>
            <span className="text-foreground">Organisation</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Icon name="building-2" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{org.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${PLAN_COLORS[org.plan] ?? PLAN_COLORS.trial}`}>
                  {PLAN_LABELS[org.plan] ?? org.plan}
                </span>
                <span className="text-xs text-muted-foreground">{org.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-4xl space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Medlemmar", value: `${org.memberCount} av ${org.maxUsers === -1 ? "\u221E" : org.maxUsers}`, icon: "users" },
            { label: "Upphandlingar", value: String(org.caseCount), icon: "clipboard-list" },
            { label: "V\u00e4ntande inbjudningar", value: String(org.invitations.length), icon: "mail" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon name={stat.icon} size={14} className="text-muted-foreground/50" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">{stat.label}</p>
              </div>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Members */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Medlemmar</h2>
          <div className="space-y-2">
            {org.members.map((m) => (
              <div key={m.userId} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {(m.firstName || m.email)[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {[m.firstName, m.lastName].filter(Boolean).join(" ") || m.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{ROLE_LABELS[m.role] ?? m.role}</span>
                {isAdmin && m.userId !== org.members.find((x) => x.role === "admin")?.userId && (
                  <button onClick={() => removeMember(m.userId)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Invitations (admin only) */}
        {isAdmin && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Bjud in</h2>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="E-postadress"
                className="flex-1 rounded-xl border border-border/60 bg-card px-4 py-2 text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-xl border border-border/60 bg-card px-3 py-2 text-sm"
              >
                <option value="member">Medlem</option>
                <option value="viewer">L\u00e4sbeh\u00f6righet</option>
                <option value="admin">Administrat\u00f6r</option>
              </select>
              <button
                onClick={invite}
                disabled={inviting || !inviteEmail.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
              >
                <Icon name="send" size={14} />
                {inviting ? "Skickar..." : "Bjud in"}
              </button>
            </div>

            {org.invitations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">V\u00e4ntande inbjudningar</p>
                {org.invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/50 px-4 py-3">
                    <Icon name="mail" size={14} className="text-muted-foreground/50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{inv.email}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {ROLE_LABELS[inv.role] ?? inv.role} · Utg\u00e5r {new Date(inv.expiresAt).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                    <button onClick={() => revokeInvite(inv.id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                      Avbryt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Back link */}
        <div className="pt-2 pb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <Icon name="arrow-left" size={14} />
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}
