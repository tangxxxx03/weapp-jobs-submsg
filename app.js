App({
  globalData: { role: 'guest' },
  onLaunch() {
    try {
      const jobs = wx.getStorageSync('jobs');
      if (!Array.isArray(jobs)) wx.setStorageSync('jobs', []);
    } catch (e) { wx.setStorageSync('jobs', []); }
  },
  ensureAuth(cb){ try{ const role = wx.getStorageSync('role')||'guest'; cb && cb({ role }); }catch(e){ cb && cb({ role:'guest' }) } },
  setRole(role){ try{ wx.setStorageSync('role', role||'guest'); }catch(e){}; this.globalData.role = role||'guest'; }
});
