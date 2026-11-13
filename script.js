// ===== DATA (edit di sini) =====
const WA = "62881024851406"; // nomor WhatsApp warung, format 62 tanpa +
const HERO_FOTO = "img/hero.jpg";
const QRIS_FOTO = "img/qris.png"; // gambar QRIS warung (ada di folder img)
// Alamat Google Apps Script (berakhiran /exec). Kosongkan "" kalau belum dipasang.
const SHEET_URL = "";
const ONGKIR = 5000; // tarif antar flat, khusus wilayah Karawang
// foto: isi path foto di folder img, contoh "img/steak-ayam.jpg". Kosong = pakai emoji.
const MENU = [
  { id: 1, nama: "Steak Ayam", harga: 25000, kat: "Steak", e: "🍗", foto: "img/steakayam.jpg" },
  { id: 2, nama: "Seblak", harga: 15000, kat: "Cemilan", e: "🔥", foto: "img/seblak.jpg" },
  { id: 3, nama: "Sushi Tobiko", harga: 20000, kat: "Sushi", e: "🍣", foto: "img/sushitobiko.jpg" },
  { id: 4, nama: "Sushi Mentai", harga: 22000, kat: "Sushi", e: "🍱", foto: "img/sushimentai.jpg" },
  { id: 5, nama: "Kentang Goreng", harga: 12000, kat: "Cemilan", e: "🍟", foto: "img/kentanggoreng.jpg" },
  { id: 6, nama: "Mie Goreng", harga: 15000, kat: "Cemilan", e: "🍜", foto: "img/miegoreng.jpg" },
  { id: 7, nama: "Salad Buah", harga: 13000, kat: "Cemilan", e: "🥗", foto: "img/saladbuah.jpg" },
  { id: 8, nama: "Es Teh", harga: 5000, kat: "Minuman", e: "🧋", foto: "img/esteh.jpg" }
];

// ===== FUNGSI BANTU =====
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch { return d } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const find = id => MENU.find(m => m.id == id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ===== HALAMAN TOKO =====
let cart = load("cart", {}), kat = "Semua";
waTop.href = waBan.href = "https://wa.me/" + WA;
const elMin = document.getElementById("minHarga");
if (elMin) elMin.textContent = rp(Math.min(...MENU.map(m => m.harga)));
if (HERO_FOTO) blob.innerHTML = `<img src="${HERO_FOTO}" alt="Warung Cemilan Key">`;
function renderMenu() {
  cats.innerHTML = ["Semua", ...new Set(MENU.map(m => m.kat))].map(k => `<button class="cat ${k == kat ? "on" : ""}" onclick="kat='${k}';renderMenu()">${k}</button>`).join("");
  grid.innerHTML = MENU.filter(m => kat == "Semua" || m.kat == kat).map(m => `<article class="card"><span class="badge">${m.kat}</span><div class="pic">${m.foto ? `<img src="${m.foto}" alt="${m.nama}">` : m.e}</div><h3>${m.nama}</h3><p class="hrg">${rp(m.harga)}</p><button class="btn y" onclick="add(${m.id})">Tambah</button></article>`).join("");
}
const add = id => { cart[id] = (cart[id] || 0) + 1; upd() };
const chg = (id, d) => { cart[id] += d; if (cart[id] <= 0) delete cart[id]; upd() };
const antar = () => layanan.value === "Antar";
const subtotal = () => Object.entries(cart).reduce((s, [id, q]) => s + find(id).harga * q, 0);
const total = () => { const s = subtotal(); return s ? s + (antar() ? ONGKIR : 0) : 0; };
function upd() {
  // buang item yang sudah tidak ada di menu (mis. menu diganti)
  Object.keys(cart).forEach(id => { if (!find(id)) delete cart[id]; });
  save("cart", cart);
  cnt.textContent = Object.values(cart).reduce((a, b) => a + b, 0);
  items.innerHTML = Object.entries(cart).map(([id, q]) => `<div class="row"><span>${find(id).nama}<br><small>${rp(find(id).harga)}</small></span><span class="qty"><button onclick="chg(${id},-1)">-</button>${q}<button onclick="chg(${id},1)">+</button></span></div>`).join("") || "<p>Keranjang masih kosong. Pilih menu dulu.</p>";
  subTot.textContent = rp(subtotal());
  ongkirRow.hidden = !antar();
  ongkirTxt.textContent = rp(ONGKIR);
  tot.textContent = rp(total());
  hitung();
}
function hitung() {
  const cash = metode.value === "Cash";
  const kirim = antar();
  tunai.hidden = !cash;
  antarBox.hidden = !kirim;
  hp.required = kirim;
  alamat.required = kirim;
  const info = document.getElementById("infoBayar");
  if (info) info.textContent = cash
    ? (kirim ? "Bayar tunai ke kurir saat pesanan sampai." : "Bayar langsung di warung saat pesanan diambil.")
    : "Setelah klik \"Bayar sekarang\", kode QRIS akan muncul. Pesanan diproses setelah pembayaran dikonfirmasi pemilik.";
  const k = Number(uang.value || 0) - total();
  kembali.textContent = cash && uang.value ? (k >= 0 ? "Kembalian: " + rp(k) : "Uang kurang: " + rp(-k)) : "";
}

// Kirim catatan pesanan ke Google Sheets (gagal pun tidak mengganggu pesanan)
function kirimKeSheet(o) {
  if (!SHEET_URL) return;
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(o)
  }).catch(() => {});
}

function bayar(e) {
  e.preventDefault();
  const tt = total();
  if (!tt) return alert("Keranjang masih kosong.");
  const nm = nama.value.trim().slice(0, 50);
  if (!nm) return alert("Nama harus diisi.");
  const cash = metode.value === "Cash";
  const kirim = antar();
  const al = alamat.value.trim().slice(0, 200);
  const nohp = hp.value.trim().slice(0, 20);
  const cat = catatan.value.trim().slice(0, 150);
  if (kirim) {
    if (!/^[0-9+\s-]{9,20}$/.test(nohp)) return alert("Nomor WhatsApp/HP belum benar.");
    if (al.length < 10) return alert("Alamat lengkap harus diisi (jalan, RT/RW, desa/kelurahan, kecamatan).");
  }
  if (cash && uang.value && Number(uang.value) < tt) return alert("Uang yang diberikan masih kurang.");

  const o = {
    id: "ORD-" + Date.now().toString().slice(-6),
    waktu: new Date().toISOString(),
    nama: nm,
    layanan: kirim ? "Antar (Karawang)" : "Ambil di warung",
    hp: kirim ? nohp : "",
    alamat: kirim ? al : "",
    catatan: kirim ? cat : "",
    metode: metode.value,
    status: cash ? (kirim ? "bayar ke kurir" : "bayar di tempat") : "menunggu konfirmasi",
    subtotal: subtotal(),
    ongkir: kirim ? ONGKIR : 0,
    total: tt,
    item: Object.entries(cart).map(([id, q]) => ({ nama: find(id).nama, q, harga: find(id).harga }))
  };
  const all = load("orders", []); all.push(o); save("orders", all);
  kirimKeSheet(o);

  let t = "Halo, saya " + o.nama + ". Pesanan " + o.id + ":\n" +
    o.item.map(i => "- " + i.nama + " x" + i.q).join("\n") +
    "\nSubtotal " + rp(o.subtotal) +
    (kirim ? "\nOngkir " + rp(o.ongkir) : "") +
    "\nTotal " + rp(o.total) + " (" + o.metode + ")" +
    "\nLayanan: " + o.layanan;
  if (kirim) {
    t += "\nAlamat: " + o.alamat + "\nNo. HP: " + o.hp;
    if (o.catatan) t += "\nCatatan: " + o.catatan;
  }
  t += cash ? (kirim ? "\nBayar tunai ke kurir." : "\nBayar di warung.") : "\nBukti pembayaran QRIS saya lampirkan di chat ini.";
  wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
  wa.textContent = cash ? "Kirim pesanan ke WhatsApp" : "Kirim bukti bayar ke WhatsApp";

  okmsg.textContent = "Pesanan " + o.id + " tercatat dengan total " + rp(o.total) + ".";
  const box = document.getElementById("qrisBox");
  if (box) {
    box.hidden = cash;
    if (!cash) {
      document.getElementById("qrisImg").src = QRIS_FOTO;
      document.getElementById("qrisTotal").textContent = rp(o.total);
    }
  }
  cart = {}; uang.value = ""; nama.value = ""; hp.value = ""; alamat.value = ""; catatan.value = "";
  upd(); dlg.close(); ok.showModal();
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
  list.innerHTML = o.slice().reverse().slice(0, 8).map(x => `<div class="row"><span><b>${esc(x.id)}</b> ${esc(x.nama)}<br><small>${x.item.map(i => esc(i.nama) + " x" + i.q).join(", ")} • ${esc(x.metode)}${x.layanan ? " • " + esc(x.layanan) : ""}</small></span><span style="text-align:right">${rp(x.total)}<br><span class="st">${esc(x.status)}</span></span></div>`).join("") || "<p>Belum ada pesanan. Buat pesanan di halaman toko, atau klik Isi data contoh.</p>";
  const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return d.toISOString().slice(0, 10) });
  const per = days.map(d => o.filter(x => x.waktu.slice(0, 10) == d).reduce((a, x) => a + x.total, 0));
  const mx = Math.max(...per, 1);
  trend.innerHTML = per.map((v, i) => `<div class="bar2" title="${rp(v)}" style="height:${v / mx * 100}%"><span>${days[i].slice(8)}</span></div>`).join("");
  const hit = {};
  o.forEach(x => x.item.forEach(i => hit[i.nama] = (hit[i.nama] || 0) + i.q));
  terlaris.innerHTML = Object.entries(hit).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, q]) => `<div class="row"><span>${esc(n)}</span><b>${q}</b></div>`).join("") || "<p>Belum ada data.</p>";
}
function seed() {
  const a = load("orders", []);
  for (let i = 0; i < 12; i++) {
    const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 7));
    const its = [...MENU].sort(() => Math.random() - .5).slice(0, 1 + Math.floor(Math.random() * 3)).map(m => ({ nama: m.nama, q: 1 + Math.floor(Math.random() * 2), harga: m.harga }));
    a.push({ id: "ORD-" + (100000 + i), waktu: d.toISOString(), nama: "Pelanggan " + (i + 1), metode: ["QRIS", "Cash"][i % 2], layanan: i % 3 ? "Ambil di warung" : "Antar (Karawang)", status: "lunas", total: its.reduce((s, x) => s + x.harga * x.q, 0), item: its });
  }
  save("orders", a); renderAdmin();
}
function hapus() { if (confirm("Hapus semua pesanan?")) { save("orders", []); renderAdmin(); } }

renderMenu(); upd();
