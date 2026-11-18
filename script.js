// ===== DATA (edit di sini) =====
const WA = "62881024851406"; // nomor WhatsApp warung, format 62 tanpa +
const HERO_FOTO = "img/hero.jpg";
const QRIS_FOTO = "img/qris.png"; // gambar QRIS warung (ada di folder img)
// Alamat Google Apps Script (berakhiran /exec). Kosongkan "" kalau belum dipasang.
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwzkZVuLyeEb4aPmxzKLpasIrk0mxy46eCJq4j-C041kPDQlHDz_AvR3ujPOABAPyA/exec";
const QRIS_AKTIF = true; // ganti true kalau QRIS sudah siap dipakai
const ONGKIR = 3000; // tarif antar flat, khusus wilayah Jakarta
// foto: isi path foto di folder img, contoh "img/steak-ayam.jpg". Kosong = pakai emoji.
const MENU = [
  { id: 1, nama: "Steak Ayam", harga: 25000, kat: "Steak", e: "🍗", foto: "img/steakayam.jpg" },
  { id: 2, nama: "Seblak", harga: 15000, kat: "Cemilan", e: "🔥", foto: "img/seblak.jpg" },
  { id: 3, nama: "Sushi Tobiko", harga: 20000, kat: "Sushi", e: "🍣", foto: "img/sushitobiko.jpg" },
  { id: 4, nama: "Sushi Mentai", harga: 22000, kat: "Sushi", e: "🍱", foto: "img/sushimentai.jpg" },
  { id: 5, nama: "Kentang Goreng", harga: 12000, kat: "Cemilan", e: "🍟", foto: "img/kentanggoreng.jpg" },
  { id: 6, nama: "Mie Goreng", harga: 15000, kat: "Cemilan", e: "🍜", foto: "img/miegoreng.jpg" },
  { id: 7, nama: "Salad Buah", harga: 13000, kat: "Cemilan", e: "🥗", foto: "img/saladbuah.jpg" },
  { id: 8, nama: "Es Teh", harga: 5000, kat: "Minuman", e: "🧋", foto: "img/esteh.jpg" },
  { id: 9, nama: "Es Jeruk", harga: 6000, kat: "Minuman", e: "🍊", foto: "img/esjeruk.jpg" },
  { id: 10, nama: "Ricebowl", harga: 15000, kat: "Nasi", e: "🍚", foto: "img/ricebowl.jpg" },
  { id: 11, nama: "Cireng", harga: 10000, kat: "Cemilan", e: "🥟", foto: "img/cireng.jpg" },
  { id: 12, nama: "Es Teler", harga: 20000, kat: "Minuman", e: "🧋", foto: "img/esteler.jpg" },
  { id: 13, nama: "Nasi Uduk Betawi", harga: 17000, kat: "Nasi", e: "🍚", foto: "img/nasiudukbetawi.jpg" },
  { id: 14, nama: "Nasi Ayam Geprek", harga: 15000, kat: "Nasi", e: "🍚", foto: "img/ayamgeprek.jpg" },
  { id: 15, nama: "Nasi Ayam Bakar", harga: 20000, kat: "Nasi", e: "🍚", foto: "img/ayambakar.jpg" },
  { id: 16, nama: "Nasi Ayam Kremes", harga: 20000, kat: "Nasi", e: "🍚", foto: "img/ayamkremes.jpg" },
  { id: 17, nama: "Spaghetti", harga: 10000, kat: "Cemilan", e: "🍜", foto: "img/spagetti.jpg" },
   { id: 18, nama: "Kimbap", harga: 15000, kat: "Sushi", e: "🍣", foto: "img/kimbap.jpg" }
];

// ===== FUNGSI BANTU =====
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d } catch { return d } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} };
const find = id => MENU.find(m => m.id == id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ===== HALAMAN TOKO =====
let cart = load("cart", {}), kat = "Semua";
waTop.href = waBan.href = "https://wa.me/" + WA;
if (!QRIS_AKTIF) {
  metode.querySelector('option[value="QRIS"]').remove(); metode.value = "Cash";
  heroP.textContent = "Pilih menu favoritmu, bayar cash, langsung proses!";
  proofSm.textContent = "Cash";
}
const elMin = document.getElementById("minHarga");
if (elMin) elMin.textContent = rp(Math.min(...MENU.map(m => m.harga)));
if (HERO_FOTO) blob.innerHTML = `<img src="${HERO_FOTO}" alt="Warung Cemilan Key" onerror="this.parentNode.textContent='🍣'">`;
const KAT_FOTO = { Semua: "img/logosemua.jpg", Steak: "img/logosteak.jpg", Cemilan: "img/logocemilan.jpg", Sushi: "img/logosushi.jpg", Minuman: "img/logominuman.jpg", Nasi: "img/logonasi.jpg" };
const KAT_E = { Semua: "🍽️", Steak: "🍗", Sushi: "🍣", Cemilan: "🍟", Minuman: "🧋", Nasi: "🍚" };
function renderPromo() {
  const a = MENU[0], z = MENU.reduce((x, y) => y.harga < x.harga ? y : x);
  const P = [
    { c: "", t: "Pilihan Key", s: a.nama, p: rp(a.harga), foto: a.foto, e: a.e },
    { c: "red", t: "Mulai dari", s: z.nama, p: rp(z.harga), foto: z.foto, e: z.e },
   { c: "", t: "Antar Jakarta", s: "Ongkir flat " + rp(ONGKIR), foto: "img/ongkir.jpg", e: "🛵" },
   { c: "w3", t: "Jam buka", s: "07.00 - 17.00", foto: "img/jambuka.jpg", e: "🕙" },
   { c: "w3", t: "Pembayaran", s: QRIS_AKTIF ? "Cash & QRIS" : "Cash", foto: "img/pembayaran.jpg", e: "💵", btn: 1 }
  ];
  promo.innerHTML = P.map(x => `<div class="pc ${x.c}"><div><h3>${x.t}</h3><small>${x.s}</small>${x.p ? `<div class="pp">${x.p}</div>` : ""}${x.btn ? `<a class="btn p" href="#menu">Pesan sekarang</a>` : ""}</div><div class="pcirc">${x.foto ? `<img src="${x.foto}" alt="${x.s}" onerror="this.parentNode.textContent='${x.e}'">` : x.e}</div></div>`).join("");
}
function renderMenu() {
  cats.innerHTML = ["Semua", ...new Set(MENU.map(m => m.kat))].map(k => {
  const e = KAT_E[k] || "🍴", f = KAT_FOTO[k] || (k != "Semua" && (MENU.find(m => m.kat == k && m.foto) || {}).foto);
    const ic = f ? `<img src="${f}" alt="${k}" onerror="this.parentNode.textContent='${e}'">` : e;
    return `<button class="cat ${k == kat ? "on" : ""}" onclick="kat='${k}';renderMenu()"><span class="ci">${ic}</span>${k}</button>`;
  }).join("");
  grid.innerHTML = MENU.filter(m => kat == "Semua" || m.kat == kat).map(m => `<article class="card"><span class="badge">${m.kat}</span><div class="pic">${m.foto ? `<img src="${m.foto}" alt="${m.nama}" onerror="this.parentNode.textContent='${m.e}'">` : m.e}</div><h3>${m.nama}</h3><p class="hrg">${rp(m.harga)}</p><button class="btn y" onclick="add(${m.id})">Tambah</button></article>`).join("");
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
  ongkirRow.hidden = !(antar() && subtotal());
  ongkirTxt.textContent = rp(ONGKIR);
  tot.textContent = rp(total());
  hitung();
}
function hitung() {
  const cash = metode.value === "Cash";
  const kirim = antar();
  tunai.hidden = !cash;
  const qf = document.getElementById("qrisForm");
  if (qf) { qf.hidden = cash; if (!cash) { document.getElementById("qrisPrev").src = QRIS_FOTO; document.getElementById("qrisPrevTotal").textContent = rp(total()); } }
  antarBox.hidden = !kirim;
  hp.required = kirim;
  alamat.required = kirim;
  const info = document.getElementById("infoBayar");
  if (info) info.textContent = cash
    ? (kirim ? "Bayar tunai ke kurir saat pesanan sampai." : "Bayar langsung di warung saat pesanan diambil.")
    : "Scan QRIS di atas, lalu klik \"Bayar sekarang\" dan kirim bukti bayar lewat WhatsApp. Pesanan diproses setelah pembayaran dikonfirmasi pemilik.";
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
    layanan: kirim ? "Antar (Jakarta)" : "Ambil di warung",
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
  cart = {}; uang.value = ""; nama.value = ""; hp.value = ""; alamat.value = ""; catatan.value = ""; layanan.value = "Ambil";
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
    a.push({ id: "ORD-" + (100000 + i), waktu: d.toISOString(), nama: "Pelanggan " + (i + 1), metode: ["QRIS", "Cash"][i % 2], layanan: i % 3 ? "Ambil di warung" : "Antar (Jakarta)", status: "lunas", total: its.reduce((s, x) => s + x.harga * x.q, 0), item: its });
  }
  save("orders", a); renderAdmin();
}
function hapus() { if (confirm("Hapus semua pesanan?")) { save("orders", []); renderAdmin(); } }

renderMenu(); renderPromo(); upd();

// ===== halaman Catering + pindah halaman (Home, Menu, Tentang, Catering) =====
// Foto halaman Catering: ganti path-nya dengan foto sendiri di folder img. Kosong/gagal dimuat = pakai emoji.
const CATERING_HERO = "img/catering-hero.jpg"; // foto besar di samping judul halaman Catering
const CATERING_FOTO = [
  { foto: "img/catering1.jpg", cap: "Aneka makanan", e: "🍱" },
  { foto: "img/catering2.jpg", cap: "Cemilan", e: "🍟" },
  { foto: "img/catering3.jpg", cap: "Antar pesanan", e: "🛵" },
  { foto: "img/catering4.jpg", cap: "Untuk acaramu", e: "🎉" }
];
(function () {
  document.getElementById("toko").insertAdjacentHTML("beforeend", `
<div class="wrap sec" id="cater">
  <section class="hero">
    <div><span class="tag">Catering</span>
      <h1>Pesan Banyak<em>untuk Acaramu</em></h1>
      <p>Butuh pesanan dalam jumlah banyak untuk acara? Isi form pesanan lalu kirim lewat WhatsApp. Bisa diambil di warung, atau diantar khusus wilayah Jakarta.</p>
      <div class="cta"><button type="button" class="btn p" id="ctGo">Isi form pesanan</button></div></div>
    <div class="visual"><div class="blob">${CATERING_HERO ? `<img src="${CATERING_HERO}" alt="Catering Warung Cemilan Key" onerror="this.parentNode.textContent='🍱'">` : "🍱"}</div>
      <span class="deco d1">🍟</span><span class="deco d2">🍃</span><span class="heart">❤</span>
      <div class="chip c1"><span class="ic"><img src="img/chippesanan.jpg" alt="" onerror="this.parentNode.textContent='🛵'"></span><div><small>Cara terima</small><b>Ambil atau antar</b></div></div>
      <div class="chip c2"><span class="ic"><img src="img/whatsapp.png" alt="" onerror="this.parentNode.textContent='💬'"></span><div><small>Pesan lewat</small><b>WhatsApp</b></div></div>
  </section>  <div class="cgal">${CATERING_FOTO.map(x => `<div class="ctile">${x.foto ? `<img src="${x.foto}" alt="${x.cap}" onerror="this.remove()">` : ""}<em>${x.e}</em><span>${x.cap}</span></div>`).join("")}</div>
  <form class="cform" id="ctForm"><h3>Ajukan Pesanan Catering</h3>
    <div class="cgrid">
      <div><label>Nama</label><input id="ctNama" required maxlength="50"></div>
      <div><label>Jumlah porsi</label><input id="ctPorsi" type="number" min="1" required></div>
      <div class="full"><label>Tanggal &amp; jam acara</label><input id="ctTgl" type="datetime-local" required></div>
      <div class="full"><label>Menu / kebutuhan</label><textarea id="ctMenu" class="ta" rows="3" maxlength="300" required placeholder="Contoh: steak ayam 20 porsi, es teh 20 gelas"></textarea></div>
    </div>
    <label>Cara terima pesanan</label>
    <div class="opts">
      <label class="opt on"><input type="radio" name="ctTerima" value="Ambil di warung" checked>🏪 Ambil di warung</label>
      <label class="opt"><input type="radio" name="ctTerima" value="Antar ke lokasi (Jakarta)">🛵 Antar ke lokasi<br><small>khusus Jakarta</small></label>
    </div>
    <div id="ctAntar" hidden><label>Alamat lokasi acara (Jakarta)</label><textarea id="ctAlamat" class="ta" rows="3" maxlength="200" placeholder="Jalan, RT/RW, desa/kelurahan, kecamatan, patokan"></textarea></div>
    <p class="note">Harga dan ongkir dikonfirmasi lewat WhatsApp.</p>
    <button class="btn p" style="width:100%;margin-top:10px">Kirim ke WhatsApp</button>
  </form>
</div>`);
  const f = document.getElementById("ctForm"), box = document.getElementById("ctAntar"), al = document.getElementById("ctAlamat");
    document.getElementById("ctGo").addEventListener("click", () => f.scrollIntoView({ behavior: "smooth" }));
  const terima = () => f.querySelector('input[name="ctTerima"]:checked').value;
  f.addEventListener("change", () => {
    const antar = terima().startsWith("Antar");
    box.hidden = !antar; al.required = antar;
    f.querySelectorAll(".opt").forEach(o => o.classList.toggle("on", o.querySelector("input").checked));
  });
  f.addEventListener("submit", e => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim(), antar = terima().startsWith("Antar");
    if (antar && v("ctAlamat").length < 10) return alert("Alamat lokasi acara harus diisi (jalan, RT/RW, desa/kelurahan, kecamatan).");
    const d = new Date(v("ctTgl")), tgl = isNaN(d) ? v("ctTgl") : d.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });
    const t = "Halo, saya " + v("ctNama") + ". Saya mau pesan catering.\nJumlah porsi: " + v("ctPorsi") + "\nTanggal & jam acara: " + tgl + "\nMenu/kebutuhan: " + v("ctMenu") + "\nCara terima: " + terima() + (antar ? "\nAlamat: " + v("ctAlamat") : "");
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(t), "_blank", "noopener");
  });

  // pindah halaman lewat alamat #hash
  const EL = { home: "home", info: "menu", menu: "menu", keunggulan: "tentang", catering: "tentang", cater: "catering" };
  const HASH = { home: "home", info: "menu", menu: "menu", keunggulan: "tentang", tentang: "tentang", catering: "catering" };
  Object.keys(EL).forEach(id => { const x = document.getElementById(id); if (x) x.dataset.page = EL[id]; });
  const sp = document.querySelector("#toko > .strip"); if (sp) sp.dataset.page = "home";
  function route() {
    const p = HASH[location.hash.slice(1)] || "home";
    document.querySelectorAll("[data-page]").forEach(x => { x.hidden = x.dataset.page !== p; });
    document.querySelectorAll("header nav a").forEach(a => a.classList.toggle("on", HASH[a.getAttribute("href").slice(1)] === p));
    scrollTo(0, 0);
  }
  addEventListener("hashchange", route); route();
})();

// ===== Catering: pilih menu, harga + ongkir otomatis =====
const ONGKIR_CATERING = ONGKIR; // ongkir catering (sama dengan ongkir biasa). Ubah angkanya kalau beda.
(function () {
  const lama = document.getElementById("ctForm"); if (!lama) return;
  const f = lama.cloneNode(false); lama.replaceWith(f); // ganti form lama dengan form baru
  const $ = id => document.getElementById(id);
  f.innerHTML = `<h3>Pesan Catering</h3>
    <label>Pilih menu &amp; jumlah porsi</label>
    <div class="cmenu">${MENU.map(m => `<div class="cm" id="cm${m.id}"><div class="cmp">${m.foto ? `<img src="${m.foto}" alt="" onerror="this.parentNode.textContent='${m.e}'">` : m.e}</div><div class="cmi"><b>${m.nama}</b><small>${rp(m.harga)}</small></div><input class="cq" type="number" min="0" max="500" value="0" inputmode="numeric" data-id="${m.id}" aria-label="Jumlah ${m.nama}"></div>`).join("")}</div>
    <div class="cgrid">
      <div><label>Nama</label><input id="ctNama" required maxlength="50"></div>
      <div><label>No. WhatsApp / HP</label><input id="ctHp" type="tel" inputmode="tel" required maxlength="20" placeholder="0812xxxxxxx"></div>
      <div class="full"><label>Tanggal &amp; jam acara</label><input id="ctTgl" type="datetime-local" required></div>
    </div>
    <label>Cara terima pesanan</label>
    <div class="opts">
      <label class="opt on"><input type="radio" name="ctTerima" value="Ambil di warung" checked>🏪 Ambil di warung<br><small>gratis ongkir</small></label>
      <label class="opt"><input type="radio" name="ctTerima" value="Antar ke lokasi (Jakarta)">🛵 Antar ke lokasi<br><small>khusus Jakarta, +${rp(ONGKIR_CATERING)}</small></label>
    </div>
    <div id="ctAntar" hidden><label>Alamat lokasi acara (Jakarta)</label><textarea id="ctAlamat" class="ta" rows="3" maxlength="200" placeholder="Jalan, RT/RW, desa/kelurahan, kecamatan, patokan"></textarea></div>
    <label>Catatan (opsional)</label><input id="ctCatatan" maxlength="100" placeholder="Contoh: pedas sedikit">
    <label>Metode bayar</label><select id="ctMetode">${QRIS_AKTIF ? '<option value="QRIS">QRIS</option>' : ""}<option value="Cash">Cash</option></select>
    <div class="cring">
      <div class="tot"><span>Subtotal</span><span id="ctSub">Rp 0</span></div>
      <div class="tot" id="ctOngRow" hidden><span>Ongkir (Jakarta)</span><span id="ctOng"></span></div>
      <div class="tot"><span>Total bayar</span><span id="ctTot">Rp 0</span></div>
    </div>
    <p class="note" id="ctInfo"></p>
    <button class="btn p" style="width:100%;margin-top:10px">Pesan catering</button>`;

  const terima = () => f.querySelector('input[name="ctTerima"]:checked').value, antar = () => terima().startsWith("Antar");
  const jumlah = () => MENU.map(m => ({ m, q: Math.max(0, Math.min(500, parseInt($("cm" + m.id).querySelector(".cq").value) || 0)) })).filter(x => x.q > 0);
  const hitungCt = () => {
    const its = jumlah(), sub = its.reduce((s, x) => s + x.m.harga * x.q, 0), ong = antar() && sub ? ONGKIR_CATERING : 0;
    MENU.forEach(m => $("cm" + m.id).classList.toggle("on", (parseInt($("cm" + m.id).querySelector(".cq").value) || 0) > 0));
    $("ctAntar").hidden = !antar(); $("ctAlamat").required = antar();
    $("ctOngRow").hidden = !ong; $("ctOng").textContent = rp(ong);
    $("ctSub").textContent = rp(sub); $("ctTot").textContent = rp(sub + ong);
    f.querySelectorAll(".opt").forEach(o => o.classList.toggle("on", o.querySelector("input").checked));
    $("ctInfo").textContent = $("ctMetode").value === "Cash" ? (antar() ? "Bayar tunai ke kurir saat pesanan sampai." : "Bayar tunai di warung saat pesanan diambil.") : "Scan QRIS yang muncul setelah memesan, lalu kirim bukti bayar lewat WhatsApp.";
    return { its, sub, ong, tot: sub + ong };
  };
  f.addEventListener("input", hitungCt); f.addEventListener("change", hitungCt); hitungCt();

  f.addEventListener("submit", e => {
    e.preventDefault();
    const { its, sub, ong, tot } = hitungCt(), v = id => $(id).value.trim();
    if (!its.length) return alert("Pilih minimal satu menu dan isi jumlah porsinya.");
    if (!/^[0-9+\s-]{9,20}$/.test(v("ctHp"))) return alert("Nomor WhatsApp/HP belum benar.");
    if (antar() && v("ctAlamat").length < 10) return alert("Alamat lokasi acara harus diisi (jalan, RT/RW, desa/kelurahan, kecamatan).");
    const d = new Date(v("ctTgl")), tgl = isNaN(d) ? v("ctTgl") : d.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });
    const metode = v("ctMetode"), cash = metode === "Cash";
    const o = {
      id: "CTR-" + Date.now().toString().slice(-6), waktu: new Date().toISOString(), nama: v("ctNama").slice(0, 50),
      layanan: antar() ? "Catering - Antar (Jakarta)" : "Catering - Ambil di warung",
      hp: v("ctHp").slice(0, 20), alamat: antar() ? v("ctAlamat").slice(0, 200) : "",
      catatan: ("Acara: " + tgl + (v("ctCatatan") ? " | " + v("ctCatatan") : "")).slice(0, 200),
      metode, status: cash ? "catering - bayar di tempat" : "catering - menunggu konfirmasi",
      subtotal: sub, ongkir: ong, total: tot,
      item: its.map(x => ({ nama: x.m.nama, q: x.q, harga: x.m.harga }))
    };
    const all = load("orders", []); all.push(o); save("orders", all);
    kirimKeSheet(o);
    const t = "Halo, saya " + o.nama + ". Saya mau pesan catering (" + o.id + "):\n" + o.item.map(i => "- " + i.nama + " x" + i.q).join("\n") +
      "\nSubtotal " + rp(sub) + (ong ? "\nOngkir " + rp(ong) : "") + "\nTotal " + rp(tot) + " (" + metode + ")" +
      "\nTanggal & jam acara: " + tgl + "\nCara terima: " + terima() + (antar() ? "\nAlamat: " + o.alamat : "") +
      "\nNo. HP: " + o.hp + (v("ctCatatan") ? "\nCatatan: " + v("ctCatatan") : "") + (cash ? "" : "\nBukti pembayaran QRIS saya lampirkan di chat ini.");
    wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);
    wa.textContent = cash ? "Kirim pesanan ke WhatsApp" : "Kirim bukti bayar ke WhatsApp";
    okmsg.textContent = "Pesanan catering " + o.id + " tercatat dengan total " + rp(tot) + ". Kirim ke WhatsApp supaya segera dikonfirmasi.";
    const box = $("qrisBox"); if (box) { box.hidden = cash; if (!cash) { $("qrisImg").src = QRIS_FOTO; $("qrisTotal").textContent = rp(tot); } }
    f.querySelectorAll(".cq").forEach(i => i.value = 0); ["ctNama", "ctHp", "ctTgl", "ctAlamat", "ctCatatan"].forEach(id => $(id).value = "");
    hitungCt(); ok.showModal();
  });
})();
