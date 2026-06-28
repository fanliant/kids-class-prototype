// ─────────────────────────────────────────────────────────────────────────────
// WYLO Mock Data  v3.0
// Architecture: Subject → TeachingType → CourseStructure → PricingPlan → ClassOffering → EnrollmentSettings
// ─────────────────────────────────────────────────────────────────────────────

// ── Studio / Instructor profiles ─────────────────────────────────────────────
export const instructors = [
  {
    id: 'mira-piano',
    name: 'Mira Chen 钢琴工作室',
    category: '鋼琴',
    categoryIcon: 'piano',
    location: 'Bellevue, WA · Downtown',
    distanceMiles: 1.2,
    bio: '毕业于华盛顿大学音乐系，教学11年，专注4-14岁启蒙与进阶教学，RCM认证教师。',
    highlights: ['RCM认证教师', '小班/一对一教学', '每学期成果发表会', '11年教学经验'],
    rating: 4.9, reviewCount: 62, yearsExperience: 11,
    reviews: [
      { rating: 5, text: '孩子从完全不懂音乐到现在能弹简单曲子，Mira老师很有耐心！', author: '林妈妈' },
      { rating: 5, text: '课程安排很系统，孩子进步非常明显，强烈推荐！', author: '王爸爸' },
    ],
  },
  {
    id: 'david-swim',
    name: 'David Park 游泳教室',
    category: '游泳', categoryIcon: 'swim',
    location: 'Bellevue, WA · Eastgate', distanceMiles: 2.8,
    bio: '前国家级游泳运动员，执教8年，专注5-14岁青少年游泳技术与水安全教育。',
    highlights: ['前国家级运动员', '小班制教学', 'WSI认证', '水安全专家'],
    rating: 4.8, reviewCount: 41, yearsExperience: 8,
    reviews: [{ rating: 5, text: 'David老师让我孩子从怕水到爱游泳，太厉害了！', author: '陈妈妈' }],
  },
  {
    id: 'lily-chinese',
    name: 'Lily Wang 中文学堂',
    category: '中文', categoryIcon: 'chinese',
    location: 'Bellevue, WA · Crossroads', distanceMiles: 3.5,
    bio: '台湾师范大学中文系毕业，海外华裔中文教学10年。',
    highlights: ['专业中文教师', '趣味教学', '适合海外华裔', '10年教学经验'],
    rating: 4.9, reviewCount: 38, yearsExperience: 10,
    reviews: [{ rating: 5, text: 'Lily老师的课孩子超喜欢，中文进步很快！', author: '张妈妈' }],
  },

  // ── 新增机构 ───────────────────────────────────────────────────────────────
  {
    id: 'bella-violin',
    name: 'Bella Music 小提琴工作室',
    category: '小提琴',
    categoryIcon: 'piano',
    location: 'Bellevue, WA · Bel-Red', distanceMiles: 1.8,
    bio: '西雅图交响乐团前团员，专注铃木教学法，培育5-16岁小提琴学习者，学生多次获奖。',
    highlights: ['铃木教学法认证', '前交响乐团团员', '比赛备考专家', '英中双语教学'],
    rating: 4.8, reviewCount: 29, yearsExperience: 14,
    reviews: [
      { rating: 5, text: 'Bella老师教学有条理，我的孩子进步超快，已经拿到比赛名次！', author: '黄妈妈' },
      { rating: 5, text: '工作室环境很好，老师很专业，强烈推荐！', author: '吴爸爸' },
    ],
  },
  {
    id: 'coach-tony-soccer',
    name: 'Tony Garcia 足球训练营',
    category: '足球',
    categoryIcon: 'swim',
    location: 'Redmond, WA · Marymoor Park', distanceMiles: 4.2,
    bio: 'MLS青少年培训认证教练，专注6-15岁足球基础与竞技训练，强调团队合作与体能发展。',
    highlights: ['MLS认证教练', '户外大场地', '团队配合训练', '竞技队选拔'],
    rating: 4.7, reviewCount: 55, yearsExperience: 9,
    reviews: [
      { rating: 5, text: '孩子在这里不只学到踢球，还学到了团队精神！', author: '刘妈妈' },
      { rating: 4, text: 'Tony教练很有热情，孩子每次上完课都很开心。', author: '陈爸爸' },
    ],
  },
  {
    id: 'art-studio-emily',
    name: 'Emily Art Studio 儿童美术',
    category: '美术',
    categoryIcon: 'piano',
    location: 'Bellevue, WA · Factoria', distanceMiles: 3.1,
    bio: '波士顿美术学院毕业，专注儿童创意美术与素描，鼓励自由表达，启发艺术潜能。',
    highlights: ['美术学院毕业', '小班6人制', '多元媒材课程', '作品展览机会'],
    rating: 4.9, reviewCount: 47, yearsExperience: 7,
    reviews: [
      { rating: 5, text: '孩子以前不爱画画，现在每天回家都要画！Emily老师真的很有魔力。', author: '林妈妈' },
    ],
  },
  {
    id: 'code-kids-bellevue',
    name: 'CodeKids Bellevue 少儿编程',
    category: '编程',
    categoryIcon: 'piano',
    location: 'Bellevue, WA · Downtown', distanceMiles: 1.5,
    bio: '前微软工程师创办，专注7-14岁Scratch、Python、游戏开发教学，寓学于乐，培养逻辑思维。',
    highlights: ['前微软工程师', 'Scratch / Python', '游戏开发课程', '作品发布展示'],
    rating: 4.8, reviewCount: 33, yearsExperience: 5,
    reviews: [
      { rating: 5, text: '孩子学完Scratch，自己做了个小游戏！老师讲解很清楚。', author: '赵妈妈' },
      { rating: 5, text: '课程内容很有趣，不是枯燥地背命令，真正让孩子爱上编程。', author: '张爸爸' },
    ],
  },
  {
    id: 'dance-studio-grace',
    name: 'Grace Dance Studio 儿童舞蹈',
    category: '舞蹈',
    categoryIcon: 'piano',
    location: 'Kirkland, WA · Juanita', distanceMiles: 5.6,
    bio: '百老汇专业舞者，教学12年，涵盖芭蕾、爵士、现代舞，每年举办盛大成果发表演出。',
    highlights: ['百老汇专业背景', '芭蕾/爵士/现代', '年度成果演出', '舞台表演培训'],
    rating: 4.9, reviewCount: 71, yearsExperience: 12,
    reviews: [
      { rating: 5, text: '去年的发表会太精彩了，孩子在台上超有自信！', author: '周妈妈' },
      { rating: 5, text: 'Grace老师对动作要求严格但很温柔，孩子非常喜欢。', author: '钱爸爸' },
    ],
  },
  {
    id: 'math-plus-bellevue',
    name: 'Math Plus 数学思维课',
    category: '数学',
    categoryIcon: 'chinese',
    location: 'Bellevue, WA · Crossroads', distanceMiles: 3.3,
    bio: '哈佛教育学院硕士创办，专注6-12岁数学思维与竞赛培训，AMC/Math Olympiad备考。',
    highlights: ['哈佛教育学院', 'AMC竞赛备考', '逻辑思维训练', '小班4人制'],
    rating: 4.7, reviewCount: 24, yearsExperience: 6,
    reviews: [
      { rating: 5, text: '孩子数学从普通到进了学校数学团，真的很感谢！', author: '孙妈妈' },
    ],
  },
  {
    id: 'chess-academy-nw',
    name: 'Northwest Chess Academy 国际象棋',
    category: '象棋',
    categoryIcon: 'chinese',
    location: 'Redmond, WA · Education Hill', distanceMiles: 5.1,
    bio: '美国象棋联盟认证教练，8年青少年教学经验，学生多次参加全国赛事获奖。',
    highlights: ['美国象棋联盟认证', '比赛备战课程', '线上/线下皆可', '全年龄层适合'],
    rating: 4.6, reviewCount: 18, yearsExperience: 8,
    reviews: [
      { rating: 5, text: '孩子学象棋之后专注力明显提升，逻辑思维也变强了！', author: '许妈妈' },
    ],
  },
];

// ── Teachers ──────────────────────────────────────────────────────────────────
export const studioTeachers = [
  {
    id: 'teacher-mira', studioId: 'mira-piano',
    // 基本信息
    name: 'Mira Chen', email: 'mira@example.com', phone: '425-555-0201',
    // 专业
    title: '创办人 / 首席钢琴教师',
    bio: '毕业于华盛顿大学音乐系，RCM认证教师，教学超过11年。',
    specialties: ['RCM考级备考', 'JMC儿童音乐启蒙', '学期制团体课', '一对一私教'],
    certifications: ['RCM Associate Teacher', 'Yamaha JMC认证教师', 'ABRSM Grade 8'],
    // 合约
    employmentType: 'owner',    // owner / full_time / part_time / contract
    joinYear: 2013, joinDate: '2013-09-01',
    maxWeeklyHours: null,       // null = 无上限
    // 薪资（默认，可被班级覆盖）
    rate: 35, rateUnit: '堂',
    // 教学
    subjectIds: ['subj-piano'],
    preferredTypes: ['group_class', 'private_lesson'],
    // 其他
    isFounder: true,
    emergencyContact: { name: 'David Chen', relation: '配偶', phone: '425-555-0202' },
    notes: '',
    active: true,
  },
  {
    id: 'teacher-sarah', studioId: 'mira-piano',
    name: 'Sarah Lin', email: 'sarah@example.com', phone: '425-555-0401',
    title: '钢琴教师',
    bio: '毕业于UBC音乐教育系，擅长活泼有趣的教学方式。',
    specialties: ['幼儿钢琴启蒙', '基础乐理', '趣味教学法'],
    certifications: ['RCM Associate Teacher', 'Yamaha JMC认证教师'],
    employmentType: 'part_time',
    joinYear: 2020, joinDate: '2020-09-01',
    maxWeeklyHours: 15,
    rate: 28, rateUnit: '堂',
    subjectIds: ['subj-piano'],
    preferredTypes: ['group_class', 'private_lesson'],
    isFounder: false,
    emergencyContact: { name: 'Linda Lin', relation: '母亲', phone: '604-555-0100' },
    notes: '每周三不可排课（校内课程）',
    active: true,
  },
  {
    id: 'teacher-grace', studioId: 'mira-piano',
    name: 'Grace Wang', email: 'grace@example.com', phone: '425-555-0501',
    title: '钢琴教师（兼职）',
    bio: '正在攻读音乐教育硕士，专长古典钢琴与即兴演奏。',
    specialties: ['古典钢琴', '即兴演奏', '一对一私教'],
    certifications: ['RCM Associate Teacher'],
    employmentType: 'contract',
    joinYear: 2024, joinDate: '2024-01-15',
    maxWeeklyHours: 8,
    rate: 28, rateUnit: '堂',
    subjectIds: ['subj-piano'],
    preferredTypes: ['private_lesson'],
    isFounder: false,
    emergencyContact: { name: 'Michael Wang', relation: '父亲', phone: '206-555-0200' },
    notes: '2026年8月起攻读论文，暑期后可能减课',
    active: true,
  },
];

// ── Step 1: Subjects（教什么）────────────────────────────────────────────────
export const mockSubjects = [
  { id: 'subj-piano', studioId: 'mira-piano', name: '钢琴', icon: 'piano', description: 'RCM系统化钢琴教学' },
  { id: 'subj-swim', studioId: 'david-swim', name: '游泳', icon: 'swim', description: '青少年游泳技术与水安全' },
  { id: 'subj-chinese', studioId: 'lily-chinese', name: '中文', icon: 'chinese', description: '海外华裔中文分级课程' },
];

// ── Step 2: Teaching Types（怎么教）─────────────────────────────────────────
// group_class | private_lesson | workshop
export const mockTeachingTypes = [
  { id: 'tt-piano-group', subjectId: 'subj-piano', studioId: 'mira-piano', type: 'group_class', name: '团体课', hasCurriculum: true, hasLevels: true },
  { id: 'tt-piano-private', subjectId: 'subj-piano', studioId: 'mira-piano', type: 'private_lesson', name: '一对一私教', hasCurriculum: false, hasLevels: false },
  { id: 'tt-piano-workshop', subjectId: 'subj-piano', studioId: 'mira-piano', type: 'workshop', name: '工作坊/营队', hasCurriculum: false, hasLevels: false },
];

// ── Step 3: Course Structure（团体课专用：课纲/级别）────────────────────────
// 依照 Yamaha 课程体系架构
export const mockCurricula = [
  {
    id: 'cur-jmc', studioId: 'mira-piano', teachingTypeId: 'tt-piano-group',
    name: 'JMC 幼儿音乐课程', nameEn: 'Junior Music Course',
    description: '4-5岁幼儿音乐启蒙，通过唱游、键盘等活动建立音感与节奏。共4级，分两年完成。',
    color: '#6BBF4E', ageRange: '4-5岁', totalYears: 2,
    nextCurriculumId: 'cur-jxc',
  },
  {
    id: 'cur-ymc', studioId: 'mira-piano', teachingTypeId: 'tt-piano-group',
    name: 'YMC 儿童音乐课程', nameEn: 'Young Music Course',
    description: '5.5-7岁儿童音乐课，培养乐器演奏、乐理及合奏能力。共6级，分三年完成。',
    color: '#378ADD', ageRange: '5.5-7岁', totalYears: 3,
    nextCurriculumId: 'cur-jnc',
  },
  {
    id: 'cur-jxc', studioId: 'mira-piano', teachingTypeId: 'tt-piano-group',
    name: 'JXC 初级延伸课程', nameEn: 'Junior Extension Course',
    description: 'JMC结业后进入，深化钢琴技巧与音乐理解。共4级，分两年完成。G10→G9。',
    color: '#F5C518', ageRange: '6-8岁', totalYears: 2,
    nextCurriculumId: 'cur-jac',
  },
  {
    id: 'cur-jnc', studioId: 'mira-piano', teachingTypeId: 'tt-piano-group',
    name: 'JNC 初级合奏课程', nameEn: 'Junior Ensemble Course',
    description: 'YMC结业后进入，以合奏为主培养音乐合作能力。共4级，分两年完成。G8。',
    color: '#2196F3', ageRange: '8-10岁', totalYears: 2,
    nextCurriculumId: 'cur-jac',
  },
  {
    id: 'cur-jac', studioId: 'mira-piano', teachingTypeId: 'tt-piano-group',
    name: 'JAC 初级进阶课程', nameEn: 'Junior Advanced Course',
    description: 'JXC/JNC结业后进入，须同时修私教课。共4级，分两年完成。G8→G7。',
    color: '#E91E8C', ageRange: '9-12岁', totalYears: 2,
    requiresPrivateLesson: true,
    nextCurriculumId: 'cur-sac',
  },
  {
    id: 'cur-sac', studioId: 'mira-piano', teachingTypeId: 'tt-piano-group',
    name: 'SAC 高级进阶课程', nameEn: 'Senior Advanced Course',
    description: 'JAC结业后进入最高级别。共4级，分两年完成。G6→G5*。',
    color: '#7B1FA2', ageRange: '12岁以上', totalYears: 2,
    requiresPrivateLesson: true,
    nextCurriculumId: null,
  },
];

export const mockLevels = [
  // ── JMC (4-5岁，2年，4级) ─────────────────────────────────────────────────
  { id: 'lv-jmc1', curriculumId: 'cur-jmc', studioId: 'mira-piano', name: 'JMC 1', shortName: 'JMC1', year: 1, levelIndex: 1, prerequisiteId: null, ageMin: 4, ageMax: 5, description: '音乐启蒙第一学期，认识键盘、节拍与歌唱。', objectives: ['认识琴键', '基础节拍感', '简单歌唱', '音乐游戏'] },
  { id: 'lv-jmc2', curriculumId: 'cur-jmc', studioId: 'mira-piano', name: 'JMC 2', shortName: 'JMC2', year: 1, levelIndex: 2, prerequisiteId: 'lv-jmc1', ageMin: 4, ageMax: 5, description: '第一年第二学期，开始接触简单旋律弹奏。', objectives: ['简单旋律', '双手配合启蒙', '节奏训练'] },
  { id: 'lv-jmc3', curriculumId: 'cur-jmc', studioId: 'mira-piano', name: 'JMC 3', shortName: 'JMC3', year: 2, levelIndex: 3, prerequisiteId: 'lv-jmc2', ageMin: 5, ageMax: 6, description: '第二年第一学期，进入五线谱启蒙。', objectives: ['五线谱识谱启蒙', '简单乐曲', '合奏体验'] },
  { id: 'lv-jmc4', curriculumId: 'cur-jmc', studioId: 'mira-piano', name: 'JMC 4', shortName: 'JMC4', year: 2, levelIndex: 4, prerequisiteId: 'lv-jmc3', ageMin: 5, ageMax: 6, description: '第二年第二学期，JMC结业，准备升入JXC。FSS结业认证。', objectives: ['完整曲目弹奏', 'FSS结业认证', '升JXC准备'] },

  // ── YMC (5.5-7岁，3年，6级) ──────────────────────────────────────────────
  { id: 'lv-ymc1', curriculumId: 'cur-ymc', studioId: 'mira-piano', name: 'YMC 1', shortName: 'YMC1', year: 1, levelIndex: 1, prerequisiteId: null, ageMin: 5, ageMax: 7, description: '儿童音乐课第一学期，键盘与视唱入门。G10预备。', objectives: ['键盘弹奏', '视唱练耳', '节奏感培养'] },
  { id: 'lv-ymc2', curriculumId: 'cur-ymc', studioId: 'mira-piano', name: 'YMC 2', shortName: 'YMC2', year: 1, levelIndex: 2, prerequisiteId: 'lv-ymc1', ageMin: 5, ageMax: 7, description: '第一年第二学期，G10水平弹奏。', objectives: ['G10曲目', '双手弹奏', '基础乐理'] },
  { id: 'lv-ymc3', curriculumId: 'cur-ymc', studioId: 'mira-piano', name: 'YMC 3', shortName: 'YMC3', year: 2, levelIndex: 3, prerequisiteId: 'lv-ymc2', ageMin: 6, ageMax: 7, description: '第二年第一学期，提升演奏技巧。G10。', objectives: ['进阶G10曲目', '和声感', '合奏技巧'] },
  { id: 'lv-ymc4', curriculumId: 'cur-ymc', studioId: 'mira-piano', name: 'YMC 4', shortName: 'YMC4', year: 2, levelIndex: 4, prerequisiteId: 'lv-ymc3', ageMin: 6, ageMax: 8, description: '第二年第二学期，G9-10水平。', objectives: ['G9准备', '多声部弹奏', '表现力'] },
  { id: 'lv-ymc5', curriculumId: 'cur-ymc', studioId: 'mira-piano', name: 'YMC 5', shortName: 'YMC5', year: 3, levelIndex: 5, prerequisiteId: 'lv-ymc4', ageMin: 7, ageMax: 8, description: '第三年第一学期，G9水平。', objectives: ['G9曲目', '即兴演奏入门', '合奏领奏'] },
  { id: 'lv-ymc6', curriculumId: 'cur-ymc', studioId: 'mira-piano', name: 'YMC 6', shortName: 'YMC6', year: 3, levelIndex: 6, prerequisiteId: 'lv-ymc5', ageMin: 7, ageMax: 8, description: '第三年第二学期，YMC结业，准备升入JNC或JAC。G9。', objectives: ['YMC结业认证', 'G9', '升JNC/JAC准备'] },

  // ── JXC (6-8岁，2年，4级) ─────────────────────────────────────────────────
  { id: 'lv-jxc1', curriculumId: 'cur-jxc', studioId: 'mira-piano', name: 'JXC 1', shortName: 'JXC1', year: 1, levelIndex: 1, prerequisiteId: 'lv-jmc4', ageMin: 6, ageMax: 8, description: 'JMC结业后进入，强化钢琴技巧与乐理。G10。', objectives: ['G10钢琴技巧', '进阶乐理', '视奏训练'] },
  { id: 'lv-jxc2', curriculumId: 'cur-jxc', studioId: 'mira-piano', name: 'JXC 2', shortName: 'JXC2', year: 1, levelIndex: 2, prerequisiteId: 'lv-jxc1', ageMin: 6, ageMax: 8, description: '第一年第二学期，G10水平巩固。', objectives: ['G10完整曲目', '踏板使用', '音乐表情'] },
  { id: 'lv-jxc3', curriculumId: 'cur-jxc', studioId: 'mira-piano', name: 'JXC 3', shortName: 'JXC3', year: 2, levelIndex: 3, prerequisiteId: 'lv-jxc2', ageMin: 7, ageMax: 9, description: '第二年第一学期，向G9迈进。', objectives: ['G9准备', '进阶踏板', '音乐风格'] },
  { id: 'lv-jxc4', curriculumId: 'cur-jxc', studioId: 'mira-piano', name: 'JXC 4', shortName: 'JXC4', year: 2, levelIndex: 4, prerequisiteId: 'lv-jxc3', ageMin: 7, ageMax: 9, description: 'JXC结业，G9水平，准备升入JAC。', objectives: ['JXC结业', 'G9', '升JAC准备'] },

  // ── JNC (8-10岁，2年，4级) ────────────────────────────────────────────────
  { id: 'lv-jnc1', curriculumId: 'cur-jnc', studioId: 'mira-piano', name: 'JNC 1', shortName: 'JNC1', year: 1, levelIndex: 1, prerequisiteId: 'lv-ymc6', ageMin: 8, ageMax: 10, description: '合奏课第一学期，G8水平合奏技术。', objectives: ['G8合奏', '音乐协调', '节奏精准'] },
  { id: 'lv-jnc2', curriculumId: 'cur-jnc', studioId: 'mira-piano', name: 'JNC 2', shortName: 'JNC2', year: 1, levelIndex: 2, prerequisiteId: 'lv-jnc1', ageMin: 8, ageMax: 10, description: '第一年第二学期，合奏技巧提升。', objectives: ['多声部合奏', '音乐表现', 'G8曲目'] },
  { id: 'lv-jnc3', curriculumId: 'cur-jnc', studioId: 'mira-piano', name: 'JNC 3', shortName: 'JNC3', year: 2, levelIndex: 3, prerequisiteId: 'lv-jnc2', ageMin: 9, ageMax: 11, description: '第二年第一学期，进阶合奏与领奏。', objectives: ['领奏能力', '复杂节奏', 'G8进阶'] },
  { id: 'lv-jnc4', curriculumId: 'cur-jnc', studioId: 'mira-piano', name: 'JNC 4', shortName: 'JNC4', year: 2, levelIndex: 4, prerequisiteId: 'lv-jnc3', ageMin: 9, ageMax: 11, description: 'JNC结业，G8，可升入JAC。', objectives: ['JNC结业', 'G8', '升JAC准备'] },

  // ── JAC (9-12岁，2年，4级，须私教) ──────────────────────────────────────
  { id: 'lv-jac1', curriculumId: 'cur-jac', studioId: 'mira-piano', name: 'JAC 1', shortName: 'JAC1', year: 1, levelIndex: 1, prerequisiteId: 'lv-jxc4', ageMin: 9, ageMax: 12, description: '进阶课第一学期，须同时修私教课。G8。', objectives: ['G8演奏', '音乐诠释', '技巧强化'] },
  { id: 'lv-jac2', curriculumId: 'cur-jac', studioId: 'mira-piano', name: 'JAC 2', shortName: 'JAC2', year: 1, levelIndex: 2, prerequisiteId: 'lv-jac1', ageMin: 9, ageMax: 12, description: '第一年第二学期，G8完整程度。', objectives: ['G8完整曲目', '音乐分析', '演奏诠释'] },
  { id: 'lv-jac3', curriculumId: 'cur-jac', studioId: 'mira-piano', name: 'JAC 3', shortName: 'JAC3', year: 2, levelIndex: 3, prerequisiteId: 'lv-jac2', ageMin: 10, ageMax: 13, description: '第二年第一学期，向G7迈进。', objectives: ['G7准备', '高难度技巧', '音乐风格分析'] },
  { id: 'lv-jac4', curriculumId: 'cur-jac', studioId: 'mira-piano', name: 'JAC 4', shortName: 'JAC4', year: 2, levelIndex: 4, prerequisiteId: 'lv-jac3', ageMin: 10, ageMax: 13, description: 'JAC结业，G7，可升入SAC。', objectives: ['JAC结业', 'G7', '升SAC准备'] },

  // ── SAC (12岁以上，2年，4级，须私教) ────────────────────────────────────
  { id: 'lv-sac1', curriculumId: 'cur-sac', studioId: 'mira-piano', name: 'SAC 1', shortName: 'SAC1', year: 1, levelIndex: 1, prerequisiteId: 'lv-jac4', ageMin: 12, ageMax: 18, description: '最高级别第一学期。G6。', objectives: ['G6演奏', '高难度曲目', '音乐会准备'] },
  { id: 'lv-sac2', curriculumId: 'cur-sac', studioId: 'mira-piano', name: 'SAC 2', shortName: 'SAC2', year: 1, levelIndex: 2, prerequisiteId: 'lv-sac1', ageMin: 12, ageMax: 18, description: '第一年第二学期，G6完整。', objectives: ['G6完整曲目', '演奏会', '音乐诠释'] },
  { id: 'lv-sac3', curriculumId: 'cur-sac', studioId: 'mira-piano', name: 'SAC 3', shortName: 'SAC3', year: 2, levelIndex: 3, prerequisiteId: 'lv-sac2', ageMin: 13, ageMax: 18, description: '第二年第一学期，向G5*迈进。', objectives: ['G5*准备', '大赛曲目', '演奏艺术'] },
  { id: 'lv-sac4', curriculumId: 'cur-sac', studioId: 'mira-piano', name: 'SAC 4', shortName: 'SAC4', year: 2, levelIndex: 4, prerequisiteId: 'lv-sac3', ageMin: 13, ageMax: 18, description: 'SAC结业，G5*，Yamaha最高级别。', objectives: ['SAC结业', 'G5*', '最高级别认证'] },
];

// ── Step 4: Pricing Plans───────────────────
export const mockPricingPlans = [
  { id: 'price-monthly-220', studioId: 'mira-piano', name: '月缴学费', model: 'monthly_tuition', amount: 220, unit: '月', description: '每月固定缴费，含4堂课' },
  { id: 'price-monthly-240', studioId: 'mira-piano', name: '月缴学费（中级）', model: 'monthly_tuition', amount: 240, unit: '月', description: '每月固定缴费，含4堂课' },
  { id: 'price-monthly-260', studioId: 'mira-piano', name: '月缴学费（高级）', model: 'monthly_tuition', amount: 260, unit: '月', description: '每月固定缴费，含4堂课' },
  { id: 'price-private-120', studioId: 'mira-piano', name: '私教单堂', model: 'drop_in', amount: 120, unit: '堂', description: '45分钟一对一私教' },
  { id: 'price-camp-350', studioId: 'mira-piano', name: '夏令营费用', model: 'semester_tuition', amount: 350, unit: '营期', description: '5天夏令营全程费用' },
];

// ── Step 5: Class Offerings（实际开班）──────────────────────────────────────
// 同一级别可由不同老师开多个班
export const mockClassOfferings = [
  // ── JMC1 入门 · 两位老师各开一班 ──────────────────────────────────────
  {
    id: 'co-jmc1-sarah-fall26', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-group', curriculumId: 'cur-jmc', levelId: 'lv-jmc1',
    pricingPlanId: 'price-monthly-220', primaryTeacherId: 'teacher-sarah',
    teacherRate: 28, teacherRateUnit: '堂',
    compensationRule: { type: 'per_session', amount: 28 },
    name: 'JMC1 入门钢琴 秋季班 A（Sarah Lin）', status: 'published',
    startDate: '2026-09-08', endDate: '2026-12-19', totalSessions: 16, durationMin: 30,
    capacity: 10, booked: 8,
    slots: [
      { id: 's1a', day: '星期二', time: '16:00–16:30', seatsLeft: 2 },
      { id: 's1b', day: '星期六', time: '10:00–10:30', seatsLeft: 0 },
    ],
    enrollmentSettings: { allowTrial: true, allowWaitlist: true, allowDropIn: false, requireConsultation: false },
    locationType: 'multi', locationRooms: ['A教室', 'B教室', 'C教室'], locationDefault: 'A教室',
  },
  {
    locationType: 'fixed', locationFixed: 'B教室（3楼）', locationDefault: 'B教室（3楼）',
    id: 'co-jmc1-mira-fall26', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-group', curriculumId: 'cur-jmc', levelId: 'lv-jmc1',
    pricingPlanId: 'price-monthly-220', primaryTeacherId: 'teacher-mira',
    teacherRate: 35, teacherRateUnit: '堂',
    compensationRule: { type: 'per_session', amount: 35 },
    name: 'JMC1 入门钢琴 秋季班 B（Mira Chen）', status: 'published',
    startDate: '2026-09-08', endDate: '2026-12-19', totalSessions: 16, durationMin: 30,
    capacity: 8, booked: 5,
    slots: [{ id: 's1c', day: '星期三', time: '15:30–16:00', seatsLeft: 3 }],
    enrollmentSettings: { allowTrial: true, allowWaitlist: false, allowDropIn: false, requireConsultation: false },
  },
  // ── JMC2 初级 · 两位老师各开一班 ──────────────────────────────────────
  {
    locationType: 'multi', locationRooms: ['A教室', 'B教室'], locationDefault: 'A教室',
    id: 'co-jmc2-sarah-fall26', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-group', curriculumId: 'cur-jmc', levelId: 'lv-jmc2',
    pricingPlanId: 'price-monthly-240', primaryTeacherId: 'teacher-sarah',
    teacherRate: 28, teacherRateUnit: '堂',
    compensationRule: { type: 'per_session', amount: 28 },
    name: 'JMC2 初级钢琴 秋季班 A（Sarah Lin）', status: 'published',
    startDate: '2026-09-08', endDate: '2026-12-19', totalSessions: 16, durationMin: 30,
    capacity: 8, booked: 6,
    slots: [{ id: 's2a', day: '星期三', time: '16:30–17:00', seatsLeft: 2 }],
    enrollmentSettings: { allowTrial: true, allowWaitlist: false, allowDropIn: false, requireConsultation: false },
    locationType: 'fixed', locationFixed: 'A教室（3楼）', locationDefault: 'A教室（3楼）',
  },
  {
    id: 'co-jmc2-mira-fall26', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-group', curriculumId: 'cur-jmc', levelId: 'lv-jmc2',
    pricingPlanId: 'price-monthly-240', primaryTeacherId: 'teacher-mira',
    teacherRate: 35, teacherRateUnit: '堂',
    compensationRule: { type: 'per_session', amount: 35 },
    name: 'JMC2 初级钢琴 秋季班 B（Mira Chen）', status: 'published',
    startDate: '2026-09-08', endDate: '2026-12-19', totalSessions: 16, durationMin: 30,
    capacity: 6, booked: 4,
    slots: [{ id: 's2b', day: '星期五', time: '16:00–16:30', seatsLeft: 2 }],
    enrollmentSettings: { allowTrial: true, allowWaitlist: false, allowDropIn: false, requireConsultation: false },
  },
  // ── JMC3 中级 ──────────────────────────────────────────────────────────
  {
    locationType: 'fixed', locationFixed: 'A教室（3楼）', locationDefault: 'A教室（3楼）',
    id: 'co-jmc3-mira-fall26', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-group', curriculumId: 'cur-jmc', levelId: 'lv-jmc3',
    pricingPlanId: 'price-monthly-260', primaryTeacherId: 'teacher-mira',
    teacherRate: 35, teacherRateUnit: '堂',
    compensationRule: { type: 'per_session', amount: 35 },
    name: 'JMC3 中级钢琴 秋季班（Mira Chen）', status: 'published',
    startDate: '2026-09-08', endDate: '2026-12-19', totalSessions: 16, durationMin: 45,
    capacity: 6, booked: 6,
    slots: [{ id: 's3a', day: '星期四', time: '17:00–17:45', seatsLeft: 0 }],
    enrollmentSettings: { allowTrial: false, allowWaitlist: true, allowDropIn: false, requireConsultation: false },
  },
  // ── 一对一私教 ──────────────────────────────────────────────────────────
  {
    id: 'co-private-mira', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-private', curriculumId: null, levelId: null,
    pricingPlanId: 'price-private-120', primaryTeacherId: 'teacher-mira',
    teacherRate: 50, teacherRateUnit: '堂',
    compensationRule: { type: 'hybrid', fixedAmount: 20, sharePercent: 30, basedOn: 'gross' },
    name: '钢琴私教（Mira Chen）', status: 'published',
    startDate: null, endDate: null, totalSessions: null, durationMin: 45,
    capacity: 4, booked: 2,
    slots: [
      { id: 'sp1', day: '星期一', time: '17:00–17:45', seatsLeft: 0 },
      { id: 'sp2', day: '星期五', time: '15:30–16:15', seatsLeft: 1 },
    ],
    enrollmentSettings: { allowTrial: true, allowWaitlist: false, allowDropIn: false, requireConsultation: true },
    locationType: 'flexible', locationDefault: '老师工作室',
  },
  {
    id: 'co-private-sarah', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-private', curriculumId: null, levelId: null,
    pricingPlanId: 'price-private-120', primaryTeacherId: 'teacher-sarah',
    teacherRate: 40, teacherRateUnit: '堂',
    compensationRule: { type: 'revenue_share', sharePercent: 65, basedOn: 'gross' },
    name: '钢琴私教（Sarah Lin）', status: 'published',
    startDate: null, endDate: null, totalSessions: null, durationMin: 45,
    capacity: 3, booked: 2,
    slots: [
      { id: 'sp3', day: '星期二', time: '17:00–17:45', seatsLeft: 1 },
      { id: 'sp4', day: '星期六', time: '11:00–11:45', seatsLeft: 0 },
    ],
    enrollmentSettings: { allowTrial: true, allowWaitlist: false, allowDropIn: false, requireConsultation: true },
    locationType: 'flexible', locationDefault: '视学生安排',
  },
  // ── 夏令营 ──────────────────────────────────────────────────────────────
  {
    id: 'co-summer-camp', studioId: 'mira-piano', subjectId: 'subj-piano',
    teachingTypeId: 'tt-piano-workshop', curriculumId: null, levelId: null,
    pricingPlanId: 'price-camp-350', primaryTeacherId: 'teacher-mira',
    teacherRate: 200, teacherRateUnit: '营期',
    compensationRule: { type: 'per_session', amount: 200 },
    name: '2026 钢琴夏令营', status: 'published',
    startDate: '2026-07-14', endDate: '2026-07-18', totalSessions: 5, durationMin: 120,
    capacity: 12, booked: 9,
    slots: [{ id: 'sc1', day: '周一至周五', time: '09:00–11:00', seatsLeft: 3 }],
    enrollmentSettings: { allowTrial: false, allowWaitlist: true, allowDropIn: false, requireConsultation: false },
  },
];

// ── Enrollments ────────────────────────────────────────────────────────────────
export const mockEnrollments = [
  // JMC1 班 A (Sarah)
  { id: 'en1',  childId: 'c1',  childName: '林小美',  parentEmail: 'lin@example.com',    studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en2',  childId: 'c2',  childName: '王大宝',  parentEmail: 'wang@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en3',  childId: 'c3',  childName: '陈雅婷',  parentEmail: 'chen@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1b', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en4',  childId: 'c4',  childName: '张俊豪',  parentEmail: 'zhang@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1b', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en5',  childId: 'c5',  childName: '李晓彤',  parentEmail: 'li@example.com',     studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1a', status: 'confirmed',       paymentStatus: 'paid',    leaveStatus: 'makeup_scheduled', makeupOfferingId: 'co-jmc1-mira-fall26', makeupSlotId: 's1c', makeupDate: '2026-06-25' },
  { id: 'en6',  childId: 'c6',  childName: '黄思颖',  parentEmail: 'huang@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1b', status: 'pending_payment', paymentStatus: 'pending' },
  { id: 'en7',  childId: 'c7',  childName: '吴浩然',  parentEmail: 'wu@example.com',     studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en8',  childId: 'c8',  childName: '刘安妮',  parentEmail: 'liu@example.com',    studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1b', status: 'pending_payment', paymentStatus: 'pending' },
  { id: 'en9',  childId: 'c9',  childName: '郑小龙',  parentEmail: 'zheng@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1a', status: 'waitlisted',      paymentStatus: 'pending' },
  { id: 'en10', childId: 'c10', childName: '赵心怡',  parentEmail: 'zhao@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc1-sarah-fall26', slotId: 's1b', status: 'waitlisted',      paymentStatus: 'pending' },
  // JMC1 班 B (Mira)
  { id: 'en1b', childId: 'c33', childName: '孙小雨',  parentEmail: 'sun2@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc1-mira-fall26',  slotId: 's1c', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en2b', childId: 'c34', childName: '钱多多',  parentEmail: 'qian@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc1-mira-fall26',  slotId: 's1c', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en3b', childId: 'c35', childName: '周晓晓',  parentEmail: 'zhou3@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc1-mira-fall26',  slotId: 's1c', status: 'confirmed',       paymentStatus: 'paid',    leaveStatus: 'makeup_scheduled', makeupOfferingId: 'co-jmc1-mira-fall26', makeupSlotId: 's1c', makeupDate: '2026-06-18' },
  { id: 'en4b', childId: 'c36', childName: '吴小琪',  parentEmail: 'wu4@example.com',    studioId: 'mira-piano', offeringId: 'co-jmc1-mira-fall26',  slotId: 's1c', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en5b', childId: 'c37', childName: '郑宇航',  parentEmail: 'zheng2@example.com', studioId: 'mira-piano', offeringId: 'co-jmc1-mira-fall26',  slotId: 's1c', status: 'pending_payment', paymentStatus: 'pending' },
  // JMC2 班 A (Sarah)
  { id: 'en11', childId: 'c11', childName: '陳曉',    parentEmail: 'chen2@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc2-sarah-fall26', slotId: 's2a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en12', childId: 'c12', childName: '许雅雯',  parentEmail: 'xu@example.com',     studioId: 'mira-piano', offeringId: 'co-jmc2-sarah-fall26', slotId: 's2a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en13', childId: 'c13', childName: '蔡明翰',  parentEmail: 'cai@example.com',    studioId: 'mira-piano', offeringId: 'co-jmc2-sarah-fall26', slotId: 's2a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en14', childId: 'c14', childName: '杨诗涵',  parentEmail: 'yang@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc2-sarah-fall26', slotId: 's2a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en15', childId: 'c15', childName: '林俊宏',  parentEmail: 'lin2@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc2-sarah-fall26', slotId: 's2a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en16', childId: 'c16', childName: '周雨桐',  parentEmail: 'zhou@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc2-sarah-fall26', slotId: 's2a', status: 'confirmed',       paymentStatus: 'paid' },
  // JMC2 班 B (Mira)
  { id: 'en11b',childId: 'c38', childName: '赵小龙',  parentEmail: 'zhao3@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc2-mira-fall26',  slotId: 's2b', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en12b',childId: 'c39', childName: '钱小燕',  parentEmail: 'qian2@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc2-mira-fall26',  slotId: 's2b', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en13b',childId: 'c40', childName: '孙思远',  parentEmail: 'sun3@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc2-mira-fall26',  slotId: 's2b', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en14b',childId: 'c41', childName: '李雅琪',  parentEmail: 'li3@example.com',    studioId: 'mira-piano', offeringId: 'co-jmc2-mira-fall26',  slotId: 's2b', status: 'pending_payment', paymentStatus: 'pending' },
  // JMC3 (Mira)
  { id: 'en17', childId: 'c17', childName: '吴雨晴',  parentEmail: 'wu2@example.com',    studioId: 'mira-piano', offeringId: 'co-jmc3-mira-fall26',  slotId: 's3a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en18', childId: 'c18', childName: '黄志远',  parentEmail: 'huang2@example.com', studioId: 'mira-piano', offeringId: 'co-jmc3-mira-fall26',  slotId: 's3a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en19', childId: 'c19', childName: '陈晓蕾',  parentEmail: 'chen3@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc3-mira-fall26',  slotId: 's3a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en20', childId: 'c20', childName: '林佳欣',  parentEmail: 'lin3@example.com',   studioId: 'mira-piano', offeringId: 'co-jmc3-mira-fall26',  slotId: 's3a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en21', childId: 'c21', childName: '王思齐',  parentEmail: 'wang2@example.com',  studioId: 'mira-piano', offeringId: 'co-jmc3-mira-fall26',  slotId: 's3a', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en22', childId: 'c22', childName: '张伟明',  parentEmail: 'zhang2@example.com', studioId: 'mira-piano', offeringId: 'co-jmc3-mira-fall26',  slotId: 's3a', status: 'pending_payment', paymentStatus: 'pending' },
  // 私教
  { id: 'en23', childId: 'c23', childName: '李小明',  parentEmail: 'li2@example.com',    studioId: 'mira-piano', offeringId: 'co-private-mira',      slotId: 'sp1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en24', childId: 'c24', childName: '陈心怡',  parentEmail: 'chen4@example.com',  studioId: 'mira-piano', offeringId: 'co-private-mira',      slotId: 'sp2', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en23b',childId: 'c42', childName: '王小涵',  parentEmail: 'wang3@example.com',  studioId: 'mira-piano', offeringId: 'co-private-sarah',     slotId: 'sp3', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en24b',childId: 'c43', childName: '刘思思',  parentEmail: 'liu3@example.com',   studioId: 'mira-piano', offeringId: 'co-private-sarah',     slotId: 'sp4', status: 'confirmed',       paymentStatus: 'paid' },
  // 夏令营
  { id: 'en25', childId: 'c1',  childName: '林小美',  parentEmail: 'lin@example.com',    studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en26', childId: 'c2',  childName: '王大宝',  parentEmail: 'wang@example.com',   studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en27', childId: 'c25', childName: '刘小强',  parentEmail: 'liu2@example.com',   studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en28', childId: 'c26', childName: '赵美玲',  parentEmail: 'zhao2@example.com',  studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en29', childId: 'c27', childName: '孙浩宇',  parentEmail: 'sun@example.com',    studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en30', childId: 'c28', childName: '周思思',  parentEmail: 'zhou2@example.com',  studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en31', childId: 'c29', childName: '吴小云',  parentEmail: 'wu3@example.com',    studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en32', childId: 'c30', childName: '黄宇轩',  parentEmail: 'huang3@example.com', studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'confirmed',       paymentStatus: 'paid' },
  { id: 'en33', childId: 'c31', childName: '陈雨晨',  parentEmail: 'chen5@example.com',  studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'pending_payment', paymentStatus: 'pending' },
  { id: 'en34', childId: 'c32', childName: '林子涵',  parentEmail: 'lin4@example.com',   studioId: 'mira-piano', offeringId: 'co-summer-camp',        slotId: 'sc1', status: 'waitlisted',      paymentStatus: 'pending' },
];



// ── Enrollment Pipeline（招生漏斗）────────────────────────────────────────────
// stage: 'interested'(有兴趣) | 'contacted'(已联络) | 'trial'(已试听) | 'enrolled'(已报名) | 'lost'(失联)
export const mockPipeline = [
  // JMC1 - Sarah班
  { id:'pl-01', offeringId:'co-jmc1-sarah-fall26', childName:'周恩熙', parentName:'周妈妈', parentEmail:'zhou.mom@gmail.com', parentPhone:'425-111-0001', stage:'interested',  source:'小红书',   note:'看到小红书帖子私信咨询', createdAt:'2026-06-01', updatedAt:'2026-06-01' },
  { id:'pl-02', offeringId:'co-jmc1-sarah-fall26', childName:'黄子轩', parentName:'黄爸爸', parentEmail:'huang.dad@gmail.com', parentPhone:'425-111-0002', stage:'contacted',   source:'朋友推荐', note:'已发试听邀请email，等回复', createdAt:'2026-06-05', updatedAt:'2026-06-10' },
  { id:'pl-03', offeringId:'co-jmc1-sarah-fall26', childName:'林筱雯', parentName:'林妈妈', parentEmail:'lin.mom@gmail.com',   parentPhone:'425-111-0003', stage:'trial',        source:'工作室官网',note:'6/20试听了Sarah老师的课，感觉很好，在考虑中', createdAt:'2026-06-08', updatedAt:'2026-06-20' },
  { id:'pl-04', offeringId:'co-jmc1-sarah-fall26', childName:'陈浩南', parentName:'陈妈妈', parentEmail:'chen.mom@gmail.com',  parentPhone:'206-222-0001', stage:'lost',         source:'Instagram',note:'试听后失联，发了2封email无回应', createdAt:'2026-05-15', updatedAt:'2026-06-01' },
  // JMC1 - Mira班
  { id:'pl-05', offeringId:'co-jmc1-mira-fall26',  childName:'吴晓童', parentName:'吴妈妈', parentEmail:'wu.mom@gmail.com',    parentPhone:'425-333-0001', stage:'interested',  source:'Facebook', note:'Facebook留言询问秋季班', createdAt:'2026-06-15', updatedAt:'2026-06-15' },
  { id:'pl-06', offeringId:'co-jmc1-mira-fall26',  childName:'蔡明翰', parentName:'蔡爸爸', parentEmail:'cai.dad@gmail.com',   parentPhone:'425-333-0002', stage:'trial',        source:'Open House',note:'6/15 Open House参加，孩子很喜欢，家长在比较其他学校', createdAt:'2026-06-15', updatedAt:'2026-06-18' },
  // JMC2
  { id:'pl-07', offeringId:'co-jmc2-sarah-fall26', childName:'张依晨', parentName:'张妈妈', parentEmail:'zhang.mom@gmail.com', parentPhone:'206-444-0001', stage:'contacted',   source:'朋友推荐', note:'已发email，朋友介绍，很有意愿', createdAt:'2026-06-18', updatedAt:'2026-06-19' },
  { id:'pl-08', offeringId:'co-jmc2-mira-fall26',  childName:'许雅涵', parentName:'许妈妈', parentEmail:'xu.mom@gmail.com',    parentPhone:'425-555-0001', stage:'interested',  source:'小红书',   note:'', createdAt:'2026-06-20', updatedAt:'2026-06-20' },
  // 夏令营
  { id:'pl-09', offeringId:'co-summer-camp',        childName:'郑宇哲', parentName:'郑妈妈', parentEmail:'zheng.mom@gmail.com', parentPhone:'206-666-0001', stage:'interested',  source:'学校海报', note:'小学校门口看到海报', createdAt:'2026-06-22', updatedAt:'2026-06-22' },
  { id:'pl-10', offeringId:'co-summer-camp',        childName:'王思涵', parentName:'王爸爸', parentEmail:'wang.dad2@gmail.com', parentPhone:'425-777-0001', stage:'trial',        source:'Open House',note:'6/20 Open House来玩过，非常感兴趣', createdAt:'2026-06-20', updatedAt:'2026-06-20' },
];


// ── Invoices ──────────────────────────────────────────────────────────────────
// Invoice生成逻辑说明：
//   monthly_tuition → 月底自动草拟，金额固定
//   drop_in         → 月结，按实际出席堂数 × 单堂价
//   semester_tuition→ 报名时一次产生，可分期
//   camp            → 报名确认时产生（含早鸟逻辑）
//
// status: 'draft'（草稿待老师确认）| 'sent'（已发给家长）| 'paid'（已缴）| 'overdue'（逾期）

export const mockInvoices = [

  // ── JMC1 Sarah班（月缴 $220）──────────────────────────────────────────────
  {
    id: 'inv-jmc1s-0726', studioId: 'mira-piano',
    parentEmail: 'lin@example.com', childName: '林小美',
    offeringId: 'co-jmc1-sarah-fall26', offeringName: 'JMC1 入门钢琴 秋季班 A',
    billingMode: 'monthly_tuition',
    billingMonth: '2026-07',
    lineItems: [
      { date:'2026-07-01', desc:'7月学费（含4堂 · 7/1, 7/8, 7/15, 7/22）', amount:220, type:'tuition' },
    ],
    adjustments: [],
    subtotal: 220, total: 220,
    status: 'draft', dueDate: '2026-07-15',
    sentAt: null, paidAt: null, reminderCount: 0, lastReminderAt: null,
  },
  {
    id: 'inv-jmc1s-0726b', studioId: 'mira-piano',
    parentEmail: 'wang@example.com', childName: '王大宝',
    offeringId: 'co-jmc1-sarah-fall26', offeringName: 'JMC1 入门钢琴 秋季班 A',
    billingMode: 'monthly_tuition',
    billingMonth: '2026-07',
    lineItems: [
      { date:'2026-07-01', desc:'7月学费（含4堂 · 7/1, 7/8, 7/15, 7/22）', amount:220, type:'tuition' },
    ],
    adjustments: [],
    subtotal: 220, total: 220,
    status: 'draft', dueDate: '2026-07-15',
    sentAt: null, paidAt: null, reminderCount: 0, lastReminderAt: null,
  },
  {
    id: 'inv-jmc1s-0726c', studioId: 'mira-piano',
    parentEmail: 'huang@example.com', childName: '黄思颖',
    offeringId: 'co-jmc1-sarah-fall26', offeringName: 'JMC1 入门钢琴 秋季班 A',
    billingMode: 'monthly_tuition',
    billingMonth: '2026-07',
    lineItems: [
      { date:'2026-07-01', desc:'7月学费（含4堂）', amount:220, type:'tuition' },
    ],
    adjustments: [],
    subtotal: 220, total: 220,
    status: 'sent', dueDate: '2026-07-15',
    sentAt: '2026-07-01', paidAt: null, reminderCount: 0, lastReminderAt: null,
  },

  // ── JMC2 Mira班（月缴 $240）──────────────────────────────────────────────
  {
    id: 'inv-jmc2m-0726', studioId: 'mira-piano',
    parentEmail: 'chen2@example.com', childName: '陈晨',
    offeringId: 'co-jmc2-mira-fall26', offeringName: 'JMC2 初级钢琴 秋季班 B',
    billingMode: 'monthly_tuition',
    billingMonth: '2026-07',
    lineItems: [
      { date:'2026-07-01', desc:'7月学费（含4堂 · 7/4, 7/11, 7/18, 7/25）', amount:240, type:'tuition' },
    ],
    adjustments: [
      { reason:'6/27 老师临时取消课，减免一堂', amount:-60 },
    ],
    subtotal: 240, total: 180,
    status: 'sent', dueDate: '2026-07-15',
    sentAt: '2026-07-01', paidAt: null, reminderCount: 1, lastReminderAt: '2026-07-16',
    overdueNote: '已发第一次催缴提醒',
  },

  // ── 已缴费（上个月）──────────────────────────────────────────────────────
  {
    id: 'inv-jmc1s-0626', studioId: 'mira-piano',
    parentEmail: 'lin@example.com', childName: '林小美',
    offeringId: 'co-jmc1-sarah-fall26', offeringName: 'JMC1 入门钢琴 秋季班 A',
    billingMode: 'monthly_tuition',
    billingMonth: '2026-06',
    lineItems: [
      { date:'2026-06-01', desc:'6月学费（含4堂）', amount:220, type:'tuition' },
    ],
    adjustments: [],
    subtotal: 220, total: 220,
    status: 'paid', dueDate: '2026-06-15',
    sentAt: '2026-06-01', paidAt: '2026-06-10', reminderCount: 0, lastReminderAt: null,
  },

  // ── 私教按堂（月结）──────────────────────────────────────────────────────
  {
    id: 'inv-private-0726', studioId: 'mira-piano',
    parentEmail: 'li2@example.com', childName: '李小明',
    offeringId: 'co-private-mira', offeringName: '钢琴私教（Mira Chen）',
    billingMode: 'drop_in',
    billingMonth: '2026-07',
    lineItems: [
      { date:'2026-07-03', desc:'私教 45分钟（已出席）', amount:120, type:'session' },
      { date:'2026-07-10', desc:'私教 45分钟（已出席）', amount:120, type:'session' },
      { date:'2026-07-17', desc:'私教 45分钟（请假，不计费）', amount:0, type:'leave' },
      { date:'2026-07-24', desc:'私教 45分钟（已出席）', amount:120, type:'session' },
    ],
    adjustments: [],
    subtotal: 360, total: 360,
    status: 'draft', dueDate: '2026-08-05',
    sentAt: null, paidAt: null, reminderCount: 0, lastReminderAt: null,
  },

  // ── 夏令营（营期制，含早鸟）──────────────────────────────────────────────
  {
    id: 'inv-camp-2026', studioId: 'mira-piano',
    parentEmail: 'wu@example.com', childName: '吴浩然',
    offeringId: 'co-summer-camp', offeringName: '2026 钢琴夏令营',
    billingMode: 'semester_tuition',
    billingMonth: '2026-07',
    lineItems: [
      { date:'2026-06-25', desc:'夏令营费用（7/14–7/18，5天）', amount:350, type:'tuition' },
      { date:'2026-06-25', desc:'早鸟优惠（6/30前报名）', amount:-51, type:'discount' },
    ],
    adjustments: [],
    subtotal: 350, total: 299,
    earlyBird: true, earlyBirdDeadline: '2026-06-30', earlyBirdPrice: 299,
    status: 'paid', dueDate: '2026-07-07',
    sentAt: '2026-06-25', paidAt: '2026-06-28', reminderCount: 0, lastReminderAt: null,
  },
];

// ── Invoice计算函数（实际产品会在后端执行）──────────────────────────────────
export function calculateInvoice(offering, pricingPlan, attendanceRecords, enrollmentDate, earlyBirdConfig) {
  const lineItems = [];
  let total = 0;

  if (pricingPlan.model === 'monthly_tuition') {
    // 月缴：固定金额，不管出席
    lineItems.push({ desc: `月缴学费`, amount: pricingPlan.amount, type: 'tuition' });
    total = pricingPlan.amount;

    // 老师取消的堂次减免
    const cancelledSessions = (attendanceRecords || []).filter(r => r.status === 'teacher_cancelled');
    if (cancelledSessions.length > 0) {
      const perSession = pricingPlan.amount / 4;
      const deduction = -(cancelledSessions.length * perSession);
      lineItems.push({ desc: `老师取消 ${cancelledSessions.length} 堂，减免`, amount: deduction, type: 'adjustment' });
      total += deduction;
    }

  } else if (pricingPlan.model === 'drop_in') {
    // 按堂：只算出席的堂
    const attended = (attendanceRecords || []).filter(r => r.status === 'present' || r.status === 'makeup');
    attended.forEach(r => {
      lineItems.push({ date: r.date, desc: `私教 ${offering.durationMin}分钟`, amount: pricingPlan.amount, type: 'session' });
      total += pricingPlan.amount;
    });

  } else if (pricingPlan.model === 'semester_tuition') {
    // 营期/学期：一次收
    let amount = pricingPlan.amount;
    lineItems.push({ desc: offering.name, amount, type: 'tuition' });

    // 早鸟折扣
    if (earlyBirdConfig && enrollmentDate <= earlyBirdConfig.deadline) {
      const discount = earlyBirdConfig.price - amount;
      lineItems.push({ desc: `早鸟优惠（${earlyBirdConfig.deadline}前报名）`, amount: discount, type: 'discount' });
      amount = earlyBirdConfig.price;
    }
    total = amount;
  }

  return { lineItems, total };
}

// ── Open House Events ────────────────────────────────────────────────────────
export const mockOpenHouses = [
  {
    id: 'oh-fall26',
    studioId: 'mira-piano',
    title: '2026 秋季招生 Open House',
    date: '2026-08-23',
    time: '周六 下午2:00–4:00',
    location: 'Mira Chen 钢琴工作室（3楼大教室）',
    desc: '欢迎家长带孩子来认识我们！当天有示范演奏、课程介绍、Q&A，现场报名享早鸟优惠。',
    maxAttendees: 20,
    registeredCount: 11,
    offeringIds: ['co-jmc1-sarah-fall26','co-jmc1-mira-fall26','co-jmc2-sarah-fall26','co-jmc2-mira-fall26','co-jmc3-mira-fall26'],
  },
];

// ── Trial Requests（旁听申请）────────────────────────────────────────────────
export const mockTrialRequests = [
  {
    id: 'tr-01',
    studioId: 'mira-piano',
    offeringId: 'co-jmc1-sarah-fall26',
    type: 'drop_in',
    status: 'pending',   // pending | approved | declined
    parentName: '林妈妈',
    parentEmail: 'linmama@gmail.com',
    parentPhone: '425-888-0001',
    childName: '林小恩',
    childAge: 4,
    preferredDate: '2026-07-08',
    note: '孩子之前没有钢琴经验，想先看看课堂氛围。',
    createdAt: '2026-06-27',
  },
  {
    id: 'tr-02',
    studioId: 'mira-piano',
    offeringId: 'co-jmc2-mira-fall26',
    type: 'drop_in',
    status: 'pending',
    parentName: '黄爸爸',
    parentEmail: 'huangdad@gmail.com',
    parentPhone: '206-777-0002',
    childName: '黄小宇',
    childAge: 6,
    preferredDate: '2026-07-10',
    note: '孩子在台湾学过半年钢琴，不确定程度是否适合JMC2。',
    createdAt: '2026-06-26',
  },
];

// ── Open House Registrations ──────────────────────────────────────────────────
export const mockOpenHouseRegistrations = [
  { id:'ohr-01', openHouseId:'oh-fall26', parentName:'王妈妈', parentEmail:'wang.mom@gmail.com', parentPhone:'425-100-0001', childCount:1, note:'', createdAt:'2026-06-20' },
  { id:'ohr-02', openHouseId:'oh-fall26', parentName:'陈爸爸', parentEmail:'chen.dad@gmail.com', parentPhone:'425-100-0002', childCount:2, note:'两个孩子，5岁和7岁', createdAt:'2026-06-22' },

  // ── demo@parent.com 的报名（用于 ParentHome 展示）
  { id: 'demo-en1', childId: 'c1',  childName: '林小美', parentEmail: 'demo@parent.com', studioId: 'mira-piano',       offeringId: 'co-jmc1-sarah-fall26', slotId: 's1a', status: 'confirmed', paymentStatus: 'paid' },
  { id: 'demo-en2', childId: 'c17', childName: '小宇',   parentEmail: 'demo@parent.com', studioId: 'david-swim',       offeringId: 'co-swim-adv-fall26',   slotId: 'sw2', status: 'confirmed', paymentStatus: 'paid' },
  { id: 'demo-en3', childId: 'c1',  childName: '林小美', parentEmail: 'demo@parent.com', studioId: 'art-studio-emily', offeringId: 'co-art-fall26',        slotId: 'art1', status: 'confirmed', paymentStatus: 'paid' },
];

// ── Studio Announcements（各机构公告）────────────────────────────────────────
export const mockStudioAnnouncements = {
  'mira-piano': [
    { id:'mp-a1', date:'2026-06-20', title:'🎹 秋季班报名开始！', body:'2026秋季钢琴课程现已开放报名，JMC1、JMC2、JMC3各班名额有限，欢迎尽早预约免费试听课。', pinned:true },
    { id:'mp-a2', date:'2026-06-15', title:'🏆 学生参赛成果', body:'JXC班的谢宗翰同学在6月RCM考级中获得Honors，恭喜！另有3位同学通过RCM Grade 2考核。', pinned:false },
    { id:'mp-a3', date:'2026-06-01', title:'☀️ 暑期钢琴集训营', body:'7月14-25日，每天90分钟，专注乐理+演奏，还有3个名额！早鸟价$299，报名请联络工作室。', pinned:false },
  ],
  'david-swim': [
    { id:'ds-a1', date:'2026-06-22', title:'🎪 Open House 7/5', body:'7月5日（周六）下午2-4点开放参观，欢迎家长带孩子来免费体验一堂课，认识我们的教练团队！', pinned:true },
    { id:'ds-a2', date:'2026-06-10', title:'⚽ 暑期密集班开放报名', body:'7月14日至8月1日，每周一三五上课，共12堂，学费$180。适合有基础的学生进阶。', pinned:false },
    { id:'ds-a3', date:'2026-05-28', title:'🏅 学生参赛捷报', body:'恭喜李大勇、王欣怡两位同学在Eastside青少年游泳锦标赛中分别获得蛙式第1名和自由式第3名！', pinned:false },
  ],
  'lily-chinese': [
    { id:'lc-a1', date:'2026-06-18', title:'📚 秋季中文班招生', body:'2026年秋季班（9月开课）现已开放报名，分初级、中级、高级三个程度，每班限6人，欢迎评估入班。', pinned:true },
    { id:'lc-a2', date:'2026-06-05', title:'🎭 端午节文化活动', body:'6月底将举办端午节文化课，包含包粽子、龙舟故事、诗词朗诵，欢迎所有学生参加！', pinned:false },
    { id:'lc-a3', date:'2026-05-20', title:'📝 中文能力测验', body:'每学期末举办内部中文能力测验，帮助家长了解孩子的学习进度，6月21日举行，请准时出席。', pinned:false },
  ],
  'bella-violin': [
    { id:'bv-a1', date:'2026-06-25', title:'🎻 暑期新生免费试听', body:'7月整个月，新生首堂课免费体验！铃木教学法从零基础开始，欢迎3岁以上小朋友报名。', pinned:true },
    { id:'bv-a2', date:'2026-06-12', title:'🏆 学生比赛获奖', body:'恭喜陈小雨同学在Washington Young Musicians Competition中荣获小提琴8-10岁组第二名！', pinned:false },
    { id:'bv-a3', date:'2026-05-30', title:'🎵 年度音乐会报名', body:'8月15日将举办年度学生音乐会，欢迎在读学生报名上台演出，截止报名6月30日。', pinned:false },
  ],
  'coach-tony-soccer': [
    { id:'ts-a1', date:'2026-06-24', title:'⚽ 暑期足球营开放报名', body:'7月21-24日（周一至周四）密集训练营，每天3小时，学费$120，适合6-14岁有基础学员。', pinned:true },
    { id:'ts-a2', date:'2026-06-08', title:'📋 秋季常规班招生', body:'9月起每周六上午10-11:30团体训练课，分5-8岁和9-14岁两个组别，名额各8人。', pinned:false },
    { id:'ts-a3', date:'2026-05-15', title:'🏆 Marymoor杯足球赛', body:'我们的U10队在Marymoor夏季杯中取得3胜1平的佳绩，进入决赛！感谢家长的支持与加油！', pinned:false },
  ],
  'art-studio-emily': [
    { id:'ae-a1', date:'2026-06-26', title:'🎨 暑期美术营 特价优惠', body:'7月暑期美术营8堂课$180（原价$240），涵盖水彩、素描、手工，每班限6人，快速报名！', pinned:true },
    { id:'ae-a2', date:'2026-06-15', title:'🖼️ 学生作品展', body:'6月30日至7月10日，工作室举办学生春季作品展，欢迎家长朋友前来参观，周一至六开放。', pinned:false },
    { id:'ae-a3', date:'2026-06-01', title:'✏️ 新课：数字插画班', body:'7月起开设iPad数字插画入门班，专为9岁以上学员设计，学习Procreate基础，每班限4人。', pinned:false },
  ],
  'code-kids-bellevue': [
    { id:'ck-a1', date:'2026-06-25', title:'🆕 Python游戏开发班 7/1开课', body:'全新Python游戏开发课程正式上线！适合10-14岁，8堂课完成一个自己的游戏项目，名额仅剩4位。', pinned:true },
    { id:'ck-a2', date:'2026-06-10', title:'💻 暑期Scratch集训营', body:'7月14-18日（五天密集班），从零学起用Scratch做动画和游戏，适合7-10岁，$150/人。', pinned:false },
    { id:'ck-a3', date:'2026-05-28', title:'🏆 学生作品发布', body:'恭喜5月毕业班的8位同学！他们在结课展中展示了自己开发的手机App和小游戏，家长们都非常惊喜！', pinned:false },
  ],
  'dance-studio-grace': [
    { id:'dg-a1', date:'2026-06-20', title:'🎭 年度成果演出 7/20', body:'7月20日（周日）下午3点，Bellevue Arts Center年度舞蹈发表会，欢迎家长购票观赏！票价$15/人。', pinned:true },
    { id:'dg-a2', date:'2026-06-12', title:'💃 秋季班招生开始', body:'9月芭蕾基础班、爵士舞进阶班现已开放报名，各班限10人，欢迎3-16岁学员加入。', pinned:false },
    { id:'dg-a3', date:'2026-05-20', title:'🩰 夏季芭蕾密集班', body:'7-8月每周两堂芭蕾密集训练，专为有志参加秋季考级或比赛的学员设计，共16堂$320。', pinned:false },
  ],
  'math-plus-bellevue': [
    { id:'mp2-a1', date:'2026-06-22', title:'📐 AMC 8 备考班 8月开课', body:'8月起AMC 8竞赛备考班开始招生，目标2026年11月考试，限10人，建议四年级以上学员报名。', pinned:true },
    { id:'mp2-a2', date:'2026-06-15', title:'🎉 学生成绩捷报', body:'今年AMC 8考试，本班5位学生获得Honor Roll以上成绩，其中2位进入Distinguished Honor Roll，祝贺！', pinned:false },
    { id:'mp2-a3', date:'2026-05-30', title:'📊 暑期数学思维强化班', body:'7月暑期8堂数学思维课，专注逻辑推理和解题策略，适合3-6年级学员，名额仅剩2位。', pinned:false },
  ],
  'chess-academy-nw': [
    { id:'ca-a1', date:'2026-06-18', title:'♟️ 秋季班报名开放', body:'9月起常规象棋课程开放报名，分初学组（无基础）和进阶组（已有评级），每周一次，欢迎查询。', pinned:true },
    { id:'ca-a2', date:'2026-06-05', title:'🏆 学生全国赛成绩', body:'恭喜本院4位学员在Washington State Junior Chess Championship中取得佳绩，其中张浩然同学荣获U12组亚军！', pinned:false },
    { id:'ca-a3', date:'2026-05-10', title:'🎮 线上象棋课现已开放', body:'因应家长需求，现提供Zoom线上个人课，弹性时间安排，适合无法亲自到场的学员。', pinned:false },
  ],
};

// ── Leave Requests（请假记录）────────────────────────────────────────────────
// leaveStatus: 'no_makeup'(请假不补) | 'makeup_scheduled'(已安排补课) | null(未请假)
// 薪资规则：
//   no_makeup / 缺席未请假 → 原班老师照收学费，payroll不受影响
//   makeup_scheduled → 补课那堂计入makeup老师的薪资


export const mockLeaveRequests = [
  {
    id: 'lr-001', enrollmentId: 'en5', childName: '李晓彤',
    offeringId: 'co-jmc1-sarah-fall26', originalDate: '2026-06-17',
    status: 'makeup_scheduled',
    makeupOfferingId: 'co-jmc1-mira-fall26', makeupDate: '2026-06-25',
    submittedAt: '2026-06-10', note: '家庭旅行',
  },
  {
    id: 'lr-002', enrollmentId: 'en6', childName: '黄思颖',
    offeringId: 'co-jmc1-sarah-fall26', originalDate: '2026-06-21',
    status: 'no_makeup',
    makeupOfferingId: null, makeupDate: null,
    submittedAt: '2026-06-18', note: '身体不适',
  },
  {
    id: 'lr-003', enrollmentId: 'en3b', childName: '周晓晓',
    offeringId: 'co-jmc1-mira-fall26', originalDate: '2026-06-18',
    status: 'makeup_scheduled',
    makeupOfferingId: 'co-jmc1-mira-fall26', makeupDate: '2026-06-25',
    submittedAt: '2026-06-15', note: '钢琴比赛',
  },
];


// Legacy compatibility
export const mockProducts = mockClassOfferings.map(o => ({
  ...o,
  price: mockPricingPlans.find(p => p.id === o.pricingPlanId)?.amount || 0,
  priceUnit: mockPricingPlans.find(p => p.id === o.pricingPlanId)?.unit || '月',
  scheduleModel: o.teachingTypeId === 'tt-piano-workshop' ? 'camp' : o.teachingTypeId === 'tt-piano-private' ? 'appointment' : 'semester',
  enrollmentModel: 'seat',
  productId: o.id,
  durationMin: o.durationMin,
}));

export const mockEnrollmentsLegacy = mockEnrollments.map(e => ({
  ...e,
  productId: e.offeringId,
  classId: e.offeringId,
}));

// Teacher payroll
// ── 上课记录（从班级开班自动生成）────────────────────────────────────────────
// 每条记录 = 一堂课的出席情况
// teacherId: 主教老师  offeringId: 班级  date: 上课日期  sessionCount: 本月已上堂数
export const mockAttendanceRecords = [
  // JMC1 班A (Sarah) - 星期二+星期六，6月份已上8堂
  { id: 'att-001', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-03', day: '星期二', students: 8, substitute: false },
  { id: 'att-002', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-07', day: '星期六', students: 8, substitute: false },
  { id: 'att-003', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-10', day: '星期二', students: 7, substitute: false },
  { id: 'att-004', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-14', day: '星期六', students: 8, substitute: false },
  { id: 'att-005', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-mira',  date: '2026-06-17', day: '星期二', students: 8, substitute: true, substituteFor: 'teacher-sarah' },
  { id: 'att-006', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-21', day: '星期六', students: 8, substitute: false },
  { id: 'att-007', offeringId: 'co-jmc1-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-24', day: '星期二', students: 8, substitute: false },
  // JMC1 班B (Mira) - 星期三
  { id: 'att-011', offeringId: 'co-jmc1-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-04', day: '星期三', students: 5, substitute: false },
  { id: 'att-012', offeringId: 'co-jmc1-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-11', day: '星期三', students: 5, substitute: false },
  { id: 'att-013', offeringId: 'co-jmc1-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-18', day: '星期三', students: 5, substitute: false },
  { id: 'att-014', offeringId: 'co-jmc1-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-25', day: '星期三', students: 5, substitute: false },
  // JMC2 班A (Sarah) - 星期三
  { id: 'att-021', offeringId: 'co-jmc2-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-04', day: '星期三', students: 6, substitute: false },
  { id: 'att-022', offeringId: 'co-jmc2-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-11', day: '星期三', students: 6, substitute: false },
  { id: 'att-023', offeringId: 'co-jmc2-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-18', day: '星期三', students: 6, substitute: false },
  { id: 'att-024', offeringId: 'co-jmc2-sarah-fall26', teacherId: 'teacher-sarah', date: '2026-06-25', day: '星期三', students: 6, substitute: false },
  // JMC2 班B (Mira) - 星期五
  { id: 'att-031', offeringId: 'co-jmc2-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-06', day: '星期五', students: 4, substitute: false },
  { id: 'att-032', offeringId: 'co-jmc2-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-13', day: '星期五', students: 4, substitute: false },
  { id: 'att-033', offeringId: 'co-jmc2-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-20', day: '星期五', students: 4, substitute: false },
  { id: 'att-034', offeringId: 'co-jmc2-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-27', day: '星期五', students: 4, substitute: false },
  // JMC3 (Mira) - 星期四
  { id: 'att-041', offeringId: 'co-jmc3-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-05', day: '星期四', students: 6, substitute: false },
  { id: 'att-042', offeringId: 'co-jmc3-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-12', day: '星期四', students: 6, substitute: false },
  { id: 'att-043', offeringId: 'co-jmc3-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-19', day: '星期四', students: 6, substitute: false },
  { id: 'att-044', offeringId: 'co-jmc3-mira-fall26', teacherId: 'teacher-mira', date: '2026-06-26', day: '星期四', students: 6, substitute: false },
  // 私教 (Mira) - 星期一
  { id: 'att-051', offeringId: 'co-private-mira', teacherId: 'teacher-mira', date: '2026-06-02', day: '星期一', students: 1, substitute: false },
  { id: 'att-052', offeringId: 'co-private-mira', teacherId: 'teacher-mira', date: '2026-06-09', day: '星期一', students: 1, substitute: false },
  { id: 'att-053', offeringId: 'co-private-mira', teacherId: 'teacher-mira', date: '2026-06-16', day: '星期一', students: 1, substitute: false },
  { id: 'att-054', offeringId: 'co-private-mira', teacherId: 'teacher-mira', date: '2026-06-23', day: '星期一', students: 1, substitute: false },
  // 私教 (Sarah) - 星期二
  { id: 'att-061', offeringId: 'co-private-sarah', teacherId: 'teacher-sarah', date: '2026-06-03', day: '星期二', students: 1, substitute: false },
  { id: 'att-062', offeringId: 'co-private-sarah', teacherId: 'teacher-sarah', date: '2026-06-10', day: '星期二', students: 1, substitute: false },
  { id: 'att-063', offeringId: 'co-private-sarah', teacherId: 'teacher-sarah', date: '2026-06-17', day: '星期二', students: 1, substitute: false },
  { id: 'att-064', offeringId: 'co-private-sarah', teacherId: 'teacher-sarah', date: '2026-06-24', day: '星期二', students: 1, substitute: false },

  // ── demo@parent.com 帐单（与课表页共用，用于演示首页付款提醒）──────────────
  { id:'inv-001', parentEmail:'demo@parent.com', month:'2026年6月', studioId:'mira-piano', offeringId:'co-jmc1-sarah-fall26', billingMode:'monthly_tuition', billingMonth:'2026-06', lineItems:[{ date:'2026-06-03', desc:'6月学费', amount:220, type:'tuition' }], adjustments:[], subtotal:220, total:220, amount:220, status:'pending', dueDate:'2026-06-30', sentAt:'2026-06-01', paidAt:null, reminderCount:1, lastReminderAt:'2026-06-25' },
  { id:'inv-002', parentEmail:'demo@parent.com', month:'2026年5月', studioId:'mira-piano', offeringId:'co-jmc1-sarah-fall26', billingMode:'monthly_tuition', billingMonth:'2026-05', lineItems:[{ date:'2026-05-06', desc:'5月学费', amount:220, type:'tuition' }], adjustments:[], subtotal:220, total:220, amount:220, status:'paid', dueDate:'2026-05-31', sentAt:'2026-05-01', paidAt:'2026-05-28', reminderCount:0, lastReminderAt:null },
  { id:'inv-003', parentEmail:'demo@parent.com', month:'2026年4月', studioId:'mira-piano', offeringId:'co-jmc1-sarah-fall26', billingMode:'monthly_tuition', billingMonth:'2026-04', lineItems:[{ date:'2026-04-01', desc:'4月学费', amount:220, type:'tuition' }], adjustments:[], subtotal:220, total:220, amount:220, status:'paid', dueDate:'2026-04-30', sentAt:'2026-04-01', paidAt:'2026-04-25', reminderCount:0, lastReminderAt:null },
];
export const mockPendingPayments = mockEnrollments.filter(e => e.paymentStatus === 'pending');
export const mockRoster = {};
export const mockBookings = mockEnrollmentsLegacy;

// ── Legacy aliases（向下兼容旧import）────────────────────────────────────────
export const mockCourses = mockLevels;

// ── 帐单数据（Invoice）────────────────────────────────────────────────────────
// 实际产品从 API 读取；这里 demo parent 的帐单用于演示