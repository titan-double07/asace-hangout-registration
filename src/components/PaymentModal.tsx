"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onProofUpload: (file: File) => void;
  isLoading?: boolean;
}

export function PaymentModal({
  open,
  onClose,
  onProofUpload,
  isLoading
}: PaymentModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) return;
    onProofUpload(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Make payment to the account below, then upload proof of payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Account Name</Label>
            <p className="text-sm font-medium">Hangout Committee</p>
          </div>
          <div>
            <Label>Account Number</Label>
            <p className="text-sm font-medium">1234567890</p>
          </div>
          <div>
            <Label>Bank</Label>
            <p className="text-sm font-medium">GTBank</p>
          </div>

          <div className="mt-4">
            <Label htmlFor="proof">Upload Payment Proof</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || isLoading} >
            {isLoading ? "Uploading..." : "Upload Proof of Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
