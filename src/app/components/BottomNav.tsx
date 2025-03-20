import { useRouter, usePathname } from "next/navigation";
import styles from "../styles/BottomNav.module.css";

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Ana Sayfa", path: "/", icon: "🏠" },
    { name: "Skor Tablosu", path: "/scoreboard", icon: "📊" },
    { name: "Denizlispor Gazetesi", path: "/newspaper", icon: "📰" },
    { name: "Profil", path: "/profile", icon: "👤" },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`${styles.navButton} ${
            pathname === item.path ? styles.active : ""
          }`}
          onClick={() => router.push(item.path)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
