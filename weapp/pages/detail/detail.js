Page({
  data:{ job:null, form:{name:"",gender:"",age:"",phone:"",email:"",note:""} },
  onLoad(opt){
    const id = opt?.id;
    const list = wx.getStorageSync('jobs')||[];
    const job = list.find(j=>String(j.id)===String(id));
    if(!job){ wx.showToast({icon:'none', title:'未找到职位'}); return; }
    this.setData({ job });
    wx.setNavigationBarTitle({ title: job.title||'职位详情' });
    try{ const all = wx.getStorageSync('applies')||{}; const draft = all[id]; if(draft) this.setData({ form:draft }); }catch(e){}
  },
  onInput(e){ const k=e.currentTarget.dataset.k; const v=e.detail.value; this.setData({ form:{...this.data.form,[k]:v} }); },
  copyWechat(){ const w=this.data.job?.wechatId||''; if(!w) return wx.showToast({icon:'none', title:'未填写微信号'}); wx.setClipboardData({ data:w, success(){ wx.showToast({icon:'success', title:'已复制'}) } }); },
  copyCard(){
    const j=this.data.job||{}; const f=this.data.form||{};
    const text = `【自荐信息】\n应聘岗位：${j.title||'-'}（${j.city||'—'}）\n姓名：${f.name||'-'}  性别：${f.gender||'-'}  年龄：${f.age||'-'}\n电话：${f.phone||'-'}  邮箱：${f.email||'-'}\n自我介绍：${(f.note||'（无）').replace(/\n/g,' ')}\n—— 来自职位小程序`;
    wx.setClipboardData({ data:text, success(){ wx.showToast({icon:'success', title:'已复制'}) } });
  },
  saveLocal(){ try{ const id=this.data.job?.id; const all=wx.getStorageSync('applies')||{}; all[id]=this.data.form; wx.setStorageSync('applies', all); wx.showToast({icon:'success', title:'已保存'}); }catch(e){ wx.showToast({icon:'none', title:'保存失败'}) } }
});
