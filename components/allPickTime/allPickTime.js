
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showPicker:{  //打开弹窗
      type:Boolean,
      value: false
    },
    pickHead:{  //picker头部文字
      type: String,
      value: "时间选择"
    },
    /**pickType
     * 
     * picker的展现格式 
     *    dates 年月日时分秒 
     *    date 年月日 
     *    times 时分秒  
     *    time 时分  
     *    startAndEnd 时分-时分   可以限制选择区域,开始和结束时间分别都为 [开始小时-结束小时,(开始小时分钟-59)(0-结束小时下分钟)(0-59,小时在这两者之间)]后面结束时间同理
     *    dataTime 先选年月日再选时分
     * 
     */
    pickType:{   
      type: String,
      value:"startAndEnd"
    },
    defaultDate:{ //默认时间
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //picker的内容,内容有pickType的值决定
    pickNavBar: [],
    currentInd: 0,  //nav选择下标
    scrollTop: 0,  

    startHourList: [],
    pickVal: [0,0,0,0,0], //时间默认的数字
    nPickVal: [], //时间选择的数字,点击确认后上面默认数字将被此数字替换,点击取消或者关闭弹窗,上面默认数字不改
    pickDate: [],  //picker选择数据,每一次选择即为一个数组
    hasTapPicker: false, //piker是否需要点击才能进行选择,默认不需要点击
    pickTime: {},   //最终选择时间
    isTapSure: true,  //是否点击确认按钮,点击取消将时间恢复上一次选择并确认的时间
    isScroll: true,  //是否滚动结束,未结束点击确认将使用上一次确认选中的时间
    /***
     * 以下数据都是当 pickType = dataTime 时需要 使用 和 改变其值 
     */
    calenderBoxArr:[],
    calenderArr:[],
    isShowCalender: false,  //是否显示日历,日历可左右滑动,也可以点击箭头进行选择,只能一个一个月的选,不允许直接选择年份
    calenWeekArr:['日','一','二','三','四','五','六'], //星期的位置
    currentDay: null,  //当天时间 
    tapDay:null,  //选择的时间
    tapMon:null,  //选择的月份

    // 滑动切换时间
    oldL:null,//滑动左边距离
    nowDate:[],//当前系统时间
    currentMon:11, //当前显示的月份
    currentYear:2020,//当前显示年份

    tapDate:[],//当前选择的日期时间,['Y-M-D','H-M']
   
  },
  attached(){
    this.initColumnData()
  },
  // 同个页面多次调用时使用,监听功能, 判断条件根据传入的defaultDate默认值进行判断
  // observers:{
  //   'defaultDate': function(e){
  //     console.log('监听',e)
  //     if(e.length > 0){
  //       this.initColumnData()
  //     }
  //   },
    

  // },
  /**
   * 组件的方法列表
   */
  methods: {
     /***
     * 数据处理方法 start
     */
    withData(param){
      return param < 10 ? '0' + param : '' + param;
    },
    getLoopArray(start,end){
      var start = start || 0;
      var end = end || 0;
      var array = [];
      // console.log(start , end)

      for (var i = start; i <= end; i++) {
        if(this.data.pickType == "dataTime" && this.data.isShowCalender){
          array.push(i)
        }else{
          array.push(this.withData(i));

        }
      }
      // console.log(array)
      return array;
    },
    getHourMin(params){
     
      var array =[];
     
      let defaultS =[...this.data.defaultDate[0].split(":"),...this.data.defaultDate[1].split(":")]
      let startH = defaultS[0]
      let endH = defaultS[2]
      let startM = parseInt(defaultS[1])
      let endM = parseInt(defaultS[3])
      // console.log(params)
      // console.log(startH, startM,endH,  endM)
    
      if(startH == endH){
        array.push(...this.getLoopArray(startM, endM) )
        
      }else{
        if(params == startH){
          array.push(...this.getLoopArray(startM, 59) )
        }else if(params == endH){
          array.push(...this.getLoopArray(0, endM) )
        }else{
          array.push(...this.getLoopArray(0, 59) )
        }

      }
      // console.log(array)
      return array;


    },
    getMonthDay(year,month){
      var flag = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0), array = null;
      switch (month) {
        case '01':
        case '03':
        case '05':
        case '07':
        case '08':
        case '10':
        case '12':
          array = this.getLoopArray(1, 31)
          break;
        case '04':
        case '06':
        case '09':
        case '11':
          array = this.getLoopArray(1, 30)
          break;
        case '02':
          array = flag ? this.getLoopArray(1, 29) : this.getLoopArray(1, 28)
          break;
        default:
          array = '月份格式不正确，请重新输入！'
      }
      // console.log(array)
      return array;


    },
    getNewDateArry(){
        // 当前时间的处理
        var newDate = new Date();
        var year = this.withData(newDate.getFullYear()),
            mont = this.withData(newDate.getMonth() + 1),
            date = this.withData(newDate.getDate()),
            hour = this.withData(newDate.getHours()),
            minu = this.withData(newDate.getMinutes()),
            seco = this.withData(newDate.getSeconds());

        return [year, mont, date, hour, minu, seco];
    },
    //end

    initColumnData(){
      let pickType = this.data.pickType
      this.iniStartAndEnd(pickType)
     
    },
     //end
    async hidePicker(){  //关闭弹窗
      this.setData({
        showPicker: false,
        currentInd:0
      })
     
      await this.defaultTime() ;
      
      if(this.data.pickType === 'dataTime'){
        let tapDate = this.data.tapDate
        tapDate.push(...this.data.pickTime)
        this.triggerEvent("pickSure",  tapDate )
        console.log(tapDate)
      }else{
        this.triggerEvent("pickSure",  this.data.pickTime )
      }
      
    },
    // 界面显示数据初始化
    iniStartAndEnd(pickType){
      
      let pickDate = [],pickNavBar=[];
      //开始时间-结束时间 start
      let defaulArr =[...this.data.defaultDate] 
      let pickVal = [],defaultT=[];  //时间默认选中的位置
      // console.log(defaulArr)

      if( pickType === 'startAndEnd' ){
       defaultT = [...defaulArr[0].split(":"),0,...defaulArr[1].split(":")]
        
        pickDate[0] = this.getLoopArray(0,59)
        pickDate[1] = this.getLoopArray(0,59)
        pickDate[2] = ["——"]
        pickDate[3] = this.getLoopArray(0,59)
        pickDate[4] = this.getLoopArray(0,59)

        // 限制选择区域时用
        // let startH = defaultT[0]
        // let endH = defaultT[3]
        // pickDate[0] = this.getLoopArray(startH,endH) 
        // pickDate[1] = await this.getHourMin(startH )
        // pickDate[2] = ["——"]
        // pickDate[3] = this.getLoopArray(startH,endH)
        // pickDate[4] = await this.getHourMin(endH)

        pickNavBar=[{
            id:0,
            text:"开始时间"
          },{
            id:1,
            text:"结束时间"
        }]

      }
      if( pickType === "dates" ){
        defaultT = [...defaulArr[0].split(' ')[0].split('-'), ...defaulArr[0].split(' ')[1].split(':')]
        console.log(defaultT)
        pickDate[0] = this.getLoopArray(2020,2025)
        pickDate[1] = this.getLoopArray(1,12)
        pickDate[2] = this.getMonthDay(defaultT[0],defaultT[1])
        pickDate[3] = this.getLoopArray(0,59)
        pickDate[4] = this.getLoopArray(0,59)
        pickDate[5] = this.getLoopArray(0,59)

      }
      if( pickType === "date" ){
        defaultT = [...defaulArr[0].split(' ')[0].split('-')]
        pickDate[0] = this.getLoopArray(2020,2025)
        pickDate[1] = this.getLoopArray(1,12)
        pickDate[2] = this.getMonthDay(defaultT[0],defaultT[1])
      }
      if( pickType === "times" ){
        defaultT = [...defaulArr[0].split(":")]
        console.log(defaultT)
        pickDate[0] = this.getLoopArray(0,59)
        pickDate[1] = this.getLoopArray(0,59)
        pickDate[2] = this.getLoopArray(0,59)
       
      }
      if( pickType === "time" ){
        defaultT = [...defaulArr[0].split(":")]
        console.log(defaultT)
        pickDate[0] = this.getLoopArray(0,59)
        pickDate[1] = this.getLoopArray(0,59)

      }

      if( pickType === 'dataTime' ){
        let defaultDateTime =  [...defaulArr[0].split("-")]; //获取传入日期
        defaultT = [...defaulArr[1].split(":")] ; //获取传入的时间值
        
        console.log(defaultT)
        console.log(defaultDateTime)

        this.getDateTime(defaultDateTime[0],defaultDateTime[1],defaultDateTime[2])

        // 时间显示内容
        pickDate[0] = this.getLoopArray(0,59)
        pickDate[1] = this.getLoopArray(0,59)

        pickNavBar=[{
          id:0,
          text:"日期"
        },{
          id:1,
          text:"时间"
        }]

        this.setData({
          hasTapPicker: true,
          isShowCalender: true,
         
        })


      }
      // console.log(pickDate)

      pickDate.forEach((cur,ind)=>{
        pickVal.push(cur.indexOf(defaultT[ind]))
      })
      //开始时间-结束时间 end

      //setTimeout同页面中多次调用时使用
      // setTimeout(()=>{
      //   this.setData({ pickVal, })
      // },0)
      this.setData({
        pickNavBar,
        pickDate,
        pickVal
      })
    },
    getDateTime(year,month,day){
      // console.log(year, month, day)
     
      let monData = [];
      let nowDate = this.getNewDateArry() //获取当前系统时间
      let currentDay = day ? day : nowDate[2];  //获取今天日期
      let currentMon = month ? month : nowDate[1];  //获取当前月份
      let currentYear =  year ? year : nowDate[0]; //获取当前年份
      /**
       * new Date(year, month ,day).getDay() 查询星期格式,当你需要查询当前月份的一号是周几时,需要将month-1,因为日历中的月份是从0开始的 
       */

      let lastM = new Date(currentYear,currentMon-1, 1).getDay()    //上个月留在本月的长度,这个月的第一天在日历中为周几,
      let aheadM = new Date(currentYear,currentMon, 0).getDay() 
      // console.log(aheadM)
      for(let i = lastM ; i>0; i--){     //拉取上个月末尾的那几天,new Date(year,month,day),月末最后一天的day为0
        let lastD = new Date(currentYear, currentMon-1, -i).getDate() 
        let obj = {
          mon:  String( parseInt(currentMon)-1),
          day: lastD
        }
        monData.push(obj)
      }
      this.getMonthDay(currentYear,this.withData(currentMon)).forEach(item =>{
        let obj = {
          mon: currentMon,
          day: item
        }
        monData.push(obj)
      })

      
      this.getLoopArray(1,6 - aheadM).forEach(item =>{  //拉取下个月开头的时间
        let obj = {
          mon: String( parseInt(currentMon)+1),
          day: item
        }
        monData.push(obj)
      })
      let calenderArr = monData
     
      this.setData({
        nowDate,
        currentDay,
        calenderArr,
        currentMon,
        currentYear,
        tapDay: currentDay,
        tapMon: currentMon
      })

    },
    // 时间选中时间方式
    defaultTime(data){
      let pickVal = [], nPickVal = [], pickTime = [];
      let type = this.data.pickType;

      if(data){  // 出现了滚动
        nPickVal = data;
        let pickDate = this.data.pickDate
        switch(type){
          case "startAndEnd" :  pickTime[0] = pickDate[0][nPickVal[0]] + ":" + pickDate[1][nPickVal[1]]
                                pickTime[1] = pickDate[3][nPickVal[3]] + ":" + pickDate[4][nPickVal[4]];
                break;
          case "dates" : pickTime[0] = pickDate[0][nPickVal[0]] + "-" + pickDate[1][nPickVal[1]] + "-" + pickDate[2][nPickVal[2]] + " " + pickDate[3][nPickVal[3]] + ":" + pickDate[4][nPickVal[4]] + ":" + pickDate[5][nPickVal[5]];
                break;
          case "times" : pickTime[0] = pickDate[0][nPickVal[0]] + ":" + pickDate[1][nPickVal[1]] + ":" + pickDate[2][nPickVal[2]];
                break;
          case "time" : pickTime[0] = pickDate[0][nPickVal[0]] + ":" + pickDate[1][nPickVal[1]];
                break;
          case "date" : pickTime[0] = pickDate[0][nPickVal[0]] + "-" + pickDate[1][nPickVal[1]] + "-" + pickDate[2][nPickVal[2]];
                break;
          case  "dataTime": pickTime[0] = pickDate[0][nPickVal[0]] + ":" + pickDate[1][nPickVal[1]];
                break;

          default: return;

        }
      

      }else{
       
        pickVal = this.data.pickVal;
        let pickDate = this.data.pickDate
        switch(type){
          case "startAndEnd" :  pickTime[0] = pickDate[0][pickVal[0]] + ":" + pickDate[1][pickVal[1]]
                                pickTime[1] = pickDate[3][pickVal[3]] + ":" + pickDate[4][pickVal[4]];
                break;
          case "dates" : pickTime[0] = pickDate[0][pickVal[0]] + "-" + pickDate[1][pickVal[1]] + "-" + pickDate[2][pickVal[2]] + " " + pickDate[3][pickVal[3]] + ":" + pickDate[4][pickVal[4]] + ":" + pickDate[5][pickVal[5]];
                break;
          case "times" : pickTime[0] = pickDate[0][pickVal[0]] + ":" + pickDate[1][pickVal[1]] + ":" + pickDate[2][pickVal[2]];
                break;
          case "time" : pickTime[0] = pickDate[0][pickVal[0]] + ":" + pickDate[1][pickVal[1]];
                break;
          case "date" : pickTime[0] = pickDate[0][pickVal[0]] + "-" + pickDate[1][pickVal[1]] + "-" + pickDate[2][pickVal[2]];
                break;
          case  "dataTime": pickTime[0] = pickDate[0][pickVal[0]] + ":" + pickDate[1][pickVal[1]];
                break;
              
          default: return;

          
                      
        }

        this.setData({
          pickVal
        })
      }
      this.setData({
        pickTime,
        nPickVal
      })
    },
    showPicker(){
      this.setData({
        showPicker: true
      })
    },
    selectNavItem(e){

      let currentInd = e.currentTarget.dataset.ind
      let isShowCalender = false
      if( this.data.pickType === "dataTime" && currentInd == 0 ){
        isShowCalender = true
      }
      this.setData({
        currentInd,
        isShowCalender
      })

    },
    // 点击确认按钮
    async tapSure(){
      if(this.data.pickType === "startAndEnd"){

        let platform = wx.getSystemInfoSync().platform
        let nowDate = this.getNewDateArry() //获取当前系统时间
        var startT = nowDate[0] + ' ' + this.data.pickTime[0]
        var endT = nowDate[0] + ' ' + this.data.pickTime[1]
        
        if(platform == 'ios'){
          var startT = this.data.currentDate.replace(/-/g,'/') + ' ' + this.data.pickTime[0]
          var endT = this.data.currentDate.replace(/-/g,'/') + ' ' + this.data.pickTime[1]
        }

        var startTimes = new Date(startT).getTime()
        var endTimes = new Date(endT).getTime()

        if(startTimes >= endTimes){    //startAndEnd 开始时间不能大于结束时间
          wx.showToast({
            title: '开始时间不能大于等于结束时间',
            duration: 1000,
            icon: "none",
            mask: true,
          })
          return
        }

      }

      this.setData({
        showPicker: false,
        currentInd:0
      })

      if(!this.data.isScroll){  //判断是否有滚动结束,滚动未结束就按点击按未滚动处理
        if(this.data.pickType === 'dataTime'){
          let tapDate = this.data.tapDate
          tapDate.push(...this.data.pickTime)
          console.log(tapDate)
          this.triggerEvent("pickSure",  tapDate )
        }else{
          this.triggerEvent("pickSure",  this.data.pickTime )

        }
        let nPickVal = this.data.nPickVal
        this.setData({
          pickVal: nPickVal
        })
      }else{

        await this.defaultTime();
        // console.log(this.data.pickTime)
        if(this.data.pickType === 'dataTime'){
          let tapDate = this.data.tapDate
          tapDate.push(...this.data.pickTime)
          this.triggerEvent("pickSure",  tapDate )
          console.log(tapDate)
        }else{
          this.triggerEvent("pickSure",  this.data.pickTime )
        }
      
      }
    },

    // 选择日期,当pickType = dataTime 
    selectDay(e){
      // console.log(e)
      let tapDay = e.currentTarget.dataset.day
      let tapMon = e.currentTarget.dataset.mon
      let currentMon = this.data.currentMon

      // console.log(tapMon)
      // console.log(tapDay)
      if(tapMon != currentMon){
        // console.log("切换月份")
        if(tapDay <7){
          this.aheadM(currentMon)
        }else{
          this.lastM(currentMon)
        }
        return
      }
      let date = this.data.currentYear+'-'+currentMon+'-'+tapDay
      let tapDate = []
      tapDate.push(date)
      this.setData({
        tapDay,
        tapMon,
        currentInd:1,
        isShowCalender:false,
        tapDate
      })
    },

    // 滚动选择
    pickerChange(e){
      let nPickVal = e.detail.value
      // console.log(nPickVal)
      let type = this.data.pickType
      let pickDate = this.data.pickDate

      switch(type){
        case "dates":  this.defaultTime(nPickVal); 
                      pickDate[2]= this.getMonthDay(pickDate[0][nPickVal[0]],pickDate[1][nPickVal[1]]);
                      this.setData({
                        pickDate
                      })
              break;
        case  "date" :  this.defaultTime(nPickVal);
                        pickDate[2]= this.getMonthDay(pickDate[0][nPickVal[0]],pickDate[1][nPickVal[1]]);
                        this.setData({
                          pickDate
                        });
              break;
        case  "startAndEnd": this.defaultTime(nPickVal); 
                        // 限制选择区域时使用
                        // pickDate[1]= this.getHourMin(pickDate[0][nPickVal[0]]);
                        // pickDate[4]= this.getHourMin(pickDate[3][nPickVal[3]]);

                        // this.setData({
                        //   pickDate
                        // })
              break;
        
        default: this.defaultTime(nPickVal);
      }
 
    },
    pickerStart(e){
      // console.log("start", e)
      this.setData({
        isScroll:true 
      })
    },
    pickerEnd(e){
      // console.log("end", e)
      // console.log( this.data.pickTime)
     
      this.triggerEvent("pickTap",  this.data.pickTime )
      this.setData({
        isScroll: false
      })
    },

    // 滑动切换日期
    bindtouchstart(e){
      // console.log('binddragstart',e)
      let oldL = e.changedTouches[0].clientX
      this.setData({
        oldL
      })
    },
    bindtouchend(e){
      // console.log('binddragend', e)
      let oldL = this.data.oldL
      let newL = e.changedTouches[0].clientX
     

      if(newL - oldL >20){
        // console.log('获取上个月日期')
        this.lastM()
        
      }else if(oldL - newL > 20){
        // console.log('获取下个月日期')
       this.aheadM()
      
      }


    },
    lastM(mon){
      let currentMon = mon || this.data.currentMon
      let currentYear = this.data.currentYear
      currentMon = String(parseInt(currentMon-1)) == '0' ? '12' : String(parseInt(currentMon-1))
      currentYear = currentMon == '12' ? String(parseInt(currentYear)-1) : currentYear
      this.getDateTime(currentYear,currentMon)
      this.setData({
        currentMon,
        currentYear
      })
    },
    aheadM(mon){
      let currentMon = mon || this.data.currentMon
      let currentYear = this.data.currentYear
      currentMon = String( parseInt(currentMon)+1) == '13' ? '1' : String( parseInt(currentMon)+1)
      currentYear = currentMon == 1 ? String(parseInt(currentYear)+1) : currentYear
      
      this.getDateTime(currentYear,currentMon)
      this.setData({
        currentMon,
        currentYear
      })
    }

  }
})
