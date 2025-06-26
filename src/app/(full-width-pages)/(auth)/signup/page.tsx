import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp Page | CT Admin",
  description: "SignUp Page CT Admin Dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
