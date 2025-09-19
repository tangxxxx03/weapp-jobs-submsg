const TEMPLATE_ID = "TEMPLATE_ID_PLACEHOLDER";
import { API_BASE } from "../../../config"

Page({
  data: {
    publisherOpenid: "",
    form: { title:"", city:"", salary:"", desc:"", requirePortfolio:false, publisherOpenid:"" },
    jobs: []
  },

  onShow(){
    this.loadJobs();
    this.tryFillOpenid();
    try{
      const oid = wx.getStorageSync('publisherOpenid') || "";
      if (oid) this.setData({ publisherOpenid: oid, form:{...this.data.form, publisherOpenid:oid} });
    }catch(e){}
  },

  tryFillOpenid(){
    try{
      const oid = wx.getStorageSync('publisherOpenid') || "";
      if (oid && !this.data.form.publisherOpenid){
        this.setData({ form:{...this.data.form, publisherOpenid: oid} });
      }
    }catch(e){}
  },

  onInput(e){
    const k = e.currentTarget.dataset.k;
    const v = e.detail.value;
    this.setData({ form: { ...this.data.form, [k]: v } });
  },

  onPortfolioSwitch(e){
    this.setData({ form:{...this.data.form, requirePortfolio: e.detail.value} });
  },

  resetForm(){
    this.setData({ form:{ title:"", city:"", salary:"", desc:"", requirePortfolio:false, publisherOpenid: this.data.publisherOpenid||"" } });
  },

  loadJobs(){
    try{
      const jobs = wx.getStorageSync('jobs') || [];
      this.setData({ jobs });
    }catch(e){
      this.setData({ jobs:[] });
    }
  },

  saveJob(){
    const f = this.data.form;
    if (!f.title) return wx.showToast({icon:"none", title:"请填写标题"});
    const now = new Date();
    const job = {
      id: now.getTime(),
      title: f.title.trim(),
      city: f.city.trim(),
      salary: f.salary.trim(),
      desc: f.desc.trim(),
      requirePortfolio: !!f.requirePortfolio,
      publisherOpenid: (f.publisherOpenid||"").trim(),
      updatedAt: `${now.getFullYear()}-${(now.getMonth()+1+'').padStart(2,'0')}-${(now.getDate()+'').padStart(2,'0')}`
    };
    try{
      const jobs = wx.getStorageSync('jobs') || [];
      jobs.unshift(job);
      wx.setStorageSync('jobs', jobs);
      wx.showToast({icon:"success", title:"已发布"});
      this.resetForm();
      this.loadJobs();
    }catch(e){
      wx.showToast({icon:"none", title:"保存失败"});
    }
  },

  removeJob(e){
    const id = e.currentTarget.dataset.id;
    try{
      let jobs = wx.getStorageSync('jobs') || [];
      jobs = jobs.filter(j => String(j.id) !== String(id));
      wx.setStorageSync('jobs', jobs);
      this.loadJobs();
      wx.showToast({icon:"success", title:"已删除"});
    }catch(e){
      wx.showToast({icon:"none", title:"删除失败"});
    }
  },

  async subscribe(){
    wx.requestSubscribeMessage({
      tmplIds: [TEMPLATE_ID],
      success: async (resp) => {
        if (resp[TEMPLATE_ID] !== "accept") { wx.showToast({ icon:"none", title:"未授权订阅" }); return; }
        const codeRes = await new Promise(r=> wx.login({ success:r, fail:r }));
        if (!codeRes.code) { wx.showToast({ icon:"none", title:"登录失败" }); return; }
        wx.request({
          url: `${API_BASE}/api/bindPublisher`,
          method: "POST",
          header: { "content-type":"application/json" },
          data: { code: codeRes.code, templateId: TEMPLATE_ID },
          success: ({ statusCode, data }) => {
            if (statusCode===200 && data && data.openid) {
              try{ wx.setStorageSync('publisherOpenid', data.openid); }catch(e){}
              this.setData({ publisherOpenid: data.openid, form:{...this.data.form, publisherOpenid: data.openid} });
              wx.showToast({ icon:"success", title:"订阅成功" });
            } else {
              wx.showToast({ icon:"none", title:"绑定失败" });
            }
          },
          fail: ()=> wx.showToast({ icon:"none", title:"网络错误" })
        });
      }
    });
  }
});
