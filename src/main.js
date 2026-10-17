const CFG = {
  phone: "08123951223",
  whatsapp: "2348123951223",
  bank: { name: "OPay", accountName: "SUNSHINE OGBIGBE", accountNumber: "8123951223" },
  delivery: "5–30 minutes",
  ratePerB: 20,
  minCustom: 25e9,
}
const PACKS = [
  { id:"starter", name:"Starter", amount:25e9, price:500 },
  { id:"hustler", name:"Hustler", amount:50e9, price:1000 },
  { id:"big-boy", name:"Big Boy", amount:100e9, price:2000, badge:"Most popular" },
  { id:"odogwu", name:"Odogwu", amount:200e9, price:4000, badge:"Best value" },
]
const fmtN = n => "₦" + n.toLocaleString("en-NG")
function fmtAmtPretty(n){
  if(n>=1e9) return `${+(n/1e9).toFixed(n%1e9===0?0:2)}B`
  if(n>=1e6) return `${+(n/1e6).toFixed(2)}M`
  if(n>=1e3) return `${+(n/1e3).toFixed(1)}K`
  return String(n)
}
function calcCustom(amount){ return Math.ceil(amount/1e9 * CFG.ratePerB) }
function genRef(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let s="LLM-"
  for(let i=0;i<6;i++) s+= chars[Math.floor(Math.random()*chars.length)]
  return s
}
let selected = { packId:"big-boy", customAmount: 300e9 }
let orderRef = genRef()
function currentPack(){
  const p = PACKS.find(x=>x.id===selected.packId)
  if(p) return { label:p.name, amount:p.amount, price:p.price }
  return { label:"Custom", amount:selected.customAmount, price: calcCustom(selected.customAmount) }
}
function render(){
  const packsEl = document.getElementById("packs")
  packsEl.innerHTML = PACKS.map(p=>{
    const active = p.id===selected.packId
    return `<div class="pack ${active?"active":""}" data-id="${p.id}">
      ${p.badge?`<span class="pack-badge">${p.badge}</span>`:""}
      <h4>${p.name}</h4>
      <p class="pack-amount">${fmtAmtPretty(p.amount)}</p>
      <p class="pack-sub">Lagos Life money</p>
      <span class="pack-price">${fmtN(p.price)}</span>
    </div>`
  }).join("")
  const isCustom = selected.packId==="custom"
  const customPrice = calcCustom(selected.customAmount)
  const customValid = selected.customAmount >= CFG.minCustom
  document.getElementById("custom-box").innerHTML = `
    <label>Custom amount (billions)</label>
    <input type="number" id="custom-input" inputmode="numeric" min="${CFG.minCustom/1e9}" step="1" value="${Math.floor(selected.customAmount/1e9)}" />
    <div class="custom-meta">
      <small style="color:${customValid?"var(--text-muted)":"#dc2626"}">${customValid?`₦${CFG.ratePerB} per 1B`:`Minimum ${fmtAmtPretty(CFG.minCustom)}`}</small>
      <strong>${fmtN(customPrice)}</strong>
    </div>
  `
  const box = document.getElementById("custom-box")
  box.className = "custom-box" + (isCustom?" active":"")
  if(isCustom && !customValid) box.style.borderColor="#fca5a5"
  const cur = currentPack()
  const disabled = isCustom && !customValid
  document.getElementById("pay-amount").textContent = disabled ? "--" : fmtN(cur.price)
  document.getElementById("pay-for").textContent = `${fmtAmtPretty(cur.amount)} ${cur.label} pack`
  document.getElementById("order-ref-display").textContent = orderRef
  document.getElementById("fine-ref").textContent = orderRef
  document.getElementById("orderRef").value = orderRef
  document.getElementById("pkgName").value = cur.label
  document.getElementById("gameAmount").value = cur.amount.toLocaleString("en-NG")
  document.getElementById("amountDue").value = fmtN(cur.price)
  document.getElementById("amountPaid").value = cur.price
  document.getElementById("btn-amount").textContent = fmtAmtPretty(cur.amount)
  document.getElementById("submit-btn").disabled = disabled
  document.querySelectorAll(".pack").forEach(el=>{
    el.onclick = ()=>{ selected.packId = el.dataset.id; render() }
  })
  const ci = document.getElementById("custom-input")
  ci.onfocus = ()=>{ selected.packId="custom"; render(); document.getElementById("custom-input")?.focus() }
  ci.oninput = (e)=>{
    const v = Number(e.target.value)
    selected.packId="custom"
    selected.customAmount = (isFinite(v) && v>0 ? v : 0) * 1e9
    const price = calcCustom(selected.customAmount)
    const meta = document.querySelector(".custom-meta")
    if(meta){
      const valid = selected.customAmount >= CFG.minCustom
      meta.innerHTML = `<small style="color:${valid?"var(--text-muted)":"#dc2626"}">${valid?`₦${CFG.ratePerB} per 1B`:`Minimum ${fmtAmtPretty(CFG.minCustom)}`}</small><strong>${fmtN(price)}</strong>`
      document.getElementById("pay-amount").textContent = valid ? fmtN(price) : "--"
      document.getElementById("pay-for").textContent = `${fmtAmtPretty(selected.customAmount||0)} Custom pack`
      document.getElementById("submit-btn").disabled = !valid
      document.getElementById("pkgName").value = "Custom"
      document.getElementById("gameAmount").value = (selected.customAmount||0).toLocaleString("en-NG")
      document.getElementById("amountDue").value = fmtN(price)
      document.getElementById("amountPaid").value = price
      document.getElementById("btn-amount").textContent = fmtAmtPretty(selected.customAmount||0)
      box.classList.add("active")
      box.style.borderColor = valid ? "" : "#fca5a5"
    }
  }
}
function toast(msg){
  const t=document.getElementById("toast")
  t.textContent=msg
  t.hidden=false
  clearTimeout(t._id)
  t._id=setTimeout(()=> t.hidden=true, 2600)
}
function waLink(text){ return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}` }
document.getElementById("yr").textContent = new Date().getFullYear()
function refreshWa(){
  const msg = `Hi, I want Lagos Life money. Order ${orderRef}. My Lagos Life username is: `
  const link = waLink(msg)
  const set = (id)=>{ const e=document.getElementById(id); if(e) e.href=link }
  set("hero-wa"); set("faq-wa"); set("wa-card"); set("sticky-wa")
}
refreshWa()
const menuBtn=document.getElementById("menu-btn")
const topnav=document.getElementById("topnav")
if(menuBtn && topnav){
  menuBtn.addEventListener("click",()=>{
    const o=topnav.classList.toggle("open")
    menuBtn.setAttribute("aria-expanded", String(o))
    menuBtn.textContent = o ? "Close" : "Menu"
  })
  topnav.querySelectorAll("a").forEach(a=> a.addEventListener("click",()=>{
    topnav.classList.remove("open"); menuBtn.setAttribute("aria-expanded","false"); menuBtn.textContent="Menu"
  }))
}
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", e=>{
    const id=a.getAttribute("href")
    if(!id || id==="#") return
    const t=document.querySelector(id)
    if(!t) return
    e.preventDefault()
    t.scrollIntoView({behavior:"smooth", block:"start"})
    history.pushState(null,"",id)
  })
})
document.querySelectorAll("[data-copy]").forEach(b=>{
  b.addEventListener("click", async ()=>{
    try{ await navigator.clipboard.writeText(b.dataset.copy); toast("Copied " + b.dataset.copy) }catch{ toast(b.dataset.copy) }
  })
})
document.getElementById("receipt").addEventListener("change", e=>{
  const f=e.target.files?.[0]
  document.getElementById("receipt-name").textContent = f ? f.name : "Tap to upload your transfer receipt"
})
render()
const form = document.getElementById("order-form")
const statusEl = document.getElementById("form-status")
form.addEventListener("submit", (e)=>{
  e.preventDefault()
  const fd = new FormData(form)
  const file = fd.get("receipt")
  if(file && file.size > 5*1024*1024){
    statusEl.hidden=false; statusEl.className="form-status err"; statusEl.textContent="Receipt larger than 5 MB. Upload a smaller file."
    return
  }
  const username = String(fd.get("username")||"")
  const ref = orderRef
  const cur = currentPack()
  const chat = waLink(`Hi, I just paid for Lagos Life money. Order ${ref}, username ${username}. Package: ${cur.label} (${fmtAmtPretty(cur.amount)}) at ${fmtN(cur.price)}. Amount sent: ₦${fd.get("amountPaid")||cur.price}. From: ${fd.get("senderName")||""} (${fd.get("whatsapp")||""})`)
  statusEl.hidden=false; statusEl.className="form-status ok"
  statusEl.innerHTML = `Order captured! Ref <strong>${ref}</strong>. Tap below to send your details on WhatsApp and we credit you within ${CFG.delivery}.<br><a href="${chat}" target="_blank" rel="noreferrer" class="btn btn-primary" style="margin-top:10px;display:inline-flex">Open WhatsApp, send order ${ref}</a>`
  statusEl.scrollIntoView({behavior:"smooth", block:"center"})
  toast("Order " + ref + " sent. Complete on WhatsApp")
  orderRef = genRef()
  refreshWa()
  render()
})
