"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Home, Building, Factory, Tractor, CheckCircle, Headset, Zap, Car, Battery, TrendingUp, ArrowDown } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";

// --- NÚMEROS ANIMADOS ---
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

  // --- CONFIGURAÇÕES ---
  const whatsappNumber = "5511940306171"; 
  const whatsappBase = `https://wa.me/${whatsappNumber}`;
  const instagramLink = "https://www.instagram.com/veloxsolar.pompeiahome/";
  const emailLink = "mailto:saopaulo.pompeia@veloxsolarenergia.com.br";
  
  // WEBHOOK & TAGS
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

  // --- LÓGICA DA CALCULADORA ---
  const [step, setStep] = useState(1);
  const [loadingSim, setLoadingSim] = useState(false);
  const [sendingLead, setSendingLead] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const toggleIndex = (index) => setOpenIndex(openIndex === index ? null : index);
  
  const [formData, setFormData] = useState({ valorConta: "", tipoImovel: "residencial", nome: "", email: "", telefone: "", cidade: "", estado: "" });
  const [simulation, setSimulation] = useState({ economiaAnual: 0, qtdPlacas: 0, producaoMensal: 0, areaNecessaria: 0 });

  const handleCalculate = () => {
    const valor = parseFloat(formData.valorConta.replace("R$", "").replace(".", "").replace(",", ".")) || 0;
    if (valor < 100) { alert("Mínimo R$ 100."); return; }

    setLoadingSim(true);
    trackConversion('InitiateCheckout', { value: valor, currency: 'BRL' });
    
    setTimeout(() => {
      const novaConta = Math.max(valor * 0.05, 50); 
      const economiaAnual = (valor - novaConta) * 12;
      const kwhNecessario = valor / 0.95; 
      const placas = Math.ceil(kwhNecessario / 60); 
      const area = Math.ceil(placas * 2.5); 
      const producao = Math.floor(placas * 60);

      setSimulation({ economiaAnual, qtdPlacas: placas, producaoMensal: producao, areaNecessaria: area });
      setStep(2);
      setLoadingSim(false);
    }, 1000);
  };

  const handleLeadSubmit = async () => {
    if(!formData.nome || !formData.telefone || !formData.cidade) return alert("Preencha Nome, WhatsApp e Cidade.");
    setSendingLead(true);
    
    const leadData = { ...formData, ...simulation, data_criacao: new Date().toLocaleString() };
    try { await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(leadData) }); } catch (e) { console.error("Erro Webhook:", e); }

    trackConversion('AddPaymentInfo'); 
    setStep(3);
    setSendingLead(false);
  };

  const handleFinalWhatsApp = () => {
    const fMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const text = `*Simulação Velox:* ☀️\n👤 *Cliente:* ${formData.nome}\n📍 *Local:* ${formData.cidade}/${formData.estado}\n💲 *Conta:* ${formData.valorConta}\n📉 *Economia:* ${fMoney(simulation.economiaAnual)}\n🔆 *Placas:* ${simulation.qtdPlacas}`;
    redirectToThankYou(`${whatsappBase}?text=${encodeURIComponent(text)}`, 'Calculadora Final');
  };

  const handleCurrencyInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (value / 100).toFixed(2) + "";
    value = value.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setFormData({ ...formData, valorConta: value });
  };

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const stats = [
    { label: "Redução na Conta", value: 95, suffix: "%", duration: 2000 },
    { label: "Garantia (Anos)", value: 25, suffix: "+", duration: 2500 },
    { label: "Projetos Entregues", value: 1000, suffix: "+", duration: 1500 },
  ];

  const solutions = [
    { icon: Home, title: "Residencial", desc: "Proteção contra inflação energética." },
    { icon: Car, title: "Mobilidade", desc: "Carregadores para veículos elétricos." },
    { icon: Factory, title: "Empresarial", desc: "Redução de custos operacionais." },
    { icon: Tractor, title: "Agro Solar", desc: "Energia para irrigação e produção." },
    { icon: Battery, title: "Off-Grid", desc: "Baterias para backup de energia." },
    { icon: TrendingUp, title: "Investimento", desc: "Retorno superior a Renda Fixa." }
  ];

  const faqs = [
    { question: "Preciso fazer obra no telhado?", answer: "Na maioria dos casos, não. Nossa equipe técnica avalia a estrutura e utiliza fixadores especiais que não causam goteiras ou danos." },
    { question: "E se não tiver sol ou chover?", answer: "O sistema funciona com a radiação, não apenas com sol direto. Em dias nublados, ele continua gerando, porém em menor intensidade." },
    { question: "Quanto tempo duram as placas?", answer: "Os painéis solares são projetados para durar mais de 25 anos com eficiência acima de 80%, exigindo pouquíssima manutenção." },
    { question: "Como funciona o financiamento?", answer: "Trabalhamos com linhas de crédito solar onde a própria economia na conta de luz paga a parcela do financiamento. É a famosa 'troca de conta'." },
    { question: "O sistema valoriza o imóvel?", answer: "Sim! Estudos do mercado imobiliário mostram que casas com energia solar própria e conta de luz zerada valorizam entre 4% a 6% na venda." },
  ];

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white font-sans selection:bg-[#00FF88] selection:text-black overflow-x-hidden">

      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#00FF88]/5 blur-[150px] rounded-full"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full"></div>
      </div>

      <button onClick={() => handleSimpleClick('Botão Flutuante')} className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebc57] text-white p-4 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-all flex items-center gap-3 group border border-white/20 backdrop-blur-sm">
        <FaWhatsapp className="text-3xl" />
      </button>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[100vh] lg:min-h-[95vh] flex items-center pt-24 pb-12 overflow-hidden z-10">
        <div className="absolute inset-0 z-0">
            <Image src="/hero-solar.webp" alt="Energia Solar" fill className="object-cover opacity-50" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17] via-[#0B0D17]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0D17]" />
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-block px-4 py-1 rounded-full border border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88] text-sm font-semibold mb-6 backdrop-blur-md">🚀 Energia Solar Premium</div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Zere sua conta de luz com a <span className="text-[#00FF88]">Velox Solar</span></h1>
                <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-lg drop-shadow-md">
                    Assista ao vídeo e entenda como transformar seu telhado em uma usina de dinheiro. Economia de até 95% garantida em contrato.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => handleSimpleClick('Botão Hero')} className="bg-[#00FF88] text-black font-extrabold py-4 px-8 rounded-full hover:bg-[#00e67a] transition-all shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:scale-105 flex items-center justify-center gap-2">
                        <FaWhatsapp size={24}/> Falar com Consultor
                    </button>
                    <a href="#calculadora" className="bg-white/10 text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2 backdrop-blur-sm">
                        <ArrowDown size={20}/> Simular Economia
                    </a>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF88] to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                 <div className="relative rounded-2xl overflow-hidden border border-[#00FF88]/30 bg-black shadow-2xl aspect-video">
                     <video controls autoPlay muted loop playsInline className="w-full h-full object-cover">
                         <source src="/vsl-velox.mp4" type="video/mp4" />
                     </video>
                 </div>
                 <p className="text-center mt-3 text-sm text-gray-400 animate-pulse flex items-center justify-center gap-2 drop-shadow-md">🔊 Ligue o som</p>
            </motion.div>
        </div>
      </section>

      {/* ================= CALCULADORA ================= */}
      <section id="calculadora" className="py-24 px-6 relative z-10 overflow-hidden">
         <div className="absolute inset-0 z-0">
             <Image src="/calculadora-foto.jpeg" alt="Fundo Calculadora" fill className="object-cover opacity-70" priority />
             <div className="absolute inset-0 bg-[#0B0D17]/80"></div>
         </div>

         <div className="container mx-auto max-w-5xl relative z-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Simulador Inteligente</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Nossa inteligência artificial analisa seu consumo e projeta o sistema ideal para zerar sua conta.
                        </p>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3 text-gray-400"><div className="w-8 h-8 rounded-full bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88]"><CheckCircle size={16}/></div> Sem compromisso</div>
                             <div className="flex items-center gap-3 text-gray-400"><div className="w-8 h-8 rounded-full bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88]"><CheckCircle size={16}/></div> Dados Seguros (LGPD)</div>
                        </div>
                    </div>

                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 shadow-inner">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                    <label className="text-[#00FF88] text-xs font-bold uppercase tracking-wider mb-2 block">Valor Mensal da Conta</label>
                                    <input type="text" value={formData.valorConta} onChange={handleCurrencyInput} placeholder="R$ 0,00" className="w-full bg-white/5 border border-white/10 focus:border-[#00FF88] rounded-xl py-4 px-4 text-2xl font-bold text-white outline-none mb-6 transition-colors" />
                                    
                                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de Imóvel</label>
                                    <div className="grid grid-cols-4 gap-2 mb-6">
                                        {[ 
                                            {id:'residencial', icon:Home, label: 'Casa'}, 
                                            {id:'comercial', icon:Building, label: 'Comércio'}, 
                                            {id:'rural', icon:Tractor, label: 'Rural'}, 
                                            {id:'industrial', icon:Factory, label: 'Indústria'} 
                                        ].map((tipo) => (
                                            <button 
                                                key={tipo.id} 
                                                onClick={() => setFormData({...formData, tipoImovel: tipo.id})} 
                                                className={`p-3 rounded-xl border flex flex-col justify-center items-center gap-1 transition-all ${formData.tipoImovel === tipo.id ? "bg-[#00FF88] border-[#00FF88] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]" : "border-white/10 text-gray-400 hover:bg-white/10"}`}
                                            >
                                                <tipo.icon size={20} />
                                                <span className="text-[10px] font-bold uppercase">{tipo.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        onClick={handleCalculate} 
                                        disabled={loadingSim} 
                                        style={{ backgroundColor: '#00FF88' }}
                                        className="w-full text-black font-bold py-4 rounded-xl hover:brightness-110 transition-all shadow-lg"
                                    >
                                        {loadingSim ? "Processando..." : "Simular Economia"}
                                    </button>
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div key="step2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="text-center">
                                    <div className="w-16 h-16 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#00FF88]"><Zap size={32}/></div>
                                    <h3 className="text-xl font-bold mb-2">Potencial Identificado!</h3>
                                    <p className="text-gray-400 text-sm mb-4">Insira seus dados para receber o estudo técnico.</p>
                                    
                                    <input type="text" placeholder="Seu Nome" value={formData.nome} onChange={e=>setFormData({...formData, nome:e.target.value})} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00FF88] outline-none text-white mb-2" />
                                    <input type="tel" placeholder="WhatsApp (com DDD)" value={formData.telefone} onChange={e=>setFormData({...formData, telefone:e.target.value})} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00FF88] outline-none text-white mb-2" />
                                    
                                    {/* CAMPOS DE CIDADE E ESTADO ADICIONADOS */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <input type="text" placeholder="Cidade" value={formData.cidade} onChange={e=>setFormData({...formData, cidade:e.target.value})} className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00FF88] outline-none text-white" />
                                        <input type="text" placeholder="UF" maxLength={2} value={formData.estado} onChange={e=>setFormData({...formData, estado:e.target.value.toUpperCase()})} className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#00FF88] outline-none text-white text-center" />
                                    </div>

                                    <button onClick={handleLeadSubmit} disabled={sendingLead} className="w-full bg-[#00FF88] text-black font-bold py-4 rounded-xl hover:bg-[#00e67a] transition-all">
                                        {sendingLead ? "Enviando..." : "Ver Resultado"}
                                    </button>
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div key="step3" initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="text-center">
                                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Economia Anual Estimada</p>
                                    <div className="text-5xl font-black text-[#00FF88] mb-6 drop-shadow-[0_0_20px_rgba(0,255,136,0.3)]">R$ {simulation.economiaAnual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10"><div className="text-xl mb-1">🔆</div><div className="font-bold text-white">{simulation.qtdPlacas} Painéis</div></div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10"><div className="text-xl mb-1">📐</div><div className="font-bold text-white">{simulation.areaNecessaria} m²</div></div>
                                    </div>
                                    <button onClick={handleFinalWhatsApp} className="w-full bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"><FaWhatsapp size={24} /> Garantir Economia</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* ================= NÚMEROS ================= */}
      <section ref={statsRef} className="py-16 border-y border-white/5 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-1"><AnimatedNumber value={stat.value} suffix={stat.suffix} duration={stat.duration} start={statsInView} /></h3>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SOLUÇÕES ================= */}
      <section className="py-24 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Soluções Velox</h2>
                <p className="text-gray-400">Tecnologia de ponta adaptada para cada necessidade.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((item, i) => (
                    <motion.div key={i} whileHover={{y:-5}} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5 hover:border-[#00FF88]/30 transition-all group">
                        <div className="bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center text-[#00FF88] mb-4 group-hover:scale-110 transition-transform"><item.icon size={24}/></div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* ================= FAQ & IMAGEM ================= */}
      <section className="py-24 px-6 relative z-10 bg-black/20">
        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row gap-16 items-start">
             <div className="lg:w-1/2 sticky top-24">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image src="/solar-texto.jpeg" alt="Atendimento Velox" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] to-transparent opacity-60"></div>
                </div>
             </div>
             <div className="lg:w-1/2 flex flex-col gap-6">
                <h2 className="text-3xl font-bold mb-4">Dúvidas Frequentes</h2>
                {faqs.map((faq, i) => (
                    <div key={i} className="border border-white/5 rounded-xl bg-white/5 overflow-hidden">
                        <button onClick={() => toggleIndex(i)} className="w-full flex justify-between items-center p-6 text-left font-semibold hover:bg-white/5 transition text-sm md:text-base">
                            {faq.question}
                            <span className={`text-[#00FF88] text-xl transition-transform duration-300 ${openIndex === i ? "rotate-45" : ""}`}>+</span>
                        </button>
                        <AnimatePresence>
                            {openIndex === i && (
                                <motion.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}} className="overflow-hidden">
                                    <div className="p-6 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
                <div className="mt-4 p-6 bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-2xl text-center">
                    <p className="text-gray-400 text-sm mb-4">Sua dúvida não está aqui? Fale com nossa engenharia.</p>
                    <button onClick={() => handleSimpleClick('FAQ Lateral')} className="bg-[#00FF88] text-black px-8 py-4 rounded-full font-bold hover:bg-[#00e67a] transition flex items-center justify-center gap-2 w-full md:w-auto mx-auto shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                        <FaWhatsapp size={20} /> Falar com Especialista
                    </button>
                </div>
             </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 pt-16 pb-8 relative z-10 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 mb-12">
            <div className="text-left">
                <p className="text-white font-bold mb-4">Sobre a Velox</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Especialistas em projetos fotovoltaicos de alta performance. 
                    Levamos economia e sustentabilidade para residências e empresas em todo o Brasil.
                </p>
            </div>
            <div className="text-left">
                <p className="text-white font-bold mb-4">Atendimento</p>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li>Segunda a Sexta: 08h às 18h</li>
                    <li>Sábado: 08h às 12h</li>
                    <li className="pt-2"><a href={emailLink} className="hover:text-[#00FF88] transition">contato@veloxsolar.com.br</a></li>
                </ul>
            </div>
            <div className="text-left">
                <p className="text-white font-bold mb-4">Redes Sociais</p>
                <div className="flex gap-4">
                    <a href={instagramLink} target="_blank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#00FF88] hover:text-black transition"><FaInstagram size={20}/></a>
                    <button onClick={() => handleSimpleClick('Footer Zap')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#00FF88] hover:text-black transition"><FaWhatsapp size={20}/></button>
                    <a href={emailLink} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#00FF88] hover:text-black transition"><FaEnvelope size={20}/></a>
                </div>
            </div>
        </div>
        <div className="container mx-auto px-6 border-t border-white/5 pt-8 text-center text-gray-700 text-xs">
            <p>© 2026 Velox Solar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}