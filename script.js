const CART_KEY = "shopEaseCart";
let products = [];
let filteredProducts = [];
let currentPage = 1;
const perPage = 8;

const money = n => new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR", maximumFractionDigits:0}).format(n);

function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){
  const count = getCart().reduce((sum,item)=>sum + item.qty,0);
  const el = document.getElementById("cartCount");
  if(el) el.textContent = count;
}
function showToast(msg){
  const t=document.getElementById("toast"); if(!t) return;
  t.textContent=msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.classList.remove("show"),1800);
}
function addToCart(id){
  const product=products.find(p=>p.id===Number(id)); if(!product) return;
  const cart=getCart(); const existing=cart.find(x=>x.id===product.id);
  if(existing) existing.qty++; else cart.push({...product, qty:1});
  saveCart(cart); showToast(`${product.title} added to cart`);
}
function changeQty(id, delta){
  const cart=getCart(); const item=cart.find(x=>x.id===Number(id));
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart.splice(cart.indexOf(item),1);
  saveCart(cart); renderCart();
}
function removeFromCart(id){ saveCart(getCart().filter(x=>x.id!==Number(id))); renderCart(); showToast("Item removed"); }

async function loadProducts(){
  try{
    const res=await fetch("products.json");
    if(!res.ok) throw new Error("Could not load products");
    products=await res.json();
    filteredProducts=[...products];
    updateCartCount();
    if(document.getElementById("productGrid")) initCatalog();
    if(document.getElementById("detail")) initDetail();
    if(document.getElementById("cartItems")) renderCart();
  }catch(e){
    const grid=document.getElementById("productGrid");
    if(grid) grid.innerHTML='<div class="empty-state" style="grid-column:1/-1"><h2>Unable to load products</h2><p>Run this project with VS Code Live Server so products.json can be fetched.</p></div>';
  }
}

function initCatalog(){
  const categories=[...new Set(products.map(p=>p.category))].sort();
  const select=document.getElementById("categoryFilter");
  categories.forEach(c=>select.insertAdjacentHTML("beforeend",`<option value="${c}">${c}</option>`));
  ["searchInput","categoryFilter","sortSelect"].forEach(id=>document.getElementById(id).addEventListener("input",applyFilters));
  document.getElementById("clearFilters").addEventListener("click",()=>{
    document.getElementById("searchInput").value="";
    document.getElementById("categoryFilter").value="all";
    document.getElementById("sortSelect").value="default";
    applyFilters();
  });
  applyFilters();
}
function applyFilters(){
  const term=document.getElementById("searchInput").value.trim().toLowerCase();
  const cat=document.getElementById("categoryFilter").value;
  const sort=document.getElementById("sortSelect").value;
  filteredProducts=products.filter(p=>(!term || p.title.toLowerCase().includes(term)) && (cat==="all" || p.category===cat));
  if(sort==="price-asc") filteredProducts.sort((a,b)=>a.price-b.price);
  if(sort==="price-desc") filteredProducts.sort((a,b)=>b.price-a.price);
  if(sort==="name-asc") filteredProducts.sort((a,b)=>a.title.localeCompare(b.title));
  if(sort==="name-desc") filteredProducts.sort((a,b)=>b.title.localeCompare(a.title));
  currentPage=1; renderProducts();
}
function renderProducts(){
  const grid=document.getElementById("productGrid"), empty=document.getElementById("emptyState");
  const totalPages=Math.max(1,Math.ceil(filteredProducts.length/perPage));
  currentPage=Math.min(currentPage,totalPages);
  const start=(currentPage-1)*perPage;
  const pageItems=filteredProducts.slice(start,start+perPage);
  grid.innerHTML=pageItems.map(p=>`
    <article class="product-card">
      <a href="product.html?id=${p.id}"><img class="product-image" src="${p.image}" alt="${p.title}" loading="lazy"></a>
      <div class="product-body">
        <span class="category">${p.category}</span>
        <a href="product.html?id=${p.id}"><h3 class="product-title">${p.title}</h3></a>
        <div class="rating">★ ${p.rating}</div>
        <div class="card-bottom"><span class="price">${money(p.price)}</span><button class="add-btn" onclick="addToCart(${p.id})">Add to cart</button></div>
      </div>
    </article>`).join("");
  empty.classList.toggle("hidden",filteredProducts.length!==0);
  document.getElementById("resultInfo").textContent=`Showing ${filteredProducts.length ? start+1 : 0}–${Math.min(start+perPage,filteredProducts.length)} of ${filteredProducts.length} products`;
  renderPagination(totalPages);
}
function renderPagination(totalPages){
  const el=document.getElementById("pagination"); if(!el) return;
  if(totalPages<=1){el.innerHTML="";return;}
  let html=`<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?"disabled":""}>‹</button>`;
  for(let i=1;i<=totalPages;i++) html+=`<button class="page-btn ${i===currentPage?"active":""}" onclick="goPage(${i})">${i}</button>`;
  html+=`<button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===totalPages?"disabled":""}>›</button>`;
  el.innerHTML=html;
}
function goPage(page){ currentPage=page; renderProducts(); window.scrollTo({top:document.querySelector(".controls").offsetTop-85,behavior:"smooth"}); }

function initDetail(){
  const id=Number(new URLSearchParams(location.search).get("id"));
  const p=products.find(x=>x.id===id), el=document.getElementById("detail");
  if(!p){el.innerHTML='<div class="empty-cart"><h2>Product not found</h2><a class="primary-btn" href="index.html">Back to products</a></div>';return;}
  document.title=`${p.title} | ShopEase`;
  el.innerHTML=`<img src="${p.image}" alt="${p.title}"><div class="detail-content">
    <span class="category">${p.category}</span><h1>${p.title}</h1><div class="rating">★ ${p.rating} / 5</div>
    <p class="desc">${p.description}</p><div class="detail-price">${money(p.price)}</div>
    <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
  </div>`;
}

function renderCart(){
  const items=getCart(), box=document.getElementById("cartItems"), summary=document.getElementById("cartSummary");
  if(!box || !summary) return;
  if(!items.length){
    box.innerHTML='<div class="empty-cart"><div style="font-size:40px">🛒</div><h2>Your cart is empty</h2><p>Add some products to get started.</p><a class="primary-btn" href="index.html">Continue Shopping</a></div>';
    summary.innerHTML='<h2>Order Summary</h2><div class="sum-line"><span>Subtotal</span><b>₹0</b></div><div class="sum-line"><span>Delivery</span><span>Free</span></div><div class="sum-total"><span>Total</span><span>₹0</span></div>';
    return;
  }
  box.innerHTML=items.map(i=>`<div class="cart-row">
    <img src="${i.image}" alt="${i.title}">
    <div><h3>${i.title}</h3><p>${i.category}</p></div>
    <div class="qty"><button onclick="changeQty(${i.id},-1)">−</button><b>${i.qty}</b><button onclick="changeQty(${i.id},1)">+</button></div>
    <div class="row-price">${money(i.price*i.qty)}<br><button class="remove" onclick="removeFromCart(${i.id})">Remove</button></div>
  </div>`).join("");
  const subtotal=items.reduce((s,i)=>s+i.price*i.qty,0), count=items.reduce((s,i)=>s+i.qty,0);
  summary.innerHTML=`<h2>Order Summary</h2><div class="sum-line"><span>Items</span><span>${count}</span></div><div class="sum-line"><span>Subtotal</span><b>${money(subtotal)}</b></div><div class="sum-line"><span>Delivery</span><span>Free</span></div><div class="sum-total"><span>Total</span><span>${money(subtotal)}</span></div><button class="primary-btn checkout" onclick="showToast('Demo checkout — no payment backend connected')">Proceed to Checkout</button>`;
}

document.addEventListener("DOMContentLoaded",loadProducts);
