interface Option {
  text: string;
  effects: Partial<Record<"Finance" | "TechnicalTeam" | "Sponsors" | "Fans", number>>;
  nextStory: Story; // The story that follows this option
}

interface Story {
  text: string;
  options: Option[];
}

interface Stories {
  [key: string]: Story | string; // Can be either a Story or string (for newStories)
}

// Finance category - branching stories based on initial choice
const financeStory5A: Story = {
  text: "Denizlispor'un kredi ödemeleri yaklaşıyor ve nakit akışı hala sıkıntılı. Transfer dönemi de kapıda. Son hamleniz ne olacak?",
  options: [
    { 
      text: "Belediye ve valilikle görüşüp destek iste", 
      effects: { Finance: 15, Sponsors: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Ana sponsorla erken ödeme anlaşması yap", 
      effects: { Finance: 10, Sponsors: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Antrenman tesislerinin bir bölümünü kirala", 
      effects: { Finance: 20, TechnicalTeam: -15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Taraftar bağış kampanyası başlat", 
      effects: { Finance: 10, Fans: 15, Sponsors: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const financeStory5B: Story = {
  text: "Genç yıldızınız Ahmet Çalık'a Avrupa'dan transfer teklifleri geliyor ama takım performansı kritik bir noktada. Takım ligde kalma mücadelesi veriyor. Nasıl ilerleyeceksiniz?",
  options: [
    { 
      text: "Sezon sonu anlaşmayla şimdi sat", 
      effects: { Finance: 30, TechnicalTeam: -5, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Fiyatı yükselt ve pazarlık yap", 
      effects: { Finance: 20, TechnicalTeam: -10, Fans: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Teklifi reddet, oyuncuya prim sözü ver", 
      effects: { Finance: -15, TechnicalTeam: 20, Fans: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Oyuncuyu ikna edip yeni sözleşme imzalat", 
      effects: { Finance: -10, TechnicalTeam: 15, Fans: 20 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const financeStory4A: Story = {
  text: "Yapıkredi'den aldığınız kredi onaylandı. Kulübe 25 milyon TL geldi. Öncelikli kullanım alanı ne olacak?",
  options: [
    { 
      text: "Vergi ve SSK borç yapılandırması", 
      effects: { Finance: 20, Sponsors: 10 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Denizli Atatürk Stadyumu iyileştirmesi", 
      effects: { Finance: -15, TechnicalTeam: 10, Fans: 25 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Şimdi 2 oyuncu transferi yap", 
      effects: { Finance: -10, TechnicalTeam: 25, Fans: 15 }, 
      nextStory: financeStory5B 
    },
    { 
      text: "Halı saha kompleksi inşaatını başlat", 
      effects: { Finance: -5, TechnicalTeam: 5, Fans: 10, Sponsors: 15 }, 
      nextStory: financeStory5B 
    },
  ],
};

const financeStory4B: Story = {
  text: "Mehmet Akyüz'ü sattıktan sonra sosyal medyada #YönetimİSTİFA etiketi trend oldu. Taraftar tepkisi büyüyor. Nasıl yöneteceksiniz?",
  options: [
    { 
      text: "2 yeni oyuncu transferi sözü ver", 
      effects: { Fans: 20, Finance: -15, TechnicalTeam: 10 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Basın toplantısı düzenleyip finansal durumu açıkla", 
      effects: { Fans: 15, Sponsors: 10, Finance: 5 }, 
      nextStory: financeStory5B 
    },
    { 
      text: "Altyapıdan genç yetenekleri A takıma al", 
      effects: { Fans: 10, TechnicalTeam: 15, Finance: 10 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Sosyal medya yorumlarını gizle, sessiz kal", 
      effects: { Fans: -25, Sponsors: -10, Finance: -5 }, 
      nextStory: financeStory5B 
    },
  ],
};

const financeStory3A: Story = {
  text: "Kredi görüşmeleri devam ederken Eti, Pamukkale Turizm ve Denizli Basket gibi sponsorlar endişeli. Ne yapmalısınız?",
  options: [
    { 
      text: "5 yıllık finansal yapılandırma planı sun", 
      effects: { Sponsors: 20, Finance: 15 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Forma reklamlarında indirim teklif et", 
      effects: { Sponsors: 15, Finance: -5 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Başkanlar Zirvesi toplantısı düzenle", 
      effects: { Sponsors: 10, Finance: 5, Fans: 10 }, 
      nextStory: financeStory4B 
    },
    { 
      text: "Sponsorlara özel VIP locası tahsis et", 
      effects: { Sponsors: 15, Finance: -10, Fans: -5 }, 
      nextStory: financeStory4B 
    },
  ],
};

const financeStory3B: Story = {
  text: "Mehmet Akyüz'ün satışından gelen 18 milyon TL için yatırım planı gerekiyor. Nasıl değerlendireceksiniz?",
  options: [
    { 
      text: "Kıvaş tesislerindeki ipotekleri kapat", 
      effects: { Finance: 25, Sponsors: 15 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "İncilipınar'da yeni altyapı tesisi aç", 
      effects: { TechnicalTeam: 25, Finance: -15, Fans: 15 }, 
      nextStory: financeStory4B 
    },
    { 
      text: "Merkez orta saha transferi yap", 
      effects: { TechnicalTeam: 20, Fans: 15, Finance: -20 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Paranın yarısını rezerv tut", 
      effects: { Finance: 20, Sponsors: 5, Fans: -15 }, 
      nextStory: financeStory4B 
    },
  ],
};

const financeStory2A: Story = {
  text: "Yapıkredi ve Denizbank kredi şartlarını sundu. Nasıl ilerlersiniz?",
  options: [
    { 
      text: "Düşük faizli 3 yıl vadeli teklifini kabul et", 
      effects: { Finance: 20, Sponsors: 5 }, 
      nextStory: financeStory3A 
    },
    { 
      text: "Ödeme takviminde 1 yıl öteleme iste", 
      effects: { Finance: 15, Sponsors: -5 }, 
      nextStory: financeStory3A 
    },
    { 
      text: "Belediye garantörlüğünde yeniden başvur", 
      effects: { Finance: 10, Sponsors: 15 }, 
      nextStory: financeStory3B 
    },
    { 
      text: "Kredi yerine taraftar bono ihracı planla", 
      effects: { Finance: 5, Sponsors: 5, Fans: 20 }, 
      nextStory: financeStory3B 
    },
  ],
};

const financeStory2B: Story = {
  text: "Mehmet Akyüz'e Trabzonspor'dan 18 milyon TL teklif var. Nasıl değerlendirirsiniz?",
  options: [
    { 
      text: "Sezon ortasında hemen sat", 
      effects: { Finance: 30, TechnicalTeam: -20, Fans: -15 }, 
      nextStory: financeStory3B 
    },
    { 
      text: "22 milyon TL'ye pazarlık yap", 
      effects: { Finance: 20, TechnicalTeam: -10, Fans: -5 }, 
      nextStory: financeStory3A 
    },
    { 
      text: "Oyuncunun görüşünü al", 
      effects: { TechnicalTeam: 15, Fans: 10, Finance: -5 }, 
      nextStory: financeStory3B 
    },
    { 
      text: "Sezon sonu 20 milyon TL garantili anlaş", 
      effects: { TechnicalTeam: 10, Finance: 15, Fans: 5 }, 
      nextStory: financeStory3A 
    },
  ],
};

const financeRoot: Story = {
  text: "Denizlispor ciddi bir finansal krizle karşı karşıya. Kulübün 35 milyon TL borcu var ve yaklaşan ödemeler için nakit akışı yetersiz. İlk hamleniz ne olacak?",
  options: [
    { 
      text: "Yapıkredi'den kredi başvurusu yap", 
      effects: { Finance: 10, Sponsors: 5, Fans: 5 }, 
      nextStory: financeStory2A // Kredi başvurusu yapılırsa krediyle ilgili hikaye
    },
    { 
      text: "Takım kaptanı Mehmet Akyüz'ü sat", 
      effects: { Finance: 30, TechnicalTeam: -20, Fans: -15 }, 
      nextStory: financeStory2B // Oyuncu satışı yapılırsa transferle ilgili hikaye
    },
    { 
      text: "Futbolcu maaşlarında %20 kesintiye git", 
      effects: { Finance: 20, TechnicalTeam: -15, Fans: -5 }, 
      nextStory: financeStory2A // Maaş kesintisi yapılırsa finansal planlamayla ilgili hikaye
    },
    { 
      text: "Denizli iş insanlarını sponsorluk için topla", 
      effects: { Sponsors: 20, Finance: 15, Fans: 10 }, 
      nextStory: financeStory2B // Sponsorluk aranırsa yatırım planlamasıyla ilgili hikaye
    },
  ],
};

// Teknik Ekip hikayeleri - daha detaylı ve seçime bağlı hikayeler

const technicalTeamStory5_Experience: Story = {
  text: `Sezon sonuna yaklaşırken, deneyimli teknik ekibiniz başarılı sonuçlar aldı. 
  Özellikle yardımcı antrenörünüz Ali Tandoğan, Süper Lig'den baş antrenörlük teklifi aldığını açıkladı. 
  Takım şu anda play-off potasında ancak teknik ekibin geleceği belirsiz.`,
  options: [
    { 
      text: "Tüm teknik ekibe 2 yıllık yeni sözleşme ve maaş artışı teklif et", 
      effects: { Finance: -25, TechnicalTeam: 30, Fans: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Ali Tandoğan'ı sportif direktörlüğe yükselt, teknik direktöre yetki ver", 
      effects: { TechnicalTeam: 20, Finance: -15, Fans: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Mevcut düzeni bozmadan sürdürmeye çalış", 
      effects: { TechnicalTeam: -10, Finance: 5, Fans: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Eski Denizlisporlu efsane Mustafa Özkan'ı yardımcı antrenör olarak getir", 
      effects: { TechnicalTeam: 15, Finance: -20, Fans: 25 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const technicalTeamStory5_Youth: Story = {
  text: `Altyapıdan terfi ettirdiğiniz genç teknik ekip, modern futbol anlayışıyla takımda dönüşüm başlattı. 
  Özellikle 35 yaş üstü tecrübeli oyuncular Serkan Aykut ve Zeki Önatlı yeni sisteme adapte olmakta zorlanıyor. 
  Denizli basını ise genç teknik ekibin cesur yaklaşımını övüyor.`,
  options: [
    { 
      text: "Genç teknik ekibin yetkilerini artır, tecrübeli oyuncuları yedek kulübesine çek", 
      effects: { TechnicalTeam: 25, Fans: 5, Finance: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Bursaspor'un eski hocası Şenol Çorlu'yu mentor olarak getir", 
      effects: { TechnicalTeam: 20, Finance: -20, Fans: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Tecrübeli oyuncuları kadro dışı bırak, gençlere şans ver", 
      effects: { TechnicalTeam: 15, Finance: 10, Fans: -15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Daha uzlaşmacı bir yaklaşımla eski-yeni dengesini kur", 
      effects: { TechnicalTeam: 10, Fans: 15, Finance: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const technicalTeamStory4A: Story = {
  text: "Teknik direktör Ali Yalçın 3-5-2 sistemine geçmek istiyor ama oyuncular 4-2-3-1 düzenine alışmış durumda. Uyum sorunu yaşanıyor. Ne yapmalı?",
  options: [
    { 
      text: "Sabah-akşam çift antrenman programı uygula", 
      effects: { TechnicalTeam: 20, Finance: -15, Fans: 5 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Kanat oyuncusu ve stoper takviyesi yap", 
      effects: { Finance: -25, TechnicalTeam: 25, Fans: 15 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "4-2-3-1 düzenine geri dön", 
      effects: { TechnicalTeam: -10, Finance: 5, Fans: -5 }, 
      nextStory: technicalTeamStory5_Youth 
    },
    { 
      text: "Taktik geçişi kademeli yap, hazırlık maçları planla", 
      effects: { TechnicalTeam: 15, Finance: -10, Fans: 10 }, 
      nextStory: technicalTeamStory5_Youth 
    },
  ],
};

const technicalTeamStory4B: Story = {
  text: "Altyapıdan 17 yaşındaki Mahmut Küçük, PAF takımında 12 maçta 14 gol attı ve A takım antrenmanlarında parlıyor. Nasıl değerlendirirsiniz?",
  options: [
    { 
      text: "Direkt A takıma alıp Süper Lig maçında ilk 11'de oynat", 
      effects: { TechnicalTeam: 20, Fans: 25, Finance: -5 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Samsunspor'a 1 yıllığına kiralık gönder", 
      effects: { Finance: 15, TechnicalTeam: 10, Fans: -10 }, 
      nextStory: technicalTeamStory5_Youth 
    },
    { 
      text: "A takımla antrenman yaptırıp gençlik kupasında oynamaya devam ettir", 
      effects: { TechnicalTeam: 15, Fans: 5, Finance: 5 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Gelişimini hızlandırmak için özel antrenör tut", 
      effects: { TechnicalTeam: 25, Finance: -20, Fans: 10 }, 
      nextStory: technicalTeamStory5_Youth 
    },
  ],
};

const technicalTeamStory3A: Story = {
  text: "Takım kaptanı Recep Niyaz, haftada 6 gün antrenman temposunun çok yoğun olduğunu ve sakatlık riskinin arttığını belirtiyor. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Haftada 5 güne düşür, yoga ve pilates ekle", 
      effects: { TechnicalTeam: 15, Finance: -10, Fans: 5 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "Teknik direktör ve kaptan arasında arabuluculuk yap", 
      effects: { TechnicalTeam: 20, Finance: -5, Fans: 10 }, 
      nextStory: technicalTeamStory4B 
    },
    { 
      text: "GPS takip sistemi ile antrenman yoğunluğunu analiz et", 
      effects: { TechnicalTeam: 15, Finance: -20, Fans: 5 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "Kaptanı teknik direktörle baş başa görüştür", 
      effects: { TechnicalTeam: -5, Finance: 0, Fans: -10 }, 
      nextStory: technicalTeamStory4B 
    },
  ],
};

const technicalTeamStory3B: Story = {
  text: "Scout ekibi, 21 yaşında Arnavut stoper Arjan Beqiri'yi keşfetti. İstatistikleri çok iyi ve bonservisi 500 bin euro. Nasıl ilgileneceksiniz?",
  options: [
    { 
      text: "Hemen 3+1 yıllık sözleşme ve 600 bin euro teklif et", 
      effects: { Finance: -25, TechnicalTeam: 25, Fans: 10 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "2 haftalık deneme süresine davet et", 
      effects: { TechnicalTeam: 15, Finance: -5, Fans: 5 }, 
      nextStory: technicalTeamStory4B 
    },
    { 
      text: "Önce maçlarını canlı izle, sonra görüşme yap", 
      effects: { TechnicalTeam: 10, Finance: -10, Fans: 0 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "Rakip takımların ilgisini ölç, sonra karar ver", 
      effects: { TechnicalTeam: 5, Finance: 0, Fans: 0 }, 
      nextStory: technicalTeamStory4B 
    },
  ],
};

const technicalTeamStory2A: Story = {
  text: "Deneyimli antrenör Faruk Hadžić takıma katıldı. Şimdi öncelik ne olmalı?",
  options: [
    { 
      text: "19-21 yaş arası yetenekleri A takıma dahil et", 
      effects: { TechnicalTeam: 20, Finance: -10, Fans: 15 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "3-5-2 sistemine geçiş hazırlıkları başlat", 
      effects: { TechnicalTeam: 15, Finance: -15, Fans: 10 }, 
      nextStory: technicalTeamStory3B 
    },
    { 
      text: "HIIT ve fonksiyonel antrenmanlarla kondisyon artır", 
      effects: { TechnicalTeam: 10, Finance: -10, Fans: 5 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "Mevcut 4-2-3-1 düzeninde ince ayarlar yap", 
      effects: { TechnicalTeam: 5, Finance: -5, Fans: 0 }, 
      nextStory: technicalTeamStory3B 
    },
  ],
};

const technicalTeamStory2B: Story = {
  text: "Altyapı direktörü Serdar Kesimal istifa etti. Altyapı takımları kaos yaşıyor. Ne yapacaksınız?",
  options: [
    { 
      text: "Fenerbahçe altyapısından Eser Özaltındere'yi getir", 
      effects: { Finance: -25, TechnicalTeam: 25, Fans: 10 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "PAF takım antrenörü Ahmet Duman'ı terfi ettir", 
      effects: { TechnicalTeam: 15, Finance: -5, Fans: 15 }, 
      nextStory: technicalTeamStory3B 
    },
    { 
      text: "Eski Denizlisporlu Mustafa Özkan'ı ikna et", 
      effects: { TechnicalTeam: 20, Finance: -15, Fans: 25 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "Scout ekibi başkanına geçici yetki ver", 
      effects: { TechnicalTeam: -5, Finance: 0, Fans: -5 }, 
      nextStory: technicalTeamStory3B 
    },
  ],
};

const technicalTeamRoot: Story = {
  text: "Teknik direktör Ali Yalçın, yeni bir yardımcı antrenör istiyor. Özellikle set parçaları ve standart durumlarda uzmanlaşmış bir isim arıyor. Ne yapacaksınız?",
  options: [
    { 
      text: "Lech Poznan'dan Bosnalı antrenör Faruk Hadžić'i transfer et", 
      effects: { Finance: -20, TechnicalTeam: 25, Fans: 5 }, 
      nextStory: technicalTeamStory2A 
    },
    { 
      text: "Altyapı hocalarından Ahmet Duman'ı terfi ettir", 
      effects: { TechnicalTeam: 15, Finance: -5, Fans: 10 }, 
      nextStory: technicalTeamStory2B 
    },
    { 
      text: "İngiliz set oyunu uzmanı Mike Phelan'ı getir", 
      effects: { Finance: -25, TechnicalTeam: 30, Fans: 0 }, 
      nextStory: technicalTeamStory2A 
    },
    { 
      text: "Bütçe yok, teknik direktöre talebi için şu an uygun olmadığını söyle", 
      effects: { Finance: 10, TechnicalTeam: -15, Fans: -5 }, 
      nextStory: technicalTeamStory2B 
    },
  ],
};

// Sponsorlar hikayeleri - daha detaylı ve seçime bağlı hikayeler

// Sponsorluk paketi hazırlama sonrası hikayeler
const sponsorStory5A: Story = {
  text: "Denizli Cam'ın logosunu içeren yeni forma tasarımı sosyal medyada tartışmalara yol açtı. Taraftarlar geleneksel forma tasarımının bozulduğunu söylüyor. Nasıl yöneteceksiniz?",
  options: [
    { 
      text: "Horoz Cafe'de taraftarlarla buluşup görüşlerini dinle", 
      effects: { Fans: 25, Sponsors: 5, Finance: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Alternatif deplasman forması için oylama düzenle", 
      effects: { Fans: 20, Sponsors: 0, Finance: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Denizli Cam ve taraftar temsilcileriyle ortak basın toplantısı düzenle", 
      effects: { Fans: 15, Sponsors: 15, Finance: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Tasarım sanat direktörüyle röportaj yapıp konsepti anlat", 
      effects: { Fans: 10, Sponsors: 10, Finance: 0 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const sponsorStory5B: Story = {
  text: "Ek ücret talebiniz sonrası Pamukkale Turizm alternatif kulüplerle görüşmeye başladı. Firma sahibi Denizlispor'a bağlılığını vurgulamasına rağmen pazarlık süreci gergin ilerliyor.",
  options: [
    { 
      text: "Özel VIP deneyimi ve maç günü etkinlikleri ile talebi destekle", 
      effects: { Finance: 15, Sponsors: 20, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Sponsorluk paketini yeniden yapılandır, ödeme takvimini esnet", 
      effects: { Finance: 10, Sponsors: 15, Fans: 0 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Stadyumda Pamukkale Corner bölümü oluştur", 
      effects: { Finance: 5, Sponsors: 25, Fans: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Talebinden kısmen vazgeç, uzun vadeli anlaşma imzala", 
      effects: { Finance: -10, Sponsors: 15, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const sponsorStory5C: Story = {
  text: "Orta yol bulma çabanız Eti firması tarafından takdir edildi. Şimdi logolarının göğüs sponsorluğu dışında kulübün dijital platformlarında da yer almasını istiyorlar.",
  options: [
    { 
      text: "Tüm sosyal medya ve dijital varlıklarda Eti'ye tam erişim ver", 
      effects: { Sponsors: 25, Finance: 20, Fans: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Web sitesi ve mobil uygulamada özel bölüm tahsis et", 
      effects: { Sponsors: 20, Finance: 15, Fans: 0 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Taraftarlar için Eti ürünlerinde indirim kampanyası başlat", 
      effects: { Sponsors: 15, Fans: 20, Finance: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Denizlispor Futbol Akademisi'ne 'Eti' ismini ver", 
      effects: { Sponsors: 20, TechnicalTeam: 15, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const sponsorStory5D: Story = {
  text: "Talebi reddetmeniz sonrası Coca-Cola kontratı feshetmekle tehdit ediyor. Denizli basını durumu yakından takip ediyor ve kriz büyüyor.",
  options: [
    { 
      text: "Pepsi ile acil görüşme ayarla", 
      effects: { Sponsors: 10, Finance: -5, Fans: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Vali ve belediye başkanını arabulucu olarak devreye sok", 
      effects: { Sponsors: 15, Finance: 0, Fans: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Taraftar gruplarıyla boykot kampanyası başlat", 
      effects: { Sponsors: -20, Finance: -15, Fans: 25 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Daha küçük yerel içecek firmalarıyla görüş", 
      effects: { Sponsors: 5, Finance: -10, Fans: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

// Then define sponsorStory4 before it's used in sponsorStory3
const sponsorStory4: Story = {
  text: "Forma sponsoru Denizli Cam tasarımda değişiklik talep ediyor. Horozun daha küçük, kendi logolarının daha büyük olmasını istiyorlar. Nasıl karşılık vereceksiniz?",
  options: [
    { 
      text: "Taraftarın tepkisini göze alıp tasarımı değiştir", 
      effects: { Sponsors: 25, Fans: -20, Finance: 15 }, 
      nextStory: sponsorStory5A 
    },
    { 
      text: "Tasarım değişikliği için ek 2 milyon TL talep et", 
      effects: { Sponsors: -10, Finance: 25, Fans: -5 }, 
      nextStory: sponsorStory5B 
    },
    { 
      text: "Forma arkasında daha büyük logo ve omuzlarda branding öner", 
      effects: { Sponsors: 20, Fans: 10, Finance: 10 }, 
      nextStory: sponsorStory5C 
    },
    { 
      text: "Kulübün 'Horoz' kimliğinin değiştirilemeyeceğini belirt", 
      effects: { Sponsors: -15, Finance: -10, Fans: 25 }, 
      nextStory: sponsorStory5D 
    },
  ],
};

// Now define sponsorStory3
const sponsorStory3: Story = {
  text: "Coca-Cola Denizli Atatürk Stadyumu isim hakkı için 5 yıllığına yıllık 5 milyon TL teklif sundu. Taraftar grupları şimdiden tepki göstermeye başladı. Ne yapacaksınız?",
  options: [
    { 
      text: "Denizli Atatürk Coca-Cola Arena olarak kabul et", 
      effects: { Sponsors: 30, Finance: 25, Fans: -25 }, 
      nextStory: sponsorStory4 
    },
    { 
      text: "Stadın ismini koruma şartıyla 'Coca-Cola sunar' formülü öner", 
      effects: { Sponsors: 20, Finance: 15, Fans: 5 }, 
      nextStory: sponsorStory4 
    },
    { 
      text: "Sosyal medyada anket düzenleyip taraftar görüşü al", 
      effects: { Sponsors: -5, Fans: 25, Finance: -5 }, 
      nextStory: sponsorStory4 
    },
    { 
      text: "Atatürk isminin korunması gerektiğini belirtip teklifi reddet", 
      effects: { Sponsors: -15, Fans: 30, Finance: -20 }, 
      nextStory: sponsorStory4 
    },
  ],
};

const sponsorStory2A_NewPackage: Story = {
  text: "Yeni sponsorluk paketiniz yerel ve ulusal firmalardan ilgi görmeye başladı. Denizli Cam, Pamukkale Turizm ve LC Waikiki ilk tekliflerini sundu. Nasıl ilerlemelisiniz?",
  options: [
    { 
      text: "LC Waikiki'nin yüksek teklifini değerlendir", 
      effects: { Sponsors: 25, Finance: 20, Fans: -5 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Uzun yıllardır destek veren Pamukkale Turizm'e öncelik tanı", 
      effects: { Sponsors: 15, Finance: 15, Fans: 15 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Denizli Cam ile şehir markası ortaklığına odaklan", 
      effects: { Sponsors: 20, Fans: 20, Finance: 10 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Aynı anda üç firmayla da farklı alanlarda anlaş", 
      effects: { Sponsors: 30, Finance: 15, Fans: 5 }, 
      nextStory: sponsorStory3 
    },
  ],
};

const sponsorStory5: Story = {
  text: "Sezon sonu yaklaşıyor ve ana sponsor Pamukkale Turizm ile yeni dönem görüşmeleri başlıyor. Pandemi sonrası turizm canlanırken ne yapmalısınız?",
  options: [
    { 
      text: "5 yıllık uzun vadeli anlaşma teklif et", 
      effects: { Sponsors: 25, Finance: 20, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Yıllık %20 artışla 3 yıllık anlaşma iste", 
      effects: { Sponsors: 20, Finance: 25, Fans: 0 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Lige göre değişen primli sistem öner (Süper Lig'de bonus)", 
      effects: { Sponsors: 15, TechnicalTeam: 10, Finance: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Hem forma hem stadyum isim hakkı için paket teklif sun", 
      effects: { Sponsors: 30, Finance: 30, Fans: -15 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const sponsorStory2: Story = {
  text: "Mevcut sponsorlar pandemi nedeniyle ödeme planında revizyon istiyor. Pamukkale Turizm ve Denizli Tekstil ödemeleri ertelemek istiyor. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "6 aylık ödeme erteleme ile esneklik göster", 
      effects: { Sponsors: 20, Finance: -15, Fans: 5 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Sözleşme şartlarını hatırlat, alternatif firmalarla görüştüğünü belirt", 
      effects: { Sponsors: -20, Finance: 15, Fans: -5 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Ödeme indirimi karşılığında sözleşme süresini uzat", 
      effects: { Sponsors: 15, Finance: -5, Fans: 10 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Vade farkıyla kademeli ödeme planı sun", 
      effects: { Sponsors: 10, Finance: 10, Fans: 0 }, 
      nextStory: sponsorStory3 
    },
  ],
};

const sponsorsRoot: Story = {
  text: "Sezon başında sponsorluk gelirleri pandemi etkisiyle düşük seyrediyor. Denizlispor'un forma ve stadyum sponsorları yenilenme bekliyor. İlk adımınız ne olacak?",
  options: [
    { 
      text: "Dijital varlıklara odaklanan yeni sponsorluk paketi hazırla", 
      effects: { Sponsors: 20, Finance: 5, Fans: 10 }, 
      nextStory: sponsorStory2A_NewPackage // Yeni paket hazırlanırsa ilgili hikaye
    },
    { 
      text: "Mevcut sponsorlarla pandemi dayanışma toplantısı düzenle", 
      effects: { Sponsors: 15, Finance: 10, Fans: 5 }, 
      nextStory: sponsorStory2 
    },
    { 
      text: "Ulusal ve uluslararası büyük markalarla görüşmeler başlat", 
      effects: { Sponsors: 25, Finance: -5, Fans: -5 }, 
      nextStory: sponsorStory2 
    },
    { 
      text: "Denizli yerel iş insanları ve KOBİ'lere yönel", 
      effects: { Sponsors: 15, Fans: 20, Finance: 5 }, 
      nextStory: sponsorStory2 
    },
  ],
};

// Taraftar İlişkileri hikayeleri
const fansStory5: Story = {
  text: "Taraftar grupları #BizDenizlisporuz etiketiyle sosyal medyada kulübe destek kampanyası başlattı. Ligde düşme hattındaki kritik maçlar öncesi nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Takım kaptanı ve teknik direktörle birlikte kampanyaya katıl", 
      effects: { Fans: 30, Sponsors: 10, TechnicalTeam: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Kampanyayı destekle ama mesafeni koru", 
      effects: { Fans: 10, Sponsors: 15, TechnicalTeam: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "#DenizliHorozu etiketiyle resmi kulüp kampanyası başlat", 
      effects: { Fans: 20, Finance: -10, Sponsors: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Sportif konulara odaklan, kampanyayı görmezden gel", 
      effects: { Fans: -20, Sponsors: -5, TechnicalTeam: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const fansStory4A: Story = {
  text: "Yaptığınız %30 indirim kampanyası sonrası bilet satışları %40 arttı ama gelir %10 düştü. Denizli Atatürk Stadı'nda ortalama seyirci 12.000'e yükseldi. Dengeyi nasıl sağlayacaksınız?",
  options: [
    {
      text: "Tam biletlerde %20 daha indirim yapıp doluluk oranını maksimize et",
      effects: { Fans: 25, Finance: -20, Sponsors: 15 },
      nextStory: {
        text: "Stadyum doluluk oranı %85'e yükseldi. Taraftar desteği arttı, sponsorlar kalabalık tribünlerden memnun ancak bilet gelirleri düştü.",
        options: []
      }
    },
    {
      text: "Mevcut fiyatları koru, kombine kampanyasına odaklan",
      effects: { Fans: 15, Finance: 10, Sponsors: 10 },
      nextStory: {
        text: "Kombine kampanyası ilgi gördü, finansal denge korundu. Taraftarlar da makul fiyatlandırmadan memnun.",
        options: []
      }
    },
    {
      text: "Premium tribün ve VIP localar oluştur",
      effects: { Fans: 5, Finance: 25, Sponsors: 20 },
      nextStory: {
        text: "VIP alanlar Denizli iş dünyasının ilgisini çekti. Gelir arttı ancak bazı taraftarlar kulübün ticarileştiğini düşünüyor.",
        options: []
      }
    },
    {
      text: "Taraftar ürünleri ve maç içi harcamalara yönel",
      effects: { Fans: 15, Finance: 15, Sponsors: 5 },
      nextStory: {
        text: "Forma satışları ve stadyum içi harcamalar arttı. Taraftarlar kulübe hem tribünde hem ekonomik olarak destek veriyor.",
        options: []
      }
    }
  ]
};

const fansStory4B: Story = {
  text: "Dernek başkanlarıyla görüşmeniz olumlu geçti. 'Horozlar Tek Yürek' kombine kampanyası büyük ilgi gördü. 8,000 kombine satıldı. Nasıl değerlendireceksiniz?",
  options: [
    {
      text: "Kombine sahiplerine özel futbolcularla buluşma etkinliği düzenle",
      effects: { Fans: 25, TechnicalTeam: 10, Finance: -5 },
      nextStory: {
        text: "Taraftar-futbolcu buluşması büyük ilgi gördü. Takım motivasyonu yükseldi ve taraftar aidiyet duygusu güçlendi.",
        options: []
      }
    },
    {
      text: "Kombine sahiplerine özel indirimli forma kampanyası başlat",
      effects: { Fans: 20, Finance: 15, Sponsors: 5 },
      nextStory: {
        text: "Forma satışları patladı, taraftarlar maçlara yeni formalarıyla geliyor. Stadyum görsel şölene dönüştü.",
        options: []
      }
    },
    {
      text: "Deplasman maçları için kombine sahiplerine özel otobüs seferleri düzenle",
      effects: { Fans: 30, Finance: -15, TechnicalTeam: 15 },
      nextStory: {
        text: "Deplasman desteği arttı, takım her yerde kalabalık taraftar desteği buluyor. Moral yüksek ancak organizasyon masrafları da arttı.",
        options: []
      }
    },
    {
      text: "Kombine hedefini 10,000'e çıkarıp taraftar gruplarına satış primi ver",
      effects: { Fans: 15, Finance: 20, Sponsors: 10 },
      nextStory: {
        text: "Taraftar grupları aktif satış çabalarıyla kombine hedefi aşıldı. Kulüp gelirleri yükseldi ve tribünler her maç dolu.",
        options: []
      }
    }
  ]
};

const fansStory4C: Story = {
  text: "Yazılı açıklamanız sonrası taraftarlar sosyal medyada #YönetimiDinliyoruz etiketiyle tepki gösterdi. Açıklamanızda şeffaf finansal durum analizi paylaşmanız takdir topladı. Bir sonraki adım ne olacak?",
  options: [
    {
      text: "Eski Denizlisporlu efsanelerle 'Horoz Nostalji Gecesi' düzenle",
      effects: { Fans: 30, Finance: -10, Sponsors: 10 },
      nextStory: {
        text: "2003-2004 sezonu UEFA Kupası kadrosunun buluştuğu nostalji gecesi muhteşem geçti. Taraftarlar duygusal anlar yaşadı.",
        options: []
      }
    },
    {
      text: "Maç öncesi taraftar festivallerine başla",
      effects: { Fans: 20, Sponsors: 25, Finance: -5 },
      nextStory: {
        text: "Stadyum çevresinde düzenlenen festivaller hem taraftar deneyimini geliştirdi hem de sponsorlara yeni alanlar açtı.",
        options: []
      }
    },
    {
      text: "Denizlispor Taraftar Konseyi kur ve karar süreçlerine dahil et",
      effects: { Fans: 25, TechnicalTeam: -5, Finance: 0 },
      nextStory: {
        text: "Taraftar Konseyi fikri büyük ilgi gördü. Taraftarlar kulüple daha bütünleşik hissediyor ancak teknik ekip kararlara müdahale endişesi yaşıyor.",
        options: []
      }
    },
    {
      text: "Taraftar gruplarıyla üç ayda bir düzenli toplantı planı oluştur",
      effects: { Fans: 15, TechnicalTeam: 5, Sponsors: 5 },
      nextStory: {
        text: "Düzenli iletişim kanalları sayesinde taraftar-yönetim ilişkileri güçlendi. Sorunlar büyümeden çözülmeye başladı.",
        options: []
      }
    }
  ]
};

const fansStory4D: Story = {
  text: "Görüşmeyi ertelemeniz nedeniyle taraftar grupları 60. dakikada stadı terk etme eylemi başlattı. İlk maçta yaklaşık 2,000 kişi eyleme katıldı ve basının ilgisini çekti. Nasıl yöneteceksiniz?",
  options: [
    {
      text: "Acil kamuoyu açıklaması yapıp taraftarlardan özür dile",
      effects: { Fans: 20, Finance: 0, TechnicalTeam: 5 },
      nextStory: {
        text: "Özür açıklamanız taraftar grupları tarafından olumlu karşılandı. Eylem sonlandırıldı ve ilişkiler onarılmaya başladı.",
        options: []
      }
    },
    {
      text: "Taraftar liderlerini acil toplantıya çağır",
      effects: { Fans: 25, Finance: -5, TechnicalTeam: 0 },
      nextStory: {
        text: "Acil toplantıda taraftar temsilcileri sorunlarını doğrudan iletebildi. Somut adımlar planlandı ve eylem son buldu.",
        options: []
      }
    },
    {
      text: "Futbolcuların taraftarla buluşmasını organize et",
      effects: { Fans: 15, TechnicalTeam: 15, Finance: -10 },
      nextStory: {
        text: "Oyuncuların taraftarla buluşması tansiyonu düşürdü ancak bazı taraftar grupları yönetimin sorumluluktan kaçtığını düşünüyor.",
        options: []
      }
    },
    {
      text: "Eylemcilere stadyum yasağı getir",
      effects: { Fans: -25, Finance: -15, Sponsors: -10 },
      nextStory: {
        text: "Yasak kararı büyük tepki topladı. Taraftar grupları birleşti ve protestolar büyüdü. Kriz derinleşiyor.",
        options: []
      }
    }
  ]
};

const fansStory3: Story = {
  text: "Denizlispor Taraftarlar Derneği, Çarşı Grubu ve Horoz Gençlik yönetimle resmi görüşme talep ediyor. Bilet fiyatları, stadyumdaki yemek hizmetleri ve maç saatleri ana gündem maddeleri. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Pamukkale Üniversitesi'nde halka açık forum düzenle", 
      effects: { Fans: 25, TechnicalTeam: 5, Finance: -10 }, 
      nextStory: fansStory4A 
    },
    { 
      text: "Dernek başkanlarıyla kulüp tesislerinde özel toplantı yap", 
      effects: { Fans: 15, TechnicalTeam: 10, Finance: -5 }, 
      nextStory: fansStory4B 
    },
    { 
      text: "Kulüp web sitesinden detaylı yazılı açıklama yap", 
      effects: { Fans: 5, Sponsors: 10, Finance: 0 }, 
      nextStory: fansStory4C 
    },
    { 
      text: "Sezon sonu geniş katılımlı toplantı vaadiyle görüşmeyi ertele", 
      effects: { Fans: -15, TechnicalTeam: 5, Finance: 5 }, 
      nextStory: fansStory4D 
    },
  ],
};

const fansStory2: Story = {
  text: "Ligde son 5 maçta alınan 1 puan ve 11 gol yeme sonrası taraftar tepkisi büyüyor. Sosyal medyada #HorozumuKoruyalım etiketi trend oldu. Ne yapmalısınız?",
  options: [
    { 
      text: "Denizli Öğretmenevi'nde taraftarla açık buluşma düzenle", 
      effects: { Fans: 25, TechnicalTeam: 5, Finance: -5 }, 
      nextStory: fansStory3 
    },
    { 
      text: "Teknik direktör ve başkanla birlikte basın toplantısı yap", 
      effects: { Fans: 15, Sponsors: 10, TechnicalTeam: 10 }, 
      nextStory: fansStory3 
    },
    { 
      text: "Takım kaptanıyla birlikte taraftara video mesaj yayınla", 
      effects: { Fans: 20, Sponsors: 15, TechnicalTeam: 5 }, 
      nextStory: fansStory3 
    },
    { 
      text: "Sportif konulara odaklanıp medya yorumlarını kısıtla", 
      effects: { Fans: -20, Sponsors: -10, TechnicalTeam: 15 }, 
      nextStory: fansStory3 
    },
  ],
};

const fansRoot: Story = {
  text: "Pandemi sonrası ilk sezonda Denizli Atatürk Stadyumu'nda ortalama seyirci sayısı 6,000'e düştü (kapasite: 19,500). Taraftar desteği azalıyor. İlk hamleniz ne olacak?",
  options: [
    { 
      text: "Bayramyeri'nde taraftar forumu düzenle", 
      effects: { Fans: 20, Finance: -10, TechnicalTeam: 5 }, 
      nextStory: fansStory2 
    },
    { 
      text: "Tüm tribünlerde %30 indirimli bilet kampanyası başlat", 
      effects: { Fans: 25, Finance: -15, Sponsors: 5 }, 
      nextStory: fansStory2 
    },
    { 
      text: "Futbolcuları şehir merkezinde imza gününe gönder", 
      effects: { Fans: 30, TechnicalTeam: -10, Sponsors: 15 }, 
      nextStory: fansStory2 
    },
    { 
      text: "#BenimHorozum sosyal medya kampanyası başlat", 
      effects: { Fans: 15, Sponsors: 20, Finance: -5 }, 
      nextStory: fansStory2 
    },
  ],
};

export const stories: Stories = {
  "Finansal Yönetim": financeRoot,
  "Teknik Ekip": technicalTeamRoot,
  "Sponsorlar": sponsorsRoot,
  "Taraftar İlişkileri": fansRoot,
  newStories: "true1" // Current week's story flag
};

// When accessing stories, type check or use a type guard:
export const getStory = (key: string): Story | null => {
  const story = stories[key];
  return typeof story === 'string' ? null : story;
};