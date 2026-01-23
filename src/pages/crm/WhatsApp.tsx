import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InstanceManager } from "@/components/whatsapp/InstanceManager";
import { ChatList } from "@/components/whatsapp/ChatList";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";
import { PatientPanel } from "@/components/whatsapp/PatientPanel";
import { WhatsAppInstance, WhatsAppConversa } from "@/hooks/useWhatsAppData";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WhatsApp() {
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [selectedConversa, setSelectedConversa] = useState<WhatsAppConversa | null>(null);
  const [showInstances, setShowInstances] = useState(true);
  const [showPatientPanel, setShowPatientPanel] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/crm/pipeline")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas conversas integradas ao CRM
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstances(!showInstances)}
          >
            <PanelLeftClose className={`h-4 w-4 ${!showInstances ? "rotate-180" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPatientPanel(!showPatientPanel)}
          >
            <PanelRightClose className={`h-4 w-4 ${!showPatientPanel ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar - Instances & Chats */}
        {showInstances && (
          <>
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="flex flex-col h-full border-r">
                <div className="border-b">
                  <InstanceManager
                    selectedInstance={selectedInstance}
                    onSelectInstance={setSelectedInstance}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatList
                    instance={selectedInstance}
                    selectedConversa={selectedConversa}
                    onSelectConversa={setSelectedConversa}
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Center - Chat Window */}
        <ResizablePanel defaultSize={showPatientPanel ? 50 : 75}>
          <ChatWindow instance={selectedInstance} conversa={selectedConversa} />
        </ResizablePanel>

        {/* Right Sidebar - Patient Panel */}
        {showPatientPanel && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <div className="h-full border-l bg-card">
                <PatientPanel conversa={selectedConversa} />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
