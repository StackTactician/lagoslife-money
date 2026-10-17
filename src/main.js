const CFG = {
  phone: "08123951223",
  whatsapp: "2348123951223",
  bank: { name: "OPay", accountName: "SUNSHINE OGBIGBE", accountNumber: "8123951223" },
  delivery: "5 to 30 minutes",
  ratePer100B: 1000,
  minCustom: 1e9,
  maxCustom: 1e12,
}
function fmtN(n){ return "₦" + n.toLocaleString("en-NG") }
function fmtAmtPretty(n){
  if(n>=1e12) return `${+(n/1e12).toFixed(2)}T`
  if(n>=1e9) return `${+(n/1e9).toFixed(n%1e9===0?0:2)}B`
  if(n>=1e6) return `${+(n/1e6).toFixed(2)}M`
  if(n>=1e3) return `${+(n/1e3).toFixed(1)}K`
  return String(n)
}
function calcPrice(amount){ return Math.ceil(amount/1e11 * CFG.ratePer100B) }
let amount = 100e9
function isValid(a){ return a >= CFG.minCustom && a <= CFG.maxCustom }
function render(){
  const input = document.getElementById("custom-input")
  const price = amount ? calcPrice(amount) : 0
  const empty = !amount
  const overMax = amount > CFG.maxCustom
  const underMin = amount > 0 && amount < CFG.minCustom
  if(input && document.activeElement !== input){
    input.value = empty ? "" : String(Math.round(amount/1e9))
  } else if(input && empty){
    input.value = ""
  } else if(input && !empty){
    // keep typed value if focused, do not overwrite
  }
  const meta = document.getElementById("custom-meta")
  if(meta){
    if(empty) meta.innerHTML = `<small>Enter amount</small><strong>--</strong>`
    else if(underMin) meta.innerHTML = `<small style="color:#dc2626">Minimum ${fmtAmtPretty(CFG.minCustom)}</small><strong>${fmtN(price)}</strong>`
    else if(overMax) meta.innerHTML = `<small style="color:#dc2626">Maximum ${fmtAmtPretty(CFG.maxCustom)}</small><strong>${fmtN(price)}</strong>`
    else meta.innerHTML = `<small>${fmtN(CFG.ratePer100B)} per 100B</small><strong>${fmtN(price)}</strong>`
  }
  document.getElementById("pay-amount").textContent = (!isValid(amount)) ? "--" : fmtN(price)
  document.getElementById("pay-for").textContent = empty ? "--" : fmtAmtPretty(amount) + " Lagos Life money"
  document.getElementById("gameAmount").value = empty ? "" : amount.toLocaleString("en-NG")
  document.getElementById("amountDue").value = empty ? "" : fmtN(price)
  document.getElementById("amountPaid").value = empty ? "" : price
  document.getElementById("btn-amount").textContent = empty ? "--" : fmtAmtPretty(amount)
  document.getElementById("submit-btn").disabled = !isValid(amount)
  const box = document.querySelector(".amount-box")
  if(box) box.style.borderColor = (underMin || overMax) ? "#fca5a5" : ""
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
  set("hero-wa"); set("faq-wa"); set("wa-card")
}
refreshWa()
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
    const raw = input.value.trim()
    if(raw === ""){
      amount = 0
      render()
      return
    }
    const v = Number(raw)
    if(!isFinite(v) || v < 0){
      amount = 0
    } else {
      amount = Math.round(v * 1e9)
    }
    render()
  })
}
render()
const form = document.getElementById("order-form")
const statusEl = document.getElementById("form-status")
form.addEventListener("submit", (e)=>{
  e.preventDefault()
  if(!isValid(amount)){
    if(!amount) statusEl.textContent = "Enter an amount first."
    else if(amount < CFG.minCustom) statusEl.textContent = `Minimum is ${fmtAmtPretty(CFG.minCustom)}.`
    else statusEl.textContent = `Maximum is ${fmtAmtPretty(CFG.maxCustom)}.`
    statusEl.hidden=false; statusEl.className="form-status err"
    return
  }
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
