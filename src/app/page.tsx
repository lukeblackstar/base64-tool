"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import copy from "copy-to-clipboard";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  ClipboardCopy,
  Code,
  Eraser,
  FileCode,
  RefreshCcw,
  Shield,
  Github,
  Lightbulb,
  Zap,
  History,
  X,
  Clock,
  Type,
  ArrowUp,
  Download,
  Upload
} from "lucide-react";

type HistoryEntry = {
  id: string;
  input: string;
  output: string;
  type: 'encode' | 'decode';
  timestamp: number;
};

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [realtimePreview, setRealtimePreview] = useState("");
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>("base64-history", []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [importedFileType, setImportedFileType] = useState<string | null>(null);

  useEffect(() => {
    if (!inputText) {
      setRealtimePreview("");
      return;
    }

    try {
      try {
        const decoded = Buffer.from(inputText, "base64").toString("utf-8");
        if (decoded !== inputText) {
          setRealtimePreview(`Decodificado: "${decoded.length > 30 ? decoded.substring(0, 30) + '...' : decoded}"`);
          return;
        }
      } catch {}

      const encoded = Buffer.from(inputText, "utf-8").toString("base64");
      setRealtimePreview(`Codificado: "${encoded.length > 30 ? encoded.substring(0, 30) + '...' : encoded}"`);
    } catch {
      setRealtimePreview("");
    }
  }, [inputText]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onload = function (ev) {
        const result = ev.target?.result as string;
        setInputText(result.split(",")[1] || "");
        setImagePreviewUrl(result);
        setImportedFileType("img");
        toast("Imagem carregada! Agora você pode converter ou baixar.");
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = function (ev) {
        setInputText(ev.target?.result as string || "");
        setImagePreviewUrl(null);
        setImportedFileType(file.type);
        toast("Arquivo carregado para conversão");
      };
      reader.readAsText(file);
    }
  }

  function handleDecodeFileDownload() {
    if (!outputText) return;
    try {
      const bin = Uint8Array.from(atob(outputText), c => c.charCodeAt(0));
      const blob = new Blob([bin]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "arquivo_decodificado";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Falha ao gerar arquivo decodificado! Isso não é uma base64 válida para arquivo.");
    }
  }

  useEffect(() => {
    if (outputText && /^([A-Za-z0-9+/=\s]+)$/.test(outputText)) {
      const possibleTypes = ["jpeg", "png", "gif", "webp"];
      let found = false;
      for (const type of possibleTypes) {
        const dataUrl = `data:image/${type};base64,${outputText}`;
        const img = new window.Image();
        img.onload = () => {
          if (!found) {
            setImagePreviewUrl(dataUrl);
            found = true;
          }
        };
        img.onerror = () => {};
        img.src = dataUrl;
      }
    } else {
      setImagePreviewUrl(null);
    }
  }, [outputText]);

  const addToHistory = (input: string, output: string, type: 'encode' | 'decode') => {
    const updatedHistory = [
      {
        id: Date.now().toString(),
        input,
        output,
        type,
        timestamp: Date.now()
      },
      ...history,
    ].slice(0, 10);

    setHistory(updatedHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    toast("Histórico apagado", {
      description: "Todas as conversões anteriores foram removidas."
    });
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setInputText(entry.input);
    setOutputText(entry.output);
    toast("Item do histórico carregado", {
      description: `Conversão de ${entry.type === 'encode' ? 'codificação' : 'decodificação'} restaurada.`
    });
    setIsHistoryOpen(false);
  };

  const handleEncode = () => {
    setErrorText("");
    if (!inputText) {
      setOutputText("");
      setImportedFileType(null);
      return;
    }
    try {
      const encoded = Buffer.from(inputText, "utf-8").toString("base64");
      setOutputText(encoded);
      addToHistory(inputText, encoded, 'encode');
      setImportedFileType(null);
      toast.success("Texto do arquivo convertido para Base64 com sucesso!", {
        description: "Resultado pronto para ser copiado ou baixado.",
      });
    } catch (e) {
      setErrorText("Ocorreu um erro ao codificar o conteúdo do arquivo. Verifique se há problemas no arquivo e tente novamente.");
      setOutputText("");
      setImportedFileType(null);
      toast.error("Erro ao codificar", { description: "Não foi possível converter o arquivo. Tente um arquivo diferente." });
    }
  };

  const handleDecode = () => {
    setErrorText("");
    if (!inputText) {
      setOutputText("");
      return;
    }
    try {
      const base64Regex = /^[A-Za-z0-9+/=]*$/;
      if (!base64Regex.test(inputText.replace(/\s/g, ''))) {
        throw new Error("Parece que o texto não está em formato Base64 válido. Base64 usa apenas letras, números, +, / e =");
      }

      const decoded = Buffer.from(inputText, "base64").toString("utf-8");
      setOutputText(decoded);
      addToHistory(inputText, decoded, 'decode');
      toast.success("Decodificação concluída!", {
        description: "O texto Base64 foi convertido de volta ao formato original."
      });
    } catch (e: any) {
      setErrorText(`Não foi possível decodificar: ${e.message || "Este não parece ser um texto Base64 válido."}`);
      setOutputText("");
      toast.error("Falha na decodificação", {
        description: "Verifique se o texto está realmente em formato Base64 sem alterações."
      });
    }
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setErrorText("");
    setImagePreviewUrl(null);
    setImportedFileType(null);
    toast("Tudo limpo! Pronto para uma nova conversão.", {
      icon: <Eraser className="h-5 w-5" />,
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;

    copy(text);
    toast.success(`${type} copiado!`, {
      description: "O texto foi copiado para sua área de transferência."
    });
  };

  const swapTextAreas = () => {
    if (!outputText) return;

    setInputText(outputText);
    setOutputText("");
    toast("Resultado movido para o campo de entrada", {
      description: "Agora você pode fazer uma nova operação com este texto.",
      icon: <RefreshCcw className="h-5 w-5" />,
    });
  };

  function downloadResult(text: string) {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resultado_base64.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="main-content">
      <header className="hero-gradient text-white py-8 px-4 mb-8 dark:border-b dark:border-gray-800">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Base64 Tools</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="flex items-center gap-2 hover:underline"
                title="Ver histórico de conversões"
              >
                <History className="h-5 w-5" />
                <span className="hidden sm:inline">Histórico</span>
              </button>
              <ThemeToggle />
              <a href="https://github.com/lukeblackstar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline" title="Ver perfil do criador no GitHub, abre em nova guia">
                <Github className="h-5 w-5" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 pb-16">
        {isHistoryOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-background border-l shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de conversões
                </h2>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearHistory}
                      className="text-xs h-8"
                    >
                      <Eraser className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsHistoryOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Seu histórico está vazio</p>
                  <p className="text-sm mt-1">As conversões que você fizer aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <Card key={entry.id} className="cursor-pointer hover:bg-muted/50" onClick={() => loadFromHistory(entry)}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            {entry.type === 'encode' ? (
                              <ArrowDown className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <ArrowUp className="h-3.5 w-3.5 text-green-500" />
                            )}
                            <span className="text-xs font-medium">
                              {entry.type === 'encode' ? 'Codificação' : 'Decodificação'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="py-0 px-4">
                        <div className="text-xs mb-1.5">
                          <span className="text-muted-foreground mr-1">Entrada:</span>
                          <span className="font-mono">
                            {entry.input.length > 30 ? entry.input.substring(0, 30) + '...' : entry.input}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground mr-1">Saída:</span>
                          <span className="font-mono">
                            {entry.output.length > 30 ? entry.output.substring(0, 30) + '...' : entry.output}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="py-2 px-4">
                        <span className="text-xs text-blue-500 hover:underline">Clique para restaurar</span>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Card className="mb-10 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Conversor Base64
            </CardTitle>
            <CardDescription>
              Escreva ou cole seu texto e escolha o que deseja fazer. Precisa codificar em Base64 ou
              decodificar um texto que já está nesse formato? Estamos aqui para ajudar!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="inputText" className="text-sm font-medium" title="Campo de entrada para texto, base64 ou arquivo">
                    O que você quer converter?
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => copyToClipboard(inputText, "Texto de entrada")}
                    disabled={!inputText}
                    title="Copiar texto de entrada"
                  >
                    <ClipboardCopy className="h-4 w-4 mr-1" />
                    <span className="text-xs">Copiar</span>
                  </Button>
                </div>
                <div className="relative">
                  <Textarea
                    id="inputText"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Digite ou cole o texto aqui... Pode ser qualquer coisa!"
                    rows={6}
                    className="font-mono text-sm resize-none"
                    title="Digite texto, cole base64 ou importe arquivo"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".txt,.json,image/*"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    title="Fazer upload de arquivo (.txt, .json, imagem) para converter em Base64 ou decodificar"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Importar arquivo
                  </Button>
                  {imagePreviewUrl && (
                    <span className="text-xs text-emerald-500">Imagem detectada!</span>
                  )}
                </div>
                {importedFileType && importedFileType !== "img" && (
                  <div className="rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 text-blue-900 dark:text-blue-100 text-xs px-3 py-2 mt-2 animate-fade-in">
                    Arquivo importado! Clique em <b>Transformar em Base64</b> para converter o conteúdo do seu arquivo em texto Base64.
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {!inputText ? "Dica: Para codificar, insira texto normal. Para decodificar, insira um texto em formato Base64." :
                    inputText.length > 100 ? `Você digitou ${inputText.length} caracteres. Uau!` :
                    `${inputText.length} caracteres inseridos.`}
                  </p>

                  {realtimePreview && (
                    <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md font-mono">
                      {realtimePreview}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <Button
                    onClick={handleEncode}
                    className={`gap-1 bg-primary hover:bg-primary/90 ${importedFileType && importedFileType !== "img" ? "animate-pulse border-2 border-blue-400" : ""}`}
                    title="Codificar texto/arquivo em Base64"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Transformar em Base64
                  </Button>
                  <Button
                    onClick={handleDecode}
                    variant="outline"
                    className="gap-1"
                    title="Decodificar texto Base64 para texto ou arquivo"
                  >
                    <ArrowDown className="h-4 w-4" />
                    Revelar texto original
                  </Button>
                  <Button
                    onClick={clearAll}
                    variant="ghost"
                    className="gap-1"
                    title="Limpar todos os campos"
                  >
                    <Eraser className="h-4 w-4" />
                    Limpar tudo
                  </Button>
                </div>

                {errorText && (
                  <div className="w-full mt-2 p-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-md">
                    <p className="text-sm">{errorText}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="outputText" className="text-sm font-medium" title="Resultado da conversão">
                    Resultado da conversão
                  </Label>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={swapTextAreas}
                      disabled={!outputText}
                      title="Mover resultado para o campo de entrada"
                    >
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      <span className="text-xs">Usar como entrada</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => copyToClipboard(outputText, "Resultado")}
                      disabled={!outputText}
                      title="Copiar resultado"
                    >
                      <ClipboardCopy className="h-4 w-4 mr-1" />
                      <span className="text-xs">Copiar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => downloadResult(outputText)}
                      disabled={!outputText}
                      title="Baixar o resultado da conversão em um arquivo texto"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span className="text-xs">Baixar</span>
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Textarea
                    id="outputText"
                    value={outputText}
                    readOnly
                    placeholder="O resultado da sua conversão aparecerá aqui... Mágica!"
                    rows={6}
                    className="font-mono text-sm resize-none bg-muted/50"
                    title="Resultado da conversão, pronto para copiar ou baixar"
                  />
                </div>
                {outputText && (
                  <p className="text-xs text-muted-foreground">
                    {outputText.length > 100 ?
                      "O texto resultante é bem longo! Você pode copiá-lo ou baixá-lo com os botões acima." :
                      "Pronto! O texto foi convertido com sucesso."}
                  </p>
                )}
                {imagePreviewUrl && (
                  <div className="mt-4 flex flex-col items-center">
                    <img src={imagePreviewUrl} alt="Preview da imagem decodificada" className="max-h-64 rounded shadow" />
                    <Button
                      className="mt-2 text-xs px-3"
                      variant="ghost"
                      size="sm"
                      onClick={handleDecodeFileDownload}
                      title="Baixar imagem decodificada"
                    >
                      Baixar imagem decodificada
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Entenda o Base64 de forma simples
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="feature-card">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-2 bg-primary/10 w-fit rounded-md">
                  <FileCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">O que é Base64?</h3>
                <p className="text-sm text-muted-foreground mb-auto">
                  Base64 é como um tradutor universal que transforma qualquer tipo de dado (textos, imagens, etc.)
                  em texto simples que pode ser enviado por qualquer lugar sem se corromper. É como transformar
                  uma mensagem em uma língua que todos os computadores entendem!
                </p>
              </div>
            </Card>

            <Card className="feature-card">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-2 bg-primary/10 w-fit rounded-md">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Quando usar?</h3>
                <p className="text-sm text-muted-foreground mb-auto">
                  Use quando precisar enviar uma imagem por email, incluir dados em uma URL,
                  ou guardar informações em um formato de texto. É como colocar qualquer coisa em
                  um envelope que todo mundo consegue abrir depois!
                </p>
              </div>
            </Card>

            <Card className="feature-card">
              <div className="flex flex-col h-full">
                <div className="mb-4 p-2 bg-primary/10 w-fit rounded-md">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Vantagens</h3>
                <p className="text-sm text-muted-foreground mb-auto">
                  As informações chegam exatamente como você enviou, sem alterações ou
                  corrupções pelo caminho. É como mandar uma carta e ter certeza que
                  ela chegará intacta, independente de como for transportada!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-muted/50 py-6 border-t">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Base64 Tools
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
