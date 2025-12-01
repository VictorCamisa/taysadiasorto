import { ChatInterface } from "@/components/assistente/ChatInterface";
import { Sparkles } from "lucide-react";

const AssistenteIA = () => {
  return (
    <div className="h-screen flex flex-col p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mb-6 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Assistente IA
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Seu assistente inteligente conectado ao N8N
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
};

export default AssistenteIA;