"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/Newspaper.module.css";
import BottomNav from "../components/BottomNav";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  date: string;
  category: string;
}

export default function Newspaper() {
  const router = useRouter();
  const [news] = useState<NewsItem[]>([
    {
      id: 1,
      title: "Denizlispor'da Yeni Sezon Hazırlıkları Başladı",
      summary:
        "Takım, yeni sezon öncesi çalışmalarına başladı. Teknik ekip ve oyuncular hazırlık kampında bir araya geldi.",
      date: "2024-03-20",
      category: "Haber",
    },
    {
      id: 2,
      title: "Taraftarlardan Büyük Destek",
      summary:
        "Son maçta tribünlerden gelen destek takımı motive etti. Taraftarlar, takımlarına olan inançlarını bir kez daha gösterdi.",
      date: "2024-03-19",
      category: "Taraftar",
    },
    // Add more news items as needed
  ]);

  const handleNewsClick = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    router.push(`/newspaper/${slug}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Denizlispor Gazetesi</h1>
        <div className={styles.newsList}>
          {news.map((item) => (
            <article
              key={item.id}
              className={styles.newsItem}
              onClick={() => handleNewsClick(item.title)}
            >
              <div className={styles.newsHeader}>
                <span className={styles.category}>{item.category}</span>
                <span className={styles.date}>{item.date}</span>
              </div>
              <h2 className={styles.newsTitle}>{item.title}</h2>
              <p className={styles.newsSummary}>{item.summary}</p>
            </article>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
