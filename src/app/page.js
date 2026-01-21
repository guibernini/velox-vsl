"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Home, Building, Factory, Tractor, CheckCircle, Zap, Car, Battery, TrendingUp, ArrowDown } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";

function AnimatedNumber({ value, suffix, duration, start }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startVal = 0;
    const stepTime = 20;
    const totalSteps = Math.ceil(duration / stepTime);
    const increment = value / totalSteps;
    const interval = setInterval(() => {
      startVal += increment;
      if (startVal >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(startVal));
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [start, value, duration]);
  return <span>{count.toLocaleString('pt-BR')}{suffix}</span>;
}

export default function LandingPage() {
  const router = useRouter();
  const whatsappNumber = "5511940306171"; 
  const whatsappBase = `https://wa.me/${whatsappNumber}`;
  const instagramLink = "https://www.instagram.com/veloxsolar.pompeiahome/";
  const emailLink = "mailto:saopaulo.pompeia@veloxsolarenergia.com.br";
  const webhookUrl = "https://hook.us2.make.com/6xwyjwejrjvweam1akefa9u35sv72j5g";
  const googleAdsId = "AW-17791443438"; 
  const conversionLabel = "AW-17791443438/q-NqCPPHz9UbEO7Dz6NC";

  const trackConversion = (eventName, params = {}) => {
    if (typeof window !== "undefined") {
      if (window.fbq) { window.fbq('track', eventName, params); }
      if (window.gtag) {
        const sendTo = (['Contact', 'Lead', 'InitiateCheckout'].includes(eventName)) ? conversionLabel : googleAdsId;
        window.gtag('event', 'conversion', { 'send_to': sendTo });
      }
    }
  };

  const redirectToThankYou = (finalUrl, originName) => {
    trackConversion('Contact', { content_name: originName });
    localStorage.setItem("velox_redirect", finalUrl);
    router.push("/obrigado");
  };

  const handleSimpleClick = (origin) => {
    const message = "Olá! Gostaria de fazer um orçamento de energia solar.";
    const finalUrl = `${whatsappBase}?text=${encodeURIComponent(message)}`;
    redirectToThankYou(finalUrl, origin);
  };

  const [step, setStep] = useState(1);
  const [loadingSim, setLoadingSim] = useState(false);
  const [sendingLead, setSendingLead] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const toggleIndex = (index) => setOpenIndex(openIndex === index ? null : index);
  const [formData, setFormData] = useState({ valorConta: "", tipoImovel: "residencial", nome: "", email: "", telefone: "", cidade: "", estado: "" });
  const [simulation, setSimulation] = useState({ economiaAnual: 0, qtdPlacas: 0, producaoMensal: 0, areaNecessaria: 0, valorMensal: 0, novaContaMensal: 0 });

  const handleCalculate = () => {
    const valor = parseFloat(formData.valorConta.replace("R$", "").replace(".", "").replace(",", ".")) || 0;
    if (valor < 100) { alert("Mínimo R$ 100."); return; }
    setLoadingSim(true);
    trackConversion('InitiateCheckout', { value: valor, currency: 'BRL' });
    setTimeout(() => {
      const novaConta = Math.max(valor * 0.05, 50); 
      const economiaAnual = (valor - novaConta) * 12;
      const placas = Math.ceil((valor / 0.95) / 60); 
      setSimulation({ economiaAnual, qtdPlacas: placas, producaoMensal: Math.floor(placas * 60), areaNecessaria: Math.ceil(placas * 2.5), valorMensal: valor, novaContaMensal: novaConta });
      setStep(2);
      setLoadingSim(false);
    }, 1000);
  };

  const handleLeadSubmit = async () => {
    if(!formData.nome || !formData.telefone || !formData.cidade) return alert("Preencha Nome, WhatsApp e Cidade.");
    setSendingLead(true);
    try { await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, ...simulation, data_criacao: new Date().toLocaleString() }) }); } catch (e) {}
    trackConversion('AddPaymentInfo'); 
    setStep(3);
    setSendingLead(false);
  };

  const handleFinalWhatsApp = () => {
    const fMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const text = `*Simulação Velox:* ☀️\n👤 *Cliente:* ${formData.nome}\n📍 *Local:* ${formData.cidade}/${formData.estado}\n💲 *Conta:* ${formData.valorConta}\n📉 *Economia:* ${fMoney(simulation.economiaAnual)}\n🔆 *Placas:* ${simulation.qtdPlacas}`;
    redirectToThankYou(`${whatsappBase}?text=${encodeURIComponent(text)}`, 'Calculadora Final');
  };

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const stats = [{ label: "Redução na Conta", value: 95, suffix: "%", duration: 2000 }, { label: "Garantia (Anos)", value: 25, suffix: "+", duration: 2500 }, { label: "Projetos Entregues", value: 1000, suffix: "+", duration: 1500 }];
  const solutions = [{ icon: Home, title: "Residencial", desc: "Proteção contra inflação energética." }, { icon: Car, title: "Mobilidade", desc: "Carregadores para veículos elétricos." }, { icon: Factory, title: "Empresarial", desc: "Redução de custos operacionais." }, { icon: Tractor, title: "Agro Solar", desc: "Energia para irrigação e produção." }, { icon: Battery, title: "Off-Grid", desc: "Baterias para backup de energia." }, { icon: TrendingUp, title: "Investimento", desc: "Retorno superior a Renda Fixa." }];
  const faqs = [{ question: "Preciso fazer obra no telhado?", answer: "Na maioria dos casos, não. Nossa equipe técnica avalia a estrutura e utiliza fixadores especiais." }, { question: "E se não tiver sol ou chover?", answer: "O sistema funciona com a radiação, não apenas com sol direto." }, { question: "Quanto tempo duram as placas?", answer: "Os painéis solares são projetados para durar mais de 25 anos." }, { question: "Como funciona o financiamento?", answer: "A própria economia na conta de luz paga a parcela." }, { question: "O sistema valoriza o imóvel?", answer: "Sim! Valorização entre 4% a 6% na venda." }];

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#00FF88]/5 blur-[150px] rounded-full" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      <button onClick={() => handleSimpleClick('Botão Flutuante')} className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebc57] text-white p-4 rounded-full shadow-lg transition-all flex items-center gap-3 border border-white/20 backdrop-blur-sm">
        <FaWhatsapp size={28} />
      </button>

      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-12 z-10">
        <div className="absolute inset-0 z-0">
            <Image src="/hero-solar.webp" alt="Energia Solar" fill className="object-cover opacity-50" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17] via-[#0B0D17]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0B0D17]" />
        </div>
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                <div className="inline-block px-4 py-1 rounded-full border border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88] text-sm font-semibold mb-6">🚀 Energia Solar Premium</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">Zere sua conta de luz com a <span className="text-[#00FF88]">Velox Solar</span></h1>
                <p className="text-gray-300 text-lg mb-8 max-w-lg">Assista ao vídeo e transforme seu telhado em uma usina de dinheiro.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => handleSimpleClick('Botão Hero')} className="bg-[#00FF88] text-black font-extrabold py-4 px-8 rounded-full shadow-lg">Falar com Consultor</button>
                    <a href="#calculadora" className="bg-white/10 text-white font-bold py-4 px-8 rounded-full border border-white/10 backdrop-blur-sm">Simular Economia</a>
                </div>
            </motion.div>
            <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF88] to-blue-600 rounded-2xl blur opacity-30" />
                 <div className="relative rounded-2xl overflow-hidden border border-[#00FF88]/30 bg-black aspect-video">
                     <video controls autoPlay muted loop playsInline className="w-full h-full object-cover"><source src="/vsl-velox.mp4" type="video/mp4" /></video>
                 </div>
            </div>
        </div>
      </section>

      {/* CALCULADORA COM GRÁFICO CORRIGIDO ✅ */}
      <section id="calculadora" className="py-24 px-6 relative z-10 overflow-hidden">
         <div className="absolute inset-0 z-0">
             <Image src="/calculadora-foto.jpeg" alt="Fundo" fill className="object-cover opacity-70" priority />
             <div className="absolute inset-0 bg-[#0B0D17]/80" />
         </div>
         <div className="container mx-auto max-w-5xl relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Simulador Inteligente</h2>
                        <p className="text-gray-400 mb-8">Nossa IA projeta o sistema ideal para zerar sua conta.</p>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3 text-gray-400"><CheckCircle size={16} className="text-[#00FF88]"/> Sem compromisso</div>
                             <div className="flex items-center gap-3 text-gray-400"><CheckCircle size={16} className="text-[#00FF88]"/> Dados Seguros (LGPD)</div>
                        </div>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 min-h-[460px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                    <label className="text-[#00FF88] text-xs font-bold uppercase mb-2 block">Valor da Conta</label>
                                    <input type="text" value={formData.valorConta} onChange={(e) => {
                                        let v = e.target.value.replace(/\D/g, "");
                                        v = (v/100).toFixed(2).replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                                        setFormData({...formData, valorConta: v});
                                    }} placeholder="R$ 0,00" className="w-full bg-white/5 border border-white/10 focus:border-[#00FF88] rounded-xl py-4 px-4 text-2xl font-bold text-white outline-none mb-6" />
                                    <div className="grid grid-cols-4 gap-2 mb-6">
                                        {[{id:'residencial', icon:Home, label: 'Casa'}, {id:'comercial', icon:Building, label: 'Comércio'}, {id:'rural', icon:Tractor, label: 'Rural'}, {id:'industrial', icon:Factory, label: 'Indústria'}].map((t) => (
                                            <button key={t.id} onClick={() => setFormData({...formData, tipoImovel: t.id})} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${formData.tipoImovel === t.id ? "bg-[#00FF88] text-black" : "border-white/10 text-gray-400"}`}>
                                                <t.icon size={20} /><span className="text-[10px] font-bold uppercase">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={handleCalculate} className="w-full bg-[#00FF88] text-black font-bold py-4 rounded-xl shadow-lg">Simular Economia</button>
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div key="2" initial={{opacity:0, x:20}} animate={{opacity:1}} className="text-center">
                                    <Zap size={32} className="mx-auto mb-4 text-[#00FF88]"/>
                                    <h3 className="text-xl font-bold mb-4">Potencial Identificado!</h3>
                                    <input type="text" placeholder="Nome" onChange={e=>setFormData({...formData, nome:e.target.value})} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-2" />
                                    <input type="tel" placeholder="WhatsApp" onChange={e=>setFormData({...formData, telefone:e.target.value})} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 mb-2" />
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <input type="text" placeholder="Cidade" onChange={e=>setFormData({...formData, cidade:e.target.value})} className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10" />
                                        <input type="text" placeholder="UF" maxLength={2} onChange={e=>setFormData({...formData, estado:e.target.value.toUpperCase()})} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center" />
                                    </div>
                                    <button onClick={handleLeadSubmit} className="w-full bg-[#00FF88] text-black font-bold py-4 rounded-xl">Ver Resultado</button>
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div key="3" initial={{scale:0.9}} animate={{scale:1}} className="text-center h-full flex flex-col justify-between">
                                    <p className="text-gray-400 text-xs uppercase mb-10">Comparativo Mensal</p>
                                    
                                    {/* GRÁFICO FINAL CORRIGIDO */}
                                    <div className="flex items-end justify-center gap-12 h-40 mb-10 px-4 w-full">
                                        {/* Barra Antes */}
                                        <div className="w-14 flex flex-col justify-end items-center group relative h-full">
                                            <span className="absolute -top-10 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ {simulation.valorMensal}</span>
                                            <span className="absolute -top-8 text-red-500 font-bold text-xs group-hover:opacity-0 transition-opacity uppercase">Antes</span>
                                            <motion.div initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 1 }} className="w-full bg-gradient-to-t from-red-900 via-red-600 to-red-400 rounded-t-lg shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                                        </div>
                                        {/* Barra Velox */}
                                        <div className="w-14 flex flex-col justify-end items-center group relative h-full">
                                            <span className="absolute -top-10 text-[#00FF88] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R$ {simulation.novaContaMensal.toFixed(0)}</span>
                                            <span className="absolute -top-8 text-[#00FF88] font-bold text-xs group-hover:opacity-0 transition-opacity uppercase">Velox</span>
                                            <motion.div initial={{ height: 0 }} animate={{ height: "15%" }} transition={{ duration: 1, delay: 0.5 }} className="w-full bg-[#00FF88] rounded-t-lg shadow-[0_0_20px_rgba(0,255,136,0.6)]" />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-400 text-xs">Economia Anual Projetada</p>
                                        <div className="text-4xl font-black text-[#00FF88] mb-4">R$ {simulation.economiaAnual.toLocaleString('pt-BR')}</div>
                                        <div className="flex justify-center gap-6 text-sm text-white/80 mb-6">
                                            <div className="flex items-center gap-2"><Zap size={18} className="text-[#00FF88]"/> {simulation.qtdPlacas} Placas</div>
                                            <div className="flex items-center gap-2"><Building size={18} className="text-[#00FF88]"/> {simulation.areaNecessaria}m²</div>
                                        </div>
                                    </div>
                                    <button onClick={handleFinalWhatsApp} className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg"><FaWhatsapp size={24} /> Garantir Economia</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* NÚMEROS E SOLUÇÕES */}
      <section ref={statsRef} className="py-16 bg-black/20 border-y border-white/5 relative z-10">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6 text-center">
          {stats.map((s, i) => (
            <div key={i}>
                <h3 className="text-5xl font-bold mb-1"><AnimatedNumber value={s.value} suffix={s.suffix} duration={s.duration} start={statsInView} /></h3>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUÇÕES CARDS */}
      <section className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16"><h2 className="text-3xl font-bold mb-4">Soluções Velox</h2><p className="text-gray-400">Tecnologia para cada necessidade.</p></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((item, i) => (
                    <motion.div key={i} whileHover={{y:-5}} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-[#00FF88]/30 group transition-all">
                        <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center text-[#00FF88] mb-4 group-hover:scale-110 transition-transform"><item.icon size={24}/></div>
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* FAQ & FOOTER */}
      <section className="py-24 px-6 relative z-10 bg-black/20">
        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row gap-16 items-start">
             <div className="lg:w-1/2 sticky top-24">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src="/solar-texto.jpeg" alt="Atendimento" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] to-transparent opacity-60" />
                </div>
             </div>
             <div className="lg:w-1/2 flex flex-col gap-6">
                <h2 className="text-3xl font-bold mb-4">Dúvidas Frequentes</h2>
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-white/5 rounded-xl bg-white/5 overflow-hidden">
                        <button onClick={() => toggleIndex(i)} className="w-full flex justify-between items-center p-6 text-left font-semibold hover:bg-white/5 transition text-sm md:text-base">
                            {faq.question}
                            <span className={`text-[#00FF88] text-xl transition-transform ${openIndex === i ? "rotate-45" : ""}`}>+</span>
                        </button>
                        <AnimatePresence>{openIndex === i && (
                            <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden border-t border-white/5">
                                <div className="p-6 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
                            </motion.div>
                        )}</AnimatePresence>
                    </div>
                ))}
                <button onClick={() => handleSimpleClick('FAQ')} className="bg-[#00FF88] text-black px-8 py-4 rounded-full font-bold mt-4 shadow-lg flex items-center justify-center gap-2 mx-auto"><FaWhatsapp size={20} /> Falar com Especialista</button>
             </div>
        </div>
      </section>

      <footer className="border-t border-white/5 pt-16 pb-8 relative z-10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12 text-sm text-gray-500">
            <div><p className="text-white font-bold mb-4 text-base">Sobre a Velox</p><p>Especialistas em projetos fotovoltaicos de alta performance para residências e empresas.</p></div>
            <div><p className="text-white font-bold mb-4 text-base">Atendimento</p><ul><li>Segunda a Sexta: 08h às 18h</li><li>Sábado: 08h às 12h</li><li className="pt-2">contato@veloxsolar.com.br</li></ul></div>
            <div>
                <p className="text-white font-bold mb-4 text-base">Redes Sociais</p>
                <div className="flex gap-4">
                    <a href={instagramLink} target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#00FF88] hover:text-black transition-all"><FaInstagram size={20}/></a>
                    <button onClick={() => handleSimpleClick('Footer')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#25D366] hover:text-black transition-all"><FaWhatsapp size={20}/></button>
                </div>
            </div>
        </div>
        <div className="container mx-auto px-6 border-t border-white/5 pt-8 text-center text-gray-700 text-xs"><p>© 2026 Velox Solar. Todos os direitos reservados.</p></div>
      </footer>
    </div>
  );
}