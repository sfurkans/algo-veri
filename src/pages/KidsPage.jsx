import "./KidsPage.css";
import { Link } from "react-router-dom";

/* ── Bölüm ayırıcı ── */
function SectionDivider({ emoji, label, cls }) {
  return (
    <div className="kp-section-divider">
      <div className="kp-section-divider-line" />
      <div className={`kp-section-divider-label ${cls}`}>
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="kp-section-divider-line" />
    </div>
  );
}

/* ── Linked List görsel ── */
function LinkedListViz({ nodes }) {
  return (
    <div className="kp-ll-viz">
      {nodes.map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div className={`kp-ll-node ${n.active ? "kp-ll-node-active" : ""}`}>
            <div className="kp-ll-val">{n.val}</div>
            <div className="kp-ll-ptr">→</div>
          </div>
          {i < nodes.length - 1 && <div className="kp-ll-arrow">—</div>}
          {i === nodes.length - 1 && (
            <><div className="kp-ll-arrow">—</div><div className="kp-ll-null">NULL</div></>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Mini görsel bileşeni: renkli kutucuklar dizisi ── */
function ArrayViz({ items }) {
  return (
    <div className="kp-array">
      {items.map((item, i) => (
        <div key={i} className={`kp-box kp-box-${item.state ?? "default"}`}>
          {item.val}
        </div>
      ))}
    </div>
  );
}

function Arrow({ label }) {
  return <div className="kp-arrow">↓ <span>{label}</span></div>;
}

/* ── Her algoritma için kart ── */
function AlgoCard({ id, color, emoji, title, subtitle, analogy, steps, visual, insight, link }) {
  return (
    <div className={`kp-card kp-card-${color}`} id={id}>
      {/* Renkli üst başlık bandı */}
      <div className="kp-card-header-band">
        <div className="kp-emoji-wrap">{emoji}</div>
        <div className="kp-card-header">
          <h2 className="kp-card-title">{title}</h2>
          <span className="kp-card-subtitle">{subtitle}</span>
        </div>
      </div>

      {/* İçerik */}
      <div className="kp-card-body">
        {/* Gerçek hayat analojisi */}
        <div className={`kp-analogy kp-analogy-${color}`}>
          <span className="kp-analogy-icon">💡</span>
          <p>{analogy}</p>
        </div>

        {/* Görsel */}
        {visual}

        {/* Adımlar */}
        <div className="kp-steps">
          {steps.map((step, i) => (
            <div key={i} className="kp-step">
              <span className={`kp-step-num kp-step-num-${color}`}>{i + 1}</span>
              <span className="kp-step-text">{step}</span>
            </div>
          ))}
        </div>

        {/* Aklında kalsın */}
        <div className={`kp-insight kp-insight-${color}`}>
          <span className="kp-insight-icon">🧠</span>
          <span>{insight}</span>
        </div>

        <Link to={link} className={`kp-goto kp-goto-${color}`}>
          Görselleştiriciyi Aç →
        </Link>
      </div>
    </div>
  );
}

/* ── Sayfa ── */
export default function KidsPage() {
  return (
    <div className="kp-page">

      {/* Hero */}
      <div className="kp-hero">
        <div className="kp-hero-grid" />
        <div className="kp-hero-orb kp-orb-1" />
        <div className="kp-hero-orb kp-orb-2" />
        <div className="kp-hero-orb kp-orb-3" />
        <div className="kp-hero-tag">📚 Başlangıç Rehberi</div>
        <h1 className="kp-hero-title">
          Algoritmalar &amp; Veri Yapıları<br />
          <span className="kp-hero-accent">Gerçek Hayattan Örneklerle</span>
        </h1>
        <p className="kp-hero-desc">
          Hiç kod yazmaya gerek yok. Sadece oku, düşün ve anla.
          Sıralama, arama ve veri yapılarının mantığını günlük hayat örnekleriyle öğren.
        </p>
        {/* İçindekiler */}
        <div className="kp-toc">
          {[
            { color: "indigo",  emoji: "🫧", label: "Bubble Sort",    href: "#bubble"     },
            { color: "amber",   emoji: "🔍", label: "Selection Sort", href: "#selection"  },
            { color: "emerald", emoji: "🃏", label: "Insertion Sort", href: "#insertion"  },
            { color: "violet",  emoji: "✂️", label: "Merge Sort",     href: "#merge"      },
            { color: "rose",    emoji: "🎯", label: "Quick Sort",     href: "#quick"      },
            { color: "red",     emoji: "🏔️", label: "Heap Sort",      href: "#heap"       },
            { color: "cyan",    emoji: "👆", label: "Linear Search",  href: "#linear"     },
            { color: "sky",     emoji: "📖", label: "Binary Search",  href: "#bsearch"    },
            { color: "blue",    emoji: "🌊", label: "BFS",            href: "#bfs"        },
            { color: "fuchsia", emoji: "🔦", label: "DFS",            href: "#dfs"        },
            { color: "slate",   emoji: "🗺️", label: "Dijkstra",       href: "#dijkstra"   },
            { color: "purple",  emoji: "📚", label: "Stack",          href: "#stack"      },
            { color: "orange",  emoji: "🚶", label: "Queue",          href: "#queue"      },
            { color: "teal",    emoji: "🔗", label: "Linked List",    href: "#linkedlist" },
            { color: "lime",    emoji: "🌳", label: "Binary Tree",    href: "#btree"      },
            { color: "green",   emoji: "🗂️", label: "Hash Table",     href: "#hashtable"  },
            { color: "zinc",    emoji: "🕸️", label: "Graph",          href: "#graph"      },
          ].map((t) => (
            <a key={t.label} href={t.href} className={`kp-toc-item kp-toc-${t.color}`}>
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Algoritma kartları */}
      <div className="kp-cards">

        {/* ── Bubble Sort ── */}
        <AlgoCard
          id="bubble"
          color="indigo"
          emoji="🫧"
          title="Bubble Sort"
          subtitle="Kabarcık Sıralama"
          analogy="Havuzda kabarcıklar nasıl yüzeye çıkarsa, büyük sayılar da her turda dizinin sonuna doğru 'yüzer'. İki kişiyi yan yana koy, büyük olan sağa geçsin. Bunu tekrarla — en büyük hep sona ulaşır."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Karışık dizi:</p>
              <ArrayViz items={[
                {val:5,state:"default"},{val:3,state:"default"},{val:8,state:"default"},{val:1,state:"default"},{val:4,state:"default"}
              ]} />
              <Arrow label="5 > 3 mü? Evet → yer değiştir. 5 > 8 mi? Hayır → geç. 8 > 1 mi? Evet → yer değiştir..." />
              <p className="kp-visual-label">1. tur sonunda:</p>
              <ArrayViz items={[
                {val:3,state:"default"},{val:5,state:"default"},{val:1,state:"default"},{val:4,state:"default"},{val:8,state:"sorted"}
              ]} />
              <p className="kp-visual-note">8 en büyük olduğu için sona ulaştı ✓</p>
            </div>
          }
          steps={[
            "Dizinin başından başla, yan yana iki elemanı karşılaştır",
            "Sol eleman sağdan büyükse ikisini yer değiştir",
            "Sona ulaşınca bir tur bitti — en büyük eleman sona oturdu",
            "Aynı işlemi sıralanan kısmı çıkararak tekrarla",
          ]}
          insight="Her turda en az 1 eleman kesin yerine oturur. n-1 tur sonunda dizi tamamen sıralı olur."
          link="/sorting/bubble-sort"
        />

        {/* ── Selection Sort ── */}
        <AlgoCard
          id="selection"
          color="amber"
          emoji="🔍"
          title="Selection Sort"
          subtitle="Seçme Sıralama"
          analogy="Masanın üzerinde karışık oyun kartları var. En küçüğünü bul ve ilk sıraya koy. Sonra geri kalanlar içinde yine en küçüğünü bul ve ikinci sıraya koy. Her seferinde 'en küçüğü seçip' doğru yere koymak — bu Selection Sort."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Başlangıç:</p>
              <ArrayViz items={[
                {val:4,state:"default"},{val:2,state:"default"},{val:7,state:"default"},{val:1,state:"minimum"},{val:5,state:"default"}
              ]} />
              <Arrow label="En küçük = 1 → başa taşı" />
              <p className="kp-visual-label">1. tur sonunda:</p>
              <ArrayViz items={[
                {val:1,state:"sorted"},{val:2,state:"default"},{val:7,state:"default"},{val:4,state:"default"},{val:5,state:"default"}
              ]} />
              <p className="kp-visual-note">1 kalıcı yerine oturdu. Şimdi kalanların en küçüğünü bul...</p>
            </div>
          }
          steps={[
            "Dizinin tamamını tara, en küçük elemanı bul",
            "O elemanı dizinin başındaki elemanla yer değiştir",
            "Artık başa oturan eleman kalıcı — ona bir daha dokunma",
            "Sıralanmamış kısımda aynı işlemi tekrarla",
          ]}
          insight="Selection Sort az takas yapar — her turda yalnızca 1 yer değiştirme olur. Ama karşılaştırma sayısı çoktur."
          link="/sorting/selection-sort"
        />

        {/* ── Insertion Sort ── */}
        <AlgoCard
          id="insertion"
          color="emerald"
          emoji="🃏"
          title="Insertion Sort"
          subtitle="Eklemeli Sıralama"
          analogy="İskambil oynarken kart çektiğinde elindeki sıralı kartların arasına doğru yere yerleştirirsin. 7'yi çektin, elimde 3-5-9 var; 7'yi 5 ile 9'un arasına sokarsın. Yeni elemanı eline alıp doğru yere 'eklemek' — bu Insertion Sort."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Sıralı kısım + yeni eleman:</p>
              <ArrayViz items={[
                {val:2,state:"sorted"},{val:5,state:"sorted"},{val:9,state:"sorted"},{val:6,state:"comparing"},{val:"?",state:"default"}
              ]} />
              <Arrow label="6'yı al. 9 > 6 → 9'u sağa kaydır. 5 < 6 → dur, buraya yerleştir" />
              <p className="kp-visual-label">Yerleştirme sonrası:</p>
              <ArrayViz items={[
                {val:2,state:"sorted"},{val:5,state:"sorted"},{val:6,state:"sorted"},{val:9,state:"sorted"},{val:"?",state:"default"}
              ]} />
              <p className="kp-visual-note">6 doğru yerine eklendi ✓</p>
            </div>
          }
          steps={[
            "İkinci elemandan başla — ilk eleman tek başına zaten 'sıralı'",
            "Yeni elemanı al (anahtar), solundaki sıralı kısma bak",
            "Anahtardan büyük olan elemanları sağa kaydır",
            "Boşalan yere anahtarı yerleştir",
          ]}
          insight="Dizi neredeyse sıralıysa Insertion Sort çok hızlıdır. Gerçek hayatta en çok kullanılan basit algoritma budur."
          link="/sorting/insertion-sort"
        />

        {/* ── Merge Sort ── */}
        <AlgoCard
          id="merge"
          color="violet"
          emoji="✂️"
          title="Merge Sort"
          subtitle="Birleştirme Sıralama"
          analogy="İki arkadaşın elinde birer sıralı kitap listesi var. Birleşik tek bir liste yapmak için: her ikiniz de listenizin en üstüne bakın, küçük olanı ortak listeye yazın ve o kişi bir alt satıra geçsin. Bu işlemi listelerin biri bitene kadar sürdürün. Böl, sırala, birleştir."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Diziyi ikiye böl:</p>
              <div className="kp-merge-split">
                <ArrayViz items={[{val:3,state:"left-sub"},{val:7,state:"left-sub"},{val:1,state:"left-sub"}]} />
                <span className="kp-split-sep">+</span>
                <ArrayViz items={[{val:2,state:"right-sub"},{val:5,state:"right-sub"},{val:4,state:"right-sub"}]} />
              </div>
              <Arrow label="Her iki yarıyı sırala, sonra birleştir" />
              <div className="kp-merge-split">
                <ArrayViz items={[{val:1,state:"sorted"},{val:3,state:"sorted"},{val:7,state:"sorted"}]} />
                <span className="kp-split-sep">+</span>
                <ArrayViz items={[{val:2,state:"sorted"},{val:4,state:"sorted"},{val:5,state:"sorted"}]} />
              </div>
              <Arrow label="Birleştir: 1<2 → 1 al, 2<3 → 2 al..." />
              <ArrayViz items={[
                {val:1,state:"sorted"},{val:2,state:"sorted"},{val:3,state:"sorted"},
                {val:4,state:"sorted"},{val:5,state:"sorted"},{val:7,state:"sorted"}
              ]} />
            </div>
          }
          steps={[
            "Diziyi tam ortadan ikiye böl",
            "Sol yarıyı kendi içinde sırala (aynı yöntemi uygula)",
            "Sağ yarıyı kendi içinde sırala",
            "İki sıralı yarıyı karşılaştırarak birleştir",
          ]}
          insight="Merge Sort böl-ve-fethet stratejisi kullanır. Her durumda O(n log n) garantisi verir — hiçbir zaman yavaşlamaz."
          link="/sorting/merge-sort"
        />

        {/* ── Quick Sort ── */}
        <AlgoCard
          id="quick"
          color="rose"
          emoji="🎯"
          title="Quick Sort"
          subtitle="Hızlı Sıralama"
          analogy="Sınıfı boya göre sıralamak istiyorsun. Bir öğrenci ortaya çıkıyor ve diyor ki: 'Ben pivotum. Benden kısa olanlar sola, uzun olanlar sağa geçsin.' Tek hamlede kalabalık ikiye bölündü. Şimdi sol ve sağ gruplar için de aynı şeyi yap."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Pivot = 5 seçildi:</p>
              <ArrayViz items={[
                {val:3,state:"default"},{val:7,state:"default"},{val:5,state:"pivot"},{val:1,state:"default"},{val:8,state:"default"},{val:4,state:"default"}
              ]} />
              <Arrow label="5'ten küçükler sola, büyükler sağa" />
              <div className="kp-merge-split kp-quick-split">
                <ArrayViz items={[{val:3,state:"left-sub"},{val:1,state:"left-sub"},{val:4,state:"left-sub"}]} />
                <ArrayViz items={[{val:5,state:"pivot"}]} />
                <ArrayViz items={[{val:7,state:"right-sub"},{val:8,state:"right-sub"}]} />
              </div>
              <p className="kp-visual-note">5 kalıcı yerine oturdu. Sol ve sağ gruplar için tekrarla.</p>
            </div>
          }
          steps={[
            "Bir eleman seç — bu 'pivot' olacak",
            "Pivottan küçük olanları sola, büyük olanları sağa taşı",
            "Pivot artık kalıcı doğru yerinde — ona dokunma",
            "Sol ve sağ gruplar için aynı işlemi tekrarla",
          ]}
          insight="Quick Sort pratikte en hızlı algoritmalardan biridir. Ama kötü pivot seçimi onu yavaşlatır — şans da önemlidir!"
          link="/sorting/quick-sort"
        />

        {/* ── Heap Sort ── */}
        <AlgoCard
          id="heap"
          color="red"
          emoji="🏔️"
          title="Heap Sort"
          subtitle="Yığın Sıralama"
          analogy="Bir turnuvayı hayal et: en güçlü oyuncu her zaman zirvede. Zirveden kazananı al (en büyük sayıyı dizinin sonuna koy), turnuvayı yeniden düzenle ve yeni şampiyon zirveye çıksın. Bunu tekrarla — en büyükten en küçüğe sıralı liste çıkar."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Max Heap — en büyük her zaman tepede:</p>
              <div className="kp-tree-viz">
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-root">9</div>
                </div>
                <div className="kp-tree-connector"><span>↙</span><span>↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left">7</div>
                  <div className="kp-tree-node kp-tn-right">6</div>
                </div>
                <div className="kp-tree-connector" style={{gap:20}}><span>↙↘</span><span>↙↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>4</div>
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>3</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>2</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>1</div>
                </div>
              </div>
              <Arrow label="9'u al → sona koy, yığını yeniden düzenle → 7 tepeye çıkar..." />
              <ArrayViz items={[
                {val:1,state:"default"},{val:2,state:"default"},{val:3,state:"default"},
                {val:4,state:"default"},{val:6,state:"default"},{val:7,state:"default"},{val:9,state:"sorted"}
              ]} />
              <p className="kp-visual-note">Her adımda bir eleman kalıcı yerine oturur — O(n log n)</p>
            </div>
          }
          steps={[
            "Diziyi Max Heap'e dönüştür (her ebeveyn çocuğundan büyük)",
            "Tepedeki en büyük elemanı al, dizinin sonuna taşı",
            "Heap boyutunu bir azalt, yığını yeniden düzenle (siftDown)",
            "Heap boşalana kadar tekrarla — dizi sıralanmış olur",
          ]}
          insight="Heap Sort her durumda O(n log n) garantisi verir ve ekstra bellek kullanmaz. Merge Sort kadar güvenilir, Quick Sort kadar yerinde — ama pratikte daha yavaş hissettirir."
          link="/sorting/heap-sort"
        />

      </div>

      {/* ── Arama Algoritmaları ── */}
      <SectionDivider emoji="⌕" label="Arama Algoritmaları" cls="kp-sdl-search" />

      <div className="kp-cards">

        {/* ── Linear Search ── */}
        <AlgoCard
          id="linear"
          color="cyan"
          emoji="👆"
          title="Linear Search"
          subtitle="Doğrusal Arama"
          analogy="Çantanda anahtarını arıyorsun ama nerede olduğunu bilmiyorsun. Tek tek her cebi kontrol ediyorsun — ta ki bulana kadar ya da hepsini kontrol edene kadar. Sıra önemli değil, her şeye bakıyorsun."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Aranan: 7 — soldan başla:</p>
              <ArrayViz items={[
                {val:5,state:"eliminated"},{val:3,state:"eliminated"},{val:8,state:"eliminated"},{val:7,state:"found"},{val:2,state:"default"}
              ]} />
              <Arrow label="5≠7 → 3≠7 → 8≠7 → 7=7 ✓ Bulundu! (4. adımda)" />
              <p className="kp-visual-note">En kötü durumda tüm diziyi taramak gerekir — O(n)</p>
            </div>
          }
          steps={[
            "Dizinin en başından başla",
            "Şu anki elemanı aradığınla karşılaştır",
            "Eşitse bulundu — dur",
            "Değilse bir sonrakine geç, sona kadar devam et",
          ]}
          insight="Dizi sıralı olmak zorunda değil. Ama n elemanlı dizide en kötü n adım atar. Küçük veya sırasız veriler için yeterli."
          link="/searching/linear-search"
        />

        {/* ── Binary Search ── */}
        <AlgoCard
          id="bsearch"
          color="sky"
          emoji="📖"
          title="Binary Search"
          subtitle="İkili Arama"
          analogy="Kalın bir sözlükte 'mango' kelimesini arıyorsun. Ortasından açıyorsun — 'K' harfi çıktı, mango daha sonra. Sağ yarıya bakıyorsun, yine ortadan açıyorsun. Her seferinde arama alanını tam yarıya indiriyorsun."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Sıralı dizi, aranan: 9</p>
              <ArrayViz items={[
                {val:1,state:"default"},{val:3,state:"default"},{val:5,state:"mid"},{val:7,state:"default"},{val:9,state:"default"},{val:11,state:"default"},{val:13,state:"default"}
              ]} />
              <Arrow label="Orta = 5. 9 > 5 → sol yarıyı at, sağa bak" />
              <ArrayViz items={[
                {val:1,state:"eliminated"},{val:3,state:"eliminated"},{val:5,state:"eliminated"},{val:7,state:"default"},{val:9,state:"mid"},{val:11,state:"default"},{val:13,state:"default"}
              ]} />
              <Arrow label="Orta = 9. 9 = 9 → Bulundu! Sadece 2 adımda." />
              <p className="kp-visual-note">7 elemanlı dizide en fazla 3 adım yeter — O(log n)</p>
            </div>
          }
          steps={[
            "DİKKAT: Dizi mutlaka sıralı olmalı",
            "Ortadaki elemana bak, arananla karşılaştır",
            "Aranan küçükse sol yarıya, büyükse sağ yarıya geç",
            "Tek eleman kalana kadar ortayı bölmeye devam et",
          ]}
          insight="Her adımda arama alanı yarıya düşer. 1000 elemanlı dizide en fazla 10 adım yeter! Linear Search'te 1000 adım gerekirdi."
          link="/searching/binary-search"
        />

      </div>

      {/* ── Graf Algoritmaları ── */}
      <SectionDivider emoji="⬡" label="Graf Algoritmaları" cls="kp-sdl-graf" />

      <div className="kp-cards">

        {/* ── BFS ── */}
        <AlgoCard
          id="bfs"
          color="blue"
          emoji="🌊"
          title="BFS"
          subtitle="Genişlik Öncelikli Arama"
          analogy="Suya taş attığında dalgalar merkezi etrafında katman katman yayılır. BFS da tam böyle çalışır: önce başlangıç noktasının tüm komşularını ziyaret et, sonra o komşuların komşularını — hep katman katman, hiç atlamadan."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Graf — A'dan başla:</p>
              <div className="kp-tree-viz">
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-root">A</div>
                </div>
                <div className="kp-tree-connector"><span>↙</span><span>↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left">B</div>
                  <div className="kp-tree-node kp-tn-right">C</div>
                </div>
                <div className="kp-tree-connector" style={{gap:20}}><span>↙↘</span><span>↙↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>D</div>
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>E</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>F</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>G</div>
                </div>
              </div>
              <Arrow label="Ziyaret sırası: A → B, C → D, E, F, G (katman katman)" />
              <p className="kp-visual-note">BFS Queue kullanır — ilk giren ilk çıkar</p>
            </div>
          }
          steps={[
            "Başlangıç düğümünü kuyruğa (Queue) ekle, ziyaret edildi işaretle",
            "Kuyruğun önündeki düğümü çıkar, ziyaret et",
            "O düğümün ziyaret edilmemiş tüm komşularını kuyruğa ekle",
            "Kuyruk boşalana kadar tekrarla",
          ]}
          insight="BFS iki düğüm arasındaki en az adımlı yolu bulur. 'Kaç derece ayrılık?' sorusu, arkadaş öneri sistemleri ve labirent çözme BFS ile yapılır."
          link="/searching/bfs"
        />

        {/* ── DFS ── */}
        <AlgoCard
          id="dfs"
          color="fuchsia"
          emoji="🔦"
          title="DFS"
          subtitle="Derinlik Öncelikli Arama"
          analogy="Mağara keşfediyorsun: bir koridora gir, sonuna kadar ilerle. Çıkmaza girince bir adım geri dön, farklı yola gir. Tüm koridorları böyle teker teker keşfedersin — genişliğe değil, derinliğe öncelik verirsin."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Graf — A'dan başla:</p>
              <div className="kp-tree-viz">
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-root">A</div>
                </div>
                <div className="kp-tree-connector"><span>↙</span><span>↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left">B</div>
                  <div className="kp-tree-node kp-tn-right">C</div>
                </div>
                <div className="kp-tree-connector" style={{gap:20}}><span>↙↘</span><span>↙↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>D</div>
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>E</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>F</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>G</div>
                </div>
              </div>
              <Arrow label="Ziyaret sırası: A → B → D → E → C → F → G (dala gir, bitir, geri dön)" />
              <p className="kp-visual-note">DFS Stack (veya özyineleme) kullanır</p>
            </div>
          }
          steps={[
            "Başlangıç düğümünü yığına (Stack) ekle, ziyaret edildi işaretle",
            "Yığının tepesindeki düğümü al, ziyaret et",
            "Ziyaret edilmemiş bir komşu varsa onu yığına ekle, ona geç",
            "Komşu yoksa geri dön (backtrack) — yığın boşalana kadar devam et",
          ]}
          insight="DFS labirent çözme, döngü tespiti, topolojik sıralama ve bağlantı analizi için kullanılır. BFS'den farklı olarak en kısa yolu garantilemez ama bellek kullanımı daha azdır."
          link="/searching/dfs"
        />

        {/* ── Dijkstra ── */}
        <AlgoCard
          id="dijkstra"
          color="slate"
          emoji="🗺️"
          title="Dijkstra"
          subtitle="En Kısa Yol Algoritması"
          analogy="GPS navigasyon gibi düşün. Şehirler arasındaki yolların farklı mesafeleri var. Başlangıçtan hedefe en kısa yolu bulmak için her adımda 'şimdiye kadar keşfedilen en ucuz yolu' seç ve oradan devam et."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">A'dan diğer şehirlere en kısa mesafe:</p>
              <ArrayViz items={[
                {val:"A:0",state:"sorted"},{val:"B:4",state:"comparing"},{val:"C:2",state:"comparing"},
                {val:"D:7",state:"default"},{val:"E:9",state:"default"}
              ]} />
              <Arrow label="A'dan başla → önce en yakın C'ye git (2) → C'den B'ye ulaş (2+2=4) → ..." />
              <p className="kp-visual-note">Her düğüm bir kez işlenir — O((V+E) log V)</p>
            </div>
          }
          steps={[
            "Başlangıç düğümüne mesafe 0, diğerlerine sonsuz ata",
            "İşlenmemiş düğümler içinden en kısa mesafeli olanı seç",
            "O düğümün komşularına gidilen yol daha kısaysa mesafeyi güncelle",
            "Tüm düğümler işlenene kadar tekrarla",
          ]}
          insight="Dijkstra negatif kenar ağırlıkları olmayan graflarda en kısa yolu garantiler. Google Maps, oyun motorları ve internet yönlendirme protokollerinin temelindedir."
          link="/searching/dijkstra"
        />

      </div>

      {/* ── Veri Yapıları ── */}
      <SectionDivider emoji="⬡" label="Veri Yapıları" cls="kp-sdl-ds" />

      <div className="kp-cards">

        {/* ── Stack ── */}
        <AlgoCard
          id="stack"
          color="purple"
          emoji="📚"
          title="Stack"
          subtitle="Yığın — LIFO"
          analogy="Tabak yığını düşün. En son koyduğun tabak en üstte ve onu ilk alırsın. Altındaki tabaklara ulaşmak için önce üsttekileri kaldırman lazım. Son giren, ilk çıkar — buna LIFO denir."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Yığın durumu:</p>
              <div className="kp-stack-viz">
                <div className="kp-stack-item kp-stack-item-top">
                  <span>30</span>
                  <span className="kp-stack-top-badge">TOP</span>
                </div>
                <div className="kp-stack-item"><span>20</span></div>
                <div className="kp-stack-item"><span>10</span></div>
                <div className="kp-stack-base" />
              </div>
              <Arrow label="push(40) → 40 tepeye eklenir | pop() → 30 çıkar" />
              <p className="kp-visual-note">Sadece tepeden işlem yapılır — her işlem O(1)</p>
            </div>
          }
          steps={[
            "push: yeni elemanı tepeye ekle",
            "pop: tepedeki elemanı çıkar ve döndür",
            "peek: tepeye bak ama çıkarma",
            "Tüm işlemler sadece tepede — hepsi O(1) sabit zaman",
          ]}
          insight="Tarayıcı geri tuşu, Ctrl+Z (geri al), ve fonksiyon çağrıları hep Stack kullanır. 'Son giren ilk çıkar' ihtiyacın varsa Stack."
          link="/data-structures/stack"
        />

        {/* ── Queue ── */}
        <AlgoCard
          id="queue"
          color="orange"
          emoji="🚶"
          title="Queue"
          subtitle="Kuyruk — FIFO"
          analogy="Kasada sıra bekliyorsun. İlk gelen ilk çıkar — sırayı atlayamazsın. Yeni gelenler arkaya eklenir, işlem sıradakinden başlar. Bu Queue: First In, First Out — FIFO."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Kuyruk durumu (soldan giriyor, soldan çıkıyor):</p>
              <div className="kp-queue-viz">
                <span className="kp-queue-end">← FRONT (çıkış)</span>
                <ArrayViz items={[
                  {val:"Ali",state:"comparing"},{val:"Veli",state:"default"},{val:"Can",state:"default"}
                ]} />
                <span className="kp-queue-end">REAR (giriş) →</span>
              </div>
              <Arrow label="dequeue() → Ali çıkar | enqueue('Duy') → Duy arkaya eklenir" />
              <p className="kp-visual-note">Önce gelen önce işlenir — O(1) enqueue & dequeue</p>
            </div>
          }
          steps={[
            "enqueue: yeni elemanı kuyruğun sonuna ekle",
            "dequeue: kuyruğun önündeki elemanı çıkar",
            "front: en öndeki elemanı gör ama çıkarma",
            "FIFO: ilk giren ilk çıkar — sıra bozulmaz",
          ]}
          insight="Yazıcı kuyruğu, müşteri sırası, CPU işlem planlaması hep Queue kullanır. 'İlk gelen ilk işlenir' ihtiyacın varsa Queue."
          link="/data-structures/queue"
        />

        {/* ── Linked List ── */}
        <AlgoCard
          id="linkedlist"
          color="teal"
          emoji="🔗"
          title="Linked List"
          subtitle="Bağlı Liste"
          analogy="Hazine avı ipuçları gibi düşün. Birinci ipucu sana ikincinin yerini söyler, ikinci üçüncüyü gösterir. İlk ipucunu bilirsen zinciri takip edebilirsin — ama direkt üçüncüye atlayamazsın."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Her düğüm: değer + sonrakinin adresi</p>
              <LinkedListViz nodes={[
                {val:10},{val:20,active:true},{val:30},{val:40}
              ]} />
              <Arrow label="20'yi aramak için: HEAD→10→20 ✓ (2 adım)" />
              <p className="kp-visual-note">Başa ekleme O(1) hızlı — ama arama O(n) yavaş</p>
            </div>
          }
          steps={[
            "Her düğüm: veri + sonraki düğümün adresi (pointer)",
            "append: sona ekle — O(n) (sona kadar git)",
            "prepend: başa ekle — O(1) (sadece HEAD güncelle)",
            "search: HEAD'den başla, tek tek ilerle — O(n)",
          ]}
          insight="Dizide ortaya eleman eklemek O(n) — hepsini kaydırman gerekir. Linked List'te pointer değiştirmek yeter: O(1). Sık ekleme/silme varsa tercih et."
          link="/data-structures/linked-list"
        />

        {/* ── Binary Tree ── */}
        <AlgoCard
          id="btree"
          color="lime"
          emoji="🌳"
          title="Binary Tree (BST)"
          subtitle="İkili Arama Ağacı"
          analogy="Aile soy ağacı gibi — her kişinin en fazla 2 çocuğu var. BST'de bir kural var: her düğümün solundaki çocuklar küçük, sağındakiler büyük. Bu kural sayesinde arama her adımda yarıya iner."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">BST kuralı: sol &lt; kök &lt; sağ (her düğüm için!)</p>
              <div className="kp-tree-viz">
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-root">50</div>
                </div>
                <div className="kp-tree-connector">
                  <span>↙</span>
                  <span>↘</span>
                </div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left">30</div>
                  <div className="kp-tree-node kp-tn-right">70</div>
                </div>
                <div className="kp-tree-label">hepsi &lt; 50 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; hepsi &gt; 50</div>
                <div className="kp-tree-connector" style={{gap:20}}>
                  <span>↙↘</span>
                  <span>↙↘</span>
                </div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>20</div>
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>40</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>60</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>80</div>
                </div>
              </div>
              <Arrow label="40'ı ara: 40<50→sola, 40>30→sağa, 40=40 ✓ Sadece 3 adım!" />
              <p className="kp-visual-note">Inorder gezinme (sol→kök→sağ) sıralı çıktı verir: 20,30,40,50,60,70,80</p>
            </div>
          }
          steps={[
            "insert: kökten başla, küçükse sola büyükse sağa in",
            "search: her adımda yarısını eliyorsun — O(log n)",
            "inorder gezinme: sıralı çıktı verir (BST'nin sihri!)",
            "Dengeli kalırsa her işlem O(log n) — sıralı eklemede O(n)'e düşer",
          ]}
          insight="Veritabanı indeksleri (B-Tree), otomatik tamamlama (Trie) ve oyun motorları BST'nin üzerine kuruludur. 'Hızlı arama + sıralı gezinme' gerekiyorsa BST."
          link="/data-structures/binary-tree"
        />

        {/* ── Hash Table ── */}
        <AlgoCard
          id="hashtable"
          color="green"
          emoji="🗂️"
          title="Hash Table"
          subtitle="Karma Tablosu"
          analogy="Alfabetik telefon rehberi gibi düşün. 'Ahmet'i bulmak için direkt A sayfasına açarsın — baştan sonra taramazsın. Hash fonksiyonu da anahtarı (ismi) bir 'sayfaya' (bellek konumuna) dönüştürür ve oraya direkt gider."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Anahtar → hash fonksiyonu → konum:</p>
              <ArrayViz items={[
                {val:"—",state:"default"},{val:"elma",state:"found"},{val:"—",state:"default"},
                {val:"top",state:"found"},{val:"—",state:"default"},{val:"kalem",state:"found"}
              ]} />
              <Arrow label={`"elma" → hash(elma)=1 → konum 1'e doğrudan git ✓`} />
              <p className="kp-visual-note">Arama, ekleme, silme ortalamada O(1) — sabit zaman!</p>
            </div>
          }
          steps={[
            "Anahtarı hash fonksiyonuna ver — bir sayısal konum döner",
            "O konuma git ve değeri oku/yaz (O(1))",
            "İki anahtar aynı konuma düşerse 'çarpışma' olur — zincir veya açık adresleme ile çözülür",
            "İyi bir hash fonksiyonu çarpışmaları minimize eder",
          ]}
          insight="Python sözlükleri, JavaScript objeleri, veritabanı önbellekleri ve Set veri yapısının altında Hash Table yatar. 'Anahtarla anında bul' ihtiyacın varsa Hash Table."
          link="/data-structures/hash-table"
        />

        {/* ── Graph ── */}
        <AlgoCard
          id="graph"
          color="zinc"
          emoji="🕸️"
          title="Graph"
          subtitle="Graf — Çizge"
          analogy="Sosyal medya ağı gibi düşün: insanlar düğüm, arkadaşlık bağları kenar. Ya da şehirler düğüm, aralarındaki yollar kenar. Herhangi bir 'şey' ve 'bağlantı' bir Graf ile modellenebilir — dünyanın en esnek veri yapısı."
          visual={
            <div className="kp-visual">
              <p className="kp-visual-label">Yönsüz Graf — 5 düğüm, 6 kenar:</p>
              <div className="kp-tree-viz">
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-root">A</div>
                </div>
                <div className="kp-tree-connector"><span>↙</span><span>↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left">B</div>
                  <div className="kp-tree-node kp-tn-right">C</div>
                </div>
                <div className="kp-tree-connector" style={{gap:20}}><span>↙↘</span><span>↙↘</span></div>
                <div className="kp-tree-row">
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>D</div>
                  <div className="kp-tree-node kp-tn-left" style={{fontSize:"0.75rem"}}>E</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>E</div>
                  <div className="kp-tree-node kp-tn-right" style={{fontSize:"0.75rem"}}>F</div>
                </div>
              </div>
              <Arrow label="Binary Tree'den farkı: bir düğümün birden fazla 'ebeveyni' olabilir, döngü oluşabilir" />
              <p className="kp-visual-note">BFS ve DFS Graf üzerinde çalışan arama algoritmaları</p>
            </div>
          }
          steps={[
            "Düğümler (nodes): varlıkları temsil eder — şehir, insan, web sayfası",
            "Kenarlar (edges): bağlantıları temsil eder — yol, arkadaşlık, link",
            "Yönlü (directed): A→B var ama B→A yok | Yönsüz: bağlantı çift yönlü",
            "Ağırlıklı (weighted): kenarlara maliyet atanır — Dijkstra bu şekilde çalışır",
          ]}
          insight="İnternet, sosyal ağlar, GPS haritaları, elektrik devreleri, öneri sistemleri — hepsi Graf. BFS, DFS ve Dijkstra Graf üzerinde çalışır. En güçlü veri modeli."
          link="/data-structures/graph"
        />

      </div>

      {/* Karşılaştırma tablosu */}
      <div className="kp-compare">
        <h2 className="kp-compare-title">Hangisini Ne Zaman Kullan?</h2>
        <div className="kp-compare-grid">
          {[
            { emoji: "🫧", name: "Bubble Sort",    when: "Sadece öğrenmek için",   speed: 1, note: "Gerçek projede kullanma" },
            { emoji: "🔍", name: "Selection Sort",  when: "Az takas önemliyse",     speed: 1, note: "Yazma maliyeti yüksek ortamlarda" },
            { emoji: "🃏", name: "Insertion Sort",  when: "Neredeyse sıralı veri",  speed: 2, note: "Küçük dizilerde en iyi seçim" },
            { emoji: "✂️", name: "Merge Sort",      when: "Güvenilirlik şartsa",    speed: 3, note: "Her durumda garantili O(n log n)" },
            { emoji: "🎯", name: "Quick Sort",      when: "Genelde en hızlı",       speed: 3, note: "Pratikte sıkça tercih edilir" },
            { emoji: "🏔️", name: "Heap Sort",       when: "Garantili O(n log n)",   speed: 3, note: "In-place, ekstra bellek yok" },
            { emoji: "👆", name: "Linear Search",   when: "Sırasız / küçük veri",   speed: 1, note: "Sıralama gerekmez, basittir" },
            { emoji: "📖", name: "Binary Search",   when: "Sıralı + hızlı arama",  speed: 3, note: "Her seferinde yarıya indirir" },
            { emoji: "🌊", name: "BFS",             when: "En az adımlı yol",       speed: 3, note: "Katman katman, Queue ile" },
            { emoji: "🔦", name: "DFS",             when: "Tüm yolları keşfet",     speed: 2, note: "Derine dal, Stack ile" },
            { emoji: "🗺️", name: "Dijkstra",        when: "En kısa ağırlıklı yol",  speed: 3, note: "GPS, ağ yönlendirme" },
            { emoji: "📚", name: "Stack",           when: "Son giren ilk çıksın",   speed: 3, note: "Undo, call stack, parantez eşle" },
            { emoji: "🚶", name: "Queue",           when: "İlk giren ilk çıksın",   speed: 3, note: "Baskı kuyruğu, CPU planlaması" },
            { emoji: "🔗", name: "Linked List",     when: "Sık ekleme/silme",       speed: 2, note: "Başa ekleme O(1), arama O(n)" },
            { emoji: "🌳", name: "Binary Tree",     when: "Hızlı arama + sıralı",  speed: 3, note: "Veritabanı indeksleri, BST" },
            { emoji: "🗂️", name: "Hash Table",     when: "Anahtarla anında bul",   speed: 3, note: "Python dict, JS object temeli" },
            { emoji: "🕸️", name: "Graph",           when: "Bağlantıları modelle",   speed: 2, note: "BFS/DFS/Dijkstra üzerinde çalışır" },
          ].map((item) => (
            <div key={item.name} className="kp-compare-row">
              <span className="kp-compare-emoji">{item.emoji}</span>
              <span className="kp-compare-name">{item.name}</span>
              <span className="kp-compare-when">{item.when}</span>
              <div className="kp-compare-speed">
                {[1,2,3].map(i => (
                  <span key={i} className={`kp-speed-dot ${i <= item.speed ? "kp-speed-on" : ""}`} />
                ))}
              </div>
              <span className="kp-compare-note">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
