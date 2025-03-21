"use client";
import { useRouter } from "next/navigation";
import { use } from "react";
import styles from "../../styles/Newspaper.module.css";
import { FaArrowLeft } from "react-icons/fa";
import BottomNav from "@/app/components/BottomNav";
interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
  content: string;
}

// This would typically come from an API or database
const newsData: NewsItem[] = [
  {
    id: 1,
    title: "Denizlispor'da Yeni Sezon Hazırlıkları Başladı",
    summary:
      "Takım, yeni sezon öncesi çalışmalarına başladı. Teknik ekip ve oyuncular hazırlık kampında bir araya geldi.",
    date: "2024-03-20",
    category: "Haber",
    content:
      "Denizlispor'un yeni sezon hazırlıkları kapsamında teknik ekip ve oyuncular hazırlık kampında bir araya geldi. Kamp süresince takım, hem fiziksel hem de taktik çalışmalarını gerçekleştirecek. Teknik direktör, yeni sezon hedeflerini ve beklentilerini oyuncularla paylaştı.",
  },
  {
    id: 2,
    title: "Taraftarlardan Büyük Destek",
    summary:
      "Son maçta tribünlerden gelen destek takımı motive etti. Taraftarlar, takımlarına olan inançlarını bir kez daha gösterdi.",
    date: "2024-03-19",
    category: "Taraftar",
    content:
      "Son maçta tribünlerden gelen destek takımı motive etti. Taraftarlar, takımlarına olan inançlarını bir kez daha gösterdi. Özellikle son dakikalarda tribünlerden yükselen tezahüratlar, takımın galibiyet mücadelesinde önemli bir rol oynadı.",
  },
];

export default function NewsDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const newsItem = newsData.find(
    (item) =>
      item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === params.slug
  );

  if (!newsItem) {
    return <div>Haber bulunamadı</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <FaArrowLeft />
        </button>
        <article className={styles.newsDetail}>
          <div className={styles.newsHeader}>
            <span className={styles.category}>{newsItem.category}</span>
            <span className={styles.date}>{newsItem.date}</span>
          </div>
          <h1 className={styles.newsTitle}>{newsItem.title}</h1>
          <p className={styles.newsContent}>{newsItem.content}</p>
        </article>
      </div>
      <BottomNav />
    </div>
  );
}
