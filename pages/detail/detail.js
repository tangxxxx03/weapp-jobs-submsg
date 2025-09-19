import { API_BASE, APP_TOKEN } from "../../config"
const fs = wx.getFileSystemManager();

Page({
  data: {
    id:"", job:null,
    form:{ name:"", phone:"", email:"" },
    resume:{ filePath:"", fileName:"", size:0 },
    portfolio:{ link:"", filePath:"", fileName:"", size:0 }
  },
  onLoad(opt){
    const id=opt.id||""; this.setData({ id });
    try{ const jobs=wx.getStorageSync('jobs')||[]; const job=jobs.find(j=>String(j.id)===String(id)); if(job) this.setData({ job }); }catch(e){}
  },
  onInput(e){ const k=e.currentTarget.dataset.k; const v=e.detail.value; this.setData({ form:{...this.data.form,[k]:v} }); },
  onPortfolioLink(e){ this.setData({ portfolio:{...this.data.portfolio, link:e.detail.value} }); },
  chooseResume(){ wx.chooseMessageFile({ count:1, type:"file", extension:["pdf","doc","docx","xls","xlsx"], success:({tempFiles})=>{ const f=tempFiles[0]; if(!f) return; if(f.size>8*1024*1024) return wx.showToast({icon:"none", title:"简历≤8MB"}); this.setData({ resume:{ filePath:f.path, fileName:f.name||"resume", size:f.size } }); wx.showToast({icon:"success", title:"已选择简历"}) } }) },
  choosePortfolio(){ wx.chooseMessageFile({ count:1, type:"file", extension:["pdf","ppt","pptx"], success:({tempFiles})=>{ const f=tempFiles[0]; if(!f) return; if(f.size>8*1024*1024) return wx.showToast({icon:"none", title:"作品集≤8MB"}); this.setData({ portfolio:{ ...this.data.portfolio, filePath:f.path, fileName:f.name||"portfolio", size:f.size } }); wx.showToast({icon:"success", title:"已选择作品集"}) } }) },
  async submitAll(){
    const { job, form, resume, portfolio } = this.data;
    if (!job) return wx.showToast({ icon:"none", title:"职位不存在" });
    if (!form.name || !form.phone) return wx.showToast({ icon:"none", title:"请填写姓名和电话" });
    if (!resume.filePath) return wx.showToast({ icon:"none", title:"请选择简历" });

    try{
      wx.showLoading({ title:"提交中…" });
      const resumeBase64 = fs.readFileSync(resume.filePath, "base64");
      let portfolioBase64 = "";
      if (portfolio.filePath) portfolioBase64 = fs.readFileSync(portfolio.filePath, "base64");

      const payload = {
        jobTitle: job.title, name: form.name, phone: form.phone, email: form.email,
        publisherOpenid: job.publisherOpenid || "",
        portfolioLink: job.requirePortfolio ? (portfolio.link||"") : "",
        resumeFilename: resume.fileName, resumeBase64,
        portfolioFilename: portfolio.fileName || "", portfolioBase64
      };

      const r = await new Promise(resolve => wx.request({
        url: `${API_BASE}/api/submit`,
        method: "POST",
        header: { "content-type":"application/json", "X-APP-TOKEN": APP_TOKEN },
        data: payload, success: resolve, fail: err => resolve({ statusCode:0, data:{ ok:0, msg: err && err.errMsg } })
      }));

      const sc = r.statusCode, data = r.data || {};
      if (sc===200 && data.ok) wx.showToast({ icon:"success", title:"投递成功" });
      else wx.showToast({ icon:"none", title: (data.msg ? `${data.msg} (HTTP ${sc})` : `提交失败 (HTTP ${sc})`) });
    }catch(e){ wx.showToast({ icon:"none", title:"提交异常" }) }finally{ wx.hideLoading(); }
  }
});
