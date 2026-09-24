/* 空域查询与地方、景区规则分列；资料整理日期不代表 UOM 已完成核验。 */
(() => {
  const sources = {
    uom: {title:'UOM 官方空域查询入口（需登录）',url:'https://uom.caac.gov.cn/#/main'},
    border: {title:'西藏公安厅：边境活动“十五禁”（2021-04-08 发布）',url:'https://gat.xizang.gov.cn/xwzx_3233/gsgg_205/202104/t20210408_198934.html'},
    ali: {title:'阿里行署：低慢小航空器管理通告（2021-05-25）',url:'https://www.al.gov.cn/info/1181/34951.htm'},
    gaize: {title:'改则公安：无人机安全管理通告（2025-05-20 发布）',url:'https://gaizexian.gov.cn/info/2251/306001.htm'},
    lhasa: {title:'拉萨公安：黑飞案例与管制空域说明（2026-03-06）',url:'https://www.lasa.gov.cn/lasa/zfdt/202603/ef71afb7529e4aeca766abfe8d549f16.shtml'},
    airportLhasa: {title:'拉萨市：贡嘎机场管制空域通告（2026-04-04）',url:'https://www.lasa.gov.cn/lasa/tggs/202604/9bd6ff1127c246c68b70bfcc9d07ca18.shtml'},
    airportShannan: {title:'山南市：贡嘎机场风险管控区域（2026-03-30）',url:'https://shannan.gov.cn/xwzx/tggs/202603/t20260330_166357.html'},
    elephant: {title:'西藏文旅：圣象天门游览管理公告（2026-06-17）',url:'https://wlt.xizang.gov.cn/xccx/lytg/202606/t20260617_546017.html'},
    elephantLocation: {title:'高德：西藏纳木措自然保护区圣象天门（独立景点，仅定位辅助）',url:'https://www.amap.com/place/B0HGGUVFD3'},
    siling: {title:'国家林草局：色林错保护区野生动物（2026-07-16）',url:'https://www.forestry.gov.cn/lyj/1/zhzs/20260716/680300.html'},
    silingLocation: {title:'游客骑行资料：许隆村色林错游客接待中心（2022-08-23，非官方定位线索）',url:'https://m.sohu.com/a/578848144_100061833'},
    wenbuLocation: {title:'文化和旅游部：当惹雍措环湖之旅与文部南村名称、位置说明',url:'https://zhuanti.mct.gov.cn/xcszbwg2022/xizang/detail/2012.html'},
    everestContact: {title:'西藏文旅：珠峰景区公告与联系电话（2026-01-29）',url:'https://wlt.xizang.gov.cn/xccx/lytg/202601/t20260129_521748.html'},
    everestReserve: {title:'西藏文旅转载新华社：珠峰核心区保护背景（2023-06-05）',url:'https://wlt.xizang.gov.cn/xwzx_69/xydt/202306/t20230605_359174.html'},
    xilinLocation: {title:'青岛日报社／观海新闻：西林观景台位置说明（2023-08-25）',url:'https://www.dailyqd.com/guanhai/272473_1.html'},
    xilinAlias: {title:'游客线索：西林又称洛子峰观景台（2025-06-07，非官方命名）',url:'https://www.sina.cn/news/detail/5175025943975368.html'},
    gyawulaAlias: {title:'旅行资料：加乌拉／加吾拉山口异写说明',url:'https://www.tibet.tw/gonglue/461.html'},
    gyawulaManagement: {title:'西藏政府转载人民日报：加吾拉山顶观景台黑飞监管整改（2026-08-24）',url:'https://www.xizang.gov.cn/xwzx_406/bmkx/202608/t20260824_554823.html'},
    castleName: {title:'西藏文旅：定日东巴古堡文旅地标（2025-12-02）',url:'https://wlt.xizang.gov.cn/ztzl_69/wenlv/202512/t20251202_512215.html'},
    castleProtection: {title:'最高检：定日县岗嘎镇东巴村珠峰古堡遗址保护记录（2024-08-30）',url:'https://www.spp.gov.cn/spp/zdgz/202408/t20240830_664676.shtml'},
    treeLocation: {title:'西藏文旅转载新华网：洞措乡确登村“大地之树”位置（2023-04-11）',url:'https://wlt.xizang.gov.cn/xwzx_69/xydt/202304/t20230411_350322.html'},
    treeVillage: {title:'西藏政府：生态文明示范区名单中的洞措乡确登村（2023-07-04）',url:'https://www.xizang.gov.cn/zwgk/xxfb/zfwj/202307/t20230704_364127.html'},
    treeMilestone: {title:'西藏文旅：G216 2860 里程碑附近的大地之树（2025-07-15，仅定位辅助）',url:'https://wlt.xizang.gov.cn/xccx/lytg/202507/t20250715_489418.html'},
    zhariAmap: {title:'高德：扎日南木措北岸观景台（独立观景点，仅定位辅助）',url:'https://www.amap.com/place/B0GRRSJIJ7'},
    zhariCtrip: {title:'携程：扎日南木错北岸观景台（“错”字名称线索）',url:'https://gs.ctrip.com/html5/you/sight/coqen120146/152787979.html'},
    malangName: {title:'札达县政府：旅发委工作总结中的“玛朗观景台”（2019-01-18）',url:'https://www.zhada.gov.cn/info/1951/90701.htm?urltype=tree.TreeTempUrl&wbtreeid=1063'},
    malangSettlement: {title:'札达县政府：托林镇玛朗组居民点（2023-05-31）',url:'https://zhada.gov.cn/info/1020/56011.htm'},
    malangListing: {title:'Trip.com：玛朗峡谷观景台景点条目（非官方定位资料）',url:'https://hk.trip.com/travel-guide/attraction/zanda/city-145330563/'},
    malangOtherViewpoint: {title:'Trip.com：另列的“玛琅观景台”（不能直接当作同点别名）',url:'https://hk.trip.com/travel-guide/attraction/zanda/malang-observation-deck-143752288?poiType=3&scene=DISTRICT'}
  };
  const point = (label,note) => ({label,precision:'待确认实际起飞点',...(note?{note}:{})});
  const venue = (status,label,detail,keys=[]) => ({status,label,detail,sources:keys.map(key=>sources[key])});
  const row = data => ({
    ...data,
    uom:{status:'unverified',label:'待核验 · 不作适飞判断',checkedAt:'',detail:'未完成 UOM 页面逐点核验；不据其他网站或航拍视频推定颜色。',sources:[sources.uom],...(data.uom||{})}
  });
  window.TIBET_DRONE = {
    checkedAt:'2026-09-25',
    legend:{verified:false,colorsVerified:false,blue:'蓝区',white:'白区',note:'蓝区／白区只以 UOM 当前页面为准；颜色观察与空域法律含义分开记录。',sources:[sources.uom]},
    notes:[
      '本表是出行前的核验清单，不是放飞许可；颜色已核验的记录仅对应 UOM 搜索匹配点及观察时间，不代表实际起飞点或全程飞行范围已确认，也不代表取得景区或属地的个案批准。已搜索定位不等于已核验颜色，资料整理日期和查询尝试时间不能代替成功核验时间。',
      'UOM 定位后底图与空域图层可能分先后加载；必须在地图放大至 9 级以上、图层稳定且点位和边界清晰时读取。加载中的白底、模糊截图或仅有地点搜索结果不能记作白区。',
      '“本次不安排航拍”是行程建议，不等于已确认全域永久禁飞；“未查到专项公告”仅表示本次公开检索未找到，不代表当地没有限制或默认允许。',
      '需要同时核对实际起飞点、计划飞行范围、UOM 当前空域、临时管制和场地管理。不得把一个观景点的结果外推到整座湖、整个景区或整段道路。',
      '边境依据：西藏公安厅 2021 年公布的“十五禁”限制边境地区私自开展低慢小飞行；本表未完成各起飞点与边境管理范围的边界核验。边境通行证不代替飞行许可。',
      '阿里依据：2021-05-25 行署通告提出事前申请和属地报备，并限制城市中心、敏感设施等区域。该旧通告早于国家新条例，公开页未列截止；现行办理流程、机型要求及适用范围须向属地重新确认，不能仅据旧文认定已获准。',
      '改则依据：通告落款 2025-02-19、网页发布 2025-05-20，列有交通运行沿线、敏感设施和人员密集场景限制及个人申请材料；可向改则公安治安管理大队 0897-2653110 核实。不将其解释为全县永久禁飞。',
      '文物、寺院、村落和保护区的准入需另问管理方；景区恢复开放、宣传航拍、媒体或科研飞行均不是普通游客的飞行许可。保护区说明也不直接等于航空禁飞边界。',
      '未把拉萨 2025 年 8 月庆典、2026 年 6 月高考、日喀则 2026 年 6 月展佛及狮泉河 2023 年象雄节的临时限制外推到本次 2026-09-25 至 10-07 行程；临行和起飞前仍需查看新公告。',
      '所有点位均未填写未经核验的坐标。湖区入口、停车区和同名观景台必须先定位；西林、珠峰古堡及洞措大地之树尤其不能仅凭名称确定起飞位置。',
      '即使手续、场地与空域均满足，也须按具体机型说明书核对起飞海拔、温度、风速、电池和返航余量；不追逐野生动物，不飞越人群，不为航拍进入封闭区、草场或未知支路。'
    ],
    rows:[
      row({id:'drone-d0-transfer',day:'D0',date:'2026-09-25',spotKey:null,place:'贡嘎机场 → 拉萨市区',
        location:point('贡嘎机场及机场至酒店转场','机场管制范围跨山南、拉萨行政区；不能把整段道路视为一个查询点。'),
        venue:venue('restricted','机场相关范围有明确管控','两市 2026 年机场公告要求在公布范围内先获批准；机场外市区点位另查，不能沿用机场边界。',['airportLhasa','airportShannan']),
        conclusion:'本次不安排航拍，以抵达与适应为主。',action:'勿在取车区或转场路边自行起飞；如改变安排，先确定点位并核验全部手续。'}),
      row({id:'drone-lurila',day:'D1',date:'2026-09-26',spotKey:'lurila',place:'鲁日拉观景台',
        location:{...point('羊湖沿线鲁日拉／鲁日啦观景台','UOM 搜索结果为浪卡子县同名观景台；实际停车平台与计划飞行范围仍需确认。'),precision:'UOM 搜索结果已匹配；实际起飞点未确认'},
        uom:{label:'搜索已匹配 · 颜色待核验',detail:'2026-09-24 查询尝试：已选择“鲁日拉观景台 西藏自治区山南市浪卡子县”，地图为 15 级；截图清晰度不足且空域图层延迟加载，未完成颜色核验。',attempt:{attemptedAt:'2026-09-24',queryText:'鲁日拉观景台',matchedResult:'鲁日拉观景台 西藏自治区山南市浪卡子县',zoom:15,blockedReason:'已选择同名搜索结果；截图为缩小的倾斜窗口画面，无法可靠读取边界，且观察到空域图层延迟加载。暂不判定蓝区或白区。'}},
        venue:venue('no_rule_found','未核得点名景点的专项准入公告','本次公开检索未找到可据以确定此平台无人机准入的官方专项公告；现场规则仍待询问。'),
        conclusion:'尚不能判定适飞；短停以地面拍摄为主。',action:'确认平台位置后查 UOM，并向现场管理方核实；未确认不飞。'}),
      row({id:'drone-karola',day:'D1',date:'2026-09-26',spotKey:'karola',place:'卡若拉冰川',
        location:point('卡若拉冰川正式开放观景平台'),
        venue:venue('no_rule_found','景区航拍要求待确认','未核得此观景平台的现行公开无人机专项准入公告；不能从冰川宣传照片推导许可。'),
        conclusion:'尚不能判定适飞；本次不预留专门航拍时段。',action:'在景区确认可用区域、审批及生态要求；不得进入冰川或封闭区域寻找起飞点。'}),
      row({id:'drone-xilin',day:'D2',date:'2026-09-27',spotKey:'xilin',place:'西林观景台',
        location:point('西林观景台（游客别称线索：洛子峰观景台）','青岛日报社记者记为定日、定结、萨迦三县交界处，沿 G219 南行约 20 公里到定结县城；“洛子峰观景台”仅为游客线索，非官方命名，实际平台仍待确认。'),
        venue:venue('conditional','先确认点位及边境管理范围','若实际点位属于边境管理范围，须遵守边境飞行要求；位置报道和游客别称不构成空域或飞行许可依据。',['border','xilinLocation','xilinAlias']),
        conclusion:'点位未定，不作适飞判断。',action:'先取得正确地图点，再核对 UOM、属地公安及现场要求；未确认不飞。'}),
      row({id:'drone-gyawula',day:'D2',date:'2026-09-27',spotKey:'gyawula',place:'加乌拉山口',
        location:point('加乌拉山口／加吾拉山口的正规观景平台','旅行资料说明两种异写；政府报道使用“加吾拉山山顶珠峰观景台”。仅以定日县珠峰道路沿线为候选，不采用贡嘎或四川同名点；山体 POI 不等于实际起飞平台。'),
        venue:venue('conditional','有黑飞监管整改报道，现场手续待确认','2026-08-24 官方报道回顾该观景台无人机黑飞问题及公安重装监控的整改；这不是禁飞边界公告，也不能据此认定全域永久禁飞。实际平台仍须核实边境、景区及属地要求。',['border','gyawulaManagement','gyawulaAlias']),
        conclusion:'未确认前不安排起飞。',action:'查明平台与飞行范围；向属地和平台管理方核实，不飞越道路、车辆和观景人群。'}),
      row({id:'drone-everest',day:'D3',date:'2026-09-28',spotKey:'everest',place:'珠峰大本营',
        location:point('景区正式开放的游客观景区域','游客大本营、登山大本营与保护区核心区不是同一地点。'),
        venue:venue('conditional','边境、保护区与景区要求并行','游客可进入范围不等于无人机许可范围；尚未取得景区对具体飞行点的确认。',['border','everestReserve','everestContact']),
        conclusion:'默认地面观景，不把航拍列为本日必做。',action:'先向景区核实航拍管理与办理渠道，再核对属地及 UOM。公告所列 0892-8263013 为紧急联系电话，不能当作已确认的航拍审批热线；不得飞入未获准区域。'}),
      row({id:'drone-castle',day:'D3',date:'2026-09-28',spotKey:'castle',place:'珠峰古堡遗址',
        location:point('珠峰古堡遗址（名称候选：东巴古堡）','最高检记录使用“珠峰古堡遗址”，明确关联定日县岗嘎镇东巴村；西藏文旅使用“东巴古堡”名称。实际入口、平台及两种名称对应仍待核对，不以附近其他古堡遗址代替。'),
        venue:venue('unverified','遗址身份与管理方待确认','官方文旅及遗址保护报道仅辅助名称和位置核验，不是无人机准入公告；尚不能确定文物保护及边境规则对实际点位的适用范围。',['border','castleName','castleProtection']),
        conclusion:'不安排航拍；本点本就可舍弃。',action:'先确认遗址身份与管理方；不得用其他古堡或附近空旷位置的结果代替。'}),
      row({id:'drone-peiku',day:'D3',date:'2026-09-28',spotKey:'peiku',place:'佩枯措',
        location:point('佩枯措实际开放观景点','湖岸不同点位须分别核验，不以湖中心代替起飞点。'),
        venue:venue('conditional','边境范围与属地要求待确认','未核得本观景点的专项飞行许可说明；需先核实实际湖岸是否涉及边境管理范围。',['border']),
        conclusion:'尚不能判定适飞；本日仅预留短停。',action:'先问属地及现场管理方，确认点位、空域及风况；转场延误则放弃航拍。'}),
      row({id:'drone-manasarovar',day:'D4',date:'2026-09-29',spotKey:'manasarovar',place:'玛旁雍措',
        location:point('玛旁雍措本次选择的正式开放湖景点'),
        venue:venue('conditional','阿里地方手续及边境要求待复核','适用阿里地方管理核验清单；还须确认该湖岸点的边境、保护区与景区要求。',['ali','border']),
        conclusion:'先核准实际点位，不默认随到随飞。',action:'向普兰属地及景区核实现行手续；以批准范围和当前 UOM 为准，不扩大到整湖。'}),
      row({id:'drone-rakshastal',day:'D4',date:'2026-09-29',spotKey:'rakshastal',place:'拉昂措',
        location:point('拉昂措合法开放的实际观景点'),
        venue:venue('conditional','地方手续与具体湖岸准入待核实','需复核阿里旧通告的现行流程及边境适用范围；未取得此点的场地飞行确认。',['ali','border']),
        conclusion:'未获确认前只作地面短停。',action:'独立核对此湖岸点，不沿用玛旁雍措结果；大风或行程延误直接取消航拍。'}),
      row({id:'drone-malang',day:'D5',date:'2026-09-30',spotKey:'malang',place:'玛朗峡谷',
        location:point('玛朗峡谷观景台（另查：玛朗观景台）','县政府使用“玛朗观景台”；Trip.com 将“玛朗峡谷观景台”列在札达县土林玛朗景区。同县另有托林镇玛朗组居民点，“玛朗”裸名不足以确认峡谷平台；Trip.com 另列“玛琅观景台”，不能擅作同点别名。'),
        venue:venue('conditional','先复核阿里地方申请流程','阿里公开地方通告见共用说明；本次未核得观景台专项准入公告。名称及居民点资料只辅助定位，不是飞行许可或 UOM 颜色依据。',['ali','malangName','malangSettlement','malangListing','malangOtherViewpoint']),
        conclusion:'尚不能判定适飞；不为航拍压缩古格游览。',action:'核准观景台及峡谷内计划飞行范围，询问属地和管理方；不下未知沟谷寻找起飞点。'}),
      row({id:'drone-guge',day:'D5',date:'2026-09-30',spotKey:'guge',place:'古格王国遗址',
        location:point('古格遗址开放区域及管理方指定位置'),
        venue:venue('conditional','文物管理与地方手续需另行确认','未核得足以确认现行航拍范围的官方景区专项公告；历史游记中的禁飞告示不作为本次已核实规则。',['ali']),
        conclusion:'本次默认地面拍摄，不安排自行起飞。',action:'向遗址管理处及属地询问书面要求；有许可也需另查实际点位 UOM，不飞越未获准文物区域。'}),
      row({id:'drone-xiayigou',day:'D6',date:'2026-10-01',spotKey:'xiayigou',place:'霞义沟土林',
        location:point('霞义沟土林正式开放观景区域'),
        venue:venue('conditional','地方手续与景区许可待核实','需复核阿里地方流程，并独立取得景区对起飞位置和范围的确认。',['ali']),
        conclusion:'手续和场地未确认前，不作适飞判断。',action:'先问景区及属地；不得为机位攀爬土柱或进入封闭沟谷。'}),
      row({id:'drone-shiquanhe',day:'D6',date:'2026-10-01',spotKey:'shiquanhe',place:'狮泉河',
        location:point('狮泉河镇午餐、加油与补给区域'),
        venue:venue('conditional','城镇及敏感设施限制需核对','阿里地方通告涉及城市中心和敏感设施；不将旧旅游节临时管制作为本次依据。',['ali']),
        conclusion:'本次不安排航拍，仅作补给。',action:'避免在加油站、聚居和敏感设施附近自行放飞；不要因补给停车临时增加航拍。'}),
      row({id:'drone-wuma',day:'D7',date:'2026-10-02',spotKey:'wuma',place:'物玛措',
        location:point('物玛措沿途合法停靠观景点'),
        venue:venue('conditional','地方手续及湖岸管理待确认','阿里地方流程须复核；尚未核实所选湖岸点的独立管理要求。',['ali']),
        conclusion:'尚不能判定适飞；只按短停安排。',action:'定位允许停靠处并问属地；不驶离道路进入草场或湖岸寻找航拍位置。'}),
      row({id:'drone-gaize',day:'D7',date:'2026-10-02',spotKey:'gaize',place:'改则',
        location:point('改则县城午餐与加油补给区域'),
        venue:venue('restricted','县城相关场景有公开限制','改则通告列有聚居、人员密集及交通运行等场景限制；实际范围仍按现场与主管部门确认。',['gaize']),
        conclusion:'本次不安排航拍，保留补给与休息。',action:'勿在道路、加油站或县城人群上空自行放飞；有其他需求先询问治安大队。'}),
      row({id:'drone-tree',day:'D7',date:'2026-10-02',spotKey:'tree',place:'洞措大地之树／确登村',
        location:point('洞措乡确登村洞错湖南岸、G216 2860 里程碑附近的“大地之树”','西藏文旅 2025-07-15 明确里程碑位置，政府名单使用“确登村”（原行程写“雀登村”）；此为定位线索，仍须确认合法停靠与实际机位，不能用村中心、那曲 G317 沿线大地之树或尼玛达则错天空之树代替。'),
        venue:venue('conditional','先确认改则手续与飞行范围','官方景观报道、里程碑及村名资料只用于定位，不是游客飞行许可或 UOM 颜色依据；须核实改则申请及道路、聚居等范围限制。',['gaize','ali','treeLocation','treeVillage','treeMilestone']),
        conclusion:'航拍是条件选项，未核准则跳过。',action:'携实际点位和机型向 0897-2653110 核实；明确起降与全程范围后再查 UOM，不为拍摄压缩长途余量。'}),
      row({id:'drone-zhari',day:'D8',date:'2026-10-03',spotKey:'zhari',place:'扎日南木措北岸',
        location:point('扎日南木措北岸观景台（另查“扎日南木错北岸观景台”）','高德有独立的北岸观景点条目，携程使用“错”字名称；均仅辅助搜索定位，仍须核对是否为本次实际开放入口与起飞平台，不能用湖心或措勤县城的景区 POI 代替。'),
        venue:venue('conditional','阿里手续与湖区管理待核实','需复核阿里地方流程；尚未取得所选北岸点的景区或保护区准入确认。地图与旅游平台条目不是飞行许可或 UOM 颜色依据。',['ali','zhariAmap','zhariCtrip']),
        conclusion:'尚不能判定适飞；本次按短停安排。',action:'核对正式入口与管理方，不沿车辙进入湿地或用整湖范围代替具体查询。'}),
      row({id:'drone-wenbu',day:'D8',date:'2026-10-03',spotKey:'wenbu',place:'文布南村／当惹雍错',
        location:point('文布南村允许停留的实际湖景位置','文旅部资料使用“文部南村／文部乡南村”，村内文部寺全称“雍忠桑丹林寺”；北村、琼宗遗址与玉本寺另列为不同地点。名称只辅助定位，村落和湖岸应分别核验，不以乡政府、北村或湖心代替机位。'),
        venue:venue('no_rule_found','村落与湖区航拍要求待确认','未核得可确定此点无人机准入的官方专项公告；文旅路线资料只提供名称与位置线索，不是飞行许可或 UOM 颜色依据，仍须询问属地和管理方。',['wenbuLocation']),
        conclusion:'未确认前以村中慢走、地面拍摄为主。',action:'先确认合法起降位置和范围；不低空掠过住宅、礼佛活动或人群，离村时间优先。'}),
      row({id:'drone-siling',day:'D9',date:'2026-10-04',spotKey:'siling',place:'色林措',
        location:point('色林措选定的合法开放观景点','2022 年游客骑行资料列有“许隆村色林措接待服务中心／色林错游客接待中心”，仅作非官方搜索线索，不确认当前开放状态。服务中心、断崖与湖岸是不同点，不能互相替代，也不能用湖心或保护区管理站代表机位。'),
        venue:venue('conditional','保护区要求需先确认','官方资料确认其保护区野生动物栖息价值，但未提供此观景点的游客航拍许可或空域边界；游客定位线索不构成 UOM 颜色或飞行许可依据。',['siling','silingLocation']),
        conclusion:'保护区与空域未核实，不作适飞判断。',action:'先问保护区或观景点管理方；不追拍野生动物，不进入湿地或封闭区域。'}),
      row({id:'drone-namtso',day:'D10',date:'2026-10-05',spotKey:'namtso',place:'纳木措开放观景区',
        location:point('最终选择的纳木措入口及观景区域','需先确定是否扎西岛等实际入口，不把整个纳木措视为同一场地。'),
        venue:venue('no_rule_found','实际入口的场地要求待确认','未核得涵盖本次未定观景入口的官方无人机专项准入公告；与圣象天门分开询问。'),
        conclusion:'返拉萨优先，未确认前不安排航拍。',action:'在前一晚确定入口并询问管理方，起飞点及范围单独查 UOM；不延误返城。'}),
      row({id:'drone-elephant',day:'D10',date:'2026-10-05',spotKey:'elephant',place:'圣象天门（条件备选）',
        location:point('圣象天门最终获准进入的观景区域','高德独立景点名为“西藏纳木措自然保护区圣象天门”（使用“措”字），地址为那曲市班戈县；仅辅助搜索，仍须确认实际开放入口与平台，不以纳木措南岸其他景区代替。'),
        venue:venue('unverified','开放公告不是无人机许可','2026-06-17 公告有生态与区域准入要求，但未明确游客无人机准入；不能据其判定可飞或全面禁飞。高德条目只辅助定位，不是 UOM 颜色依据。',['elephant','elephantLocation']),
        conclusion:'航拍另行确认；未满足条件仍按原计划舍弃。',action:'可向公告所列景区咨询电话 18011110212／17789060224 询问起降、飞行范围和手续；不惊扰动物、不进入封闭区，并保留返拉萨余量。'}),
      row({id:'drone-potala',day:'D11',date:'2026-10-06',spotKey:'potala',place:'布达拉宫',
        location:point('布达拉宫主体、广场及实际外部拍摄点','不同位置分别核验，不把远处拍摄布宫的机位等同宫殿或广场。'),
        venue:venue('conditional','文物、安保与人群要求需核对','拉萨公安说明重要文物及周边等管制类别；该说明不是布宫逐点永久边界公告。',['lhasa']),
        conclusion:'本次不安排航拍，使用地面机位。',action:'按参观预约和现场管理拍摄；如另有专业飞行需求，先取得对应许可并核对实际空域。'}),
      row({id:'drone-jokhang',day:'D11',date:'2026-10-06',spotKey:'jokhang',place:'大昭寺',
        location:point('大昭寺参观区域及寺前广场'),
        venue:venue('conditional','文物、宗教场地和安保须确认','尚未核得对本点生效的专项飞行边界及许可；不能从官媒航拍反推游客可飞。',['lhasa']),
        conclusion:'本次不安排航拍，服从参观及拍摄规则。',action:'不在寺院、广场或礼佛人群上空自行放飞；场地管理与 UOM 需分别满足。'}),
      row({id:'drone-barkhor',day:'D11',date:'2026-10-06',spotKey:'barkhor',place:'八廓街',
        location:point('八廓街实际街巷与拟拍摄位置'),
        venue:venue('conditional','老城人群与周边文物场地待核实','未取得街巷实际点位的空域或管理许可；拉萨公安材料不能代替此处逐点确认。',['lhasa']),
        conclusion:'本次不安排航拍，慢走与地面拍摄。',action:'不飞越街巷人群，不打扰转经和居民生活；拍摄人物先征得同意。'}),
      row({id:'drone-d12-transfer',day:'D12',date:'2026-10-07',spotKey:null,place:'拉萨市区 → 贡嘎机场',
        location:point('酒店至还车点、贡嘎机场返程路线'),
        venue:venue('restricted','机场公布范围未经许可不得飞','返程涉及机场相关管控区域；市区及途中其他位置须另查，不代表整条路线统一禁飞。',['airportLhasa','airportShannan']),
        conclusion:'不安排航拍，只作返程。',action:'不在还车、加油或候机期间临时起飞，按还车和航班时间前往机场。'})
    ]
  };
  // Only live UOM observations can upgrade a row; venue rules never supply a color.
  const evidence=window.TIBET_DRONE_EVIDENCE||{};
  if(evidence.legend)window.TIBET_DRONE.legend={...window.TIBET_DRONE.legend,...evidence.legend};
  const colorsVerified=window.TIBET_DRONE.legend.colorsVerified===true;
  const complete=observation=>['blue','white','mixed'].includes(observation?.status)
    && typeof observation.queryText==='string'&&observation.queryText.trim()
    && typeof observation.matchedResult==='string'&&observation.matchedResult.trim()
    && Number.isFinite(observation.zoom)&&observation.zoom>=9
    && typeof observation.observedAt==='string'&&Number.isFinite(Date.parse(observation.observedAt))
    && typeof observation.note==='string'&&observation.note.trim();
  const observations=new Map((evidence.observations||[]).map(observation=>[observation.rowId,observation]));
  const labels={blue:'UOM 蓝区',white:'UOM 白区',mixed:'蓝白交界 / 范围混合'};
  window.TIBET_DRONE.rows=window.TIBET_DRONE.rows.map(item=>{
    const observation=observations.get(item.id);
    if(!observation)return item;
    const colorVerified=colorsVerified&&Boolean(complete(observation));
    const {attempt:previousAttempt,...previousUom}=item.uom;
    return {...item,uom:{...previousUom,observation,colorVerified,
      status:colorVerified?observation.status:'unverified',
      label:colorVerified?labels[observation.status]:observation.status==='unverified'?'已尝试查询 · 点位待确认':'观察证据不完整 · 颜色待核验',
      checkedAt:colorVerified?observation.observedAt:'',
      detail:colorVerified?'仅为搜索匹配点的 UOM 页面实见颜色；白区不自动等同法定管制区或可飞区，实际起飞点及飞行范围仍待确认。':observation.status==='unverified'?'已在 UOM 尝试查询，但未确认对应行程点位及颜色；尝试日期不是成功核验日期，不纳入颜色已核验数量。':'未满足清晰点位、图层与查询记录的完整核验条件，暂不判定颜色。',
      sources:observation.sources?.length?observation.sources:[sources.uom]
    }};
  });
})();
