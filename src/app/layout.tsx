import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Base64 Tools - Codificador e Decodificador Profissional",
  description: "Uma ferramenta moderna para codificar e decodificar textos em Base64",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Uma ferramenta moderna para codificar e decodificar textos em Base64 de modo fácil e seguro." />
        <meta name="theme-color" content="#18181b" />
        <link rel="icon" href="/favicon.ico" />
        <title>Base64 Tools - Codificador e Decodificador Profissional</title>
      </Head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <div className="app-container max-w-2xl w-full mx-auto p-4">
            {children}
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
