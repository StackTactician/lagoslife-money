const CFG = {
  phone: "08123951223",
  whatsapp: "2348123951223",
  bank: { name: "OPay", accountName: "SUNSHINE OGBIGBE", accountNumber: "8123951223" },
  delivery: "5 to 30 minutes",
  ratePer100B: 1500,
  minCustom: 1e9,
}
function fmtN(n){ return "₦" + n.toLocaleString("en-NG") }
function fmtAmtPretty(n){
  if(n>=1e9) return `${+(n/1e9).toFixed(n%1e9===0?0:2)}B`
  if(n>=1e6) return `${+(n/1e6).toFixed(2)}M`
  if(n>=1e3) return `${+(n/1e3).toFixed(1)}K`
  return String(n)
}
function calcPrice(amount){ return Math.ceil(amount/1e11 * CFG.ratePer100B) }
let amount = 100e9
function render(){
  const price = calcPrice(amount)
  document.getElementById("custom-input").value = Math.round(amount/1e9) || ""
  document.getElementById("custom-meta").innerHTML = `<small>${fmtN(CFG.ratePer100B)} per 100B</small><strong>${fmtN(price)}</strong>`
  document.getElementById("pay-amount").textContent = fmtN(price)
  document.getElementById("pay-for").textContent = fmtAmtPretty(amount) + " Lagos Life money"
  document.getElementById("gameAmount").value = amount.toLocaleString("en-NG")
  document.getElementById("amountDue").value = fmtN(price)
  document.getElementById("amountPaid").value = price
  document.getElementById("btn-amount").textContent = fmtAmtPretty(amount)
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
  const link = waLink("Hello Eko Cash, I want to buy Lagos Life cash. My username is: ")
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
  document.getElementById("receipt-name").textContent = f ? f.name : "Upload your transfer screenshot if you have it"
})
const input = document.getElementById("custom-input")
if(input){
  input.addEventListener("input", ()=>{
    const v = Number(input.value)
    amount = (isFinite(v) && v>0 ? v : 0) * 1e9
    if(amount < CFG.minCustom) amount = CFG.minCustom
    render()
  })
}
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
  const price = calcPrice(amount)
  const username = String(fd.get("username")||"")
  const senderName = String(fd.get("senderName")||"")
  const whatsapp = String(fd.get("whatsapp")||"")
  let msg = `Hello Eko Cash, I want to buy Lagos Life cash. Amount: ${fmtAmtPretty(amount)} at ${fmtN(price)}.`
  if(username) msg += ` Username: ${username}.`
  if(senderName) msg += ` Sender: ${senderName}.`
  if(whatsapp) msg += ` Phone: ${whatsapp}.`
  const chat = waLink(msg)
  statusEl.hidden=false; statusEl.className="form-status ok"
  statusEl.innerHTML = `Details ready. Tap below to send on WhatsApp and we will credit you within ${CFG.delivery} after confirming payment.<br><a href="${chat}" target="_blank" rel="noreferrer" class="btn btn-primary" style="margin-top:10px;display:inline-flex">Open WhatsApp</a>`
  statusEl.scrollIntoView({behavior:"smooth", block:"center"})
  toast("Details ready. Send on WhatsApp to complete")
})
