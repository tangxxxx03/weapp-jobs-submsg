import { ADMIN_BIND_CODE } from "../../../config"
Page({
  data:{ code:"" },
  onInput(e){ this.setData({ code:e.detail.value }) },
  doBind(){
    if (this.data.code===ADMIN_BIND_CODE) {
      try{ wx.setStorageSync('role','admin') }catch(e){}
      wx.showToast({icon:'success', title:'绑定成功'});
      setTimeout(()=> wx.redirectTo({url:"/pages/admin/manage/manage"}), 400);
    } else {
      wx.showToast({ icon:'none', title:'口令错误' });
    }
  }
});
