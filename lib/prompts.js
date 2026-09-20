'use strict';



const MARKDOWN_RULES = {
  ru: `Формат ответа — строго Markdown из ограниченного набора элементов:
- заголовки "#", "##", "###";
- обычные абзацы;
- маркированные списки ("- пункт");
- нумерованные списки ("1. пункт");
- "**жирный текст**";
- разделитель "---" отдельной строкой.
Не используй таблицы, блоки кода, ссылки, изображения и цитаты — они не поддерживаются рендерером.
Пиши только на русском языке, по-деловому и конкретно. Не добавляй вводных фраз о себе ("Вот...", "Конечно...") — начинай сразу с содержания, с заголовка первого уровня.`,
  en: `The response format must be strict Markdown using only this limited set of elements:
- headings "#", "##", "###";
- plain paragraphs;
- bullet lists ("- item");
- numbered lists ("1. item");
- "**bold text**";
- a "---" divider on its own line.
Do not use tables, code blocks, links, images or blockquotes — the renderer does not support them.
Write only in English, in a clear and businesslike tone. Do not add introductory phrases about yourself ("Here is...", "Sure...") — start directly with the content, from the first-level heading.`,
  kk: `Жауап пішімі — тек шектеулі Markdown элементтерінен тұруы керек:
- тақырыптар "#", "##", "###";
- қарапайым абзацтар;
- маркерлі тізімдер ("- тармақ");
- нөмірленген тізімдер ("1. тармақ");
- "**қалың мәтін**";
- жеке жолдағы "---" бөлгіші.
Кестелерді, код блоктарын, сілтемелерді, суреттерді және дәйексөздерді пайдаланба — олар рендерде қолдау таппайды.
Тек қазақ тілінде, іскерлік әрі нақты стильде жаз. Өзің туралы кіріспе тіркестер қоспа («Міне...», «Әрине...») — тікелей мазмұннан, бірінші деңгейлі тақырыптан баста.`,
};

const FORMATIVKA_LABELS = {
  ru: {
    role: 'Ты — опытный методист, который помогает учителям составлять формативное оценивание для печати.',
    subject: 'Предмет',
    grade: 'Класс',
    topic: 'Тема урока',
    count: 'Количество заданий',
    notes: 'Дополнительные пожелания учителя',
    intro: 'Составь формативное оценивание.',
    structureIntro: 'Структура ответа (используй ровно эти разделы):',
    h1: '# Формативное оценивание',
    h1Desc: 'Одна короткая строка с предметом, классом и темой урока.',
    h2Tasks: '## Задания',
    tasksDesc: (count) =>
      `Нумерованный список из ${count} заданий разного типа и уровня сложности (от простого к сложному), которые проверяют понимание темы, а не только запоминание фактов.`,
    h2Criteria: '## Критерии оценивания',
    criteriaDesc: 'Маркированный список чётких критериев/дескрипторов, по которым можно оценить выполнение заданий.',
    h2Feedback: '## Обратная связь ученику',
    feedbackDesc: 'Несколько готовых фраз обратной связи для разных уровней выполнения работы.',
  },
  en: {
    role: 'You are an experienced instructional coach helping teachers put together a printable formative assessment.',
    subject: 'Subject',
    grade: 'Grade',
    topic: 'Lesson topic',
    count: 'Number of tasks',
    notes: 'Additional notes from the teacher',
    intro: 'Put together a formative assessment.',
    structureIntro: 'Response structure (use exactly these sections):',
    h1: '# Formative Assessment',
    h1Desc: 'One short line with the subject, grade and lesson topic.',
    h2Tasks: '## Tasks',
    tasksDesc: (count) =>
      `A numbered list of ${count} tasks of varying type and difficulty (from easy to hard) that test understanding of the topic, not just fact recall.`,
    h2Criteria: '## Assessment Criteria',
    criteriaDesc: 'A bullet list of clear criteria/descriptors for grading the tasks.',
    h2Feedback: '## Feedback to the Student',
    feedbackDesc: 'A few ready-to-use feedback phrases for different levels of performance.',
  },
  kk: {
    role: 'Сен — мұғалімдерге басып шығаруға арналған қалыптастырушы бағалауды құрастыруға көмектесетін тәжірибелі әдіскерсің.',
    subject: 'Пән',
    grade: 'Сынып',
    topic: 'Сабақ тақырыбы',
    count: 'Тапсырмалар саны',
    notes: 'Мұғалімнің қосымша тілектері',
    intro: 'Қалыптастырушы бағалауды құрастыр.',
    structureIntro: 'Жауап құрылымы (дәл осы бөлімдерді пайдалан):',
    h1: '# Қалыптастырушы бағалау',
    h1Desc: 'Пән, сынып және сабақ тақырыбы көрсетілген бір қысқа жол.',
    h2Tasks: '## Тапсырмалар',
    tasksDesc: (count) =>
      `Тақырыпты түсінуді тексеретін (жаттандыны ғана емес), қиындығы әртүрлі (жеңілден қиынға қарай) ${count} тапсырмадан тұратын нөмірленген тізім.`,
    h2Criteria: '## Бағалау критерийлері',
    criteriaDesc: 'Тапсырмалардың орындалуын бағалауға болатын нақты критерийлер/дескрипторлардың маркерлі тізімі.',
    h2Feedback: '## Оқушыға кері байланыс',
    feedbackDesc: 'Орындау деңгейлері әртүрлі оқушыларға арналған бірнеше дайын кері байланыс фразалары.',
  },
};

const ANALYZE_LABELS = {
  ru: {
    role: 'Ты — опытный методист, который помогает учителю анализировать оценки класса по таблице результатов.',
    tableIntro: 'Вот таблица с оценками (первая строка — заголовки столбцов, ячейки разделены " | "):',
    notesLabel: 'Дополнительный контекст от учителя',
    structureIntro: 'Структура ответа (используй ровно эти разделы):',
    h1: '# Анализ оценок класса',
    h1Desc: 'Короткая сводка: средний балл, разброс результатов, общая картина по классу.',
    h2Overall: '## По классу в целом',
    overallDesc: 'Маркированный список: сильные и слабые темы/задания, типичные ошибки, заметные тенденции.',
    h2Students: '## По ученикам',
    studentsDesc: 'Пункт списка на каждого ученика из таблицы — его результат и точечная рекомендация.',
    h2Recs: '## Рекомендации учителю',
    recsDesc: 'Маркированный список конкретных следующих шагов к следующему уроку.',
  },
  en: {
    role: 'You are an experienced instructional coach helping a teacher analyze a class grade table.',
    tableIntro: 'Here is the grade table (the first row is the column headers, cells are separated by " | "):',
    notesLabel: 'Additional context from the teacher',
    structureIntro: 'Response structure (use exactly these sections):',
    h1: '# Class Grade Analysis',
    h1Desc: 'A short summary: average score, spread of results, overall picture for the class.',
    h2Overall: '## Class Overview',
    overallDesc: 'A bullet list: strong and weak topics/tasks, common mistakes, notable trends.',
    h2Students: '## By Student',
    studentsDesc: 'One list item per student in the table — their result and a specific recommendation.',
    h2Recs: '## Recommendations for the Teacher',
    recsDesc: 'A bullet list of concrete next steps for the next lesson.',
  },
  kk: {
    role: 'Сен — мұғалімге сынып бағаларының кестесін талдауға көмектесетін тәжірибелі әдіскерсің.',
    tableIntro: 'Бағалар кестесі (бірінші жол — баған тақырыптары, ұяшықтар " | " арқылы бөлінген):',
    notesLabel: 'Мұғалімнен қосымша контекст',
    structureIntro: 'Жауап құрылымы (дәл осы бөлімдерді пайдалан):',
    h1: '# Сынып бағаларын талдау',
    h1Desc: 'Қысқа қорытынды: орташа балл, нәтижелердің таралуы, сынып бойынша жалпы көрініс.',
    h2Overall: '## Сынып бойынша жалпы',
    overallDesc: 'Маркерлі тізім: сыныптың мықты/әлсіз тақырыптары не тапсырмалары, тән қателер, байқалатын тенденциялар.',
    h2Students: '## Оқушылар бойынша',
    studentsDesc: 'Кестедегі әр оқушыға бір тармақ — оның нәтижесі және нақты ұсыныс.',
    h2Recs: '## Мұғалімге ұсыныстар',
    recsDesc: 'Келесі сабаққа арналған нақты қадамдардың маркерлі тізімі.',
  },
};

function normalizeLang(lang) {
  return ['ru', 'en', 'kk'].includes(lang) ? lang : 'ru';
}

function formativkaPrompt({ subject, grade, topic, count, notes, lang }) {
  const L = normalizeLang(lang);
  const t = FORMATIVKA_LABELS[L];
  const notesLine = notes ? `\n${t.notes}: ${notes}` : '';
  return {
    system: `${t.role} ${MARKDOWN_RULES[L]}`,
    user:
      `${t.intro}\n` +
      `${t.subject}: ${subject}\n` +
      `${t.grade}: ${grade}\n` +
      `${t.topic}: ${topic}\n` +
      `${t.count}: ${count}${notesLine}\n\n` +
      `${t.structureIntro}\n` +
      `${t.h1}\n` +
      `${t.h1Desc}\n` +
      `${t.h2Tasks}\n` +
      `${t.tasksDesc(count)}\n` +
      `${t.h2Criteria}\n` +
      `${t.criteriaDesc}\n` +
      `${t.h2Feedback}\n` +
      `${t.feedbackDesc}`,
  };
}

function analyzePrompt({ rows, notes, lang }) {
  const L = normalizeLang(lang);
  const t = ANALYZE_LABELS[L];
  const notesLine = notes ? `\n${t.notesLabel}: ${notes}` : '';
  const tableText = rows.map((row) => row.join(' | ')).join('\n');
  return {
    system: `${t.role} ${MARKDOWN_RULES[L]}`,
    user:
      `${t.tableIntro}\n\n${tableText}\n${notesLine}\n\n` +
      `${t.structureIntro}\n` +
      `${t.h1}\n` +
      `${t.h1Desc}\n` +
      `${t.h2Overall}\n` +
      `${t.overallDesc}\n` +
      `${t.h2Students}\n` +
      `${t.studentsDesc}\n` +
      `${t.h2Recs}\n` +
      `${t.recsDesc}`,
  };
}

module.exports = { formativkaPrompt, analyzePrompt };
