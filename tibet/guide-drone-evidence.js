/* 仅记录浏览器中实际观察到的 UOM 搜索点颜色，不代表整景区或起飞许可。 */
window.TIBET_DRONE_EVIDENCE = {
  legend: {
    colorsVerified: true,
    observedAt: '2026-09-24',
    note: 'UOM 页面蓝色色块图例为“适飞空域（地图放大至9级及以上显示）”。本表“白区”仅描述查询标记处未见蓝色空域覆盖，不将河湖底图蓝色当作空域，不根据颜色自行认定飞行许可。',
    sources: [{title:'UOM 空域信息查询页面（已登录实查）',url:'https://uom.caac.gov.cn/#/main'}]
  },
  observations: [
    {rowId:'drone-d0-transfer',status:'white',queryText:'拉萨贡嘎国际机场',matchedResult:'拉萨贡嘎国际机场 西藏自治区山南市贡嘎县',zoom:12,observedAt:'2026-09-25',note:'15 级标记位于机场航站区，缩至 12 级后外围西北、东北及南侧蓝色网格和边界清晰，机场搜索标记处为白色未覆盖区域。仅记录抵达端机场参考点，不代表机场至拉萨整段转场道路，也不以白色取代机场法定管制要求。'},
    {rowId:'drone-d12-transfer',status:'white',queryText:'拉萨贡嘎国际机场',matchedResult:'拉萨贡嘎国际机场 西藏自治区山南市贡嘎县',zoom:12,observedAt:'2026-09-25',note:'返程复用同次机场 POI 观察：15 级定位航站区，12 级外围蓝色网格加载完整，机场标记处无蓝色覆盖。此为 09.25 的出行前快照，不是 10.07 当天已核验；不概括还车、加油及市区至机场全部路线。'},
    {rowId:'drone-barkhor',status:'white',queryText:'八廓街',matchedResult:'八廓街 西藏自治区拉萨市城关区（首个同名候选）',zoom:12,observedAt:'2026-09-24',note:'15 级地图定位于大昭寺西北侧街区，再缩至 12 级核对；旧会话色块未加载，刷新并重新进入空域查询后，北侧及南侧蓝色网格恢复，街区红色标记位于白色区域。仅代表街区 POI，不概括所有街巷或准入许可。'},
    {rowId:'drone-jokhang',status:'white',queryText:'大昭寺',matchedResult:'大昭寺 西藏自治区拉萨市城关区',zoom:15,observedAt:'2026-09-24',note:'15 级地图红色标记位于大昭寺，未见蓝色空域覆盖；同轮已在拉萨 12 级地图核对城区外围蓝色边界。仅为该寺院 POI 的页面颜色，不能视为文物区或宗教场所的飞行许可。'},
    {rowId:'drone-potala',status:'white',queryText:'布达拉宫',matchedResult:'布达拉宫 西藏自治区拉萨市城关区',zoom:12,observedAt:'2026-09-24',note:'先在 15 级核对红色标记位于布达拉宫，再缩至 12 级复核；标记处未见蓝色覆盖，城区外围北侧与南侧蓝色网格及边界清晰，图层已加载。仅为该 POI 颜色，不代表文物区准入或飞行许可。'},
    {rowId:'drone-elephant',status:'unverified',queryText:'圣象天门；圣象；纳木错圣象天门；西藏纳木措自然保护区圣象天门',matchedResult:'完整景点名称无匹配；简称仅返回外省同名商家',observedAt:'2026-09-25',note:'09.25 按独立地图条目补查“西藏纳木措自然保护区圣象天门”，仍无候选。没有选中位于班戈县的准确位置，不能沿用纳木措南岸扎西岛结果判断北岸景点。保留待核验。'},
    {rowId:'drone-namtso',status:'blue',queryText:'扎西岛',matchedResult:'扎西岛下拉康 西藏自治区拉萨市当雄县',zoom:15,observedAt:'2026-09-24',note:'纳木措同名候选无法确定入口，故另查明确的扎西岛下拉康地标作为参考。红色标记位于扎西半岛陆地，蓝色空域网格覆盖陆地与周边湖面。该结果仅限此地标，不代表当日开放观景区、其他湖岸或寺院准入，实际机位仍待确认。'},
    {rowId:'drone-malang',status:'unverified',queryText:'玛朗峡谷；玛朗观景台；玛朗峡谷观景台',matchedResult:'玛朗观景台无匹配；峡谷观景台全名查询尚未完成复核',observedAt:'2026-09-25',note:'“玛朗观景台”未显示候选；补查“玛朗峡谷观景台”后系统报告 Mac 锁定，无法完成结果复核。没有选中准确观景平台，不能读取颜色，也不采用札达或改则的“玛朗”裸名居民点代替。'},
    {rowId:'drone-siling',status:'unverified',queryText:'色林措；色林错；色林错观景台；色林措观景台',matchedResult:'只有跨双湖、申扎、班戈的多个同名湖泊点及保护区管理机构，未找到观景台',observedAt:'2026-09-24',note:'“色林措”主要返回保护区管理分局；“色林错”返回多个不同县域的同名湖泊点。两种观景台拼写均无匹配。行程未明确岸边机位，不任选湖心或管理机构代替，颜色待核验。'},
    {rowId:'drone-wenbu',status:'unverified',queryText:'文布南村；文部南村；文布；文部；当惹雍错；文布南；文部乡南村；文部寺；雍忠桑丹林寺',matchedResult:'未找到明确的南村或寺院候选；“文部”与多个同名湖泊点不能区分南村',observedAt:'2026-09-25',note:'09.25 按文旅部资料补查村名和寺院名称，均无匹配；“文部”仍仅返回尼玛县裸名、乡政府等候选，“当惹雍错”此前返回八个无法区分的同名点。未用乡政府或湖中心代替文布南村实际观景位置，颜色待核验。'},
    {rowId:'drone-zhari',status:'unverified',queryText:'扎日南木措；扎日南木措观景台；扎日南木措北岸观景台；扎日南木错北岸观景台',matchedResult:'原“景区”两候选不能对应北岸；两种北岸观景台完整名称均无匹配',observedAt:'2026-09-25',note:'09.24 两个“景区”候选分别落在湖面与措勤县城，均不是已确认的北岸观景点；09.25 按独立地图条目尝试“措／错”两种北岸观景台完整名称，UOM 均未显示候选。不能用湖面或县城代替，颜色保留待核验。'},
    {rowId:'drone-tree',status:'unverified',queryText:'确登村；大地之树',matchedResult:'确登村 西藏自治区阿里地区改则县；大地之树无匹配',observedAt:'2026-09-24',note:'确登村候选的 G216 旁红色标记在 15 级地图显示蓝色覆盖，但村庄 POI 不是已确认的“大地之树”拍摄机位。“大地之树”未显示匹配，故此景点颜色仍待核验，不用村庄蓝区代替。'},
    {rowId:'drone-gaize',status:'white',queryText:'改则县',matchedResult:'改则县 西藏自治区阿里地区改则县',zoom:15,observedAt:'2026-09-24',note:'红色搜索标记位于县城北部白色矩形区域，四周蓝色空域网格及边界清晰可见。仅记录县城 POI，不能概括整个县城或改则县行政范围。'},
    {rowId:'drone-wuma',status:'blue',queryText:'物玛错',matchedResult:'物玛错 西藏自治区阿里地区改则县',zoom:15,observedAt:'2026-09-24',note:'“物玛措”无匹配后改搜“物玛错”；红色标记位于 G317 南侧湖面，蓝色空域覆盖连续延伸到周边陆地。仅为湖泊 POI 参考点，不代表尚未选定的岸边起飞点或整个湖区。'},
    {rowId:'drone-shiquanhe',status:'white',queryText:'狮泉河镇',matchedResult:'狮泉河镇 西藏自治区阿里地区噶尔县',zoom:11,observedAt:'2026-09-24',note:'镇区红色搜索标记处未见蓝色空域覆盖；连续核对 15、13、12、11 级地图均为白底，11 级西南侧可见蓝色网格边界，确认图层有加载。仅代表镇区参考点，不外推至整个噶尔县。'},
    {rowId:'drone-xiayigou',status:'blue',queryText:'霞义沟',matchedResult:'霞义沟景区游客服务中心 西藏自治区阿里地区札达县',zoom:15,observedAt:'2026-09-24',note:'S302 旁游客服务中心红色标记位于蓝色覆盖内；东侧可见白色边界。此为景区入口参考点，沟内其他观景台及飞行范围需另核。'},
    {rowId:'drone-guge',status:'blue',queryText:'古格王国遗址',matchedResult:'古格王国遗址 西藏自治区阿里地区札达县',zoom:15,observedAt:'2026-09-24',note:'遗址搜索标记处显示蓝色网格覆盖，北侧波林村与河谷附近可见白色区域边界；不外推至全部文物范围或景区出入口。'},
    {rowId:'drone-rakshastal',status:'blue',queryText:'拉昂错',matchedResult:'拉昂错 西藏自治区阿里地区普兰县（首个同名结果）',zoom:15,observedAt:'2026-09-24',note:'搜索点位于湖北部水面，蓝色网格连续覆盖湖面与周围陆地。此为湖泊 POI 参考点，不能代替尚未确定的岸边起飞点，也不代表全湖范围。'},
    {rowId:'drone-manasarovar',status:'blue',queryText:'玛旁雍错',matchedResult:'玛旁雍错游客中心 西藏自治区阿里地区普兰县',zoom:15,observedAt:'2026-09-24',note:'采用已收录的游客中心作为明确参考点：G219 旁红色标记处显示蓝色网格覆盖。不是整湖结论，不能代替本次实际湖岸起飞点。'},
    {rowId:'drone-xilin',status:'blue',queryText:'洛子峰观景台',matchedResult:'洛子峰观景台 西藏自治区日喀则市定结县',zoom:15,observedAt:'2026-09-25',note:'西林观景台完整名称未匹配，按公开资料的别名线索改查洛子峰观景台。15 级红色标记位于 G219 与 S303 路口附近，陆地及道路上可见连续蓝色空域网格。此为别名候选参考点，不将其自动等同于实际停车平台或起飞机位。'},
    {rowId:'drone-peiku',status:'blue',queryText:'佩枯措',matchedResult:'佩枯措观景台 西藏自治区日喀则市聂拉木县',zoom:15,observedAt:'2026-09-24',note:'搜索落在湖东岸道路旁观景台，红色标记处陆地区域为蓝色覆盖；与湖面底图蓝色区分读取。不代表整湖或其他岸线。'},
    {rowId:'drone-castle',status:'unverified',queryText:'东巴古堡；珠峰古堡；珠峰古堡遗址',matchedResult:'未显示匹配候选',observedAt:'2026-09-25',note:'09.25 按官方保护报道补查“珠峰古堡遗址”全名，仍无候选，不能读取遗址本身颜色。公开资料指向岗嘎镇东巴村，但未用村庄、宾馆或其他古堡点代替遗址。'},
    {rowId:'drone-everest',status:'blue',queryText:'珠峰大本营',matchedResult:'珠峰大本营 西藏自治区日喀则市定日县',zoom:15,observedAt:'2026-09-24',note:'UOM 同名搜索标记位于蓝色网格内，西侧与西南侧紧邻白色区域；仅记录该 POI，不将其等同于当日开放游客区或允许飞越的范围。'},
    {rowId:'drone-gyawula',status:'blue',queryText:'加吾拉',matchedResult:'加吾拉 西藏自治区日喀则市定日县',zoom:15,observedAt:'2026-09-24',note:'加乌拉山口异写候选；UOM 红色标记位于 S515 珠峰路连续盘山弯道，标记处显示蓝色网格覆盖。仅核验此山口搜索点，实际停车平台仍须对应。'},
    {rowId:'drone-lurila',status:'blue',queryText:'鲁日拉观景台',matchedResult:'鲁日拉观景台 西藏自治区山南市浪卡子县',zoom:15,observedAt:'2026-09-24',note:'搜索标记落在蓝色网格覆盖内，西南侧可见白色未覆盖边界；仅对搜索标记处作颜色记录，不代表整个羊湖沿线。'},
    {rowId:'drone-karola',status:'blue',queryText:'卡若拉冰川',matchedResult:'卡若拉冰川景区 西藏自治区日喀则市江孜县',zoom:15,observedAt:'2026-09-24',note:'选择景区候选后，G349 道路旁红色标记处与周围显示蓝色空域覆盖。首帧曾为白底，待图层加载后复核为蓝区。'}
  ]
};
