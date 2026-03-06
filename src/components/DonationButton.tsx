import { useState } from "react";
import { Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const DonationButton = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<"mtn" | "airtel" | null>(null);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const providers = {
    mtn: {
      name: "MTN Mobile Money",
      recipientNumber: "0785393756",
      color: "from-yellow-400 to-yellow-500",
      bgHover: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
      ussd: (amt: string, sender: string) => `*165*1*0785393756*${amt}#`,
    },
    airtel: {
      name: "Airtel Money",
      recipientNumber: "0755692470",
      color: "from-red-500 to-red-600",
      bgHover: "hover:bg-red-50 dark:hover:bg-red-950/30",
      ussd: (amt: string, sender: string) => `*185*9*0755692470*${amt}#`,
    },
  };

  const handleDonate = () => {
    if (!selected || !amount || !phoneNumber) return;
    const provider = providers[selected];
    const ussd = provider.ussd(amount, phoneNumber);
    window.location.href = `tel:${encodeURIComponent(ussd)}`;
  };

  const handleBack = () => {
    setSelected(null);
    setAmount("");
    setPhoneNumber("");
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setAmount("");
    setPhoneNumber("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-fade-in"
        aria-label="Make a donation"
      >
        <Heart className="h-5 w-5 fill-current" />
        <span className="font-semibold text-sm">Donate</span>
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {selected ? `Donate via ${providers[selected].name}` : "Support BASAMU"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {selected
                ? `Sending to ${providers[selected].recipientNumber}`
                : "Choose your mobile money provider"}
            </DialogDescription>
          </DialogHeader>

          {!selected ? (
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={() => setSelected("mtn")}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border ${providers.mtn.bgHover} transition-all duration-200 hover:scale-105 hover:border-yellow-400`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-md">
                  <span className="text-yellow-900 font-extrabold text-lg">MTN</span>
                </div>
                <span className="font-semibold text-sm text-foreground">MTN MoMo</span>
                <span className="text-xs text-muted-foreground">0785393756</span>
              </button>

              <button
                onClick={() => setSelected("airtel")}
                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border ${providers.airtel.bgHover} transition-all duration-200 hover:scale-105 hover:border-red-500`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                  <span className="text-white font-extrabold text-lg">Airtel</span>
                </div>
                <span className="font-semibold text-sm text-foreground">Airtel Money</span>
                <span className="text-xs text-muted-foreground">0755692470</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="donor-phone" className="text-sm font-medium text-foreground">
                  Your {providers[selected].name} number
                </label>
                <Input
                  id="donor-phone"
                  type="tel"
                  placeholder="e.g. 0771234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="donation-amount" className="text-sm font-medium text-foreground">
                  Amount to donate (UGX)
                </label>
                <Input
                  id="donation-amount"
                  type="number"
                  min="500"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg h-12"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleDonate}
                  disabled={!amount || Number(amount) < 500 || !phoneNumber || phoneNumber.length < 10}
                  className="flex-1 gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Donate UGX {amount ? Number(amount).toLocaleString() : "0"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                This will open your phone dialer with the USSD code. Confirm the payment with your PIN.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonationButton;
