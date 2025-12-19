// --- CEK DATA & TAMPILKAN POPUP KONFIRMASI ---
function handleCheckout() {
    // Ambil data input user
    const nama = document.getElementById('nama').value;
    const nohp = document.getElementById('nohp').value;
    const alamat = document.getElementById('alamat').value;
    
    // Cek metode pembayaran yg kepilih
    const paymentOption = document.querySelector('input[name="payment_method"]:checked');
    
    // kalau data kosong, stop
    if (nama === "" || nohp === "" || alamat === "") {
        alert("Mohon lengkapi Nama, No HP, dan Alamat Anda.");
        return;
    }
    if (!paymentOption) {
        alert("Mohon pilih metode pembayaran.");
        return;
    }

    // Ambil item di keranjang & bikin ringkasan buat popup nanti
    const savedCart = localStorage.getItem('gobuCart');
    let rincianProduk = "";
    let grandTotal = 0;

    if (savedCart) {
        const cartArray = JSON.parse(savedCart);
        cartArray.forEach((item, index) => {
            grandTotal += item.subTotal;
            rincianProduk += `${index + 1}. ${item.name} (${item.grind})\n    Qty: ${item.qty} x Rp ${item.price.toLocaleString('id-ID')}\n`;
        });
    }

    // Isi text untuk popup
    const confirmMessage = 
`KONFIRMASI PESANAN
------------------------------------------------
DATA PENERIMA:
Nama   : ${nama}
No. HP : ${nohp}
Alamat : ${alamat}

METODE PEMBAYARAN:
${paymentOption.value.toUpperCase()}

RINCIAN PRODUK:
${rincianProduk}
------------------------------------------------
TOTAL BAYAR: Rp ${grandTotal.toLocaleString('id-ID')}
------------------------------------------------
Sudah benar?`;

    // Kalau user klik OK ke proses checkout
    if (confirm(confirmMessage)) {
        clearCart();
    }
}


// --- COUNTER PRODUK (boleh 0, ga harus mulai 1) ---
function changeQty100(qty100Id, change, price, total100Id) {
    let qtyElement = document.getElementById(qty100Id);
    let totalElement = document.getElementById(total100Id);
    
    let qty1 = parseInt(qtyElement.innerText);
    qty1 += change;

    // Minimal 0
    if (qty1 < 0) qty1 = 0; 
    
    qtyElement.innerText = qty1;
    totalElement.innerText = (qty1 * price).toLocaleString("id-ID");
}

function changeQty250(qty250Id, change, price, total250Id) {
    let qtyElement = document.getElementById(qty250Id);
    let totalElement = document.getElementById(total250Id);
    
    let qty2 = parseInt(qtyElement.innerText);
    qty2 += change;

    // Minimal 0
    if (qty2 < 0) qty2 = 0; 
    
    qtyElement.innerText = qty2;
    totalElement.innerText = (qty2 * price).toLocaleString("id-ID");
}


// --- Tambah produk ke keranjang ---
function addToCart(productName, qtyId, price, grindGroupId) {
    const qtyElement = document.getElementById(qtyId);
    const qty = parseInt(qtyElement.innerText);
    
    // Kalau qty masih 0, stop
    if (qty <= 0) {
        alert("Isi jumlah dulu sebelum beli ya!");
        return; 
    }

    // Ambil pilihan grind (kasar/halus)
    const grindContainer = document.querySelector(grindGroupId);
    let selectedGrind = "KASAR";
    if (grindContainer) {
        const activeBtn = grindContainer.querySelector('.grind-btn.active');
        if (activeBtn) selectedGrind = activeBtn.innerText;
    }

    const subTotal = qty * price;

    // Bikin object item yang mau disimpan
    const newItem = {
        name: productName,
        qty: qty,
        grind: selectedGrind,
        price: price,
        subTotal: subTotal
    };

    // Ambil data sebelumnya dari cart
    let currentCart = localStorage.getItem('gobuCart');
    let cartArray = currentCart ? JSON.parse(currentCart) : [];
    cartArray.push(newItem);
    
    // Save lagi ke localStorage
    localStorage.setItem('gobuCart', JSON.stringify(cartArray));

    // Popup: mau lanjut bayar atau belanja lagi?
    if (confirm(`✔ ${qty}x ${productName} (${selectedGrind}) masuk ke keranjang.\n\nOK = Checkout sekarang\nCancel = Belanja lagi`)) {
        window.location.href = 'payment.html';
    } else {
        // Reset qty kalau user mau tambah yang lain
        qtyElement.innerText = "0"; 
        
        let totalId = qtyId === 'qty100' ? 'total100' : qtyId === 'qty250' ? 'total250' : "";
        if (totalId) document.getElementById(totalId).innerText = "0";
    }
}


// --- Bersihkan keranjang setelah checkout siap ---
function clearCart() {
    alert('Terima kasih! Pesananmu sudah kami terima.');
    localStorage.removeItem('gobuCart'); 
    window.location.href = 'page1.html'; 
}


// --- Logic umum saat halaman load ---
document.addEventListener('DOMContentLoaded', function() {

    // Animasi fade-in
    setTimeout(() => document.body.classList.add('loaded'), 10);

    // Kalau di halaman pembayaran, tampilkan ringkasan order
    if (window.location.pathname.includes('payment.html')) {
        const savedCart = localStorage.getItem('gobuCart');
        const container = document.getElementById('order-summary');
        const grandTotalElement = document.getElementById('grand-total');

        // Biar input no HP cuma angka
        const inputHP = document.getElementById('nohp');
        if (inputHP) {
            inputHP.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }

        if (savedCart) {
            const cartArray = JSON.parse(savedCart);
            let grandTotal = 0;
            container.innerHTML = ""; 

            cartArray.forEach((item) => {
                grandTotal += item.subTotal;
                container.innerHTML += `
                    <div class="item-row">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <div style="display:flex; gap:10px;">
                                <span class="item-detail">Qty: ${item.qty}</span>
                                <span class="item-detail">| ${item.grind}</span>
                            </div>
                        </div>
                        <span class="item-price">Rp ${item.subTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin-bottom: 20px;">
                `;
            });

            grandTotalElement.innerText = "Rp " + grandTotal.toLocaleString('id-ID');
        } else {
            container.innerHTML = "<p>Keranjang kosong.</p>";
            grandTotalElement.innerText = "Rp 0";
        }

        const btnPesan = document.querySelector('.btn-pesan');
        if (btnPesan) btnPesan.onclick = handleCheckout;
    }


    // Navbar transition
    document.querySelectorAll('.navbar a').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetUrl = this.getAttribute('href');
            if (!targetUrl) return;

            e.preventDefault(); 
            document.querySelector('.navbar a.active')?.classList.replace('active', 'tes');
            this.classList.replace('tes', 'active');

            document.body.classList.remove('loaded');
            setTimeout(() => window.location.href = targetUrl, 500);
        });
    });

    // Logic tombol grind (kasar/halus)
    document.querySelectorAll('.grind-options, .grind-options2').forEach(group => {
        group.querySelectorAll('.grind-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                group.querySelectorAll('.grind-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });

    // Setup tombol beli
    const btnBuyAtas = document.querySelector('.product-section-100g .buy-btn');
    if (btnBuyAtas) {
        btnBuyAtas.onclick = () => {
            addToCart('GOBU Robusta 100G', 'qty100', 12000, '.product-section-100g .grind-options');
        };
    }

    
    const btnBuyBawah = document.querySelector('.product-section-250g .buy-btn');
    if (btnBuyBawah) {
        btnBuyBawah.onclick = () => {
            addToCart('GOBU Robusta 250G', 'qty250', 21000, '.product-section-250g .grind-options2');
        };
    }
});
