import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignIn Page | CT Admin",
  description: "Signin Page CT Admin Dashboard",
};

export default function SignIn() {
  return <SignInForm />;
}
