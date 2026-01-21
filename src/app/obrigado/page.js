"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export default function ObrigadoPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    // 1. Recupera o link do WhatsApp gerado na página anterior
    const storedUrl = localStorage.getItem("velox_redirect");
    
    // Se tiver link, configura o redirecionamento
    if (storedUrl) {
      setWhatsappUrl(storedUrl);
      
      // Tenta abrir o WhatsApp automaticamente após 3 segundos
      const timer = setTimeout(() => {
        window.location.href = storedUrl;
      }, 3000);

      // Contador visual
      const countInterval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countInterval);
      };
    } else {
      // Se não tiver link (acesso direto), manda pro WhatsApp genérico
      setWhatsappUrl("https://wa.me/5511940306171");
    }
  }, []);

  const handleManualRedirect = () => {
    if (whatsappUrl) window.location.href = whatsappUrl;
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* BACKGROUND IGUAL AO DA LANDING */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#00FF88]/10 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        
        {/* CARD DE SUCESSO */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-[#00FF88]/30 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_60px_rgba(0,255,136,0.15)]"
        >
          {/* ÍCONE ANIMADO */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-[#00FF88]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#00FF88] border-2 border-[#00FF88]"
          >
            <CheckCircle size={48} strokeWidth={3} />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Solicitação <span className="text-[#00FF88]">Recebida!</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Nossa inteligência artificial já processou sua simulação. Estamos te redirecionando para o WhatsApp para entregar o relatório.
          </p>

          {/* BARRA DE PROGRESSO DO REDIRECIONAMENTO */}
          <div className="w-full bg-white/10 h-1 rounded-full mb-8 overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.5, ease: "linear" }}
              className="h-full bg-[#00FF88]"
            />
          </div>

          {/* BOTÃO MANUAL */}
          <button 
            onClick={handleManualRedirect}
            className="w-full bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3 text-lg mb-4"
          >
            <FaWhatsapp size={24} />
            Abrir WhatsApp Agora
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecionando em {countdown} segundos...
          </p>

        </motion.div>

        {/* FOOTER SIMPLES */}
        <div className="text-center mt-8 text-gray-600 text-sm flex justify-center items-center gap-2">
           <Zap size={14} /> Velox Solar - Tecnologia Certificada
        </div>
        
        <div className="text-center mt-4">
            <Link href="/" className="text-[#00FF88] text-sm hover:underline flex items-center justify-center gap-1">
                <ArrowRight size={14} className="rotate-180"/> Voltar ao início
            </Link>
        </div>

      </div>
    </div>
  );
}