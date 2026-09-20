'use strict';

window.TA = window.TA || {};

(function (TA) {
  var SUPPORTED = ['ru', 'en', 'kk'];
  var STORAGE_KEY = 'ta_lang';

  var DICT = {
    ru: {
      brandName: 'Помощник учителя',
      brandSub: 'формативка + анализ оценок',
      langName: 'Русский',
      settingsBtn: 'Настройки',
      settingsTitle: 'Ключ Anthropic API',
      settingsDesc:
        'Приложению нужен ваш собственный ключ Anthropic API, чтобы генерировать тексты. Он сохраняется только в этом браузере и отправляется исключительно на ваш сервер вместе с запросом — учителю не нужно ничего настраивать на сервере.',
      apiKeyLabel: 'Ключ API',
      apiKeyPh: 'sk-ant-…',
      getKeyLink: 'Получить ключ на console.anthropic.com →',
      btnSaveKey: 'Сохранить',
      btnClearKey: 'Удалить ключ',
      keySavedNote: 'Ключ сохранён в этом браузере.',
      keyClearedNote: 'Ключ удалён.',
      errKeyMissing: 'Сначала введите ключ Anthropic API в настройках.',
      tabFormativka: 'Формативка',
      tabAnalysis: 'Анализ оценок',
      titleFormativka: 'Формативка из темы урока',
      subFormativka: 'Опишите тему — получите готовое формативное оценивание для печати.',
      titleAnalysis: 'Анализ оценок класса',
      subAnalysis: 'Вставьте таблицу с оценками — получите разбор по каждому ученику и по классу в целом.',
      fieldSubject: 'Предмет',
      fieldSubjectPh: 'Например: биология',
      fieldGrade: 'Класс',
      fieldGradePlaceholder: 'Выберите класс',
      fieldTopic: 'Тема урока',
      fieldTopicPh: 'Например: фотосинтез — процесс, значение для растений и экосистемы',
      fieldCount: 'Количество заданий',
      fieldNotes: 'Комментарий (необязательно)',
      fieldNotesPh: 'Особенности класса, на что сделать упор, формат заданий и т. п.',
      btnGenerate: 'Сгенерировать',
      btnGenerating: 'Генерируем…',
      btnDownload: 'Скачать .docx',
      btnPreparingFile: 'Готовим файл…',
      btnRegenerate: 'Сгенерировать заново',
      sectionPreview: 'Предпросмотр',
      emptyFormativka: 'Заполните форму слева и нажмите «Сгенерировать» — здесь появится готовая формативка.',
      fieldTable: 'Таблица с оценками',
      tableHint:
        'Скопируйте диапазон из Excel или Google Таблиц и вставьте сюда (первая строка — заголовки: имя ученика, оценки по заданиям и т. п.).',
      tableHintDefault: 'Вставьте таблицу — например, скопированную из Excel или Google Таблиц.',
      tableHintParsed: function (rows, cols) {
        return 'Распознано строк: ' + rows + ' (включая заголовок), столбцов: ' + cols;
      },
      tablePh: 'Ученик\tЗадание 1\tЗадание 2\tЗадание 3\nИванов А.\t4\t5\t3\nПетрова М.\t5\t5\t5',
      btnAnalyze: 'Проанализировать',
      btnAnalyzing: 'Анализируем…',
      sectionOverview: 'Обзор от ИИ',
      emptyAnalysis: 'Вставьте таблицу и нажмите «Проанализировать» — здесь появится разбор по классу и по каждому ученику.',
      errNeedTable: 'Вставьте таблицу: первая строка — заголовки столбцов, дальше строки с оценками.',
      errGeneric: 'Не удалось выполнить запрос. Попробуйте ещё раз.',
      errDocx: 'Не удалось подготовить файл .docx.',
      errDocxMissing: 'Библиотека для .docx не загрузилась. Проверьте соединение и обновите страницу.',
      errTimeout: 'Сервер не ответил вовремя — попробуйте ещё раз.',
      errNetwork: 'Не удалось связаться с сервером. Проверьте подключение к сети.',
      errRateLimited: 'Слишком много запросов подряд — подождите немного.',
      errServer: function (status) { return 'Ошибка сервера (' + status + ').'; },
      footer: 'Формативка и анализ оценок · черновик, который стоит перепроверить перед печатью',
      howBtn: 'Как это работает',
      howTitle: 'Как это работает',
      howStep1: '1) Вкладка «Формативка» — опишите предмет, класс и тему, нажмите «Сгенерировать». Скачайте готовый документ в .docx и распечатайте.',
      howStep2: '2) Вкладка «Анализ оценок» — вставьте таблицу или загрузите файл (ученик / задания / оценки), нажмите «Проанализировать». ИИ покажет, над чем поработать каждому ученику и какие темы стоит повторить всему классу.',
      howStep3: 'Тексты создаёт модель Claude по вашему собственному ключу Anthropic API — он не хранится на сервере.',
      howOk: 'Понятно',
      tipBannerBold: 'Работает через ваш ключ Anthropic API.',
      tipBannerText: 'Ключ хранится только в этом браузере и отправляется вместе с запросом — на сервере ничего не сохраняется.',
      dzTitle: 'Загрузите файл или перетащите сюда',
      dzSub: '.xlsx, .xls или .csv — заполнит таблицу ниже автоматически',
    },
    en: {
      brandName: 'Teacher Assistant',
      brandSub: 'formative assessment + grade analysis',
      langName: 'English',
      settingsBtn: 'Settings',
      settingsTitle: 'Anthropic API key',
      settingsDesc:
        'The app needs your own Anthropic API key to generate text. It is saved only in this browser and sent solely to your own server with each request — nothing to configure on the server.',
      apiKeyLabel: 'API key',
      apiKeyPh: 'sk-ant-…',
      getKeyLink: 'Get a key at console.anthropic.com →',
      btnSaveKey: 'Save',
      btnClearKey: 'Remove key',
      keySavedNote: 'Key saved in this browser.',
      keyClearedNote: 'Key removed.',
      errKeyMissing: 'Please enter your Anthropic API key in Settings first.',
      tabFormativka: 'Formative test',
      tabAnalysis: 'Grade analysis',
      titleFormativka: 'Formative assessment from a lesson topic',
      subFormativka: 'Describe the topic — get a ready-to-print formative assessment.',
      titleAnalysis: 'Class grade analysis',
      subAnalysis: 'Paste a grade table — get a breakdown for each student and the class as a whole.',
      fieldSubject: 'Subject',
      fieldSubjectPh: 'e.g. Biology',
      fieldGrade: 'Grade',
      fieldGradePlaceholder: 'Select a grade',
      fieldTopic: 'Lesson topic',
      fieldTopicPh: 'e.g. photosynthesis — the process and its role for plants and ecosystems',
      fieldCount: 'Number of tasks',
      fieldNotes: 'Comment (optional)',
      fieldNotesPh: 'Class specifics, what to emphasize, task format, etc.',
      btnGenerate: 'Generate',
      btnGenerating: 'Generating…',
      btnDownload: 'Download .docx',
      btnPreparingFile: 'Preparing file…',
      btnRegenerate: 'Regenerate',
      sectionPreview: 'Preview',
      emptyFormativka: 'Fill in the form on the left and click "Generate" — the finished assessment will appear here.',
      fieldTable: 'Grade table',
      tableHint:
        'Copy a range from Excel or Google Sheets and paste it here (first row = headers: student name, task grades, etc.).',
      tableHintDefault: 'Paste a table — for example, copied from Excel or Google Sheets.',
      tableHintParsed: function (rows, cols) {
        return 'Recognized rows: ' + rows + ' (including header), columns: ' + cols;
      },
      tablePh: 'Student\tTask 1\tTask 2\tTask 3\nJohnson A.\t4\t5\t3\nSmith M.\t5\t5\t5',
      btnAnalyze: 'Analyze',
      btnAnalyzing: 'Analyzing…',
      sectionOverview: 'AI overview',
      emptyAnalysis: 'Paste a table and click "Analyze" — a breakdown for the class and each student will appear here.',
      errNeedTable: 'Paste a table: the first row is the column headers, then rows of grades.',
      errGeneric: 'Could not complete the request. Please try again.',
      errDocx: 'Could not prepare the .docx file.',
      errDocxMissing: 'The .docx library failed to load. Check your connection and refresh the page.',
      errTimeout: 'The server did not respond in time — please try again.',
      errNetwork: 'Could not reach the server. Check your network connection.',
      errRateLimited: 'Too many requests in a row — please wait a moment.',
      errServer: function (status) { return 'Server error (' + status + ').'; },
      footer: 'Formative assessment and grade analysis · a draft worth double-checking before printing',
      howBtn: 'How it works',
      howTitle: 'How it works',
      howStep1: '1) "Formative test" tab — describe the subject, grade and topic, click "Generate". Download the finished .docx file and print it.',
      howStep2: '2) "Grade analysis" tab — paste a table or upload a file (student / tasks / grades), click "Analyze". The AI shows what each student should work on and which topics the whole class should review.',
      howStep3: 'Texts are generated by the Claude model using your own Anthropic API key — it is not stored on the server.',
      howOk: 'Got it',
      tipBannerBold: 'Runs on your own Anthropic API key.',
      tipBannerText: 'The key is stored only in this browser and sent with each request — nothing is saved on the server.',
      dzTitle: 'Upload a file or drag it here',
      dzSub: '.xlsx, .xls or .csv — fills the table below automatically',
    },
    kk: {
      brandName: 'Мұғалім көмекшісі',
      brandSub: 'қалыптастырушы бағалау + баға талдауы',
      langName: 'Қазақша',
      settingsBtn: 'Баптаулар',
      settingsTitle: 'Anthropic API кілті',
      settingsDesc:
        'Мәтін жасау үшін қосымшаға сіздің жеке Anthropic API кілтіңіз қажет. Ол тек осы браузерде сақталады және әр сұраныспен бірге тек сіздің серверіңізге жіберіледі — серверде ештеңе баптаудың қажеті жоқ.',
      apiKeyLabel: 'API кілті',
      apiKeyPh: 'sk-ant-…',
      getKeyLink: 'Кілтті console.anthropic.com сайтынан алыңыз →',
      btnSaveKey: 'Сақтау',
      btnClearKey: 'Кілтті өшіру',
      keySavedNote: 'Кілт осы браузерде сақталды.',
      keyClearedNote: 'Кілт өшірілді.',
      errKeyMissing: 'Алдымен баптауларда Anthropic API кілтін енгізіңіз.',
      tabFormativka: 'Қалыптастырушы бағалау',
      tabAnalysis: 'Бағаларды талдау',
      titleFormativka: 'Сабақ тақырыбынан қалыптастырушы бағалау',
      subFormativka: 'Тақырыпты сипаттаңыз — басып шығаруға дайын қалыптастырушы бағалау аласыз.',
      titleAnalysis: 'Сынып бағаларын талдау',
      subAnalysis: 'Бағалар кестесін қойыңыз — әр оқушы және сынып бойынша жалпы талдау аласыз.',
      fieldSubject: 'Пән',
      fieldSubjectPh: 'Мысалы: биология',
      fieldGrade: 'Сынып',
      fieldGradePlaceholder: 'Сыныпты таңдаңыз',
      fieldTopic: 'Сабақ тақырыбы',
      fieldTopicPh: 'Мысалы: фотосинтез — өсімдіктер мен экожүйе үшін маңызы',
      fieldCount: 'Тапсырмалар саны',
      fieldNotes: 'Түсініктеме (міндетті емес)',
      fieldNotesPh: 'Сыныптың ерекшеліктері, неге баса назар аудару керек, тапсырма пішімі және т.б.',
      btnGenerate: 'Жасау',
      btnGenerating: 'Жасалуда…',
      btnDownload: '.docx жүктеу',
      btnPreparingFile: 'Файл дайындалуда…',
      btnRegenerate: 'Қайта жасау',
      sectionPreview: 'Алдын ала қарау',
      emptyFormativka: 'Сол жақтағы форманы толтырып, «Жасау» түймесін басыңыз — дайын бағалау осында пайда болады.',
      fieldTable: 'Бағалар кестесі',
      tableHint:
        'Excel немесе Google Sheets-тен ауқымды көшіріп, осында қойыңыз (бірінші жол — тақырыптар: оқушы аты, тапсырма бағалары және т.б.).',
      tableHintDefault: 'Кестені қойыңыз — мысалы, Excel немесе Google Sheets-тен көшірілген.',
      tableHintParsed: function (rows, cols) {
        return 'Танылған жолдар: ' + rows + ' (тақырыппен қоса), бағандар: ' + cols;
      },
      tablePh: 'Оқушы\t1-тапсырма\t2-тапсырма\t3-тапсырма\nИванов А.\t4\t5\t3\nПетрова М.\t5\t5\t5',
      btnAnalyze: 'Талдау',
      btnAnalyzing: 'Талдануда…',
      sectionOverview: 'ЖИ шолуы',
      emptyAnalysis: 'Кестені қойып, «Талдау» түймесін басыңыз — сынып және әр оқушы бойынша талдау осында пайда болады.',
      errNeedTable: 'Кестені қойыңыз: бірінші жол — баған тақырыптары, одан кейін бағалар жолдары.',
      errGeneric: 'Сұранысты орындау мүмкін болмады. Қайталап көріңіз.',
      errDocx: '.docx файлын дайындау мүмкін болмады.',
      errDocxMissing: '.docx кітапханасы жүктелмеді. Байланысты тексеріп, бетті жаңартыңыз.',
      errTimeout: 'Сервер уақытында жауап бермеді — қайталап көріңіз.',
      errNetwork: 'Серверге қосылу мүмкін болмады. Желі байланысын тексеріңіз.',
      errRateLimited: 'Қатарынан тым көп сұраныс — сәл күте тұрыңыз.',
      errServer: function (status) { return 'Сервер қатесі (' + status + ').'; },
      footer: 'Қалыптастырушы бағалау және баға талдауы · басып шығармас бұрын қайта тексерген жөн',
      howBtn: 'Бұл қалай жұмыс істейді',
      howTitle: 'Бұл қалай жұмыс істейді',
      howStep1: '1) «Қалыптастырушы бағалау» қойындысы — пәнді, сыныпты және тақырыпты сипаттап, «Жасау» түймесін басыңыз. Дайын құжатты .docx форматында жүктеп алып, басып шығарыңыз.',
      howStep2: '2) «Бағаларды талдау» қойындысы — кестені қойыңыз немесе файл жүктеңіз (оқушы / тапсырмалар / бағалар), «Талдау» түймесін басыңыз. ЖИ әр оқушыға немен жұмыс істеу керектігін және бүкіл сыныпқа қандай тақырыптарды қайталау керектігін көрсетеді.',
      howStep3: 'Мәтіндерді Claude моделі сіздің жеке Anthropic API кілтіңіз арқылы жасайды — ол серверде сақталмайды.',
      howOk: 'Түсінікті',
      tipBannerBold: 'Сіздің Anthropic API кілтіңіз арқылы жұмыс істейді.',
      tipBannerText: 'Кілт тек осы браузерде сақталады және сұраныспен бірге жіберіледі — серверде ештеңе сақталмайды.',
      dzTitle: 'Файлды жүктеңіз немесе осында сүйреп апарыңыз',
      dzSub: '.xlsx, .xls немесе .csv — төмендегі кестені автоматты түрде толтырады',
    },
  };

  function detectDefault() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || 'ru').slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(nav) !== -1) return nav;
    return 'ru';
  }

  var current = detectDefault();
  var listeners = [];

  function t(key) {
    return DICT[current][key];
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1 || lang === current) return;
    current = lang;
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    listeners.forEach(function (fn) { fn(current); });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  TA.i18n = {
    SUPPORTED: SUPPORTED,
    getLang: function () { return current; },
    setLang: setLang,
    t: t,
    onChange: onChange,
  };
})(window.TA);
