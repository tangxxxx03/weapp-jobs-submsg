Page({
  data:{ jobs:[] },
  onShow(){ const jobs = wx.getStorageSync('jobs')||[]; this.setData({ jobs }); },
  goDetail(e){ const id=e.currentTarget.dataset.id; if(!id) return; wx.navigateTo({ url:`/pages/detail/detail?id=${id}` }); },
  openAdmin(){ wx.navigateTo({ url:'/pages/admin/manage/manage' }); }
});
