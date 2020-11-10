const app = getApp()

Page({
  data: {
    showPicker:false, //是否开启弹窗
    pickType:'dataTime',  //picker模式  dates 年月日时分秒 date 年月日  times 时分秒  time 时分   startAndEnd 时分-时分 dataTime 先选年月日再选时分
    Tdata:{},
    /**
     * 当 pickType:'dataTime', 时,
     * defaultDate:如果不传入指定的日期,传指定时间,则需要传一个空字符串进来,如defaultDate:['','14:00'], 只不传时间同理, 如果两个都不传则不需要写这个数组
     */
    defaultDate:['','14:00'],
    /**
     * date模式
     * 
     */
    // defaultDate:['06:30',"20:10"]

  },
 
  onLoad: function () {
    console.log('代码片段是一种迷你、可分享的小程序或小游戏项目，可用于分享小程序和小游戏的开发经验、展示组件和 API 的使用、复现开发问题和 Bug 等。可点击以下链接查看代码片段的详细文档：')
    console.log('https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/devtools.html')
  },
  selectTime(){

    this.setData({
      showPicker: true
    })
    
  },
  // 预览时间
  pickTap(e){
    let defaultDate = e.detail
    this.setData({
      defaultDate
    })
  },
  // 最终选择的时间
  pickSure(e){
    let defaultDate = e.detail
    this.setData({
      defaultDate,
      showPicker: false
    })
  }


})
