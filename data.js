// Nomor WhatsApp warung (format 62, tanpa +). GANTI dengan nomor asli.
const WA = "6281234567890";
// Daftar menu. Ganti emoji dengan foto: tambahkan field foto:"img/steak.jpg" lalu ubah di index.html
const MENU = [
  { id: 1, nama: "Steak Ayam", harga: 25000, e: "🍗" },
  { id: 2, nama: "Steak Ayam Bakar", harga: 27000, e: "🔥" },
  { id: 3, nama: "Sushi Goreng", harga: 20000, e: "🍣" },
  { id: 4, nama: "Sushi Mentai", harga: 22000, e: "🍱" },
  { id: 5, nama: "Kentang Goreng", harga: 12000, e: "🍟" },
  { id: 6, nama: "Mie Goreng", harga: 15000, e: "🍜" },
  { id: 7, nama: "Salad Buah", harga: 13000, e: "🥗" },
  { id: 8, nama: "Es Teh", harga: 5000, e: "🧋" }
];
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch { return d } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
