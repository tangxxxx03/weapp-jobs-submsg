import { API_BASE, APP_TOKEN } from "../../config"
Page({
  data:{ rid:"", info:null },
  onLoad(q){
    const rid = q.rid || "";
    this.setData({ rid });
    wx.request({
      url: `${API_BASE}/api/inboxGet?rid=${encodeURIComponent(rid)}`,
      method:"GET",
      header: { "X-APP-TOKEN": APP_TOKEN },
      success: ({ statusCode, data }) => {
        if (statusCode===200 && data && data.ok) this.setData({ info: data.data });
        else wx.showToast({ icon:"none", title:"记录不存在或已过期" });
      },
      fail: ()=> wx.showToast({ icon:"none", title:"网络错误" })
    })
  },
  downloadResume(){
    const url = `${API_BASE}/api/download?rid=${encodeURIComponent(this.data.rid)}&type=resume`;
    wx.downloadFile({ url, header: { "X-APP-TOKEN": APP_TOKEN }, success: ({tempFilePath})=>{
      wx.openDocument({ filePath: tempFilePath });
    }});
  },
  downloadPortfolio(){
    const url = `${API_BASE}/api/download?rid=${encodeURIComponent(this.data.rid)}&type=portfolio`;
    wx.downloadFile({ url, header: { "X-APP-TOKEN": APP_TOKEN }, success: ({tempFilePath})=>{
      wx.openDocument({ filePath: tempFilePath });
    }});
  }
});
