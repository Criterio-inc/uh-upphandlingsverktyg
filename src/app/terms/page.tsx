import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border/60 bg-card/60">
        <div className="px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/cases" className="hover:text-foreground transition-colors">Upphandlingar</Link>
            <span>/</span>
            <span className="text-foreground">Villkor & information</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Villkor & information</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Användarvillkor, datahantering och kontaktuppgifter
          </p>
        </div>
      </div>

      <div className="px-8 py-8 max-w-3xl space-y-8">
        {/* Användarvillkor */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Icon name="file-text" size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Användarvillkor</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Critero Upphandling LOU ("Tjänsten") tillhandahålls av Critero Consulting AB
              som ett verktyg för stöd vid offentlig upphandling enligt Lagen om offentlig
              upphandling (LOU).
            </p>
            <p>
              Tjänsten erbjuds i sin nuvarande form utan garantier avseende tillgänglighet,
              korrekthet eller fullständighet. Användaren ansvarar själv för att verifiera
              att upphandlingsunderlag uppfyller gällande lagkrav.
            </p>
            <p>
              Critero Consulting AB förbehåller sig rätten att uppdatera eller förändra
              tjänsten utan föregående meddelande. Obehörig åtkomst, automatiserad
              datainsamling eller användning i strid med svensk lag är inte tillåten.
            </p>
          </div>
        </section>

        {/* Data- och personuppgiftshantering */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Icon name="shield-alert" size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Data- och personuppgiftshantering</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Upphandlingsdata som skapas i Critero lagras i en molndatabas (Turso/LibSQL)
              med kryptering i vila och under transport. All kommunikation sker via HTTPS.
            </p>
            <p>
              Tjänsten samlar inte in personuppgifter utöver vad som krävs för
              autentisering (e-post och namn vid inloggning). Inga personuppgifter
              delas med tredje part.
            </p>
            <p>
              Upphandlingsdata som du matar in ägs av dig/din organisation. Du kan
              när som helst exportera all data via JSON-export och begära radering
              genom att kontakta oss.
            </p>
            <h3 className="text-sm font-semibold text-foreground pt-1">Cookies</h3>
            <p>
              Tjänsten använder enbart tekniskt nödvändiga cookies (sessionscookie för
              inloggning). Inga spårningscookies eller analytics från tredje part används.
            </p>
          </div>
        </section>

        {/* Kontaktuppgifter */}
        <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Icon name="users" size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Kontakt</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/60 p-4 space-y-1">
                <p className="text-xs font-semibold text-foreground">Critero Consulting AB</p>
                <p className="text-xs">Organisationsnummer: [att fylla i]</p>
              </div>
              <div className="rounded-xl border border-border/60 p-4 space-y-1">
                <p className="text-xs font-semibold text-foreground">E-post</p>
                <a
                  href="mailto:kontakt@criteroconsulting.se"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  kontakt@criteroconsulting.se
                </a>
              </div>
            </div>
            <p>
              Vid frågor om dina uppgifter, dataskydd eller om du vill begära radering
              av din data, kontakta oss via e-post ovan.
            </p>
          </div>
        </section>

        {/* Tillbaka */}
        <div className="pt-2">
          <Link
            href="/cases"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
          >
            <Icon name="arrow-left" size={14} />
            Tillbaka till upphandlingar
          </Link>
        </div>
      </div>
    </div>
  );
}
