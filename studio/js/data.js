/* ==========================================================================
 * AI 短剧工作台 · 页面数据
 * --------------------------------------------------------------------------
 * 这个文件只放「内容」：下拉选项、提示词模板、筛选项、示例作品。
 * 改文案、加作品、换提示词，只需要动这里；交互逻辑在 app.js。
 *
 * - 提示词以《漫剧制作零基础教程》附录 D（D1–D7）为底稿：【】里的空换成
 *   页面上填写 / 选择的内容；D1 多了一行可选的「方向参考」，D4 多了一行题材说明。
 * - 作品（标题、作者、数字）全部是虚构的示例数据；封面 10 张是 AI 生成的原创插画，
 *   另外 3 张（樱雨照归人 / 他从顶楼往下看 / 第 404 号直播间）取自本仓库 tutorial/assets/。
 * ========================================================================== */
(function () {
  'use strict';

  /** 教程 2.2 的单集结构：3 秒钩子 + 1/4 铺垫 + 1/2 冲突 + 1/4 反转 */
  function structure(seconds) {
    var quarter = Math.round(seconds / 4);
    var half = Math.round(seconds / 2);
    return '3秒钩子+' + quarter + '秒铺垫+' + half + '秒冲突+' + quarter + '秒反转/悬念';
  }

  var RATIO_TEXT = { '9:16': '竖屏 9:16', '16:9': '横屏 16:9', '1:1': '方形 1:1', '3:4': '竖图 3:4' };

  /** 分镜 / 配音两个环节的「示例台词稿」（人物沿用教程 4.3 的陆沉） */
  var SAMPLE_SCRIPT = [
    '0-3 秒｜雨夜，写字楼大堂｜（冷笑）一个送外卖的，也配进这栋楼？｜雷声',
    '3-30 秒｜陆沉低头擦掉头盔上的雨水｜（平静）我来取一份文件。｜雨声渐弱',
    '30-90 秒｜保安伸手拦人，大堂经理一路小跑过来鞠躬｜（惊慌）陆总，您怎么亲自来了！｜重音鼓点',
    '90-120 秒｜陆沉抬头看向顶楼的灯光｜（低声）从今天起，不用再瞒了。｜BGM 推高，黑屏'
  ].join('\n');

  window.STUDIO_DATA = {
    tutorialUrl: '../tutorial/index.html',
    doubaoUrl: 'https://www.doubao.com/',

    /* ---------- 下拉选项 ---------- */
    options: {
      genre: [
        { value: '古风甜宠', label: '古风甜宠', hint: '新手推荐' },
        { value: '都市逆袭', label: '都市逆袭', hint: '新手推荐' },
        { value: '霸总虐恋', label: '霸总虐恋', hint: '新手推荐' },
        { value: '悬疑恐怖', label: '悬疑恐怖', hint: '新手推荐' },
        { value: '校园青春', label: '校园青春', hint: '新手推荐' },
        { value: '都市甜宠', label: '都市甜宠' },
        { value: '科幻冒险', label: '科幻冒险' }
      ],
      ratio: [
        { value: '9:16', label: '9:16 竖屏', short: '9:16', hint: '短视频平台' },
        { value: '16:9', label: '16:9 横屏', short: '16:9', hint: '长视频平台' },
        { value: '1:1', label: '1:1 方形', short: '1:1' },
        { value: '3:4', label: '3:4 竖图', short: '3:4' }
      ],
      duration: [
        { value: 60, label: '60 秒', hint: '约 150 字台词' },
        { value: 120, label: '120 秒', hint: '教程默认' },
        { value: 180, label: '180 秒', hint: '约 400 字台词' }
      ],
      sort: [
        { value: 'new', label: '最新发布' },
        { value: 'hot', label: '最多点赞' }
      ]
    },
    defaults: { mode: 'script', genre: '都市逆袭', ratio: '9:16', duration: 120, sort: 'new' },

    /* ---------- 提示词生成器的 7 个环节 ----------
     * opts        这个环节用到哪些下拉选项
     * max         输入框字数上限
     * allowEmpty  允许不填直接生成
     * placeholders 打字机占位示例（长文本环节用 placeholder 单句）
     * suggestions 输入框下方的示例；value 为点击后填入的内容
     * blanks      模板里仍需用户到豆包里自己补的【空】（结果里会高亮并提示）
     * build(p)    p = { text, genre, ratio, duration }，返回最终提示词
     * next        生成后引导去的下一个环节
     */
    modes: [
      {
        id: 'topic', label: '选题', icon: 'i-spark', ref: 'D1',
        chapter: 2, chapterTitle: '选题与剧本',
        field: '方向或关键词（可以留空，只选题材）',
        opts: ['genre'], max: 200, allowEmpty: true,
        placeholders: ['外卖小哥其实是隐藏大佬', '深夜直播间里出现了禁忌规则', '穿越成王府里的小医女'],
        suggestions: [
          { label: '外卖小哥其实是隐藏大佬' },
          { label: '深夜直播间的禁忌规则' },
          { label: '穿越成王府里的小医女' }
        ],
        build: function (p) {
          var lines = ['你是短剧策划。我打算做竖屏漫剧，请给我 5 个「' + p.genre + '」选题，每个包含：一句话梗概、目标人群、3 秒钩子台词。要求身份反差+悬念+情绪。'];
          if (p.text) lines.push('方向参考：' + p.text);
          return lines.join('\n');
        },
        next: 'script', nextText: '挑一个选题，去写剧本'
      },
      {
        id: 'script', label: '剧本', icon: 'i-script', ref: 'D2',
        chapter: 2, chapterTitle: '选题与剧本',
        field: '一句话梗概',
        opts: ['genre', 'duration'], max: 300,
        emptyMessage: '先写一句话梗概，再生成提示词。',
        placeholders: [
          '被赶出家门的上门女婿，其实是整栋楼的业主',
          '探险女主播的直播间，在线人数永远停在 404',
          '逃婚的小郡主在灯会上遇到了自己的未婚夫'
        ],
        suggestions: [
          { label: '上门女婿其实是整栋楼的业主', value: '被赶出家门的上门女婿，其实是整栋写字楼的业主，当晚他决定不再隐瞒身份' },
          { label: '在线人数永远停在 404', value: '探险女主播深夜在废弃医院直播，在线人数永远停在 404，弹幕开始发来只有她能看到的规则' },
          { label: '逃婚郡主遇到未婚夫', value: '逃婚的小郡主在上元灯会弄丢了兔子灯，捡到灯的正是她要逃的那位未婚夫，两人都没认出对方' }
        ],
        build: function (p) {
          return [
            '你是一名竖屏漫剧编剧。请为我写第 1 集剧本，要求：',
            '1. 题材：' + p.genre + '；一句话梗概：' + p.text + '；',
            '2. 时长 ' + p.duration + ' 秒，按「' + structure(p.duration) + '」结构；',
            '3. 先给 200 字大纲，再给台词表（时间|画面/动作|台词|音效/BGM 四列）；',
            '4. 每句台词不超过 15 字，旁白不超过 3 句，台词前标注情绪；',
            '5. 结尾必须留钩子（悬念/反转/危机三选一）。'
          ].join('\n');
        },
        next: 'storyboard', nextText: '拿到台词稿后，去拆分镜'
      },
      {
        id: 'storyboard', label: '分镜', icon: 'i-frames', ref: 'D3',
        chapter: 3, chapterTitle: '分镜脚本',
        field: '粘贴剧本 / 台词稿',
        opts: [], max: 3000,
        emptyMessage: '先把豆包写好的台词稿粘贴进来。',
        placeholder: '把上一步豆包输出的台词稿粘贴到这里…',
        suggestions: [{ label: '填入示例台词稿', value: SAMPLE_SCRIPT }],
        build: function (p) {
          return [
            '你是漫剧分镜师。请把我下面的剧本拆成分镜表，要求：',
            '1. 严格输出 6 列表格：镜号|景别|画面内容|镜头运动|台词/音效|时长；',
            '2. 每镜 2-6 秒，一集 6-10 镜，连续 3 镜不重复景别；',
            '3. 对话用中景/近景，情绪用特写，环境用远景；',
            '4. 第 1 镜必须是钩子，最后 1 镜必须留钩子。',
            '剧本：',
            p.text
          ].join('\n');
        },
        next: 'character', nextText: '分镜有了，去做角色设定'
      },
      {
        id: 'character', label: '角色', icon: 'i-user', ref: 'D4',
        chapter: 4, chapterTitle: '角色与场景设计',
        field: '角色姓名 + 身份，一句话',
        opts: ['genre'], max: 200,
        emptyMessage: '先写角色的姓名和身份。',
        placeholders: ['陆沉，隐藏身份的集团继承人', '沈清辞，现代外科医生穿越成的王妃', '小北，胆子不大的探灵主播'],
        suggestions: [
          { label: '陆沉 · 集团继承人', value: '陆沉，隐藏身份的集团继承人，28 岁' },
          { label: '沈清辞 · 穿越王妃', value: '沈清辞，现代外科医生穿越成的王妃，25 岁' },
          { label: '小北 · 探灵主播', value: '小北，探灵主播，22 岁，直播设备齐全' }
        ],
        build: function (p) {
          return [
            '你是漫剧角色设计师。请为角色「' + p.text + '」输出：',
            '1. 设定卡：外貌（含识别点）、服装、3 个主色（含色号）、表情包 4 个；',
            '2. 一段可直接发给豆包生图的提示词（含三视图、白色背景、画风标签）。',
            '题材是' + p.genre + '，画风请与题材保持一致。'
          ].join('\n');
        },
        next: 'scene', nextText: '角色定了，去出场景图'
      },
      {
        id: 'scene', label: '场景', icon: 'i-scene', ref: 'D5',
        chapter: 4, chapterTitle: '角色与场景设计',
        field: '场景名称',
        opts: ['ratio'], max: 200, blanks: ['【贴画风标签】'],
        emptyMessage: '先写一个场景名称。',
        placeholders: ['王府后花园，月夜，海棠花开', '城市天台，深夜，远处是霓虹天际线', '废弃医院走廊，应急灯闪烁'],
        suggestions: [
          { label: '王府后花园 · 月夜' , value: '王府后花园，月夜，海棠花开' },
          { label: '城市天台 · 深夜', value: '城市天台，深夜，远处是霓虹天际线' },
          { label: '废弃医院走廊', value: '废弃医院走廊，应急灯闪烁' }
        ],
        build: function (p) {
          return '给我生成场景图提示词：' + p.text + '，空镜无人物，' + (RATIO_TEXT[p.ratio] || p.ratio) +
            '，电影感光影，画风与角色设定统一（【贴画风标签】）。';
        },
        next: 'dubbing', nextText: '画面齐了，去写配音稿'
      },
      {
        id: 'dubbing', label: '配音', icon: 'i-mic', ref: 'D6',
        chapter: 5, chapterTitle: '配音与音效',
        field: '粘贴台词表',
        opts: [], max: 3000,
        emptyMessage: '先把台词表粘贴进来。',
        placeholder: '把台词表粘贴到这里…',
        suggestions: [{ label: '填入示例台词表', value: SAMPLE_SCRIPT }],
        build: function (p) {
          return [
            '请把下面台词表改写成配音稿：每句前用括号标注情绪和语速（如（愤怒·快）），用「……」标停顿，按镜号分段，方便逐段生成配音。',
            '台词表：',
            p.text
          ].join('\n');
        },
        next: 'publish', nextText: '成片剪好后，去写标题封面'
      },
      {
        id: 'publish', label: '发布', icon: 'i-send', ref: 'D7',
        chapter: 8, chapterTitle: '发布与运营',
        field: '一句话梗概',
        opts: ['genre'], max: 300,
        emptyMessage: '先写一句话梗概。',
        placeholders: [
          '被赶出家门的上门女婿，其实是整栋楼的业主',
          '探险女主播的直播间，在线人数永远停在 404'
        ],
        suggestions: [
          { label: '上门女婿其实是整栋楼的业主', value: '被赶出家门的上门女婿，其实是整栋写字楼的业主' },
          { label: '在线人数永远停在 404', value: '探险女主播深夜直播，在线人数永远停在 404' }
        ],
        build: function (p) {
          return '你是短视频运营。为这条漫剧写 5 个标题（15 字内，含冲突/悬念）、3 版封面大字（3-6 个字）、1 条简介（含话题标签）。题材：' +
            p.genre + '；一句话梗概：' + p.text + '。';
        },
        next: null, nextText: ''
      }
    ],

    /* ---------- 30 天学习计划（教程 10.2） ---------- */
    plan: [
      { from: 1, to: 7, name: '入门期', task: '学豆包提示词和剪映基础，写 3 个剧本大纲' },
      { from: 8, to: 21, name: '实战期', task: '按教程做 3 个完整案例（甜宠→逆袭→悬疑）' },
      { from: 22, to: 30, name: '进阶期', task: '做 1 条进阶漫剧，复盘数据' }
    ],

    /* ---------- 作品筛选 ---------- */
    filters: [
      { id: 'all', label: '全部' },
      { id: 'ancient', label: '古风' },
      { id: 'urban', label: '都市' },
      { id: 'mystery', label: '悬疑' },
      { id: 'sweet', label: '甜宠' },
      { id: 'scifi', label: '科幻' }
    ],

    /* ---------- 预览动效（对应教程 6.1「推拉镜头」和分镜里的摇镜） ---------- */
    motions: {
      push: { label: '推镜', frames: [{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }] },
      pull: { label: '拉镜', frames: [{ transform: 'scale(1.16)' }, { transform: 'scale(1)' }] },
      panLeft: { label: '左摇', frames: [{ transform: 'scale(1.14) translateX(4.5%)' }, { transform: 'scale(1.14) translateX(-4.5%)' }] },
      panRight: { label: '右摇', frames: [{ transform: 'scale(1.14) translateX(-4.5%)' }, { transform: 'scale(1.14) translateX(4.5%)' }] },
      tiltUp: { label: '上摇', frames: [{ transform: 'scale(1.14) translateY(-4.5%)' }, { transform: 'scale(1.14) translateY(4.5%)' }] }
    },

    /* ---------- 示例作品（虚构数据） ----------
     * src     卡片封面（720 / 960 宽）；large 预览弹层里换上的大图（可省略）
     * w / h   封面像素尺寸，用来在加载前占位，避免布局抖动
     * tone    图片平均色，作为加载占位底色
     * seconds 时长（秒）；lines 预览时依次出现的字幕
     * idea    「做同款」时填进提示词生成器的一句话创意；composerGenre 同时选中的题材
     */
    works: [
      {
        id: 'boardroom', title: '实习生今天接管董事会', author: '钢笔与咖啡', genre: 'urban',
        src: 'assets/works/rise-boardroom.jpg', large: 'assets/works/large/rise-boardroom.jpg', w: 960, h: 644, tone: '#6b656a',
        alt: '推开会议室玻璃门的白色西装女子，会议桌旁的高管纷纷回头',
        likes: 6203, views: 158000, seconds: 126, date: '2026-11-10',
        tags: ['逆袭', '职场'],
        desc: '被当众辞退的实习生，第二天以最大股东的身份回来开会。',
        idea: '被部门主管当众辞退的实习生，第二天推开董事会的门——她是刚完成收购的最大股东',
        composerGenre: '都市逆袭', motion: 'push',
        lines: ['「谁让实习生进来的？」', '「从今天起，这个会由我来开。」', '会议室里，没有人再出声。']
      },
      {
        id: 'umbrella', title: '便利店的第七把伞', author: '半糖去冰', genre: 'sweet',
        src: 'assets/works/sweet-umbrella.jpg', large: 'assets/works/large/sweet-umbrella.jpg', w: 720, h: 964, tone: '#65504b',
        alt: '雨夜便利店门口共撑一把透明伞的年轻男女',
        likes: 4410, views: 96000, seconds: 82, date: '2026-11-09',
        tags: ['都市', '日常'],
        desc: '她每次下雨都忘带伞，他每次都说这是店里最后一把。',
        idea: '夜班便利店店员每次下雨都借伞给同一个女孩，第七把伞的伞柄上刻着他没说出口的话',
        composerGenre: '都市甜宠', motion: 'pull',
        lines: ['「又没带伞？」', '「你们店的伞，怎么总是最后一把。」', '第七把伞，伞柄上多了一行小字。']
      },
      {
        id: 'blossom', title: '樱雨照归人', author: '栀子青', genre: 'ancient',
        src: 'assets/works/ancient-blossom.jpg', large: '../tutorial/assets/hero-manhua.jpg', w: 720, h: 1279, tone: '#927d85',
        alt: '樱花树下并肩而立的古装男女',
        likes: 2841, views: 52000, seconds: 96, date: '2026-11-08',
        tags: ['甜宠', '重逢'],
        desc: '失忆的小医女在樱花树下，没认出三年前救过的将军。',
        idea: '失忆的小医女在樱花树下重逢三年前救过的冷面将军，他认得她，她却把他当成陌生人',
        composerGenre: '古风甜宠', motion: 'push',
        lines: ['「姑娘，我们见过。」', '「将军认错人了。」', '花落在她发间，他没有再说话。']
      },
      {
        id: 'door704', title: '七楼没有 704', author: '楼道灯', genre: 'mystery',
        src: 'assets/works/mystery-stairwell.jpg', large: 'assets/works/large/mystery-stairwell.jpg', w: 720, h: 1073, tone: '#342c1d',
        alt: '背着书包的女孩站在老旧楼道里，尽头有一扇透出红光的门',
        likes: 4875, views: 109000, seconds: 92, date: '2026-11-07',
        tags: ['规则怪谈', '都市传说'],
        desc: '房东说七楼只有三户，可她每晚回家都要经过第四扇门。',
        idea: '刚搬进老小区的女孩发现七楼多出一扇红门，房东说这层只有三户，邻居们却都劝她别敲门',
        composerGenre: '悬疑恐怖', motion: 'push',
        lines: ['「七楼只有三户。」', '「那这扇门，是谁家的？」', '门缝里的光，闪了一下。']
      },
      {
        id: 'redline', title: '红线尽头', author: '雾港', genre: 'mystery',
        src: 'assets/works/mystery-board.jpg', large: 'assets/works/large/mystery-board.jpg', w: 960, h: 644, tone: '#2d3935',
        alt: '昏暗办公室里用手电照向线索墙的风衣侦探背影',
        likes: 3318, views: 72000, seconds: 110, date: '2026-11-06',
        tags: ['刑侦', '反转'],
        desc: '线索墙上的每根红线，最后都连向同一个人：他自己。',
        idea: '失眠的老侦探重查十年前的悬案，线索墙上所有红线最终都指向同一张照片——年轻时的他自己',
        composerGenre: '悬疑恐怖', motion: 'panRight',
        lines: ['「十年了，还是这面墙。」', '「这根线……不该连到这里。」', '照片上的人，是他自己。']
      },
      {
        id: 'rooftop', title: '他从顶楼往下看', author: '北纬三十度', genre: 'urban',
        src: 'assets/works/rise-rooftop.jpg', large: '../tutorial/assets/urban-revenge.jpg', w: 720, h: 1279, tone: '#292d4d',
        alt: '夜色中站在天台俯瞰城市的西装男子',
        likes: 5127, views: 131000, seconds: 118, date: '2026-11-05',
        tags: ['逆袭', '身份反转'],
        desc: '被赶出家门的那一晚，整栋楼的产权证上写着他的名字。',
        idea: '被赶出家门的上门女婿，其实是整栋写字楼的业主，当晚他站在天台决定不再隐瞒身份',
        composerGenre: '都市逆袭', motion: 'tiltUp',
        lines: ['「你一个送外卖的，也配进这栋楼？」', '「这栋楼，是我的。」', '夜风很大，他第一次没有低头。']
      },
      {
        id: 'lantern', title: '上元灯下', author: '糯米团子', genre: 'ancient',
        src: 'assets/works/ancient-lantern.jpg', large: 'assets/works/large/ancient-lantern.jpg', w: 720, h: 1073, tone: '#814a38',
        alt: '元宵灯会上手提兔子灯回眸微笑的红衣女子',
        likes: 5632, views: 124000, seconds: 88, date: '2026-11-04',
        tags: ['甜宠', '灯会'],
        desc: '她在灯会上弄丢了兔子灯，捡到灯的人顺手把她也带回了家。',
        idea: '逃婚的小郡主在上元灯会弄丢了兔子灯，捡到灯的正是她要逃的那位未婚夫，两人都没认出对方',
        composerGenre: '古风甜宠', motion: 'push',
        lines: ['「这盏灯，是姑娘的吗？」', '「是我的。……你是谁？」', '烟花在河面上炸开。']
      },
      {
        id: 'live404', title: '第 404 号直播间', author: '夜班编辑', genre: 'mystery',
        src: 'assets/works/mystery-live.jpg', large: '../tutorial/assets/horror-live.jpg', w: 720, h: 1279, tone: '#192226',
        alt: '手持补光灯在废弃医院走廊里回头的女主播',
        likes: 3962, views: 87000, seconds: 104, date: '2026-11-02',
        tags: ['直播', '规则怪谈'],
        desc: '直播间人数停在 404，弹幕却在提醒她：别回头。',
        idea: '探险女主播深夜在废弃医院直播，在线人数永远停在 404，弹幕开始发来只有她能看到的规则',
        composerGenre: '悬疑恐怖', motion: 'pull',
        lines: ['「家人们，这里什么都没有。」', '弹幕：别回头。', '走廊尽头，多了一个人影。']
      },
      {
        id: 'rustbelt', title: '锈带修理铺', author: '零件盒', genre: 'scifi',
        src: 'assets/works/scifi-mechanic.jpg', large: 'assets/works/large/scifi-mechanic.jpg', w: 720, h: 1073, tone: '#4a4565',
        alt: '霓虹雨巷里蹲着修理圆形小机器人的少女机械师',
        likes: 3077, views: 66000, seconds: 105, date: '2026-10-31',
        tags: ['赛博', '冒险'],
        desc: '她修好了一台报废的清洁机器人，它醒来的第一句话是：快跑。',
        idea: '贫民区的少女机械师修好一台报废机器人，它的记忆里藏着一段被全城通缉的影像',
        composerGenre: '科幻冒险', motion: 'pull',
        lines: ['「好了，再试一次开机。」', '机器人的眼睛亮了。', '「……快跑。」']
      },
      {
        id: 'rider', title: '凌晨五点的订单', author: '阿七不加班', genre: 'urban',
        src: 'assets/works/rise-rider.jpg', large: 'assets/works/large/rise-rider.jpg', w: 720, h: 1073, tone: '#425576',
        alt: '清晨站在电动车旁仰望摩天大楼的年轻骑手',
        likes: 2756, views: 61000, seconds: 98, date: '2026-10-30',
        tags: ['逆袭', '热血'],
        desc: '最后一单的收件地址，是他三年前被赶出来的那家公司。',
        idea: '创业失败的程序员改行送外卖，凌晨最后一单送到前公司楼下，取餐的人正是当年偷走他代码的合伙人',
        composerGenre: '都市逆袭', motion: 'tiltUp',
        lines: ['「您的订单已送达。」', '「……是你？」', '天亮了，他把头盔放回车上。']
      },
      {
        id: 'radio', title: '天台广播站', author: '夏屿', genre: 'sweet',
        src: 'assets/works/sweet-rooftop.jpg', large: 'assets/works/large/sweet-rooftop.jpg', w: 960, h: 644, tone: '#806269',
        alt: '夕阳下背靠背坐在学校天台分享耳机的两名学生',
        likes: 1984, views: 43000, seconds: 75, date: '2026-10-28',
        tags: ['校园', '暗恋'],
        desc: '午休的点歌台只有两个听众，其中一个是点歌的人。',
        idea: '校园广播站只剩两名成员，她每天匿名给他点同一首歌，毕业前最后一期他念出了点歌人的名字',
        composerGenre: '校园青春', motion: 'panLeft',
        lines: ['「今天还是那首歌。」', '「点歌的人，不留名字吗？」', '风把后半句吹散了。']
      },
      {
        id: 'snow', title: '雪岭听剑', author: '松间月', genre: 'ancient',
        src: 'assets/works/ancient-snowbridge.jpg', large: 'assets/works/large/ancient-snowbridge.jpg', w: 960, h: 644, tone: '#95a0ac',
        alt: '白色斗篷的女剑客独自走过雪山间的吊桥',
        likes: 3540, views: 78000, seconds: 100, date: '2026-10-26',
        tags: ['武侠', '大女主'],
        desc: '师门覆灭那年她十六岁。十年后独自回山，只为取回一把剑。',
        idea: '师门被灭十年后，隐姓埋名的女剑客独自回到雪岭旧址取剑，却发现山门前有人替她扫了十年的雪',
        composerGenre: '古风甜宠', motion: 'panLeft',
        lines: ['「十年了，这座桥还在。」', '风雪里，传来扫雪的声音。', '「你终于回来了。」']
      },
      {
        id: 'orbit', title: '轨道上的第 9 封信', author: '近地点', genre: 'scifi',
        src: 'assets/works/scifi-station.jpg', large: 'assets/works/large/scifi-station.jpg', w: 960, h: 644, tone: '#404856',
        alt: '空间站舷窗前漂浮的宇航员，窗外是日出中的蓝色星球，纸质信件飘在空中',
        likes: 2390, views: 51000, seconds: 94, date: '2026-10-24',
        tags: ['太空', '亲情'],
        desc: '通讯中断的第九天，她开始给地面写永远寄不出去的信。',
        idea: '空间站与地面失联后，唯一的宇航员每天手写一封寄不出的信，第九封写完时，舷窗外亮起了回应的灯光',
        composerGenre: '科幻冒险', motion: 'panRight',
        lines: ['「第九天，通讯仍未恢复。」', '她把信折好，松开了手。', '地平线上，有一盏灯亮了。']
      }
    ]
  };
})();
