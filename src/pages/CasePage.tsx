import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Send, Users2, Clock, Trophy, Lightbulb, CheckCircle2,
  MessageCircle, FileText, Target, ChevronRight,
} from "lucide-react";

interface ChatMessage {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

const caseData = {
  tag: "Управление",
  title: "Кризис в компании «ТехноСтар»",
  difficulty: "Сложный",
  timeLimit: "45 мин",
  teamSize: "4-6",
  description:
    "Компания «ТехноСтар» — средний производитель электроники. За последний квартал выручка упала на 35%, два ключевых клиента ушли к конкурентам, а лучшие инженеры начали увольняться. Совет директоров требует план антикризисных мер в течение 48 часов.",
  objectives: [
    "Проанализировать причины кризиса",
    "Разработать план удержания ключевых сотрудников",
    "Предложить стратегию возврата клиентов",
    "Составить финансовый план на 6 месяцев",
  ],
  materials: [
    { name: "Финансовый отчёт Q3", type: "PDF" },
    { name: "Анализ конкурентов", type: "PDF" },
    { name: "Результаты опроса сотрудников", type: "XLSX" },
    { name: "Портфель клиентов", type: "PDF" },
  ],
  team: [
    { name: "Вы", role: "Финансовый директор", avatar: "В", online: true },
    { name: "Анна К.", role: "HR-директор", avatar: "А", online: true },
    { name: "Дмитрий С.", role: "Директор по продажам", avatar: "Д", online: true },
    { name: "Мария П.", role: "Технический директор", avatar: "М", online: false },
  ],
};

const initialMessages: ChatMessage[] = [
  { id: 1, author: "Система", avatar: "С", text: "Кейс «Кризис в компании ТехноСтар» начат. У вас 45 минут. Удачи!", time: "10:00", isSystem: true },
  { id: 2, author: "Анна К.", avatar: "А", text: "Привет всем! Предлагаю начать с анализа причин ухода сотрудников — у меня есть данные из опроса.", time: "10:01" },
  { id: 3, author: "Дмитрий С.", avatar: "Д", text: "Согласен. Со своей стороны подготовлю анализ по клиентам — почему ушли и что предложили конкуренты.", time: "10:02" },
];

const CasePage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "solution">("chat");
  const [solution, setSolution] = useState("");
  const [completedObj, setCompletedObj] = useState<Set<number>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now(),
      author: "Вы",
      avatar: "В",
      text: input.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");

    // Simulate response
    setTimeout(() => {
      const responses = [
        { author: "Анна К.", avatar: "А", text: "Хорошая мысль! Давайте это учтём в плане." },
        { author: "Дмитрий С.", avatar: "Д", text: "Согласен, это ключевой момент для нашей стратегии." },
        { author: "Анна К.", avatar: "А", text: "По данным опроса, 60% сотрудников недовольны отсутствием карьерного роста." },
        { author: "Дмитрий С.", avatar: "Д", text: "Два клиента ушли из-за задержек в поставках. Нужно пересмотреть логистику." },
      ];
      const resp = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          ...resp,
          time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  const toggleObjective = (idx: number) => {
    setCompletedObj((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 pt-16 flex flex-col lg:flex-row">
        {/* Left sidebar — Case info */}
        <aside className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border bg-card/50 overflow-y-auto shrink-0">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {caseData.tag}
                </span>
                <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                  {caseData.difficulty}
                </span>
              </div>
              <h1 className="font-display text-xl font-bold leading-tight">{caseData.title}</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{caseData.description}</p>
            </div>

            {/* Meta */}
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                {caseData.timeLimit}
              </div>
              <div className="flex items-center gap-1.5">
                <Users2 size={14} className="text-primary" />
                {caseData.teamSize} игроков
              </div>
            </div>

            {/* Objectives */}
            <div>
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <Target size={16} className="text-primary" /> Цели
              </h3>
              <div className="space-y-2">
                {caseData.objectives.map((obj, i) => (
                  <button
                    key={i}
                    onClick={() => toggleObjective(i)}
                    className="flex items-start gap-2 text-left w-full group"
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      completedObj.has(i) ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}>
                      {completedObj.has(i) && <CheckCircle2 size={12} className="text-primary-foreground" />}
                    </div>
                    <span className={`text-sm transition-colors ${completedObj.has(i) ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {obj}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Материалы
              </h3>
              <div className="space-y-2">
                {caseData.materials.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <span className="text-sm">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div>
              <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                <Users2 size={16} className="text-primary" /> Команда
              </h3>
              <div className="space-y-2">
                {caseData.team.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                        {t.avatar}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                        t.online ? "bg-green-400" : "bg-muted-foreground/40"
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Tabs */}
          <div className="border-b border-border px-4 flex gap-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "chat"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageCircle size={16} /> Обсуждение
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "solution"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb size={16} /> Решение
            </button>
          </div>

          {activeTab === "chat" ? (
            <>
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={msg.isSystem ? "text-center" : "flex gap-3"}
                    >
                      {msg.isSystem ? (
                        <span className="inline-block px-4 py-2 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                          {msg.text}
                        </span>
                      ) : (
                        <>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                            msg.author === "Вы" ? "bg-primary text-primary-foreground" : "bg-secondary"
                          }`}>
                            {msg.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-sm font-medium">{msg.author}</span>
                              <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <div className={`inline-block max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.author === "Вы"
                                ? "bg-primary text-primary-foreground rounded-tl-sm"
                                : "bg-secondary rounded-tl-sm"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Напишите сообщение..."
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button onClick={sendMessage} size="icon" className="h-[46px] w-[46px] rounded-xl shrink-0">
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Solution tab */
            <div className="flex-1 flex flex-col p-6">
              <div className="mb-4">
                <h2 className="font-display text-lg font-semibold mb-1">Совместное решение</h2>
                <p className="text-sm text-muted-foreground">
                  Опишите ваш план антикризисных мер. Все участники команды видят изменения в реальном времени.
                </p>
              </div>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder={"1. Анализ причин кризиса\n\n2. План удержания сотрудников\n\n3. Стратегия возврата клиентов\n\n4. Финансовый план на 6 месяцев"}
                className="flex-1 bg-secondary/50 border border-border rounded-xl p-5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-muted-foreground">
                  {completedObj.size} из {caseData.objectives.length} целей выполнено
                </span>
                <Button className="gap-2">
                  <CheckCircle2 size={16} /> Отправить решение
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CasePage;
