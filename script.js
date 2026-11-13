// ===== DATA (edit di sini) =====
const WA = "6281234567890"; // nomor WhatsApp warung, format 62 tanpa +
const HERO_FOTO = "img/hero.jpg";
// foto: isi path foto di folder img, contoh "img/steak-ayam.jpg". Kosong = pakai emoji.
const MENU = [
  { id: 1, nama: "Steak Ayam", harga: 25000, kat: "Steak", e: "🍗", foto: "img/steakayam.img" },
  { id: 2, nama: "Steak Ayam Bakar", harga: 27000, kat: "Steak", e: "🔥", foto: "" },
  { id: 3, nama: "Sushi Goreng", harga: 20000, kat: "Sushi", e: "🍣", foto: "" },
  { id: 4, nama: "Sushi Mentai", harga: 22000, kat: "Sushi", e: "🍱", foto: "" },
  { id: 5, nama: "Kentang Goreng", harga: 12000, kat: "Cemilan", e: "🍟", foto: "" },
  { id: 6, nama: "Mie Goreng", harga: 15000, kat: "Cemilan", e: "🍜", foto: "" },
  { id: 7, nama: "Salad Buah", harga: 13000, kat: "Cemilan", e: "🥗", foto: "" },
  { id: 8, nama: "Es Teh", harga: 5000, kat: "Minuman", e: "🧋", foto: "" }
];

// ===== FUNGSI BANTU =====
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch { return d } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const find = id => MENU.find(m => m.id == id);

// ===== HALAMAN TOKO =====
let cart = load("cart", {}), kat = "Semua";
waTop.href = waBan.href = "https://wa.me/" + WA;
minHarga.textContent = rp(Math.min(...MENU.map(m => m.harga)));
if (HERO_FOTO) blob.innerHTML = `<img src="${HERO_FOTO}" alt="Warung Cemilan Key">`;
function renderMenu() {
  cats.innerHTML = ["Semua", ...new Set(MENU.map(m => m.kat))].map(k => `<button class="cat ${k == kat ? "on" : ""}" onclick="kat='${k}';renderMenu()">${k}</button>`).join("");
  grid.innerHTML = MENU.filter(m => kat == "Semua" || m.kat == kat).map(m => `<article class="card"><span class="badge">${m.kat}</span><div class="pic">${m.foto ? `<img src="${m.foto}" alt="${m.nama}">` : m.e}</div><h3>${m.nama}</h3><p class="hrg">${rp(m.harga)}</p><button class="btn y" onclick="add(${m.id})">Tambah</button></article>`).join("");
}
const add = id => { cart[id] = (cart[id] || 0) + 1; upd() };
const chg = (id, d) => { cart[id] += d; if (cart[id] <= 0) delete cart[id]; upd() };
const total = () => Object.entries(cart).reduce((s, [id, q]) => s + find(id).harga * q, 0);
function upd() {
  save("cart", cart);
  cnt.textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  items.innerHTML = Object.entries(cart).map(([id, q]) => `<div class="row"><span>${find(id).nama}<br><small>${rp(find(id).harga)}</small></span><span class="qty"><button onclick="chg(${id},-1)">-</button>${q}<button onclick="chg(${id},1)">+</button></span></div>`).join("") || "<p>Keranjang masih kosong. Pilih menu dulu.</p>";
  tot.textContent = rp(total());
  hitung();
}
function hitung() {
  tunai.hidden = metode.value !== "Tunai";
  const k = Number(uang.value || 0) - total();
  kembali.textContent = uang.value ? (k >= 0 ? "Kembalian: " + rp(k) : "Uang kurang: " + rp(-k)) : "";
}
function bayar(e) {
  e.preventDefault();
  if (!total()) return alert("Keranjang masih kosong.");
  if (metode.value === "Tunai" && Number(uang.value || 0) < total()) return alert("Uang yang diberikan masih kurang.");
  const o = { id: "ORD-" + Date.now().toString().slice(-6), waktu: new Date().toISOString(), nama: nama.value, metode: metode.value, status: "lunas", total: total(),
    item: Object.entries(cart).map(([id, q]) => ({ nama: find(id).nama, q, harga: find(id).harga })) };
  const all = load("orders", []); all.push(o); save("orders", all);
  const t = "Halo, saya " + o.nama + ". Pesanan " + o.id + ":\n" + o.item.map(i => "- " + i.nama + " x" + i.q).join("\n") + "\nTotal " + rp(o.total) + " (" + o.metode + ", lunas)";
  wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
  okmsg.textContent = "Pesanan " + o.id + " tercatat dengan total " + rp(o.total) + ".";
  cart = {}; uang.value = ""; upd(); dlg.close(); ok.showModal();
}

// ===== DASHBOARD OWNER =====
function show(v) {
  toko.hidden = v === "admin";
  admin.hidden = v !== "admin";
  if (v === "admin") { renderAdmin(); scrollTo(0, 0); }
}
function renderAdmin() {
  const o = load("orders", []);
  const sum = o.reduce((a, x) => a + x.total, 0);
  const qty = o.reduce((a, x) => a + x.item.reduce((b, i) => b + i.q, 0), 0);
  st.innerHTML = [["Total penjualan", rp(sum)], ["Jumlah transaksi", o.length], ["Rata-rata transaksi", rp(o.length ? Math.round(sum / o.length) : 0)], ["Jumlah pesanan", qty]]
    .map(([a, b]) => `<div class="stat"><small>${a}</small><b>${b}</b></div>`).join("");
  list.innerHTML = o.slice().reverse().slice(0, 8).map(x => `<div class="row"><span><b>${x.id}</b> ${x.nama}<br><small>${x.item.map(i => i.nama + " x" + i.q).join(", ")}</small></span><span style="text-align:right">${rp(x.total)}<br><span class="st">${x.status}</span></span></div>`).join("") || "<p>Belum ada pesanan. Buat pesanan di halaman toko, atau klik Isi data contoh.</p>";
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d.toISOString().slice(0, 10) });
  const per = days.map(d => o.filter(x => x.waktu.slice(0, 10) == d).reduce((a, x) => a + x.total, 0));
  const mx = Math.max(...per, 1);
  trend.innerHTML = per.map((v, i) => `<div class="bar2" title="${rp(v)}" style="height:${v / mx * 100}%"><span>${days[i].slice(8)}</span></div>`).join("");
  const hit = {};
  o.forEach(x => x.item.forEach(i => hit[i.nama] = (hit[i.nama] || 0) + i.q));
  terlaris.innerHTML = Object.entries(hit).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, q]) => `<div class="row"><span>${n}</span><b>${q}</b></div>`).join("") || "<p>Belum ada data.</p>";
}
function seed() {
  const a = load("orders", []);
  for (let i = 0; i < 12; i++) {
    const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 7));
    const its = [...MENU].sort(() => Math.random() - .5).slice(0, 1 + Math.floor(Math.random() * 3)).map(m => ({ nama: m.nama, q: 1 + Math.floor(Math.random() * 2), harga: m.harga }));
    a.push({ id: "ORD-" + (100000 + i), waktu: d.toISOString(), nama: "Pelanggan " + (i + 1), metode: ["QRIS", "E-wallet", "Transfer bank / VA"][i % 3], status: "lunas", total: its.reduce((s, x) => s + x.harga * x.q, 0), item: its });
  }
  save("orders", a); renderAdmin();
}
function hapus() { if (confirm("Hapus semua pesanan?")) { save("orders", []); renderAdmin(); } }

renderMenu(); upd();
