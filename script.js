// Core config
const SHOP = { name: "Maxistore", currency: "FCFA", mainColor: "#c9a23f" };

const PRODUCTS = [
  { id:1, title:"Tasse en céramique", price:4500, oldPrice:5500, category:"Maison", image:"images/tasse.svg", image2:"images/tasse-2.svg", desc:"Tasse design, idéale pour thé et café."},
  { id:2, title:"Tisane bio 100g", price:2500, category:"Alimentation", image:"images/tisane.svg", desc:"Mélange traditionnel."},
  { id:3, title:"Casquette unisexe", price:8000, oldPrice:10000, category:"Vêtements", image:"images/casquette.svg", image2:"images/casquette-2.svg", desc:"Casquette confortable."},
  { id:4, title:"Montre minimaliste", price:25000, category:"Accessoires", image:"images/montre.svg", desc:"Montre élégante."},
  { id:5, title:"Savon naturel (pack 3)", price:3200, category:"Hygiène", image:"images/savon.svg", desc:"Savon doux pour peau sensible."},
  { id:6, title:"Sac à main", price:18000, oldPrice:22000, category:"Vêtements", image:"images/sac.svg", desc:"Sac pratique et stylé."},
  { id:7, title:"Enceinte portable", price:15000, category:"Électronique", image:"images/enceinte.svg", desc:"Son riche et portatif."},
  { id:8, title:"Bougies parfumées", price:7000, oldPrice:9000, category:"Maison", image:"images/bougies.svg", desc:"Ambiance chaleureuse."}
];

const productGrid = document.getElementById('productGrid');
const categoriesEl = document.getElementById('categories');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartItemsEl = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const paymentModal = document.getElementById('paymentModal');
const checkoutForm = document.getElementById('checkoutForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const shopNow = document.getElementById('shopNow');

const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalAddBtn = document.getElementById('modalAddBtn');

let cart = JSON.parse(localStorage.getItem('maxistore_cart') || '{}');
let activeCategory = 'Tous';
const categories = ['Tous', ...Array.from(new Set(PRODUCTS.map(p=>p.category)))];

// init UI colors
document.querySelectorAll('.dot').forEach(d=>d.style.background=SHOP.mainColor);
document.querySelectorAll('.cta-btn').forEach(b=>b.style.background=SHOP.mainColor);
document.querySelectorAll('.logo').forEach(l=>l.style.color=SHOP.mainColor);
document.getElementById('year').textContent = new Date().getFullYear();

function saveCart(){ localStorage.setItem('maxistore_cart', JSON.stringify(cart)); }
function formatPrice(n){ return n.toLocaleString('fr-FR') + ' ' + SHOP.currency; }

function renderCategories(){
  categoriesEl.innerHTML = '';
  categories.forEach(cat=>{
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat===activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', ()=>{ activeCategory = cat; renderProducts(); renderCategories(); });
    categoriesEl.appendChild(btn);
  });
}

function getFilteredProducts(){
  const q = (searchInput.value || '').trim().toLowerCase();
  let list = PRODUCTS.filter(p=> activeCategory==='Tous' || p.category===activeCategory);
  if(q) list = list.filter(p=> (p.title||'').toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q));
  return list;
}

function renderProducts(){
  const list = getFilteredProducts();
  productGrid.innerHTML = '';
  if(list.length===0){ productGrid.innerHTML = '<div class="muted">Aucun produit trouvé.</div>'; return; }
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className='card';
    card.innerHTML = `
      ${p.oldPrice?'<span class="badge">Promo</span>':''}
      <img loading="lazy" src="${p.image}" alt="${p.title}">
      <div class="card-body">
        <div class="title">${p.title}</div>
        <div class="muted small">${p.category}</div>
        <div class="price">${p.oldPrice?`<span class="old-price">${formatPrice(p.oldPrice)}</span>`:''}<span class="current-price">${formatPrice(p.price)}</span></div>
        <div class="card-actions">
          <button class="btn-add" data-id="${p.id}">Ajouter au panier</button>
          <button class="pill small" data-details="${p.id}">Détails</button>
        </div>
      </div>`;
    productGrid.appendChild(card);
  });
  productGrid.querySelectorAll('.btn-add').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); addToCart(Number(e.currentTarget.dataset.id)); }));
  productGrid.querySelectorAll('[data-details]').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); openProductModal(Number(e.currentTarget.dataset.details)); }));
  // clicking the card opens modal
  productGrid.querySelectorAll('.card').forEach((card, idx)=> card.addEventListener('click', ()=> openProductModal(list[idx].id)));
}

function openProductModal(id){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  modalImg.src = p.image2 || p.image;
  modalTitle.textContent = p.title;
  modalCategory.textContent = p.category;
  modalDesc.textContent = p.desc || '';
  modalPrice.innerHTML = (p.oldPrice?`<span class="old-price">${formatPrice(p.oldPrice)}</span>`:'')+` <span class="current-price">${formatPrice(p.price)}</span>`;
  modalAddBtn.dataset.id = id;
  productModal.style.display = 'flex';
  productModal.setAttribute('aria-hidden','false');
}
function closeProductModal(){ productModal.style.display='none'; productModal.setAttribute('aria-hidden','true'); }
modalClose.addEventListener('click', closeProductModal);
productModal.addEventListener('click', e=>{ if(e.target===productModal) closeProductModal(); });

function addToCart(id, qty=1){ cart[id]= (cart[id]||0)+qty; saveCart(); updateCartUI(); showCartDrawer(); }
function removeFromCart(id){ delete cart[id]; saveCart(); updateCartUI(); }
function changeQty(id, qty){ if(qty<=0) removeFromCart(id); else { cart[id]=qty; saveCart(); updateCartUI(); } }

function updateCartUI(){
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  cartCount.textContent = count;
  cartItemsEl.innerHTML = '';
  let total = 0;
  if(count===0){ cartItemsEl.innerHTML = '<div class="muted">Ton panier est vide.</div>'; cartTotalEl.textContent = formatPrice(0); return; }
  for(const [idStr, qty] of Object.entries(cart)){
    const id = Number(idStr); const p = PRODUCTS.find(x=>x.id===id); if(!p) continue;
    const item = document.createElement('div'); item.className='cart-item';
    item.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div style="flex:1">
        <div style="font-weight:600">${p.title}</div>
        <div class="small muted">${formatPrice(p.price)}</div>
        <div class="qty small" style="margin-top:6px">
          <button class="pill" data-dec="${id}">-</button>
          <span style="padding:6px 10px;border-radius:8px;border:1px solid #eee">${qty}</span>
          <button class="pill" data-inc="${id}">+</button>
          <button class="pill" data-rem="${id}" style="margin-left:8px">Suppr</button>
        </div>
      </div>`;
    cartItemsEl.appendChild(item); total += p.price*qty;
  }
  cartTotalEl.textContent = formatPrice(total);
  cartItemsEl.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click', e=>{ const id=Number(e.currentTarget.dataset.inc); changeQty(id, cart[id]+1); }));
  cartItemsEl.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click', e=>{ const id=Number(e.currentTarget.dataset.dec); changeQty(id, (cart[id]||1)-1); }));
  cartItemsEl.querySelectorAll('[data-rem]').forEach(b=>b.addEventListener('click', e=>{ removeFromCart(Number(e.currentTarget.dataset.rem)); }));
}

function showCartDrawer(){ cartDrawer.style.display='block'; cartDrawer.setAttribute('aria-hidden','false'); }
function hideCartDrawer(){ cartDrawer.style.display='none'; cartDrawer.setAttribute('aria-hidden','true'); }
cartBtn.addEventListener('click', ()=>{ if(cartDrawer.style.display==='block') hideCartDrawer(); else { updateCartUI(); showCartDrawer(); } });

checkoutBtn.addEventListener('click', ()=>{ paymentModal.style.display='flex'; paymentModal.setAttribute('aria-hidden','false'); });
document.getElementById('cancelPayment').addEventListener('click', ()=>{ paymentModal.style.display='none'; paymentModal.setAttribute('aria-hidden','true'); });

checkoutForm.addEventListener('submit', e=>{ e.preventDefault(); const form=new FormData(checkoutForm); alert(`Merci ${form.get('name')} !\nCommande simulée (paiement à la livraison).`); cart={}; saveCart(); updateCartUI(); paymentModal.style.display='none'; });

searchBtn.addEventListener('click', renderProducts);
searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter') renderProducts(); });
modalAddBtn.addEventListener('click', ()=>{ const id=Number(modalAddBtn.dataset.id); if(id) addToCart(id); closeProductModal(); });
shopNow.addEventListener('click', ()=> location.href='#products');

renderCategories(); renderProducts(); updateCartUI();
