import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  // Map NextAuth error codes to human-readable messages
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to access this page.",
    Verification: "The verification token has expired or has already been used.",
    OAuthSignin: "Error starting OAuth sign-in flow.",
    OAuthCallback: "Error completing OAuth sign-in flow.",
    OAuthCreateAccount: "Could not create user account using OAuth provider.",
    EmailCreateAccount: "Could not create user account using email provider.",
    Callback: "Error in the OAuth callback handler route.",
    OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "Check your email for a verification link.",
    CredentialsSignin: "Invalid email or password.",
    default: "An unknown authentication error occurred.",
  };

  const errorCode = resolvedSearchParams.error || "default";
  const errorMessage = errorMessages[errorCode] || errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription className="pt-2 text-base text-gray-700">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}