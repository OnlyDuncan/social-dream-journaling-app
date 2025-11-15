import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <SignIn
            appearance={{
                elements: {
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                    card: "shadow-lg rounded-2xl",
                },
                variables: {
                    colorPrimary: "#2563eb",
                    colorText: "#111827",
                    fontFamily: "Inter, sans-serif",
                },
            }}
        />
    );
}