import { API_BASE } from "../../../config";

Page({
  data:{
    form:{ title:"", city:"", salary:"", desc:"", wechatId:"", qrUrl:"", qrName:"", qrTempPath:"", requirePortfolio:false },
    jobs:[], canSubmit:false, uploading:false
  },
  onShow(){ this.loadJobs(); this.setData({ canSubmit: !!(this.data.form.title && this.data.form.title.trim()) }); },
  onInput(e){ const k=e.currentTarget.dataset.k; const v=e.detail.value; const next={...this.data.form,[k]:v}; this.setData({ form:next, canSubmit:!!(next.title&&next.title.trim()) }); },
  resetForm(){ this.setData({ form:{ title:"", city:"", salary:"", desc:"", wechatId:"", qrUrl:"", qrName:"", qrTempPath:"", requirePortfolio:false }, canSubmit:false }); },
  loadJobs(){ try{ const jobs=wx.getStorageSync('jobs')||[]; this.setData({ jobs:Array.isArray(jobs)?jobs:[] }); }catch(e){ this.setData({ jobs:[] }); } },
  async pickQrcode(){
    wx.chooseImage({
      count:1, sizeType:["compressed"], sourceType:["album","camera"],
      success: (res)=>{
        const path = res.tempFilePaths?.[0]; if(!path) return;
        const name = path.split("/").pop() || "qrcode.jpg";
        this.setData({ uploading:true, form:{...this.data.form, qrName:name} });
        wx.uploadFile({
          url: `${API_BASE}/api/uploadImage`, filePath: path, name: "file", formData:{ filename:name },
          success: (r)=>{
            try{ const data = JSON.parse(r.data||"{}"); 
              if(data.ok && data.url){ this.setData({ form:{...this.data.form, qrUrl:data.url, qrTempPath:""}, uploading:false }); wx.showToast({icon:"success", title:"已上传"}); }
              else { this.setData({ uploading:false }); wx.showToast({icon:"none", title:"上传失败"}); }
            }catch(e){ this.setData({ uploading:false }); wx.showToast({icon:"none", title:"解析失败"}); }
          },
          fail: ()=>{ this.setData({ uploading:false }); wx.showToast({icon:"none", title:"网络错误"}); }
        });
      }
    });
  },
  previewQrcode(){ const { qrUrl, qrTempPath } = this.data.form||{}; const src = qrUrl || qrTempPath; if(!src) return wx.showToast({icon:"none", title:"暂无二维码"}); wx.previewImage({ urls:[src] }); },
  removeQrcode(){ this.setData({ form:{...this.data.form, qrUrl:"", qrTempPath:"", qrName:""} }); },
  saveJob(){
    const f=this.data.form||{}; const title=(f.title||"").trim(); if(!title) return wx.showToast({icon:"none", title:"请填写标题"});
    const now=new Date();
    const job={ id: now.getTime(), title, city:(f.city||"").trim(), salary:(f.salary||"").trim(), desc:(f.desc||"").trim(),
      wechatId:(f.wechatId||"").trim(), qrUrl:(f.qrUrl||"").trim(), requirePortfolio:!!f.requirePortfolio,
      updatedAt:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}` };
    try{ const list=wx.getStorageSync('jobs')||[]; const jobs=Array.isArray(list)?list:[]; jobs.unshift(job); wx.setStorageSync('jobs', jobs);
      wx.showToast({icon:"success", title:"已发布"}); this.resetForm(); this.loadJobs(); }catch(e){ wx.showToast({icon:"none", title:"保存失败"}); }
  },
  removeJob(e){ const id=e.currentTarget.dataset.id; try{ let jobs=wx.getStorageSync('jobs')||[]; jobs=(Array.isArray(jobs)?jobs:[]).filter(j=>String(j.id)!==String(id)); wx.setStorageSync('jobs', jobs); this.loadJobs(); wx.showToast({icon:"success", title:"已删除"}); }catch(e){ wx.showToast({icon:"none", title:"删除失败"}); } },
  openDetail(e){ const id=e.currentTarget.dataset.id; if(!id) return; wx.navigateTo({ url:`/pages/detail/detail?id=${id}` }); }
});
