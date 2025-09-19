import { REMOTE_JOB_JSON } from "../../config"
Page({
  data:{ jobs:[] },
  onShow(){ this.refreshJobs(); },
  async refreshJobs(){
    if (REMOTE_JOB_JSON) {
      try {
        const r = await wx.request({ url: REMOTE_JOB_JSON, method:"GET" });
        if (r.statusCode===200 && Array.isArray(r.data)) { this.setData({ jobs:r.data }); return; }
      } catch(e){}
    }
    try { const jobs = wx.getStorageSync('jobs')||[]; this.setData({ jobs }); } catch(e){ this.setData({ jobs:[] }) }
  },
  openAdmin(){ getApp().ensureAuth(({role})=>{ role==="admin" ? wx.navigateTo({url:"/pages/admin/manage/manage"}) : wx.navigateTo({url:"/pages/admin/bind/bind"}) }); },
  goDetail(e){ const id=e.currentTarget.dataset.id; wx.navigateTo({ url:`/pages/detail/detail?id=${id}` }); }
});
