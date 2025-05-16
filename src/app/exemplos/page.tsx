"use client";
import { Card } from "@/components/ui/card";
import { Type, Lightbulb } from "lucide-react";

export default function ExemplosPage() {
  return (
    <main className="main-content">
      <section className="space-y-6 mb-12 mt-4">
        <h1 className="text-3xl font-bold text-center mb-4">
          Exemplos práticos de uso do Base64
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="feature-card">
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Para Desenvolvedores
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold">Imagens em Data URI:</p>
                <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">{'<img src="data:image/jpeg;base64,/9j/4AAQSkZJRg..." />'}</pre>
                <p className="font-semibold mt-3">JWT (JSON Web Tokens):</p>
                <p>
                  Os JWTs têm três partes separadas por pontos, todas codificadas em Base64:
                  <span className="block font-mono mt-1">header.payload.signature</span>
                </p>
                <p className="font-semibold mt-3">Armazenamento de Binários:</p>
                <p>
                  Ao armazenar arquivos binários em bancos de dados ou JSON, a codificação Base64
                  permite transformar dados não imprimíveis em strings seguras.
                </p>
              </div>
            </div>
          </Card>
          <Card className="feature-card">
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Uso Cotidiano
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="font-semibold">Email com Anexos:</p>
                <p>
                  Quando você anexa um arquivo a um email, ele é convertido em Base64 para transitar
                  de forma segura pela internet.
                </p>
                <p className="font-semibold mt-3">QR Codes:</p>
                <p>
                  Muitos QR codes armazenam informações em Base64, especialmente quando incluem
                  imagens ou dados estruturados.
                </p>
                <p className="font-semibold mt-3">Transferências Seguras:</p>
                <p>
                  Para enviar arquivos ou textos com caracteres especiais de forma segura,
                  a codificação Base64 garante que todos os bytes serão preservados sem corrupção.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
