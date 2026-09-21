'use strict';


const SUPPORTED_LANGS = ['ru', 'en', 'kk'];
const DEFAULT_LANG = 'ru';

function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
}


const MESSAGES = {
  ru: {
    badJson: 'Тело запроса должно быть объектом JSON.',
    subjectRequired: 'Укажите предмет.',
    subjectTooLong: 'Название предмета слишком длинное.',
    gradeRequired: 'Укажите класс (1–11).',
    topicRequired: 'Укажите тему урока.',
    topicTooLong: (max) => `Тема слишком длинная (максимум ${max} символов).`,
    countRange: (min, max) => `Количество заданий должно быть числом от ${min} до ${max}.`,
    notesType: 'Комментарий должен быть текстом.',
    notesTooLong: (max) => `Комментарий слишком длинный (максимум ${max} символов).`,
    tableTooShort: 'Нужна таблица минимум из строки заголовков и одной строки с оценками.',
    tableTooManyRows: (max) => `Слишком много строк в таблице (максимум ${max}).`,
    rowInvalid: (i) => `Строка ${i} таблицы имеет неверный формат.`,
    rowTooManyCols: (i, max) => `Слишком много столбцов в строке ${i} (максимум ${max}).`,
    methodNotAllowed: 'Метод не поддерживается.',
    keyRequired: 'Введите ключ Anthropic API в настройках (иконка шестерёнки вверху).',
    keyInvalid: 'Ключ API недействителен. Проверьте его в настройках.',
    keyInvalidFormat: 'Ключ API указан в неверном формате.',
    rateLimited: 'Сервис генерации перегружен — попробуйте через минуту.',
    upstreamBadRequest: 'Не удалось получить корректный ответ от модели.',
    upstreamError: 'Сервис генерации временно недоступен. Попробуйте ещё раз.',
    emptyResponse: 'Модель вернула пустой ответ. Попробуйте ещё раз.',
    internalError: 'Внутренняя ошибка сервера.',
    routeNotFound: 'Маршрут не найден.',
    corsForbidden: 'Домен не разрешён.',
    tooManyRequests: 'Слишком много запросов подряд — подождите немного.',
    filenameFormativka: 'Формативка',
    filenameGrade: (grade) => `${grade} класс`,
    filenameAnalysis: 'Анализ оценок класса',
  },
  en: {
    badJson: 'The request body must be a JSON object.',
    subjectRequired: 'Please enter a subject.',
    subjectTooLong: 'The subject name is too long.',
    gradeRequired: 'Please select a grade (1–11).',
    topicRequired: 'Please enter the lesson topic.',
    topicTooLong: (max) => `The topic is too long (maximum ${max} characters).`,
    countRange: (min, max) => `The number of tasks must be a number from ${min} to ${max}.`,
    notesType: 'The comment must be text.',
    notesTooLong: (max) => `The comment is too long (maximum ${max} characters).`,
    tableTooShort: 'You need a table with at least a header row and one row of grades.',
    tableTooManyRows: (max) => `Too many rows in the table (maximum ${max}).`,
    rowInvalid: (i) => `Row ${i} of the table has an invalid format.`,
    rowTooManyCols: (i, max) => `Too many columns in row ${i} (maximum ${max}).`,
    methodNotAllowed: 'This method is not supported.',
    keyRequired: 'Enter your Anthropic API key in Settings (gear icon at the top).',
    keyInvalid: 'The API key is invalid. Please check it in Settings.',
    keyInvalidFormat: 'The API key has an invalid format.',
    rateLimited: 'The generation service is overloaded — please try again in a minute.',
    upstreamBadRequest: 'Could not get a valid response from the model.',
    upstreamError: 'The generation service is temporarily unavailable. Please try again.',
    emptyResponse: 'The model returned an empty response. Please try again.',
    internalError: 'Internal server error.',
    routeNotFound: 'Route not found.',
    corsForbidden: 'This origin is not allowed.',
    tooManyRequests: 'Too many requests in a row — please wait a moment.',
    filenameFormativka: 'Formative assessment',
    filenameGrade: (grade) => `grade ${grade}`,
    filenameAnalysis: 'Class grade analysis',
  },
  kk: {
    badJson: 'Сұраныс денесі JSON объектісі болуы керек.',
    subjectRequired: 'Пәнді көрсетіңіз.',
    subjectTooLong: 'Пән атауы тым ұзын.',
    gradeRequired: 'Сыныпты көрсетіңіз (1–11).',
    topicRequired: 'Сабақ тақырыбын көрсетіңіз.',
    topicTooLong: (max) => `Тақырып тым ұзын (ең көбі ${max} таңба).`,
    countRange: (min, max) => `Тапсырмалар саны ${min}-ден ${max}-ге дейінгі сан болуы керек.`,
    notesType: 'Түсініктеме мәтін болуы керек.',
    notesTooLong: (max) => `Түсініктеме тым ұзын (ең көбі ${max} таңба).`,
    tableTooShort: 'Кемінде тақырыптар жолы және бір бағалар жолы бар кесте қажет.',
    tableTooManyRows: (max) => `Кестеде жолдар тым көп (ең көбі ${max}).`,
    rowInvalid: (i) => `Кестенің ${i}-жолының пішімі дұрыс емес.`,
    rowTooManyCols: (i, max) => `${i}-жолда бағандар тым көп (ең көбі ${max}).`,
    methodNotAllowed: 'Бұл әдіске қолдау көрсетілмейді.',
    keyRequired: 'Жоғарыдағы «Баптаулар» (тісті дөңгелек) арқылы Anthropic API кілтін енгізіңіз.',
    keyInvalid: 'API кілті жарамсыз. Оны баптауларда тексеріңіз.',
    keyInvalidFormat: 'API кілтінің пішімі дұрыс емес.',
    rateLimited: 'Генерация қызметі шамадан тыс жүктелген — бір минуттан кейін қайталап көріңіз.',
    upstreamBadRequest: 'Модельден дұрыс жауап алу мүмкін болмады.',
    upstreamError: 'Генерация қызметі уақытша қолжетімсіз. Қайталап көріңіз.',
    emptyResponse: 'Модель бос жауап қайтарды. Қайталап көріңіз.',
    internalError: 'Сервердің ішкі қатесі.',
    routeNotFound: 'Маршрут табылмады.',
    corsForbidden: 'Бұл домен рұқсат етілмеген.',
    tooManyRequests: 'Қатарынан тым көп сұраныс — сәл күте тұрыңыз.',
    filenameFormativka: 'Қалыптастырушы бағалау',
    filenameGrade: (grade) => `${grade}-сынып`,
    filenameAnalysis: 'Сынып бағаларын талдау',
  },
};

function t(lang) {
  return MESSAGES[normalizeLang(lang)];
}

module.exports = { SUPPORTED_LANGS, DEFAULT_LANG, normalizeLang, t };
