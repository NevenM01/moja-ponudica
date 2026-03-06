import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setOnboardingDone } from "@/lib/onboarding";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Share2,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    title: "Dobrodošli u MojaPonudica",
    description:
      "Ovdje možete brzo kreirati i upravljati ponudama za svoje klijente. Prođimo kroz osnove.",
    icon: Sparkles,
  },
  {
    title: "Dashboard",
    description:
      "Ovdje vidite pregled: ukupan broj ponuda, prihvaćene, odbijene i one na čekanju. Bilješke i grafikon pokazuju aktivnost po mjesecima.",
    icon: LayoutDashboard,
  },
  {
    title: "Ponude i nova ponuda",
    description:
      "U izborniku: Ponude — lista svih ponuda s pretraživanjem. Nova ponuda — kreirajte novu ponudu za klijenta. Link za pregled možete poslati klijentu.",
    icon: FileText,
  },
  {
    title: "Podijelite link i postavke",
    description:
      "Kada ponuda bude spremna, kopirajte link za pregled i pošaljite ga klijentu. Postavke firme i računa nalaze se u Moj račun → Postavke.",
    icon: Share2,
  },
];

interface WelcomeTutorialProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function WelcomeTutorial({ open, onClose, userId }: WelcomeTutorialProps) {
  const [step, setStep] = useState(1);
  const totalSteps = STEPS.length;

  const handleClose = () => {
    setOnboardingDone(userId);
    setStep(1);
    onClose();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
    }
  };

  const current = STEPS[step - 1];
  const Icon = current.icon;
  const isLast = step === totalSteps;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{current.title}</DialogTitle>
              <DialogDescription className="mt-1.5 text-left">
                {current.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-center gap-1.5 py-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i + 1 === step ? "bg-primary" : "bg-muted"
              }`}
              aria-hidden
            />
          ))}
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={handleClose}
          >
            Preskoči
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isLast) {
                handleClose();
              } else {
                setStep((s) => s + 1);
              }
            }}
          >
            {isLast ? "Završi" : "Dalje"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
