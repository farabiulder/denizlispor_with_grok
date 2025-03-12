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
  [key: string]: Story; // Each category starts with a single root story
}

// Finance category - branching stories based on initial choice
const financeStory5A: Story = {
  text: "Kredi ödemeleri yaklaşıyor ve nakit akışı hala sıkıntılı. Son hamleniz ne olacak?",
  options: [
    { 
      text: "Kredi yapılandırması talep et", 
      effects: { Finance: 10, Sponsors: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Ek kredi başvurusu yap", 
      effects: { Finance: -5, Sponsors: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Varlık satışı planla", 
      effects: { Finance: 15, Fans: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Yatırımcı görüşmeleri başlat", 
      effects: { Finance: 20, Sponsors: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const financeStory5B: Story = {
  text: "Transfer teklifleri geliyor ama takım performansı kritik. Nasıl ilerleyeceksiniz?",
  options: [
    { 
      text: "Yıldız oyuncuyu sat", 
      effects: { Finance: 25, TechnicalTeam: -15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Genç oyuncuları değerlendir", 
      effects: { Finance: 15, TechnicalTeam: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Teklifleri reddet", 
      effects: { Finance: -10, TechnicalTeam: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Kiralık gönder", 
      effects: { Finance: 10, TechnicalTeam: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const financeStory4A: Story = {
  text: "Banka kredisi onaylandı. Öncelikli kullanım alanı ne olacak?",
  options: [
    { 
      text: "Borç yapılandırması", 
      effects: { Finance: 15, Sponsors: 10 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Altyapı yatırımı", 
      effects: { Finance: -10, TechnicalTeam: 20 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Transfer bütçesi", 
      effects: { Finance: -5, TechnicalTeam: 15 }, 
      nextStory: financeStory5B 
    },
    { 
      text: "Operasyonel giderler", 
      effects: { Finance: 10, TechnicalTeam: 5 }, 
      nextStory: financeStory5B 
    },
  ],
};

const financeStory4B: Story = {
  text: "Satış sonrası taraftar tepkisi büyüyor. Nasıl yöneteceksiniz?",
  options: [
    { 
      text: "Transfer sözü ver", 
      effects: { Fans: 15, Finance: -10 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Finansal durumu açıkla", 
      effects: { Fans: 10, Sponsors: 5 }, 
      nextStory: financeStory5B 
    },
    { 
      text: "Altyapıya yöneleceğiz de", 
      effects: { Fans: 5, TechnicalTeam: 10 }, 
      nextStory: financeStory5A 
    },
    { 
      text: "Sessiz kal", 
      effects: { Fans: -15, Sponsors: -5 }, 
      nextStory: financeStory5B 
    },
  ],
};

const financeStory3A: Story = {
  text: "Kredi görüşmeleri devam ederken sponsorlar endişeli. Ne yapmalısınız?",
  options: [
    { 
      text: "Finansal plan sun", 
      effects: { Sponsors: 15, Finance: 5 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Ek sponsorluk iste", 
      effects: { Sponsors: -5, Finance: 10 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Toplantı düzenle", 
      effects: { Sponsors: 10, Finance: -5 }, 
      nextStory: financeStory4B 
    },
    { 
      text: "Mevcut durumu koru", 
      effects: { Sponsors: -10, Finance: 5 }, 
      nextStory: financeStory4B 
    },
  ],
};

const financeStory3B: Story = {
  text: "Oyuncu satışından gelen gelir için yatırım planı gerekiyor. Nasıl değerlendireceksiniz?",
  options: [
    { 
      text: "Borç ödemesi", 
      effects: { Finance: 20, Sponsors: 10 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Altyapı yatırımı", 
      effects: { TechnicalTeam: 20, Finance: -10 }, 
      nextStory: financeStory4B 
    },
    { 
      text: "Yeni transfer", 
      effects: { TechnicalTeam: 15, Fans: 10, Finance: -15 }, 
      nextStory: financeStory4A 
    },
    { 
      text: "Yedek bütçe", 
      effects: { Finance: 15, Sponsors: 5 }, 
      nextStory: financeStory4B 
    },
  ],
};

const financeStory2A: Story = {
  text: "Banka kredi şartlarını sundu. Nasıl ilerlersiniz?",
  options: [
    { 
      text: "Şartları kabul et", 
      effects: { Finance: 15, Sponsors: -5 }, 
      nextStory: financeStory3A 
    },
    { 
      text: "Pazarlık yap", 
      effects: { Finance: 10, Sponsors: 5 }, 
      nextStory: financeStory3A 
    },
    { 
      text: "Alternatif ara", 
      effects: { Finance: 5, Sponsors: 10 }, 
      nextStory: financeStory3B 
    },
    { 
      text: "Vazgeç", 
      effects: { Finance: -10, Sponsors: -5 }, 
      nextStory: financeStory3B 
    },
  ],
};

const financeStory2B: Story = {
  text: "Yıldız oyuncuya büyük kulüplerden teklif var. Nasıl değerlendirirsiniz?",
  options: [
    { 
      text: "Hemen sat", 
      effects: { Finance: 25, TechnicalTeam: -15, Fans: -10 }, 
      nextStory: financeStory3B 
    },
    { 
      text: "Fiyat artır", 
      effects: { Finance: 15, TechnicalTeam: -5 }, 
      nextStory: financeStory3A 
    },
    { 
      text: "Oyuncuyla görüş", 
      effects: { TechnicalTeam: 10, Fans: 5 }, 
      nextStory: financeStory3B 
    },
    { 
      text: "Teklifi reddet", 
      effects: { TechnicalTeam: 15, Finance: -10 }, 
      nextStory: financeStory3A 
    },
  ],
};

const financeRoot: Story = {
  text: "Kulüp ciddi bir finansal krizle karşı karşıya. İlk hamleniz ne olacak?",
  options: [
    { 
      text: "Banka kredisi başvurusu yap", 
      effects: { Finance: -5, Sponsors: 10 }, 
      nextStory: financeStory2A // Kredi başvurusu yapılırsa krediyle ilgili hikaye
    },
    { 
      text: "Yıldız oyuncuyu sat", 
      effects: { Finance: 25, TechnicalTeam: -15, Fans: -10 }, 
      nextStory: financeStory2B // Oyuncu satışı yapılırsa transferle ilgili hikaye
    },
    { 
      text: "Maaşlarda kesintiye git", 
      effects: { Finance: 15, TechnicalTeam: -10 }, 
      nextStory: financeStory2A // Maaş kesintisi yapılırsa finansal planlamayla ilgili hikaye
    },
    { 
      text: "Yeni sponsorlar ara", 
      effects: { Sponsors: 15, Finance: 5 }, 
      nextStory: financeStory2B // Sponsorluk aranırsa yatırım planlamasıyla ilgili hikaye
    },
  ],
};

// Teknik Ekip hikayeleri - daha detaylı ve seçime bağlı hikayeler

const technicalTeamStory5_Experience: Story = {
  text: `Sezon sonuna yaklaşırken, deneyimli teknik ekibiniz büyük kulüplerden teklifler almaya başladı. 
  Özellikle yardımcı antrenörünüz, önemli bir Süper Lig kulübünden baş antrenörlük teklifi aldığını açıkladı. 
  Teknik ekibin motivasyonu yüksek ama ayrılık sinyalleri endişe yaratıyor.`,
  options: [
    { 
      text: "Teknik ekibe yeni sözleşme teklif et ve gelecek planlarını paylaş", 
      effects: { Finance: -20, TechnicalTeam: 25 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Yardımcı antrenörü baş antrenörlüğe yükselt, mevcut hocayla yolları ayır", 
      effects: { TechnicalTeam: 15, Finance: -15, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Ayrılmak isteyenlere izin ver ama genç antrenörlerle yola devam et", 
      effects: { TechnicalTeam: -5, Finance: 10, Fans: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Mevcut sözleşmeleri hatırlat ve takımda kalmalarını sağla", 
      effects: { TechnicalTeam: -10, Finance: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const technicalTeamStory5_Youth: Story = {
  text: `Altyapıdan yetiştirdiğiniz genç teknik ekip, modern futbol anlayışıyla takımı değiştirmeye başladı. 
  Ancak bazı tecrübeli oyuncular yeni sisteme adapte olmakta zorlanıyor ve takım içinde gruplaşmalar oluşuyor. 
  Taraftar ise genç teknik ekibe tam destek veriyor.`,
  options: [
    { 
      text: "Genç teknik ekibe tam yetki ver ve değişimi destekle", 
      effects: { TechnicalTeam: 20, Fans: 15, Finance: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Tecrübeli bir danışman ekibe mentor olarak ata", 
      effects: { TechnicalTeam: 15, Finance: -15, Fans: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Uyum sorunu yaşayan oyuncuları kadro dışı bırak", 
      effects: { TechnicalTeam: 10, Finance: -5, Fans: -10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Daha dengeli bir sistem için teknik ekibi uyar", 
      effects: { TechnicalTeam: -5, Fans: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const technicalTeamStory4A: Story = {
  text: "Teknik direktör taktik değişiklik istiyor ama oyuncular uyum sağlamakta zorlanıyor. Ne yapmalı?",
  options: [
    { 
      text: "Ekstra antrenman programı", 
      effects: { TechnicalTeam: 15, Finance: -10 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Tecrübeli oyuncu transferi", 
      effects: { Finance: -15, TechnicalTeam: 20 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Eski sisteme dön", 
      effects: { TechnicalTeam: -5 }, 
      nextStory: technicalTeamStory5_Youth 
    },
    { 
      text: "Zamana bırak", 
      effects: { TechnicalTeam: 5, Finance: 5 }, 
      nextStory: technicalTeamStory5_Youth 
    },
  ],
};

const technicalTeamStory4B: Story = {
  text: "Altyapıdan genç bir oyuncu parlıyor. Nasıl değerlendirirsiniz?",
  options: [
    { 
      text: "A takıma yükselt", 
      effects: { TechnicalTeam: 15, Fans: 10 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Kiralık gönder", 
      effects: { Finance: 10, TechnicalTeam: 5 }, 
      nextStory: technicalTeamStory5_Youth 
    },
    { 
      text: "Altyapıda devam", 
      effects: { TechnicalTeam: 10 }, 
      nextStory: technicalTeamStory5_Experience 
    },
    { 
      text: "Satış planla", 
      effects: { Finance: 20, TechnicalTeam: -5, Fans: -5 }, 
      nextStory: technicalTeamStory5_Youth 
    },
  ],
};

const technicalTeamStory3A: Story = {
  text: "Takım kaptanı antrenman yoğunluğundan şikayet ediyor. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Programı hafiflet", 
      effects: { TechnicalTeam: 10, Finance: -5 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "Teknik ekiple görüş", 
      effects: { TechnicalTeam: 15 }, 
      nextStory: technicalTeamStory4B 
    },
    { 
      text: "Performans analizi iste", 
      effects: { TechnicalTeam: 5, Finance: -10 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "Şikayeti görmezden gel", 
      effects: { TechnicalTeam: -10, Fans: -5 }, 
      nextStory: technicalTeamStory4B 
    },
  ],
};

const technicalTeamStory3B: Story = {
  text: "Scout ekibi yeni bir yetenek keşfetti. Nasıl ilgileneceksiniz?",
  options: [
    { 
      text: "Hemen transfer et", 
      effects: { Finance: -15, TechnicalTeam: 20 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "Takip listesine al", 
      effects: { TechnicalTeam: 5 }, 
      nextStory: technicalTeamStory4B 
    },
    { 
      text: "Deneme antrenmanı", 
      effects: { TechnicalTeam: 10, Finance: -5 }, 
      nextStory: technicalTeamStory4A 
    },
    { 
      text: "İlgilenme", 
      effects: { TechnicalTeam: -5 }, 
      nextStory: technicalTeamStory4B 
    },
  ],
};

const technicalTeamStory2A: Story = {
  text: "Yeni antrenör takıma katıldı. Şimdi öncelik ne olmalı?",
  options: [
    { 
      text: "Genç oyuncuların gelişimi", 
      effects: { TechnicalTeam: 15, Finance: -10 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "Taktik sistem değişikliği", 
      effects: { TechnicalTeam: 10, Finance: -5 }, 
      nextStory: technicalTeamStory3B 
    },
    { 
      text: "Kondisyon artırımı", 
      effects: { TechnicalTeam: 5 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "Mevcut düzeni koru", 
      effects: { TechnicalTeam: -5, Finance: 5 }, 
      nextStory: technicalTeamStory3B 
    },
  ],
};

const technicalTeamStory2B: Story = {
  text: "Altyapı antrenörü istifa etti. Ne yapacaksınız?",
  options: [
    { 
      text: "Tecrübeli hoca getir", 
      effects: { Finance: -15, TechnicalTeam: 20 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "İçeriden terfi", 
      effects: { TechnicalTeam: 10, Fans: 5 }, 
      nextStory: technicalTeamStory3B 
    },
    { 
      text: "Genç antrenör şansı", 
      effects: { TechnicalTeam: 15, Finance: -5 }, 
      nextStory: technicalTeamStory3A 
    },
    { 
      text: "Geçici çözüm", 
      effects: { TechnicalTeam: -5 }, 
      nextStory: technicalTeamStory3B 
    },
  ],
};

const technicalTeamRoot: Story = {
  text: "Teknik direktör yeni bir yardımcı antrenör istiyor. Ne yapacaksınız?",
  options: [
    { 
      text: "Deneyimli antrenör transfer et", 
      effects: { Finance: -15, TechnicalTeam: 20 }, 
      nextStory: technicalTeamStory2A 
    },
    { 
      text: "Altyapıdan terfi ettir", 
      effects: { TechnicalTeam: 15, Finance: -5 }, 
      nextStory: technicalTeamStory2B 
    },
    { 
      text: "Yurt dışından getir", 
      effects: { Finance: -20, TechnicalTeam: 25 }, 
      nextStory: technicalTeamStory2A 
    },
    { 
      text: "Talebi reddet", 
      effects: { Finance: 5, TechnicalTeam: -10 }, 
      nextStory: technicalTeamStory2B 
    },
  ],
};

// Sponsorlar hikayeleri
const sponsorStory5: Story = {
  text: "Sezon sonu yaklaşıyor ve sponsorlarla yeni dönem görüşmeleri başlıyor. Ne yapmalısınız?",
  options: [
    { 
      text: "Uzun vadeli anlaşma teklif et", 
      effects: { Sponsors: 20, Finance: 15 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Daha yüksek bedelli kısa dönem anlaşma iste", 
      effects: { Sponsors: 15, Finance: 20 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Performansa dayalı bonus sistem öner", 
      effects: { Sponsors: 10, TechnicalTeam: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Mevcut şartları koru", 
      effects: { Sponsors: 5, Finance: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const sponsorStory4: Story = {
  text: "Forma sponsoru değişiklik talep ediyor. Nasıl karşılık vereceksiniz?",
  options: [
    { 
      text: "Tasarımı değiştir", 
      effects: { Sponsors: 15, Fans: -5 }, 
      nextStory: sponsorStory5 
    },
    { 
      text: "Ek ücret talep et", 
      effects: { Sponsors: -5, Finance: 15 }, 
      nextStory: sponsorStory5 
    },
    { 
      text: "Orta yol bul", 
      effects: { Sponsors: 10, Fans: 5 }, 
      nextStory: sponsorStory5 
    },
    { 
      text: "Talebi reddet", 
      effects: { Sponsors: -10, Finance: -5 }, 
      nextStory: sponsorStory5 
    },
  ],
};

const sponsorStory3: Story = {
  text: "Yeni bir sponsor adayı stadyum isim hakkı için teklifte bulundu. Ne yapacaksınız?",
  options: [
    { 
      text: "Teklifi kabul et", 
      effects: { Sponsors: 20, Finance: 20, Fans: -10 }, 
      nextStory: sponsorStory4 
    },
    { 
      text: "Daha yüksek teklif iste", 
      effects: { Sponsors: 10, Finance: 10 }, 
      nextStory: sponsorStory4 
    },
    { 
      text: "Taraftar görüşü al", 
      effects: { Sponsors: -5, Fans: 15 }, 
      nextStory: sponsorStory4 
    },
    { 
      text: "Teklifi reddet", 
      effects: { Sponsors: -10, Fans: 10 }, 
      nextStory: sponsorStory4 
    },
  ],
};

const sponsorStory2: Story = {
  text: "Mevcut sponsorlar ödeme planında revizyon istiyor. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Esneklik göster", 
      effects: { Sponsors: 15, Finance: -10 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Sözleşmeyi hatırlat", 
      effects: { Sponsors: -15, Finance: 10 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Alternatif sponsor ara", 
      effects: { Sponsors: 5, Finance: 5 }, 
      nextStory: sponsorStory3 
    },
    { 
      text: "Uzlaşma teklif et", 
      effects: { Sponsors: 10, Finance: -5 }, 
      nextStory: sponsorStory3 
    },
  ],
};

const sponsorsRoot: Story = {
  text: "Sezon başında sponsorluk gelirleri düşük seyrediyor. İlk adımınız ne olacak?",
  options: [
    { 
      text: "Yeni sponsorluk paketi hazırla", 
      effects: { Sponsors: 15, Finance: -5 }, 
      nextStory: sponsorStory2 
    },
    { 
      text: "Mevcut sponsorlarla görüş", 
      effects: { Sponsors: 10, Finance: 5 }, 
      nextStory: sponsorStory2 
    },
    { 
      text: "Uluslararası sponsor ara", 
      effects: { Sponsors: 20, Finance: -10 }, 
      nextStory: sponsorStory2 
    },
    { 
      text: "Yerel işletmelere odaklan", 
      effects: { Sponsors: 10, Fans: 10 }, 
      nextStory: sponsorStory2 
    },
  ],
};

// Taraftar İlişkileri hikayeleri
const fansStory5: Story = {
  text: "Taraftar grupları sosyal medyada kampanya başlattı. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Destekle ve katıl", 
      effects: { Fans: 20, Sponsors: 5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Mesafeli dur", 
      effects: { Fans: -5, Sponsors: 10 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Alternatif kampanya başlat", 
      effects: { Fans: 15, Finance: -5 }, 
      nextStory: { text: "End", options: [] } 
    },
    { 
      text: "Görmezden gel", 
      effects: { Fans: -15 }, 
      nextStory: { text: "End", options: [] } 
    },
  ],
};

const fansStory4: Story = {
  text: "Taraftarlar bilet fiyatlarından şikayetçi. Ne yapacaksınız?",
  options: [
    { 
      text: "İndirim yap", 
      effects: { Fans: 20, Finance: -15 }, 
      nextStory: fansStory5 
    },
    { 
      text: "Kombine kampanyası başlat", 
      effects: { Fans: 15, Finance: -10 }, 
      nextStory: fansStory5 
    },
    { 
      text: "Ek hizmetler sun", 
      effects: { Fans: 10, Finance: 5 }, 
      nextStory: fansStory5 
    },
    { 
      text: "Fiyatları koru", 
      effects: { Fans: -10, Finance: 10 }, 
      nextStory: fansStory5 
    },
  ],
};

const fansStory3: Story = {
  text: "Taraftar dernekleri yönetimle görüşmek istiyor. Nasıl yaklaşacaksınız?",
  options: [
    { 
      text: "Açık toplantı düzenle", 
      effects: { Fans: 15, TechnicalTeam: 5 }, 
      nextStory: fansStory4 
    },
    { 
      text: "Dernek başkanlarıyla görüş", 
      effects: { Fans: 10, TechnicalTeam: 10 }, 
      nextStory: fansStory4 
    },
    { 
      text: "Yazılı açıklama yap", 
      effects: { Fans: -5, Sponsors: 5 }, 
      nextStory: fansStory4 
    },
    { 
      text: "Görüşmeyi ertele", 
      effects: { Fans: -10 }, 
      nextStory: fansStory4 
    },
  ],
};

const fansStory2: Story = {
  text: "Kötü sonuçlar taraftar tepkisine yol açıyor. Ne yapmalısınız?",
  options: [
    { 
      text: "Taraftarla buluşma düzenle", 
      effects: { Fans: 15, TechnicalTeam: 5 }, 
      nextStory: fansStory3 
    },
    { 
      text: "Basın açıklaması yap", 
      effects: { Fans: 5, Sponsors: 5 }, 
      nextStory: fansStory3 
    },
    { 
      text: "Sosyal medyada iletişim kur", 
      effects: { Fans: 10, Sponsors: 10 }, 
      nextStory: fansStory3 
    },
    { 
      text: "Sessiz kal", 
      effects: { Fans: -15, Sponsors: -5 }, 
      nextStory: fansStory3 
    },
  ],
};

const fansRoot: Story = {
  text: "Taraftar desteği azalıyor. İlk hamleniz ne olacak?",
  options: [
    { 
      text: "Taraftar forumu düzenle", 
      effects: { Fans: 15, Finance: -5 }, 
      nextStory: fansStory2 
    },
    { 
      text: "Bilet kampanyası başlat", 
      effects: { Fans: 10, Finance: -10 }, 
      nextStory: fansStory2 
    },
    { 
      text: "Oyuncularla buluşma ayarla", 
      effects: { Fans: 20, TechnicalTeam: -5 }, 
      nextStory: fansStory2 
    },
    { 
      text: "Sosyal medya kampanyası yap", 
      effects: { Fans: 10, Sponsors: 5 }, 
      nextStory: fansStory2 
    },
  ],
};

export const stories: Stories = {
  "Finansal Yönetim": financeRoot,
  "Teknik Ekip": technicalTeamRoot,
  "Sponsorlar": sponsorsRoot,
  "Taraftar İlişkileri": fansRoot,
};