import { SignIn } from "@clerk/nextjs";
import { Icon } from "@/components/ui/icon";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <Icon name="scale" size={28} className="text-primary" />
            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Critero</h1>
              <p className="text-[10px] text-muted-foreground tracking-wide">Upphandling LOU</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Logga in för att hantera dina upphandlingar
          </p>
        </div>

        {/* Clerk SignIn component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border border-border rounded-2xl",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "rounded-xl",
                formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-xl",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground">
          &copy; Critero Consulting AB
        </p>
      </div>
    </div>
  );
}
