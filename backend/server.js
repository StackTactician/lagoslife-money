import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

const UPLOAD_DIR = path.join(__dirname, "uploads")
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ORDERS_FILE = path.join(__dirname, "orders.json")
function loadOrders(){ try{ return JSON.parse(fs.readFileSync(ORDERS_FILE,"utf8")) }catch{ return [] } }
function saveOrder(o){
  const arr = loadOrders()
  arr.unshift(o)
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr,null,2))
}

const storage = multer.diskStorage({
  destination: (_,__,cb)=> cb(null, UPLOAD_DIR),
  filename: (_,file,cb)=>{
    const ext = path.extname(file.originalname) || ""
    const base = Date.now()+"-"+Math.random().toString(36).slice(2,8)
    cb(null, base+ext)
  }
})
const upload = multer({
  storage,
  limits:{ fileSize: 5*1024*1024 },
  fileFilter:(_,file,cb)=>{
    const ok = /^(image\/|application\/pdf)/.test(file.mimetype)
    if(!ok) return cb(new Error("Only images/PDF allowed"))
    cb(null,true)
  }
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended:true }))
app.use("/uploads", express.static(UPLOAD_DIR))

app.get("/api/health", (_,res)=> res.json({ ok:true }))

app.get("/api/orders", (_,res)=> res.json(loadOrders()))

app.post("/api/order", upload.single("receipt"), (req,res)=>{
  try{
    const { username, senderName, whatsapp, email, senderAccountName, amountPaid, paymentRef, note, orderRef, package: pkg, gameAmount, amountDue } = req.body
    if(!username || !senderName || !whatsapp || !senderAccountName || !amountPaid){
      return res.status(400).json({ error:"Missing required fields" })
    }
    const order = {
      id: orderRef || `LLM-${Date.now().toString(36).toUpperCase()}`,
      username: String(username).slice(0,60),
      senderName: String(senderName).slice(0,100),
      whatsapp: String(whatsapp).slice(0,20),
      email: String(email||"").slice(0,120),
      senderAccountName: String(senderAccountName).slice(0,100),
      amountPaid: Number(amountPaid),
      paymentRef: String(paymentRef||"").slice(0,100),
      note: String(note||"").slice(0,500),
      package: String(pkg||""),
      gameAmount: String(gameAmount||""),
      amountDue: String(amountDue||""),
      receipt: req.file ? `/uploads/${req.file.filename}` : null,
      receiptOriginal: req.file?.originalname || null,
      createdAt: new Date().toISOString(),
      status: "pending",
    }
    saveOrder(order)
    console.log(`[order] ${order.id} ${order.username} ${order.package} ${order.gameAmount} -> ${order.amountDue}`)
    res.json({ ok:true, orderRef: order.id })
  }catch(e){
    console.error(e)
    res.status(500).json({ error: e.message || "Server error" })
  }
})

app.use((err,_,res,__)=>{
  if(err?.code==="LIMIT_FILE_SIZE") return res.status(400).json({ error:"Receipt larger than 5 MB" })
  res.status(400).json({ error: err.message })
})

// serve built frontend in production
const dist = path.join(__dirname, "..", "dist")
if(fs.existsSync(dist)){
  app.use(express.static(dist))
  app.get("*", (_,res)=> res.sendFile(path.join(dist,"index.html")))
}

app.listen(PORT, ()=> console.log(`Backend on http://localhost:${PORT}`))
