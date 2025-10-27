import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { PaymentModal } from "./PaymentModal";

// 🔹 Validation Schema

const formSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters."),
  dob: z.string().min(1, "Date of Birth is required."),
  gender: z.enum(["male", "female", "other"]),
  hobbies: z.string().min(5, "Hobbies are required."),
  email: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

// 🔹 Component

export function RegistrationForm() {
  const [showModal, setShowModal] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      gender: "other",
      hobbies: "",
    },
  });
  useEffect(() => {
    // Check what user/session the client is using
    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();
      console.log("🔎 Supabase session user:", data?.user || "No user", error);
    }

    checkSession();
  }, []);

  // 🔹 Upload proof to Supabase

  async function uploadPaymentProof(file: File, fullName: string) {
    const fileExt = file.name.split(".").pop();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const dateString = `${day}-${month}-${year}`;

    const fileName = `${fullName.replace(
      /\s+/g,
      "_"
    )}_${dateString}.${fileExt}`;
    const filePath = fileName;

    // Upload file to private bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payment_proofs")
      .upload(filePath, file, { upsert: true }); // allow overwrite if name collides

    if (uploadError) {
      toast.error("❌ Upload error:", { description: uploadError.message });
      // cons.error("❌ Upload error:", { description: uploadError.message });
      throw uploadError;
    }

    console.log("✅ Uploaded file:", uploadData?.path);

    // Create signed URL (only if bucket is private)
    const { data: signed, error: signError } = await supabase.storage
      .from("payment_proofs")
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7); // 7 days

    if (signError) {
      console.error("❌ Signed URL error:", signError.message);
      throw signError;
    }

    console.log("✅ Signed URL:", signed.signedUrl);

    return signed?.signedUrl ?? null;
  }

  // 🔹 Handle form submit

  async function onSubmit(values: FormValues) {
    // First store form data locally, then open modal
    setFormValues(values);
    setShowModal(true);
  }

  // 🔹 Handle file upload after payment

  async function handleProofUpload(file: File) {
    if (!formValues) return;
    setIsSubmitting(true);

    try {
      const proofUrl = await uploadPaymentProof(file, formValues.fullName);
      console.log("🚀 ~ handleProofUpload ~ proofUrl:", proofUrl);

      // Insert user data into Supabase
      const { error } = await supabase.from("registrations").insert([
        {
          full_name: formValues.fullName,
          email: formValues.email,
          dob: formValues.dob,
          gender: formValues.gender,
          hobbies: formValues.hobbies,
          payment_status: "pending",
          payment_proof_url: proofUrl,
        },
      ]);

      if (error) throw error;

      toast.success("Registration submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting registration:", err);
      // toast.error("Error uploading proof or saving data. Please try again.");
    } finally {
      setShowModal(false);
      setIsSubmitting(false);
      // form.reset();
    }
  }

  // 🔹 UI

  return (
    <>
      <Card className="w-full sm:max-w-lg">
        <CardHeader>
          <CardTitle>Register for the Hangout</CardTitle>
          <CardDescription>
            Fill out the form below to register for the hangout. After
            successful payment verification, you will be added to the WhatsApp
            group.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <Input
                    id={field.name}
                    placeholder="Your full name"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="Your email"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Date of Birth */}
            <Controller
              name="dob"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Date of Birth</FieldLabel>
                  <Input id={field.name} type="date" {...field} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Gender */}
            <Controller
              name="gender"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Hobbies */}
            <Controller
              name="hobbies"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Hobbies</FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder="What are your hobbies?"
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Proceed to Payment"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <PaymentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onProofUpload={handleProofUpload}
        isLoading={isSubmitting}
      />
    </>
  );
}
