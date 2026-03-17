import { useState, useRef, useEffect } from "react";
import useBigO from "../../visualizers/big-o/useBigO";
import "./BigOPage.css";

/* ── küçük yardımcılar ─────────────────────────────────────────── */
function SectionTitle({ tag, title, sub }) {
  return (
    <div className="bo-section-title">
      <span className="bo-section-tag">{tag}</span>
      <h2>{title}</h2>
      {sub && <p className="bo-section-sub">{sub}</p>}
    </div>
  );
}

function NoteBox({ icon, color, title, children }) {
  return (
    <div className={`bo-note-box bo-note-${color}`}>
      <span className="bo-note-icon">{icon}</span>
      <div>
        {title && <strong>{title}</strong>}
        <p>{children}</p>
      </div>
    </div>
  );
}

/* ── karmaşıklık kartı ─────────────────────────────────────────── */
const COMPLEXITIES = [
  {
    key: "O1",
    label: "O(1)",
    name: "Sabit Zaman",
    color: "emerald",
    emoji: "🟢",
    grade: "Mükemmel",
    shortDesc: "Eleman sayısı ne olursa olsun, işlem hep aynı sürer.",
    analogy: "Evindeki buzdolabını açmak. 1 şey de olsa 1000 şey de olsa, kapıyı bir kez açarsın.",
    code: `function ilkElemanAl(dizi) {\n  return dizi[0];  // Hep 1 adım\n}`,
    realAlgos: ["Dizi indexleme", "Hash tablosu erişimi", "Stack push/pop"],
    explain: "n'in değeri ne kadar büyürse büyüsün, bu algoritma hep 1 adımda biter. Grafikteki düz çizgidir.",
  },
  {
    key: "OlogN",
    label: "O(log n)",
    name: "Logaritmik Zaman",
    color: "sky",
    emoji: "🔵",
    grade: "Harika",
    shortDesc: "Her adımda iş yarıya iner. Çok hızlı büyür ama çok yavaş yavaşlar.",
    analogy: "Sözlükte kelime aramak. Kitabı ortadan açarsın, harfe göre sağa veya sola geçersin. 1000 sayfalık kitabı ~10 adımda bulursun.",
    code: `function ikiliBul(dizi, hedef) {\n  let sol = 0, sag = dizi.length - 1;\n  while (sol <= sag) {\n    let orta = (sol + sag) >> 1;\n    if (dizi[orta] === hedef) return orta;\n    if (dizi[orta] < hedef) sol = orta + 1;\n    else sag = orta - 1;\n  }\n  return -1;\n}`,
    realAlgos: ["Binary Search", "BST arama", "Dengeli ağaç işlemleri"],
    explain: "n iki katına çıkınca sadece 1 adım daha eklenir. 1.000.000 elemanlı bir dizide sadece ~20 adım!",
  },
  {
    key: "ON",
    label: "O(n)",
    name: "Doğrusal Zaman",
    color: "amber",
    emoji: "🟡",
    grade: "İyi",
    shortDesc: "n kadar eleman varsa n kadar adım atılır. Adil ve tahmin edilebilir.",
    analogy: "Bir kutu içindeki her çikolatayı tek tek kontrol etmek. 10 çikolata → 10 kontrol. 100 çikolata → 100 kontrol.",
    code: `function topla(dizi) {\n  let toplam = 0;\n  for (let i = 0; i < dizi.length; i++) {\n    toplam += dizi[i];  // n kez döner\n  }\n  return toplam;\n}`,
    realAlgos: ["Linear Search", "Dizi toplamı", "En büyük/küçük bulma"],
    explain: "Elemana doğrudan erişemiyorsak, tek tek bakmanın kaçınılmaz maliyetidir.",
  },
  {
    key: "ONlogN",
    label: "O(n log n)",
    name: "Doğrusal-logaritmik Zaman",
    color: "violet",
    emoji: "🟣",
    grade: "Makul",
    shortDesc: "Sıralama algoritmalarının 'altın standardı'. Hem hızlı hem doğru.",
    analogy: "Bir sınıftaki öğrencileri alfabetik sıraya dizmek. Her öğrenci için sıralı listedeki yerini bulman gerekir.",
    code: `// Merge Sort ana fikri:\nfunction mergeSort(dizi) {\n  if (dizi.length <= 1) return dizi;\n  const orta = Math.floor(dizi.length / 2);\n  const sol = mergeSort(dizi.slice(0, orta));   // log n derinlik\n  const sag = mergeSort(dizi.slice(orta));\n  return merge(sol, sag);  // her seviyede n iş\n}`,
    realAlgos: ["Merge Sort", "Quick Sort (ortalama)", "Heap Sort"],
    explain: "Karşılaştırma tabanlı sıralamanın teorik en düşük sınırıdır. Daha iyi yapılamaz!",
  },
  {
    key: "ON2",
    label: "O(n²)",
    name: "Karesel Zaman",
    color: "orange",
    emoji: "🟠",
    grade: "Yavaş",
    shortDesc: "İki iç içe döngü. n büyüyünce işlem patlar.",
    analogy: "Bir partide herkesi herkesle tanıştırmak. 10 kişi → 45 tanışma. 100 kişi → 4950 tanışma!",
    code: `function kabarcikSirala(dizi) {\n  for (let i = 0; i < dizi.length; i++) {        // n kez\n    for (let j = 0; j < dizi.length - 1; j++) {  // n kez\n      if (dizi[j] > dizi[j+1])\n        [dizi[j], dizi[j+1]] = [dizi[j+1], dizi[j]];\n    }\n  }\n}`,
    realAlgos: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
    explain: "Küçük n için sorun yok, ama n=1000 olunca 1.000.000 işlem demek.",
  },
  {
    key: "O2N",
    label: "O(2ⁿ)",
    name: "Üstel Zaman",
    color: "rose",
    emoji: "🔴",
    grade: "Tehlikeli",
    shortDesc: "Her adımda iş ikiye katlanır. Çok küçük n'lerde bile saatler/günler sürebilir.",
    analogy: "Şifreli bir kasayı kırmaya çalışmak. Her basamak 0-1 ise 10 basamaklı şifre = 2^10 = 1024 deneme. 40 basamak = 1 trilyon!",
    code: `// Fibonacci (kötü yol)\nfunction fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);  // Her çağrı 2 çağrı üretir\n}`,
    realAlgos: ["Naif Fibonacci", "Tüm alt kümeleri üretme", "Bazı gezgin satıcı çözümleri"],
    explain: "n=50 için 2^50 ≈ 1.000.000.000.000.000 işlem. Kâbus!",
  },
];

/* ── Animasyonlu bar ───────────────────────────────────────────── */
function ComplexityBar({ pct, color, label, value }) {
  return (
    <div className="bo-bar-row">
      <span className="bo-bar-label">{label}</span>
      <div className="bo-bar-track">
        <div
          className={`bo-bar-fill bo-bar-${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="bo-bar-value">{value}</span>
    </div>
  );
}

/* ── Karmaşıklık detay kartı ───────────────────────────────────── */
function ComplexityCard({ c, active, onClick }) {
  return (
    <div
      className={`bo-card bo-card-${c.color} ${active ? "bo-card-active" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="bo-card-header">
        <span className="bo-card-emoji">{c.emoji}</span>
        <div>
          <span className="bo-card-label">{c.label}</span>
          <span className="bo-card-name">{c.name}</span>
        </div>
        <span className={`bo-grade bo-grade-${c.color}`}>{c.grade}</span>
      </div>
      <p className="bo-card-short">{c.shortDesc}</p>

      {active && (
        <div className="bo-card-detail">
          <div className="bo-card-analogy">
            <span className="bo-detail-icon">🌍</span>
            <div>
              <strong>Günlük hayat analojisi</strong>
              <p>{c.analogy}</p>
            </div>
          </div>
          <div className="bo-card-code">
            <span className="bo-detail-tag">Örnek Kod</span>
            <pre><code>{c.code}</code></pre>
          </div>
          <div className="bo-card-algos">
            <span className="bo-detail-tag">Bu karmaşıklıktaki algoritmalar</span>
            <div className="bo-algo-chips">
              {c.realAlgos.map((a) => (
                <span key={a} className={`bo-chip bo-chip-${c.color}`}>{a}</span>
              ))}
            </div>
          </div>
          <p className="bo-card-explain">{c.explain}</p>
        </div>
      )}
    </div>
  );
}

/* ── Ana sayfa ─────────────────────────────────────────────────── */
export default function BigOPage() {
  const { n, setN, values } = useBigO();
  const [activeCard, setActiveCard] = useState(null);
  const [activeRule, setActiveRule] = useState(null);

  function toggleCard(key) {
    setActiveCard((prev) => (prev === key ? null : key));
  }

  /* Kural açıklamaları */
  const rules = [
    {
      id: "sabitler",
      title: "Sabitleri At",
      icon: "✂️",
      short: "O(2n) → O(n)",
      explain: `Big O sadece büyüme hızıyla ilgilenir, sabit katlarla değil.\n\nO(2n) ile O(n) büyüme şekli aynıdır: n iki katına çıkınca, her ikisinde de adım sayısı iki katına çıkar.\n\nPratik: for döngüsü 3 kez dönse bile O(3n) değil O(n) yazarız.`,
      example: `// 3 ayrı döngü, ama hepsi n kez döner\nfor (let i=0; i<n; i++) {...}   // n\nfor (let i=0; i<n; i++) {...}   // n\nfor (let i=0; i<n; i++) {...}   // n\n// Toplam: 3n → O(n)`,
    },
    {
      id: "dominant",
      title: "Baskın Terimi Al",
      icon: "👑",
      short: "O(n² + n) → O(n²)",
      explain: `n büyüdükçe küçük terimler anlamsızlaşır.\n\nn=1000 için: n² = 1.000.000, n = 1.000\nYani n, n²'nin binde biridir. Yok sayabiliriz.\n\nPratik: bir fonksiyonda hem O(n²) hem O(n) adım varsa, sadece O(n²) yazılır.`,
      example: `function ornek(dizi) {\n  // O(n²) - iç içe döngü\n  for (let i=0; i<n; i++)\n    for (let j=0; j<n; j++) {}\n\n  // O(n) - tek döngü\n  for (let i=0; i<n; i++) {}\n}\n// Toplam: n² + n → O(n²)`,
    },
    {
      id: "toplama",
      title: "Ardışık → Topla",
      icon: "➕",
      short: "O(n) + O(m) = O(n+m)",
      explain: `İki ayrı veri yapısı kullanılıyorsa veya bağımsız iki döngü varsa, toplama yapılır.\n\nEğer ikisi de n ile büyüyorsa: O(n) + O(n) = O(2n) = O(n)\nFarklı büyüklükse: O(n) + O(m) = O(n+m) olarak bırakılır.`,
      example: `function ikiDizi(a, b) {\n  // a'yı gez: O(a.length)\n  for (let x of a) console.log(x);\n\n  // b'yi gez: O(b.length)\n  for (let x of b) console.log(x);\n}\n// O(a + b) — ikisi de bağımsız`,
    },
    {
      id: "carpma",
      title: "İç İçe → Çarp",
      icon: "✖️",
      short: "O(n) × O(n) = O(n²)",
      explain: `Bir döngü başka bir döngünün içindeyse, karmaşıklıkları çarpılır.\n\nDıştaki n kez döner, içteki de n kez → n × n = n².`,
      example: `function cifDizi(a, b) {\n  // a'nın her elemanı için b'yi gez\n  for (let x of a) {       // n kez\n    for (let y of b) {     // m kez\n      console.log(x, y);\n    }\n  }\n}\n// O(n × m) — ya da ikisi eşitse O(n²)`,
    },
    {
      id: "log",
      title: "Log Tabanı Önemli Değil",
      icon: "📐",
      short: "O(log₂ n) = O(log n)",
      explain: `Logaritmanın tabanı sadece sabit bir faktördür, Big O'da sabitleri attığımız için taban fark etmez.\n\nlog₂(n) = log(n) / log(2)\nYani log₂(n), log(n)'den sadece 1/log(2) ≈ 3.32 kat büyüktür — sabit!`,
      example: `// Binary Search\nfunction ara(dizi, hedef) {\n  let sol=0, sag=dizi.length-1;\n  while(sol<=sag) {\n    let mid = sol+sag >> 1;\n    // Her adımda n yarıya iner\n    // → log₂(n) adım → O(log n)\n  }\n}`,
    },
  ];

  /* Karşılaştırma tablosu verileri */
  const tableData = [
    { algo: "Dizi indexleme", best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(1)", grade: "emerald" },
    { algo: "Binary Search", best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)", grade: "sky" },
    { algo: "Linear Search", best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)", grade: "amber" },
    { algo: "Merge Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)", grade: "violet" },
    { algo: "Quick Sort", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)", grade: "violet" },
    { algo: "Bubble Sort", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", grade: "orange" },
    { algo: "Insertion Sort", best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)", grade: "orange" },
    { algo: "Stack push/pop", best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(n)", grade: "emerald" },
    { algo: "BST arama", best: "O(log n)", avg: "O(log n)", worst: "O(n)", space: "O(n)", grade: "sky" },
  ];

  return (
    <div className="bo-page">

      {/* ── HERO ── */}
      <section className="bo-hero">
        <div className="bo-hero-badge">Algoritma Analizi</div>
        <h1 className="bo-hero-title">
          Big O Notasyonu
        </h1>
        <p className="bo-hero-sub">
          Bir algoritmanın ne kadar <em>hızlı büyüdüğünü</em> anlatan evrensel dil.
          Sıfırdan, günlük hayat örnekleriyle, hiçbir şey bilmeden.
        </p>
        <div className="bo-hero-chips">
          {COMPLEXITIES.map((c) => (
            <span key={c.key} className={`bo-hero-chip bo-hero-chip-${c.color}`}>{c.label}</span>
          ))}
        </div>
      </section>

      {/* ── NEDEN BIG O? ── */}
      <section className="bo-section">
        <SectionTitle
          tag="Temel Kavram"
          title="Neden Big O'ya İhtiyaç Var?"
          sub="İki farklı bilgisayarda aynı kodu çalıştırsan farklı süre alabilir. Ama algoritmanın büyüme hızı değişmez."
        />

        <div className="bo-why-grid">
          <div className="bo-why-card">
            <span className="bo-why-icon">⏱️</span>
            <h3>Süre mi ölçelim?</h3>
            <p>
              Hız bilgisayara, dile, yüke göre değişir. Bugün 0.1 sn olan kod, yarın başka makinede 2 sn olabilir.
              <strong> Güvenilmez!</strong>
            </p>
          </div>
          <div className="bo-why-card bo-why-card-highlight">
            <span className="bo-why-icon">📈</span>
            <h3>Büyüme hızını ölçelim!</h3>
            <p>
              n (eleman sayısı) 2 katına çıkınca adım sayısı ne kadar artıyor?
              Bu oran evrenseldir, makineye bağlı değildir.
              <strong> Big O tam bunu ölçer.</strong>
            </p>
          </div>
          <div className="bo-why-card">
            <span className="bo-why-icon">🎯</span>
            <h3>En kötü durumu baz alır</h3>
            <p>
              Big O genellikle <em>en kötü senaryo</em> için üst sınır verir.
              "Bu algoritma hiçbir zaman bundan daha kötü olmaz" garantisidir.
            </p>
          </div>
        </div>

        <NoteBox icon="💡" color="sky" title="Basit tanım: ">
          n sayısı çok büyüyünce, kaç adım atılacak? Big O bize bunu büyüme hızı olarak söyler.
          n=1.000.000 için: O(1) → 1 adım, O(log n) → 20 adım, O(n) → 1.000.000 adım, O(n²) → 1.000.000.000.000 adım!
        </NoteBox>
      </section>

      {/* ── İNTERAKTİF SLIDER ── */}
      <section className="bo-section">
        <SectionTitle
          tag="İnteraktif"
          title="n Kaç Olursa Ne Olur?"
          sub="Kaydırıcıyı hareket ettir ve farklı karmaşıklıkların adım sayısını canlı gör."
        />

        <div className="bo-slider-card">
          <div className="bo-slider-header">
            <span className="bo-slider-label">n (Eleman Sayısı)</span>
            <span className="bo-slider-n">{n}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="bo-slider"
          />
          <div className="bo-slider-ticks">
            <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
          </div>

          <div className="bo-bars">
            {values.map((v) => (
              <ComplexityBar key={v.key} pct={v.pct} color={v.color} label={v.label} value={v.value} />
            ))}
          </div>

          <p className="bo-slider-note">
            n={n} için en kötü: O(2ⁿ) = 2^{n} ≈ {Math.pow(2, n) > 1e9 ? (Math.pow(2, n) / 1e9).toFixed(1) + " milyar" : Math.pow(2, n).toLocaleString("tr-TR")} adım
          </p>
        </div>
      </section>

      {/* ── KARMAŞIKLIK KARTLARI ── */}
      <section className="bo-section">
        <SectionTitle
          tag="6 Temel Seviye"
          title="Her Karmaşıklık Sınıfı"
          sub="Bir karta tıkla: günlük hayat analojisini, örnek kodu ve gerçek algoritmaları gör."
        />

        <div className="bo-cards-list">
          {COMPLEXITIES.map((c) => (
            <ComplexityCard
              key={c.key}
              c={c}
              active={activeCard === c.key}
              onClick={() => toggleCard(c.key)}
            />
          ))}
        </div>
      </section>

      {/* ── GÖRSEL KARŞILAŞTIRMA ── */}
      <section className="bo-section">
        <SectionTitle
          tag="Görselleştirme"
          title="Büyüme Eğrileri"
          sub="n arttıkça her sınıfın nasıl davrandığını gösteren sezgisel grafik."
        />

        <div className="bo-chart-card">
          <div className="bo-chart-area">
            {/* SVG grafik */}
            <svg viewBox="0 0 500 280" className="bo-chart-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8faff" />
                  <stop offset="100%" stopColor="#f0f4ff" />
                </linearGradient>
              </defs>
              <rect width="500" height="280" fill="url(#bgGrad)" rx="12"/>

              {/* Grid çizgileri */}
              {[50,100,150,200,250].map((y) => (
                <line key={y} x1="50" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4"/>
              ))}
              {[100,200,300,400].map((x) => (
                <line key={x} x1={x+50} y1="10" x2={x+50} y2="260" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4"/>
              ))}

              {/* Eksenler */}
              <line x1="50" y1="260" x2="480" y2="260" stroke="#94a3b8" strokeWidth="2"/>
              <line x1="50" y1="10" x2="50" y2="260" stroke="#94a3b8" strokeWidth="2"/>
              <text x="490" y="264" fontSize="11" fill="#94a3b8">n</text>
              <text x="30" y="15" fontSize="11" fill="#94a3b8">ops</text>

              {/* O(1) - düz çizgi */}
              <path d="M50,255 L480,255" stroke="#10b981" strokeWidth="2.5" fill="none"/>
              <text x="455" y="250" fontSize="10" fill="#10b981" fontWeight="700">O(1)</text>

              {/* O(log n) */}
              <path d={`M50,255 ${Array.from({length:43},(_,i)=>{const x=50+i*10;const ni=(i+1)*0.7;const y=255-Math.log2(ni+1)*28;return `L${x},${y.toFixed(1)}`}).join(' ')}`}
                stroke="#0ea5e9" strokeWidth="2.5" fill="none"/>
              <text x="448" y="148" fontSize="10" fill="#0ea5e9" fontWeight="700">O(log n)</text>

              {/* O(n) */}
              <path d={`M50,255 L480,${255-43*3.5}`} stroke="#f59e0b" strokeWidth="2.5" fill="none"/>
              <text x="460" y={255-43*3.5-5} fontSize="10" fill="#f59e0b" fontWeight="700">O(n)</text>

              {/* O(n log n) */}
              <path d={`M50,255 ${Array.from({length:43},(_,i)=>{const x=50+i*10;const ni=(i+1)*0.7;const y=255-ni*Math.log2(ni+1)*2.0;return `L${x},${Math.max(10,y).toFixed(1)}`}).join(' ')}`}
                stroke="#8b5cf6" strokeWidth="2.5" fill="none"/>
              <text x="310" y="20" fontSize="10" fill="#8b5cf6" fontWeight="700">O(n log n)</text>

              {/* O(n²) */}
              <path d={`M50,255 ${Array.from({length:43},(_,i)=>{const x=50+i*10;const ni=(i+1)*0.6;const y=255-ni*ni*0.24;return `L${x},${Math.max(10,y).toFixed(1)}`}).join(' ')}`}
                stroke="#f97316" strokeWidth="2.5" fill="none"/>
              <text x="180" y="22" fontSize="10" fill="#f97316" fontWeight="700">O(n²)</text>

              {/* O(2^n) */}
              <path d={`M50,255 ${Array.from({length:24},(_,i)=>{const x=50+i*10;const ni=(i+1)*0.5;const y=255-Math.pow(2,ni)*0.6;return `L${x},${Math.max(10,y).toFixed(1)}`}).join(' ')}`}
                stroke="#f43f5e" strokeWidth="2.5" fill="none"/>
              <text x="105" y="22" fontSize="10" fill="#f43f5e" fontWeight="700">O(2ⁿ)</text>
            </svg>
          </div>
          <div className="bo-chart-legend">
            {[
              {label:"O(1)", color:"emerald", desc:"Düz çizgi — hiç büyümez"},
              {label:"O(log n)", color:"sky", desc:"Yavaş yavaş artar"},
              {label:"O(n)", color:"amber", desc:"Doğrusal büyür"},
              {label:"O(n log n)", color:"violet", desc:"Biraz daha eğimli"},
              {label:"O(n²)", color:"orange", desc:"Hızlı fırlar"},
              {label:"O(2ⁿ)", color:"rose", desc:"Dikey çıkış — tehlikeli"},
            ].map((l) => (
              <div key={l.label} className="bo-legend-row">
                <span className={`bo-legend-dot bo-dot-${l.color}`} />
                <span className="bo-legend-label">{l.label}</span>
                <span className="bo-legend-desc">{l.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HESAPLAMA KURALLARI ── */}
      <section className="bo-section">
        <SectionTitle
          tag="Kurallar"
          title="Big O Nasıl Hesaplanır?"
          sub="Bir algoritmaya bakıp Big O'yu bulmak için 5 pratik kural. Tıkla, detayını gör."
        />

        <div className="bo-rules-list">
          {rules.map((r) => (
            <div
              key={r.id}
              className={`bo-rule-card ${activeRule === r.id ? "bo-rule-active" : ""}`}
              onClick={() => setActiveRule((prev) => (prev === r.id ? null : r.id))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveRule((prev) => (prev === r.id ? null : r.id))}
            >
              <div className="bo-rule-header">
                <span className="bo-rule-icon">{r.icon}</span>
                <div className="bo-rule-title-wrap">
                  <span className="bo-rule-title">{r.title}</span>
                  <code className="bo-rule-short">{r.short}</code>
                </div>
                <span className="bo-rule-chevron">{activeRule === r.id ? "▲" : "▼"}</span>
              </div>
              {activeRule === r.id && (
                <div className="bo-rule-detail">
                  <p className="bo-rule-explain" style={{whiteSpace:"pre-line"}}>{r.explain}</p>
                  <pre className="bo-rule-code"><code>{r.example}</code></pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── EN İYİ / ORTALAMA / EN KÖTÜ ── */}
      <section className="bo-section">
        <SectionTitle
          tag="Derinlik"
          title="En İyi, Ortalama, En Kötü Durum"
          sub="Big O genelde en kötü durumu ifade eder. Ama üç durum da önemlidir."
        />

        <div className="bo-case-grid">
          <div className="bo-case-card bo-case-best">
            <span className="bo-case-icon">🌟</span>
            <h3>En İyi Durum (Ω)</h3>
            <p>Algoritmanın şanslı olduğu durum. Örneğin linear search'te aranan eleman ilk sıradadır → O(1).</p>
            <p className="bo-case-note">Omega (Ω) notasyonuyla gösterilir. Nadiren işe yarar çünkü garantisi yok.</p>
          </div>
          <div className="bo-case-card bo-case-avg">
            <span className="bo-case-icon">📊</span>
            <h3>Ortalama Durum (Θ)</h3>
            <p>Tüm olası girdilerin ortalaması. Linear search'te eleman ortada → O(n/2) = O(n).</p>
            <p className="bo-case-note">Theta (Θ) notasyonuyla gösterilir. Gerçek dünya performansı için önemlidir.</p>
          </div>
          <div className="bo-case-card bo-case-worst">
            <span className="bo-case-icon">😱</span>
            <h3>En Kötü Durum (O)</h3>
            <p>Algoritmanın en fazla bu kadar sürer dedirten durum. Linear search'te eleman son sıradadır → O(n).</p>
            <p className="bo-case-note">Bu, Big O'nun ifade ettiği şeydir. Güvenilir üst sınır garantisi verir.</p>
          </div>
        </div>

        <NoteBox icon="🎯" color="violet" title="Pratik not: ">
          Quick Sort ortalamada O(n log n) ama en kötü durumda O(n²). Merge Sort her zaman O(n log n).
          Kritik sistemlerde en kötü durum garantisi olan algoritmalar tercih edilir.
        </NoteBox>
      </section>

      {/* ── KARŞILAŞTIRMA TABLOSU ── */}
      <section className="bo-section">
        <SectionTitle
          tag="Özet Tablo"
          title="Algoritma Karmaşıklık Tablosu"
          sub="Öğrendiğimiz algoritmaların Big O özeti."
        />

        <div className="bo-table-wrap">
          <table className="bo-table">
            <thead>
              <tr>
                <th>Algoritma</th>
                <th>En İyi</th>
                <th>Ortalama</th>
                <th>En Kötü</th>
                <th>Alan</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.algo}>
                  <td className="bo-table-algo">{row.algo}</td>
                  <td><span className={`bo-complexity-badge bo-cb-${row.grade}`}>{row.best}</span></td>
                  <td><span className="bo-complexity-badge bo-cb-neutral">{row.avg}</span></td>
                  <td><span className="bo-complexity-badge bo-cb-neutral">{row.worst}</span></td>
                  <td><span className="bo-complexity-badge bo-cb-neutral">{row.space}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── GÜNLÜK HAYAT ── */}
      <section className="bo-section">
        <SectionTitle
          tag="Günlük Hayat"
          title="Gerçek Hayatta Big O"
          sub="Kod bilmesen de zaten kullanıyorsun. Her Big O türüne karşılık gelen günlük hayat senaryoları."
        />

        <div className="bo-life-list">

          <div className="bo-life-card bo-life-emerald">
            <div className="bo-life-complexity">
              <span className="bo-life-badge bo-lb-emerald">O(1)</span>
              <span className="bo-life-grade">Sabit Zaman</span>
            </div>
            <div className="bo-life-examples">
              <div className="bo-life-example">
                <span className="bo-life-icon">🚗</span>
                <div>
                  <strong>Otopark bilet makinesi</strong>
                  <p>Otoparkta kaç araç olursa olsun, çıkış bileti almak için 1 düğmeye basarsın. 10 araçlık otoparkta da 1000 araçlık otoparkta da işlem aynı sürer.</p>
                </div>
              </div>
              <div className="bo-life-example">
                <span className="bo-life-icon">🔑</span>
                <div>
                  <strong>Anahtarla kapı açmak</strong>
                  <p>Binada kaç kat olursa olsun, anahtarı kilide takıp çevirmek hep 1 harekettir. Binanın büyüklüğü süreyi etkilemez.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bo-life-card bo-life-sky">
            <div className="bo-life-complexity">
              <span className="bo-life-badge bo-lb-sky">O(log n)</span>
              <span className="bo-life-grade">Logaritmik Zaman</span>
            </div>
            <div className="bo-life-examples">
              <div className="bo-life-example">
                <span className="bo-life-icon">📖</span>
                <div>
                  <strong>Sözlükte kelime aramak</strong>
                  <p>Kitabı ortadan açarsın. "Aranan kelime mi önce mi sonra?" diye sorar, ilgili yarıya geçersin. 100.000 kelimeli sözlükte ~17 adımda bulursun.</p>
                </div>
              </div>
              <div className="bo-life-example">
                <span className="bo-life-icon">🏢</span>
                <div>
                  <strong>Asansörde kat bulmak</strong>
                  <p>20 katlı binada 14. kata çıkmak istiyorsun. 10. katta mısın? Yukarı. 17. katta mısın? Aşağı. Her seferinde alanı yarıya indirirsin.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bo-life-card bo-life-amber">
            <div className="bo-life-complexity">
              <span className="bo-life-badge bo-lb-amber">O(n)</span>
              <span className="bo-life-grade">Doğrusal Zaman</span>
            </div>
            <div className="bo-life-examples">
              <div className="bo-life-example">
                <span className="bo-life-icon">🛒</span>
                <div>
                  <strong>Markette kayıp ürün aramak</strong>
                  <p>Markette belirli bir ürünü arıyorsun ama nerede olduğunu bilmiyorsun. Raf raf tek tek bakman gerekiyor. 100 raflı markette 100 rafa bakarsın.</p>
                </div>
              </div>
              <div className="bo-life-example">
                <span className="bo-life-icon">📋</span>
                <div>
                  <strong>Yoklama listesini okumak</strong>
                  <p>Öğretmen sınıftaki herkesi tek tek ismiyle çağırır. 30 öğrenci varsa 30 isim okunur. 60 öğrenci varsa 60 isim. Doğrudan orantılı.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bo-life-card bo-life-violet">
            <div className="bo-life-complexity">
              <span className="bo-life-badge bo-lb-violet">O(n log n)</span>
              <span className="bo-life-grade">Doğrusal-logaritmik</span>
            </div>
            <div className="bo-life-examples">
              <div className="bo-life-example">
                <span className="bo-life-icon">🃏</span>
                <div>
                  <strong>İskambil kartlarını sıralamak</strong>
                  <p>52 kartı sıralamak için: desteni ikiye böl, her yarıyı sırala, sonra birleştir. Bu işlemi tekrarla. n kartı sıralamak O(n log n) adım ister.</p>
                </div>
              </div>
              <div className="bo-life-example">
                <span className="bo-life-icon">📬</span>
                <div>
                  <strong>Postacının mektupları sıralaması</strong>
                  <p>Postacı 1000 mektubu semte göre gruplayıp, her grup içinde sokağa göre, sonra kapı numarasına göre sıralar. Her aşamada akıllıca ikiye böler.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bo-life-card bo-life-orange">
            <div className="bo-life-complexity">
              <span className="bo-life-badge bo-lb-orange">O(n²)</span>
              <span className="bo-life-grade">Karesel Zaman</span>
            </div>
            <div className="bo-life-examples">
              <div className="bo-life-example">
                <span className="bo-life-icon">🤝</span>
                <div>
                  <strong>Partide herkesi tanıştırmak</strong>
                  <p>10 kişilik partide herkes herkesle el sıkışacak: 45 tokalaşma. 20 kişi olsa 190, 100 kişi olsa 4950 tokalaşma. n kişi → n×(n-1)/2 ≈ n² işlem.</p>
                </div>
              </div>
              <div className="bo-life-example">
                <span className="bo-life-icon">👗</span>
                <div>
                  <strong>Gardırobu düzensiz sıralamak</strong>
                  <p>Kıyafetleri renge göre sıralıyorsun ama yöntemi yok: her kıyafeti diğerleriyle karşılaştırıp doğru yere koyuyorsun. n kıyafet için n² karşılaştırma gerekir.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bo-life-card bo-life-rose">
            <div className="bo-life-complexity">
              <span className="bo-life-badge bo-lb-rose">O(2ⁿ)</span>
              <span className="bo-life-grade">Üstel Zaman</span>
            </div>
            <div className="bo-life-examples">
              <div className="bo-life-example">
                <span className="bo-life-icon">🔐</span>
                <div>
                  <strong>Kombinasyon kilidi kırmak</strong>
                  <p>Her basamak 0 ya da 1 ise: 1 basamak → 2 deneme, 10 basamak → 1024 deneme, 30 basamak → 1 milyar deneme, 40 basamak → 1 trilyon deneme. Her basamak eklenmesi işi ikiye katlar.</p>
                </div>
              </div>
              <div className="bo-life-example">
                <span className="bo-life-icon">🍕</span>
                <div>
                  <strong>Pizza malzemeleri seçmek</strong>
                  <p>8 malzeme var, her birini koyup koymamayı seçiyorsun. 2⁸ = 256 farklı pizza mümkün. 20 malzeme olsa 2²⁰ = 1.048.576 olasılık. Her yeni malzeme olanakları ikiye katlar!</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── ÖZET ── */}
      <section className="bo-section bo-section-last">
        <SectionTitle
          tag="Özet"
          title="Aklında Kalan 3 Şey"
        />
        <div className="bo-summary-grid">
          <div className="bo-summary-card">
            <span className="bo-summary-num">1</span>
            <h3>Büyüme hızına bak</h3>
            <p>n iki katına çıkınca ne oluyor? Aynı mı kalıyor (O(1))? İki kat mı artıyor (O(n))? Dört kat mı (O(n²))?</p>
          </div>
          <div className="bo-summary-card">
            <span className="bo-summary-num">2</span>
            <h3>Sabitleri ve küçük terimleri at</h3>
            <p>O(5n² + 3n + 100) → O(n²). Karmaşıklıkta sadece en baskın terim kalır.</p>
          </div>
          <div className="bo-summary-card">
            <span className="bo-summary-num">3</span>
            <h3>En kötü durumu düşün</h3>
            <p>Big O, algoritmanın garantili üst sınırıdır. "Bu algoritmadan daha kötü olmaz" diyebilmek için kullanılır.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
