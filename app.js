/**
 * ASOSIY MINI APP — app.js
 * PIN tizimi, tab navigatsiya, API, Til, Tema
 */

const API_BASE = '';
const LS_PIN = 'app_pin';
const LS_USER = 'app_user';
const LS_LANG = 'app_lang';
const LS_THEME = 'app_theme';

// ── I18N ────────────────────────────────────────
var I18N = {
  uz: {
    tab_home: 'Asosiy', tab_tests: 'Testlar', tab_profile: 'Profil', tab_admin: 'Admin',
    status_active: 'Faol', status_offline: 'Oflayn',
    header_theme_title: 'Mavzu', header_lang_title: 'Til',
    splash_subtitle: 'TEST MARKAZI VA MILLIY SERTIFIKAT',
    pin_create: 'PIN kod yarating', pin_create_sub: 'Xavfsizlik uchun 4 xonali PIN kod belgilang',
    pin_confirm: 'PIN kodni tasdiqlang', pin_confirm_sub: 'Tasdiqlash uchun PIN kodingizni qayta kiriting',
    pin_enter_title: 'PIN kodni kiriting', pin_enter_sub: 'Kirish uchun PIN kodingizni kiriting',
    pin_mismatch: 'PIN kodlar mos kelmadi', pin_wrong: "Noto'g'ri PIN kod",
    welcome: 'Xush kelibsiz', default_user: 'Foydalanuvchi', default_test_title: 'Matematika Testi', default_subject: 'Matematika',
    home_title: 'Asosiy', home_sub: 'Testlar va rejalashtirilgan sinovlar',
    subtab_active: 'Faol testlar', subtab_past: 'Oldingi testlar',
    upcoming_tests: 'Kutilayotgan testlar', active_tests_now: 'Hozir faol testlar',
    unit_count: 'ta',
    empty_active: "Hozircha faol test yo'q",
    empty_active_sub: "Yangi testlar rejalashtirilganda yoki boshlanganda shu yerda ko'rinadi.",
    empty_past: 'Oldingi testlar mavjud emas',
    empty_past_sub: 'Muddati tugagan yoki yakunlangan testlar arxivi shu yerda saqlanadi.',
    badge_upcoming: '⏳ Kutilmoqda', badge_submitted: '✅ Topshirilgan',
    badge_active_now: '🟢 Hozir faol', badge_stopped: "🔴 To'xtatildi",
    lbl_test_code: '📌 Test kodi:', lbl_scheduled_date: '📅 Belgilangan sana:',
    lbl_start_time: '🕐 Boshlanish vaqti:', lbl_end_time: '🕕 Tugash vaqti:',
    lbl_questions_count: '❓ Savollar soni:', lbl_time_limit: '⏱ Vaqt chegarasi:',
    lbl_video_analysis: '🎬 Video tahlil:',
    val_unlimited: 'Cheklanmagan', val_infinite: 'Cheksiz',
    val_scheduled_soon: 'Belgilangan vaqtda', val_today: 'Bugun', val_started: 'Boshlangan',
    val_questions_format: 'ta savol (55 ta band)', val_minutes: 'daqiqa',
    val_yt_available: 'Mavjud (YouTube) 🎬', val_yt_planning: 'Rejalashtirilmoqda',
    btn_return_bot: 'Botga (chatga) qaytish', btn_view_result: "Natijani ko'rish",
    btn_solve_test: 'Testni yechish', btn_test_ended: 'Test muddati tugagan',
    my_tests_title: 'Mening testlarim', tests_count: 'ta test topshirildi',
    empty_tests: 'Hali hech qanday test topshirmadingiz',
    test_in_progress: '⏳ Test davom etmoqda', test_waiting_result: 'Kutilmoqda',
    test_score_unit: 'ball', test_result_sub: 'natija',
    profile_title: 'Profil', change_pin: "PIN kodni o'zgartirish",
    stat_tests: 'Testlar', stat_avg: "O'rtacha", stat_max: 'Eng yuqori', stat_status: 'Holat',
    profile_edit_btn: 'Tahrirlash',
    profile_status_approved: "Faol o'quvchi", profile_status_pending: 'Kutilmoqda',
    profile_status_blocked: 'Bloklangan', profile_status_admin: '🛡 Bosh Admin',
    profile_personal_info: "Shaxsiy ma'lumotlar",
    toggle_hide: 'Yashirish ▲', toggle_show: "Ko'rish ▼",
    lbl_tg_id: 'Telegram ID (Bosganda nusxalanadi)', lbl_username: 'Telegram Username',
    lbl_phone_edit: 'Telefon raqami (Tahrirlash)', lbl_reg_date: "Roʻyxatdan oʻtgan vaqti",
    val_not_linked: 'Biriktirilmagan', val_none: 'Mavjud emas', val_recent: 'Yaqinda',
    btn_copy: 'Nusxa', toast_copied: 'Nusxalandi! 📋',
    sec_settings_guide: "Sozlamalar va Qo'llanma", lbl_app_theme: 'Ilova mavzusi',
    theme_dark_lbl: 'Tungi rejim (Dark)', theme_light_lbl: 'Kunduzgi rejim (Light)',
    lbl_how_it_works: 'Bot qanday ishlaydi?', sub_how_it_works: "O'quvchilar uchun to'liq qo'llanma",
    sec_danger_zone: 'Xavfli hudud',
    desc_danger_zone: "Akkaunt va unga biriktirilgan barcha test natijalarini butunlay o'chirib tashlash.",
    btn_delete_account: "🗑 Akkauntni butunlay o'chirish",
    modal_edit_title: '✏️ Profilni tahrirlash', lbl_fullname: 'Ism va familiya',
    placeholder_fullname: 'Ism Familiya', lbl_phone: 'Telefon raqami',
    placeholder_phone: '+998901234567', btn_cancel: 'Bekor qilish', btn_save: 'Saqlash',
    btn_saving: 'Saqlanmoqda...', alert_enter_name: 'Iltimos, ismingizni kiriting!',
    alert_enter_phone: 'Iltimos, telefon raqamingizni kiriting!',
    toast_profile_saved: "Profil ma'lumotlari muvaffaqiyatli saqlandi! ✅",
    confirm_delete_account: "⚠️ DIQQAT! Haqiqatan ham profilingizni va barcha test natijalaringizni butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!",
    alert_account_deleted: "Profilingiz va barcha natijalaringiz muvaffaqiyatli o'chirildi.",
    result_title: 'Test Natijasi',
    result_checking_title: '⏳ Javoblaringiz tekshirilmoqda...',
    result_checking_desc: "Test hozirda davom etmoqda. Admin testni to‘xtatib, Rasch tahlili asosida natijalarni e’lon qilgach, bu yerda to‘liq ball, to‘g‘ri javoblar va darajangiz ko‘rsatiladi.",
    lbl_submitted_time: '📅 Topshirilgan vaqt: ',
    btn_see_keys: "🔑 To'g'ri javoblarni ko'rish",
    desc_key_code: "Test kalitlarini ko'rish uchun maxfiy parolni kiriting",
    placeholder_key_code: 'Parol...', btn_confirm: 'Tasdiqlash',
    lbl_total_score: "To'plangan ball", result_grade: 'Daraja',
    result_correct: "To'g'ri", result_wrong: "Noto'g'ri", result_blank: 'Belgilanmagan',
    result_date: 'Sana', err_enter_code: 'Iltimos, parolni kiriting!', err_network: 'Tarmoq xatosi.',
    admin_panel: 'Admin Panel', admin_panel_sub: 'Foydalanuvchilar va tizim boshqaruvi',
    admin_tab_users: 'Foydalanuvchilar', admin_tab_broadcast: 'Xabar yuborish',
    admin_users_list: "👥 Foydalanuvchilar ro'yxati",
    admin_search_ph: 'Ism, telefon yoki Telegram ID...',
    flt_all: 'Barchasi', flt_approved: '✅ Faol', flt_pending: '⏳ Kutilmoqda', flt_blocked: '⛔️ Bloklangan',
    btn_restrict_all: "🔒 Barcha o'quvchilarni cheklash (qayta so'rov)",
    bcast_title: "O'quvchilarga xabar yuborish",
    bcast_subtitle: "Barcha faol o'quvchilarga tezkor xabarnoma tarqatish",
    bcast_badge_fast: '⚡️ Tezkor', bcast_quick_label: 'Tezkor tayyor shablonlar:',
    tmpl_30m: '30 daqiqa qoldi', tmpl_10m: '10 daqiqa qoldi', tmpl_started: 'Test boshlandi',
    tmpl_15m: '15 daqiqa qoldi', tmpl_ended: 'Test yakunlandi',
    bcast_textarea_ph: 'Xabar matnini kiriting yoki yuqoridagi tayyor shablonlardan birini bosing...',
    bcast_chars: 'belgi', bcast_clear: '✕ Tozalash',
    bcast_send_btn: "🚀 Barcha o'quvchilarga yuborish", bcast_sending: 'Yuborilmoqda...',
    admin_stat_total: 'Jami', admin_stat_active: 'Faol', admin_stat_pending: 'Kutilmoqda', admin_stat_blocked: 'Bloklangan',
    status_approved: 'Faol', status_pending: 'Kutilmoqda', status_blocked: 'Bloklangan',
    admin_no_match: 'Mos keluvchi foydalanuvchi topilmadi', admin_no_users: 'Foydalanuvchilar mavjud emas',
    modal_user_mgmt_title: '👤 Foydalanuvchi boshqaruvi',
    admin_modal_approved_badge: 'Faol (Ruxsat berilgan)',
    admin_modal_pending_badge: 'Kutilmoqda (Cheklangan)',
    admin_modal_blocked_badge: 'Bloklangan (Chiqarilgan)',
    admin_no_tests_yet: 'Hali test topshirmagan',
    btn_admin_approve: '✅ Ruxsat berish (Faollashtirish)',
    btn_admin_suspend: "⏳ Huquqini to'xtatish (Kutilmoqda)",
    btn_admin_block: '⛔️ Bloklash (Botdan chiqarish)',
    btn_admin_unblock: '🔓 Blokdan chiqarish va Ruxsat berish',
    btn_admin_delete_db: "🗑 Bazadan butunlay o'chirish",
    admin_user_info_label: "Foydalanuvchi ma'lumotlari",
    lbl_phone_short: 'Telefon raqami', lbl_tg_id_short: 'Telegram ID', lbl_username_short: 'Username',
    admin_lbl_tests_count: 'Topshirgan testlari soni', admin_lbl_last_test: 'Oxirgi test topshirgan vaqti',
    ob_slide0_badge: '1-TUGMA: ASOSIY', ob_slide0_title: '«Asosiy» bo‘limi',
    ob_slide0_desc: 'Pastki menyudagi birinchi «Asosiy» tugmasi orqali faol testlar ro‘yxatini ko‘rishingiz, test kodini kiritib sinovni boshlashingiz mumkin.',
    ob_slide0_feat: '⚡️ Tezkor kirish, test kodlari va e’lonlar',
    ob_slide1_badge: '2-TUGMA: TESTLAR', ob_slide1_title: '«Testlar» tarixi & Kalitlar',
    ob_slide1_desc: 'Pastdagi «Testlar» tugmasida siz topshirgan barcha testlaringiz ro‘yxati, to‘liq javoblar tahlili va to‘g‘ri kalitlar saqlanadi.',
    ob_slide1_feat: '🔍 Har bir savolning to‘g‘ri/noto‘g‘ri tahlili',
    ob_slide2_badge: '3-TUGMA: PROFIL', ob_slide2_title: '«Profil» & Sertifikat darajasi',
    ob_slide2_desc: 'Pastdagi «Profil» tugmasi orqali Rasch modeli bo‘yicha to‘plagan ballaringiz, Milliy sertifikat darajalaringiz (A+, A, B+, B, C) va shaxsiy sozlamalarni ko‘rasiz.',
    ob_slide2_feat: '🎖 Shaxsiy ballar, reyting va PIN-kod',
    ob_slide3_badge: 'QULAY DIZAYN', ob_slide3_title: 'Oq va Qorong‘u rejim',
    ob_slide3_desc: 'Ilova kirishda har doim qulay Oq (kunduzgi) rejimda ochiladi. Tepadagi ☀️ / 🌙 tugma orqali ilovani xohlagan vaqtingizda Qorong‘u (tungi) yoki Oq rejimga o‘tkaza olasiz!',
    ob_slide3_light: '☀️ Kunduzgi (Oq)', ob_slide3_dark: '🌙 Tungi (Qorong‘u)',
    btn_skip: 'O‘tkazish', btn_next: 'Keyingisi ➔', btn_finish: 'Tushundim, boshlash 🚀',
    toast_tour_done: 'Yo‘riqnoma yakunlandi. Xush kelibsiz! 🎉',
    toast_pin_set: "PIN kod muvaffaqiyatli o'rnatildi! ✅",
    compare_keys_title: 'Kalitlar va javoblar tahlili',
    compare_keys_sub: 'Jami 55 ta savol (35 yopiq + 20 ochiq band)',
    compare_keys_stage1: '1-bosqich: Yopiq savollar (1–35)',
    compare_keys_stage2: '2-bosqich: Ochiq yozma savollar (36a–45b, 20 band)',
    compare_keys_you: 'Siz:',
    compare_keys_orig: 'Asl:',
    compare_keys_correct_suffix: "to'g'ri",
    score_pts: 'ball',
    user_unknown: 'Nomaʼlum',
    user_not_found: "Foydalanuvchi ma'lumotlari topilmadi",
    error_occurred: 'Xatolik yuz berdi',
    user_status_updated: "Holat muvaffaqiyatli o'zgartirildi!",
    action_in_progress: 'Bajarilmoqda...',
    filtered_suffix: 'saralangan',
    admin_broadcast_empty_prompt: "Iltimos, avval xabar matnini kiriting yoki yuqoridagi tayyor shablonlardan birini tanlang!",
    admin_broadcast_confirm_prompt: "Ushbu xabarni barcha faol o'quvchilarga yuborishni tasdiqlaysizmi?",
    admin_broadcast_sending: "Xabar yuborilmoqda...",
    admin_broadcast_sent_title: "Xabar muvaffaqiyatli tarqatildi!",
    admin_broadcast_delivered_lbl: "Yetkazildi",
    admin_broadcast_failed_lbl: "Yetkazilmadi",
    admin_confirm_delete_user: "⚠️ DIQQAT! Haqiqatan ham ushbu foydalanuvchini va uning barcha test natijalarini butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!",
    admin_confirm_block_user: "Ushbu foydalanuvchini bloklamoqchimisiz? U botdan va test tizimidan chiqarib yuboriladi.",
    admin_confirm_pending_user: "Ushbu foydalanuvchining huquqini to'xtatib, kutilmoqda holatiga o'tkazmoqchimisiz?",
    admin_confirm_restrict_all: "⚠️ DIQQAT! Barcha oddiy foydalanuvchilarning ruxsatini bekor qilib, ularni «kutilmoqda» (pending) holatiga o'tkazmoqchimisiz?\n\nAdminlar daxlsiz qoladi.",
    admin_alert_deleted: "🗑 Foydalanuvchi muvaffaqiyatli o'chirildi!",
    admin_alert_approved: "✅ Foydalanuvchiga ruxsat berildi!",
    admin_alert_blocked: "⛔️ Foydalanuvchi bloklandi!",
    admin_alert_pending: "⏳ Foydalanuvchi kutilmoqda holatiga o'tkazildi!"
  },
  ru: {
    tab_home: 'Главная', tab_tests: 'Тесты', tab_profile: 'Профиль', tab_admin: 'Админ',
    status_active: 'Активен', status_offline: 'Офлайн',
    header_theme_title: 'Тема', header_lang_title: 'Язык',
    splash_subtitle: 'ТЕСТОВЫЙ ЦЕНТР И НАЦИОНАЛЬНЫЙ СЕРТИФИКАТ',
    pin_create: 'Создайте PIN-код', pin_create_sub: 'Установите 4-значный PIN-код для безопасности',
    pin_confirm: 'Подтвердите PIN-код', pin_confirm_sub: 'Введите PIN-код еще раз для подтверждения',
    pin_enter_title: 'Введите PIN-код', pin_enter_sub: 'Введите PIN-код для входа',
    pin_mismatch: 'PIN-коды не совпадают', pin_wrong: 'Неверный PIN-код',
    welcome: 'Добро пожаловать', default_user: 'Пользователь', default_test_title: 'Тест по математике', default_subject: 'Математика',
    home_title: 'Главная', home_sub: 'Тесты и запланированные испытания',
    subtab_active: 'Активные тесты', subtab_past: 'Прошедшие тесты',
    upcoming_tests: 'Ожидаемые тесты', active_tests_now: 'Сейчас активные тесты',
    unit_count: 'шт.',
    empty_active: 'Пока нет активных тестов',
    empty_active_sub: 'Новые тесты появятся здесь, когда они будут запланированы или запущены.',
    empty_past: 'Нет архивных тестов',
    empty_past_sub: 'Здесь сохраняется архив завершенных тестов.',
    badge_upcoming: '⏳ Ожидается', badge_submitted: '✅ Сдан',
    badge_active_now: '🟢 Сейчас активен', badge_stopped: '🔴 Остановлен',
    lbl_test_code: '📌 Код теста:', lbl_scheduled_date: '📅 Назначенная дата:',
    lbl_start_time: '🕐 Время начала:', lbl_end_time: '🕕 Время окончания:',
    lbl_questions_count: '❓ Количество вопросов:', lbl_time_limit: '⏱ Лимит времени:',
    lbl_video_analysis: '🎬 Видео разбор:',
    val_unlimited: 'Без ограничений', val_infinite: 'Без лимита',
    val_scheduled_soon: 'В назначенное время', val_today: 'Сегодня', val_started: 'Начат',
    val_questions_format: 'вопросов (55 пунктов)', val_minutes: 'минут',
    val_yt_available: 'Доступен (YouTube) 🎬', val_yt_planning: 'Планируется',
    btn_return_bot: 'Вернуться к боту (чат)', btn_view_result: 'Посмотреть результат',
    btn_solve_test: 'Решать тест', btn_test_ended: 'Срок теста истек',
    my_tests_title: 'Мои тесты', tests_count: 'тестов сдано',
    empty_tests: 'Вы еще не сдали ни одного теста',
    test_in_progress: '⏳ Тест продолжается', test_waiting_result: 'Ожидается',
    test_score_unit: 'балл(ов)', test_result_sub: 'результат',
    profile_title: 'Профиль', change_pin: 'Изменить PIN-код',
    stat_tests: 'Тесты', stat_avg: 'Средний', stat_max: 'Максимум', stat_status: 'Статус',
    profile_edit_btn: 'Редактировать',
    profile_status_approved: 'Активный ученик', profile_status_pending: 'В ожидании',
    profile_status_blocked: 'Заблокирован', profile_status_admin: '🛡 Главный админ',
    profile_personal_info: 'Личные данные',
    toggle_hide: 'Скрыть ▲', toggle_show: 'Показать ▼',
    lbl_tg_id: 'Telegram ID (нажмите для копирования)', lbl_username: 'Имя пользователя Telegram',
    lbl_phone_edit: 'Номер телефона (Редактировать)', lbl_reg_date: 'Дата регистрации',
    val_not_linked: 'Не привязан', val_none: 'Отсутствует', val_recent: 'Недавно',
    btn_copy: 'Копия', toast_copied: 'Скопировано! 📋',
    sec_settings_guide: 'Настройки и руководство', lbl_app_theme: 'Тема приложения',
    theme_dark_lbl: 'Тёмный режим (Dark)', theme_light_lbl: 'Светлый режим (Light)',
    lbl_how_it_works: 'Как работает бот?', sub_how_it_works: 'Полное руководство для учеников',
    sec_danger_zone: 'Опасная зона',
    desc_danger_zone: 'Безвозвратное удаление аккаунта и всех связанных результатов тестов.',
    btn_delete_account: '🗑 Удалить аккаунт навсегда',
    modal_edit_title: '✏️ Редактирование профиля', lbl_fullname: 'Имя и фамилия',
    placeholder_fullname: 'Имя Фамилия', lbl_phone: 'Номер телефона',
    placeholder_phone: '+998901234567', btn_cancel: 'Отмена', btn_save: 'Сохранить',
    btn_saving: 'Сохранение...', alert_enter_name: 'Пожалуйста, введите ваше имя!',
    alert_enter_phone: 'Пожалуйста, введите ваш номер телефона!',
    toast_profile_saved: 'Данные профиля успешно сохранены! ✅',
    confirm_delete_account: '⚠️ ВНИМАНИЕ! Вы уверены, что хотите навсегда удалить свой профиль и все результаты тестов? Это действие необратимо!',
    alert_account_deleted: 'Ваш профиль и все результаты успешно удалены.',
    result_title: 'Результат теста',
    result_checking_title: '⏳ Ваши ответы проверяются...',
    result_checking_desc: 'Тест в настоящее время продолжается. После завершения теста администратором и публикации результатов на основе анализа Раша здесь отобразятся ваши баллы, правильные ответы и уровень.',
    lbl_submitted_time: '📅 Время сдачи: ',
    btn_see_keys: '🔑 Посмотреть правильные ответы',
    desc_key_code: 'Введите секретный пароль для просмотра ключей теста',
    placeholder_key_code: 'Пароль...', btn_confirm: 'Подтвердить',
    lbl_total_score: 'Набранный балл', result_grade: 'Уровень',
    result_correct: 'Правильные', result_wrong: 'Неправильные', result_blank: 'Не отмечено',
    result_date: 'Дата', err_enter_code: 'Пожалуйста, введите пароль!', err_network: 'Ошибка сети.',
    admin_panel: 'Панель администратора', admin_panel_sub: 'Управление пользователями и системой',
    admin_tab_users: 'Пользователи', admin_tab_broadcast: 'Рассылка',
    admin_users_list: '👥 Список пользователей',
    admin_search_ph: 'Имя, телефон или Telegram ID...',
    flt_all: 'Все', flt_approved: '✅ Активные', flt_pending: '⏳ В ожидании', flt_blocked: '⛔️ Заблокированные',
    btn_restrict_all: '🔒 Ограничить всех учеников (повторный запрос)',
    bcast_title: 'Рассылка сообщений ученикам',
    bcast_subtitle: 'Быстрая рассылка уведомлений всем активным ученикам',
    bcast_badge_fast: '⚡️ Быстро', bcast_quick_label: 'Быстрые шаблоны:',
    tmpl_30m: 'Осталось 30 минут', tmpl_10m: 'Осталось 10 минут', tmpl_started: 'Тест начался',
    tmpl_15m: 'Осталось 15 минут', tmpl_ended: 'Тест завершен',
    bcast_textarea_ph: 'Введите текст сообщения или выберите один из готовых шаблонов выше...',
    bcast_chars: 'символов', bcast_clear: '✕ Очистить',
    bcast_send_btn: '🚀 Отправить всем ученикам', bcast_sending: 'Отправка...',
    admin_stat_total: 'Всего', admin_stat_active: 'Активные', admin_stat_pending: 'В ожидании', admin_stat_blocked: 'Заблокированы',
    status_approved: 'Активен', status_pending: 'В ожидании', status_blocked: 'Заблокирован',
    admin_no_match: 'Подходящий пользователь не найден', admin_no_users: 'Пользователи отсутствуют',
    modal_user_mgmt_title: '👤 Управление пользователем',
    admin_modal_approved_badge: 'Активен (Одобрен)',
    admin_modal_pending_badge: 'В ожидании (Ограничен)',
    admin_modal_blocked_badge: 'Заблокирован (Исключен)',
    admin_no_tests_yet: 'Еще не сдавал тесты',
    btn_admin_approve: '✅ Одобрить (Активировать)',
    btn_admin_suspend: '⏳ Приостановить (В ожидание)',
    btn_admin_block: '⛔️ Заблокировать (Исключить)',
    btn_admin_unblock: '🔓 Разблокировать и одобрить',
    btn_admin_delete_db: '🗑 Удалить из базы навсегда',
    admin_user_info_label: 'Данные пользователя',
    lbl_phone_short: 'Номер телефона', lbl_tg_id_short: 'Telegram ID', lbl_username_short: 'Username',
    admin_lbl_tests_count: 'Количество сданных тестов', admin_lbl_last_test: 'Время последнего теста',
    ob_slide0_badge: '1-КНОПКА: ГЛАВНАЯ', ob_slide0_title: 'Раздел «Главная»',
    ob_slide0_desc: 'Через первую кнопку «Главная» в нижнем меню вы можете просматривать список активных тестов и начинать тестирование.',
    ob_slide0_feat: '⚡️ Быстрый доступ, коды тестов и объявления',
    ob_slide1_badge: '2-КНОПКА: ТЕСТЫ', ob_slide1_title: 'История «Тесты» и Ключи',
    ob_slide1_desc: 'Во вкладке «Тесты» сохраняется список всех сданных вами тестов, полный анализ ответов и правильные ключи.',
    ob_slide1_feat: '🔍 Анализ правильных и неправильных ответов',
    ob_slide2_badge: '3-КНОПКА: ПРОФИЛЬ', ob_slide2_title: '«Профиль» и Уровень сертификата',
    ob_slide2_desc: 'Через вкладку «Профиль» вы можете видеть набранные баллы по модели Раша, уровни Национального сертификата (A+, A, B+, B, C) и настройки.',
    ob_slide2_feat: '🎖 Личные баллы, рейтинг и PIN-код',
    ob_slide3_badge: 'УДОБНЫЙ ДИЗАЙН', ob_slide3_title: 'Светлый и Тёмный режим',
    ob_slide3_desc: 'Приложение всегда открывается в удобном светлом режиме. С помощью кнопки ☀️ / 🌙 вверху вы в любой момент можете переключиться между тёмной и светлой темой!',
    ob_slide3_light: '☀️ Светлая (День)', ob_slide3_dark: '🌙 Тёмная (Ночь)',
    btn_skip: 'Пропустить', btn_next: 'Далее ➔', btn_finish: 'Понятно, начать 🚀',
    toast_tour_done: 'Инструкция завершена. Добро пожаловать! 🎉',
    toast_pin_set: 'PIN-код успешно установлен! ✅',
    compare_keys_title: 'Анализ ключей и ответов',
    compare_keys_sub: 'Всего 55 вопросов (35 закрытых + 20 открытых пунктов)',
    compare_keys_stage1: '1-й этап: Закрытые вопросы (1–35)',
    compare_keys_stage2: '2-й этап: Открытые письменные вопросы (36a–45b, 20 пунктов)',
    compare_keys_you: 'Вы:',
    compare_keys_orig: 'Верно:',
    compare_keys_correct_suffix: 'верно',
    score_pts: 'балл(ов)',
    user_unknown: 'Неизвестно',
    user_not_found: 'Данные пользователя не найдены',
    error_occurred: 'Произошла ошибка',
    user_status_updated: 'Статус успешно обновлен!',
    action_in_progress: 'Выполняется...',
    filtered_suffix: 'отфильтровано',
    admin_broadcast_empty_prompt: 'Пожалуйста, введите текст сообщения или выберите готовый шаблон выше!',
    admin_broadcast_confirm_prompt: 'Вы подтверждаете отправку этого сообщения всем активным ученикам?',
    admin_broadcast_sending: 'Сообщение отправляется...',
    admin_broadcast_sent_title: 'Сообщение успешно отправлено!',
    admin_broadcast_delivered_lbl: 'Доставлено',
    admin_broadcast_failed_lbl: 'Не доставлено',
    admin_confirm_delete_user: '⚠️ ВНИМАНИЕ! Вы действительно хотите удалить этого пользователя и все результаты тестов навсегда? Это действие необратимо!',
    admin_confirm_block_user: 'Вы хотите заблокировать этого пользователя? Он будет исключен из бота и тестов.',
    admin_confirm_pending_user: 'Приостановить доступ этого пользователя и перевести в статус ожидания?',
    admin_confirm_restrict_all: '⚠️ ВНИМАНИЕ! Отозвать доступ у всех обычных пользователей и перевести их в режим «ожидания» (pending)?\n\nАдминистраторы останутся активными.',
    admin_alert_deleted: '🗑 Пользователь успешно удален!',
    admin_alert_approved: '✅ Пользователю предоставлен доступ!',
    admin_alert_blocked: '⛔️ Пользователь заблокирован!',
    admin_alert_pending: '⏳ Пользователь переведен в статус ожидания!'
  },
  en: {
    tab_home: 'Home', tab_tests: 'Tests', tab_profile: 'Profile', tab_admin: 'Admin',
    status_active: 'Active', status_offline: 'Offline',
    header_theme_title: 'Theme', header_lang_title: 'Language',
    splash_subtitle: 'TEST CENTER & NATIONAL CERTIFICATE',
    pin_create: 'Create PIN Code', pin_create_sub: 'Set a 4-digit PIN for security',
    pin_confirm: 'Confirm PIN', pin_confirm_sub: 'Re-enter your PIN code to confirm',
    pin_enter_title: 'Enter PIN Code', pin_enter_sub: 'Enter your PIN to sign in',
    pin_mismatch: "PIN codes don't match", pin_wrong: 'Incorrect PIN code',
    welcome: 'Welcome', default_user: 'User', default_test_title: 'Math Test', default_subject: 'Mathematics',
    home_title: 'Home', home_sub: 'Tests and upcoming trials',
    subtab_active: 'Active Tests', subtab_past: 'Past Tests',
    upcoming_tests: 'Upcoming Tests', active_tests_now: 'Currently Active Tests',
    unit_count: 'items',
    empty_active: 'No active tests right now',
    empty_active_sub: 'New tests will appear here once scheduled or launched.',
    empty_past: 'No past tests available',
    empty_past_sub: 'The archive of completed or expired tests will be stored here.',
    badge_upcoming: '⏳ Upcoming', badge_submitted: '✅ Submitted',
    badge_active_now: '🟢 Active now', badge_stopped: '🔴 Stopped',
    lbl_test_code: '📌 Test code:', lbl_scheduled_date: '📅 Scheduled date:',
    lbl_start_time: '🕐 Start time:', lbl_end_time: '🕕 End time:',
    lbl_questions_count: '❓ Questions count:', lbl_time_limit: '⏱ Time limit:',
    lbl_video_analysis: '🎬 Video analysis:',
    val_unlimited: 'Unlimited', val_infinite: 'No limit',
    val_scheduled_soon: 'At scheduled time', val_today: 'Today', val_started: 'Started',
    val_questions_format: 'questions (55 items)', val_minutes: 'min',
    val_yt_available: 'Available (YouTube) 🎬', val_yt_planning: 'In preparation',
    btn_return_bot: 'Return to bot (chat)', btn_view_result: 'View result',
    btn_solve_test: 'Solve test', btn_test_ended: 'Test has ended',
    my_tests_title: 'My Tests', tests_count: 'tests submitted',
    empty_tests: "You haven't submitted any tests yet",
    test_in_progress: '⏳ Test in progress', test_waiting_result: 'Pending',
    test_score_unit: 'pts', test_result_sub: 'result',
    profile_title: 'Profile', change_pin: 'Change PIN Code',
    stat_tests: 'Tests', stat_avg: 'Average', stat_max: 'Highest', stat_status: 'Status',
    profile_edit_btn: 'Edit',
    profile_status_approved: 'Active student', profile_status_pending: 'Pending',
    profile_status_blocked: 'Restricted', profile_status_admin: '🛡 Super Admin',
    profile_personal_info: 'Personal Information',
    toggle_hide: 'Hide ▲', toggle_show: 'View ▼',
    lbl_tg_id: 'Telegram ID (tap to copy)', lbl_username: 'Telegram Username',
    lbl_phone_edit: 'Phone Number (Edit)', lbl_reg_date: 'Registration date',
    val_not_linked: 'Not linked', val_none: 'None', val_recent: 'Recently',
    btn_copy: 'Copy', toast_copied: 'Copied! 📋',
    sec_settings_guide: 'Settings & Guide', lbl_app_theme: 'App theme',
    theme_dark_lbl: 'Dark mode', theme_light_lbl: 'Light mode',
    lbl_how_it_works: 'How does the bot work?', sub_how_it_works: 'Complete guide for students',
    sec_danger_zone: 'Danger Zone',
    desc_danger_zone: 'Permanently delete your account and all associated test records.',
    btn_delete_account: '🗑 Permanently delete account',
    modal_edit_title: '✏️ Edit Profile', lbl_fullname: 'Full name',
    placeholder_fullname: 'Full Name', lbl_phone: 'Phone number',
    placeholder_phone: '+998901234567', btn_cancel: 'Cancel', btn_save: 'Save',
    btn_saving: 'Saving...', alert_enter_name: 'Please enter your name!',
    alert_enter_phone: 'Please enter your phone number!',
    toast_profile_saved: 'Profile data saved successfully! ✅',
    confirm_delete_account: '⚠️ WARNING! Are you sure you want to permanently delete your profile and all test records? This action cannot be undone!',
    alert_account_deleted: 'Your profile and all results have been successfully deleted.',
    result_title: 'Test Result',
    result_checking_title: '⏳ Evaluating your answers...',
    result_checking_desc: 'The test is currently in progress. Once the administrator stops the test and publishes Rasch analysis results, your full score, correct answers, and grade will be displayed here.',
    lbl_submitted_time: '📅 Submission time: ',
    btn_see_keys: '🔑 View correct keys',
    desc_key_code: 'Enter secret passcode to view test keys',
    placeholder_key_code: 'Passcode...', btn_confirm: 'Confirm',
    lbl_total_score: 'Total score', result_grade: 'Grade',
    result_correct: 'Correct', result_wrong: 'Incorrect', result_blank: 'Blank',
    result_date: 'Date', err_enter_code: 'Please enter passcode!', err_network: 'Network error.',
    admin_panel: 'Admin Panel', admin_panel_sub: 'User and system management',
    admin_tab_users: 'Users', admin_tab_broadcast: 'Broadcast',
    admin_users_list: '👥 Users List',
    admin_search_ph: 'Name, phone, or Telegram ID...',
    flt_all: 'All', flt_approved: '✅ Active', flt_pending: '⏳ Pending', flt_blocked: '⛔️ Blocked',
    btn_restrict_all: '🔒 Restrict all students (re-approval)',
    bcast_title: 'Broadcast Message to Students',
    bcast_subtitle: 'Instant notifications to all active students',
    bcast_badge_fast: '⚡️ Fast', bcast_quick_label: 'Quick message templates:',
    tmpl_30m: '30 minutes left', tmpl_10m: '10 minutes left', tmpl_started: 'Test started',
    tmpl_15m: '15 minutes left', tmpl_ended: 'Test completed',
    bcast_textarea_ph: 'Enter message text or click one of the quick templates above...',
    bcast_chars: 'chars', bcast_clear: '✕ Clear',
    bcast_send_btn: '🚀 Send to all students', bcast_sending: 'Sending...',
    admin_stat_total: 'Total', admin_stat_active: 'Active', admin_stat_pending: 'Pending', admin_stat_blocked: 'Blocked',
    status_approved: 'Active', status_pending: 'Pending', status_blocked: 'Blocked',
    admin_no_match: 'No matching user found', admin_no_users: 'No users available',
    modal_user_mgmt_title: '👤 User Management',
    admin_modal_approved_badge: 'Active (Approved)',
    admin_modal_pending_badge: 'Pending (Restricted)',
    admin_modal_blocked_badge: 'Blocked (Excluded)',
    admin_no_tests_yet: 'No tests submitted yet',
    btn_admin_approve: '✅ Approve (Activate)',
    btn_admin_suspend: '⏳ Suspend (Set Pending)',
    btn_admin_block: '⛔️ Block (Restrict)',
    btn_admin_unblock: '🔓 Unblock & Approve',
    btn_admin_delete_db: '🗑 Delete Permanently from Database',
    admin_user_info_label: 'User Information',
    lbl_phone_short: 'Phone Number', lbl_tg_id_short: 'Telegram ID', lbl_username_short: 'Username',
    admin_lbl_tests_count: 'Tests taken count', admin_lbl_last_test: 'Last test submitted',
    ob_slide0_badge: 'BUTTON 1: HOME', ob_slide0_title: '“Home” Section',
    ob_slide0_desc: 'Through the first "Home" button in the bottom menu, you can view active tests and start taking a test.',
    ob_slide0_feat: '⚡️ Quick access, test codes, and announcements',
    ob_slide1_badge: 'BUTTON 2: TESTS', ob_slide1_title: '“Tests” History & Keys',
    ob_slide1_desc: 'In the "Tests" tab, you will find the history of all your submitted tests, full answers analysis, and correct keys.',
    ob_slide1_feat: '🔍 Correct and incorrect answers breakdown',
    ob_slide2_badge: 'BUTTON 3: PROFILE', ob_slide2_title: '“Profile” & Certificate Level',
    ob_slide2_desc: 'Through the "Profile" tab, you can view your Rasch model test scores, National certificate grades (A+, A, B+, B, C), and personal settings.',
    ob_slide2_feat: '🎖 Personal scores, rating, and PIN code',
    ob_slide3_badge: 'MODERN DESIGN', ob_slide3_title: 'Light & Dark Mode',
    ob_slide3_desc: 'The app opens in light mode by default. You can easily switch between Dark and Light mode anytime using the ☀️ / 🌙 button at the top!',
    ob_slide3_light: '☀️ Light (Day)', ob_slide3_dark: '🌙 Dark (Night)',
    btn_skip: 'Skip', btn_next: 'Next ➔', btn_finish: 'Got it, start 🚀',
    toast_tour_done: 'Guide completed. Welcome! 🎉',
    toast_pin_set: 'PIN code successfully set! ✅',
    compare_keys_title: 'Keys & Answers Analysis',
    compare_keys_sub: 'Total 55 questions (35 closed + 20 open items)',
    compare_keys_stage1: 'Stage 1: Closed Questions (1–35)',
    compare_keys_stage2: 'Stage 2: Open Written Questions (36a–45b, 20 items)',
    compare_keys_you: 'You:',
    compare_keys_orig: 'Key:',
    compare_keys_correct_suffix: 'correct',
    score_pts: 'pts',
    user_unknown: 'Unknown',
    user_not_found: 'User information not found',
    error_occurred: 'An error occurred',
    user_status_updated: 'Status successfully updated!',
    action_in_progress: 'Processing...',
    filtered_suffix: 'filtered',
    admin_broadcast_empty_prompt: 'Please enter a message or choose a template above first!',
    admin_broadcast_confirm_prompt: 'Do you confirm sending this message to all active students?',
    admin_broadcast_sending: 'Sending message...',
    admin_broadcast_sent_title: 'Message broadcasted successfully!',
    admin_broadcast_delivered_lbl: 'Delivered',
    admin_broadcast_failed_lbl: 'Failed',
    admin_confirm_delete_user: '⚠️ CAUTION! Are you sure you want to permanently delete this user and all their test records? This action cannot be undone!',
    admin_confirm_block_user: 'Are you sure you want to block this user? They will be removed from the bot and test system.',
    admin_confirm_pending_user: 'Are you sure you want to suspend this user and set them to pending?',
    admin_confirm_restrict_all: '⚠️ CAUTION! Revoke access for all standard users and reset them to «pending»?\n\nAdmins will remain active.',
    admin_alert_deleted: '🗑 User successfully deleted!',
    admin_alert_approved: '✅ User approved and activated!',
    admin_alert_blocked: '⛔️ User blocked!',
    admin_alert_pending: '⏳ User moved to pending status!'
  }
};

function t(key) {
  var lang = localStorage.getItem(LS_LANG) || 'uz';
  return (I18N[lang] && I18N[lang][key]) || (I18N.uz && I18N.uz[key]) || key;
}

// ── STATE ────────────────────────────────────────
var state = {
  tgUser: null,
  userInfo: null,
  isAdmin: false,
  pinBuffer: '',
  pinMode: 'enter',
  pinFirst: '',
  activeTab: 'home',
  homeSubtab: 'active',
  adminSubtab: 'users',
};

// ── INIT ────────────────────────────────────────
function initApp() {
  // Birinchi kirishda oq (light), foydalanuvchi qora (dark) qilsa o'sha saqlanadi
  var savedTheme = localStorage.getItem(LS_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  syncTelegramTheme(savedTheme);
  updateLangLabel();
  applyI18n();
  renderOnboardingSlides();

  try {
    var urlParams = new URLSearchParams(window.location.search);
    var queryTgId = urlParams.get('tg_id');
    var tg = window.Telegram && window.Telegram.WebApp;
    if (tg) {
      try { tg.ready(); tg.expand(); } catch (e) {}
    }
    var tgU = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (tgU && tgU.id) {
      state.tgUser = tgU;
    } else if (queryTgId && parseInt(queryTgId) > 0) {
      state.tgUser = { id: parseInt(queryTgId), first_name: 'Foydalanuvchi', last_name: '', username: '' };
    } else {
      state.tgUser = { id: 0, first_name: 'Mehmon', last_name: '', username: '' };
    }
    try {
      var saved = localStorage.getItem(LS_USER);
      if (saved) state.userInfo = JSON.parse(saved);
    } catch (e) {}
  } catch (err) {
    console.error('initApp error:', err);
  }

  if (window.BM_LOGO_B64) {
    document.querySelectorAll('.splash-logo-img, .header-logo-img, .header-bm-logo').forEach(function(img) {
      img.src = window.BM_LOGO_B64;
    });
  }

  runSplash();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ── SPLASH (Chiroyli kirish animatsiyasi) ──────────
function runSplash() {
  var splash = document.getElementById('splash-screen');
  var logoBox = document.getElementById('splash-logo-box');
  var ring = document.getElementById('splash-ring');
  var ring2 = document.getElementById('splash-ring-2');

  if (!splash) { launchApp(); return; }

  // Ma'lumotlarni fonda oldindan tayyorlab qo'yish
  launchApp();

  // 1.0s — Muvaffaqiyatli tekshiruv (checkmark) animatsiyasi
  setTimeout(function() {
    if (logoBox) logoBox.classList.add('success');
    if (ring) ring.classList.add('success');
    if (ring2) ring2.classList.add('success');
  }, 1000);

  // 1.8s — Yumshoq tarzda asosiy ilovaga o'tish (fade-out)
  setTimeout(function() {
    if (splash) splash.classList.add('hide-splash');
    setTimeout(function() {
      if (splash) splash.style.display = 'none';

      // Kirish animatsiyasi 100% tugagachgina tugmalar va dizayn yo'riqnomasini ochish
      if (!localStorage.getItem('onboarding_nav_tour_seen')) {
        setTimeout(function() {
          openOnboardingModal();
        }, 350);
      }
    }, 450);
  }, 1800);
}

// ── PIN SYSTEM ──────────────────────────────────
async function initPinScreen() {
  var hasPin = !!localStorage.getItem(LS_PIN);
  if (!hasPin && state.userInfo && state.userInfo.has_pin) {
    hasPin = true;
  }

  // Telegram CloudStorage tekshirish
  if (!hasPin && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
    try {
      window.Telegram.WebApp.CloudStorage.getItem(LS_PIN, function(err, val) {
        if (!err && val) {
          localStorage.setItem(LS_PIN, val);
          state.pinMode = 'enter';
          updatePinUI(true);
        }
      });
    } catch(e) {}
  }

  updatePinUI(hasPin);
  renderPinDots(0);
}

function updatePinUI(hasPin) {
  var pinTitle = document.getElementById('pin-title');
  var pinSub = document.getElementById('pin-subtitle');
  if (!pinTitle || !pinSub) return;

  if (!hasPin) {
    state.pinMode = 'setup';
    pinTitle.textContent = t('pin_create');
    pinSub.textContent = t('pin_create_sub');
  } else {
    state.pinMode = 'enter';
    var name = (state.userInfo && state.userInfo.fullname)
      || (state.tgUser && state.tgUser.first_name) || 'Salom';
    pinTitle.textContent = t('welcome') + ', ' + name.split(' ')[0] + '!';
    pinSub.textContent = t('pin_enter_sub');
  }
}

function onPinKey(val) {
  if (state.pinBuffer.length >= 4) return;
  state.pinBuffer += val;
  renderPinDots(state.pinBuffer.length);
  if (state.pinBuffer.length === 4) setTimeout(processPin, 120);
}

function onPinDel() {
  if (state.pinBuffer.length === 0) return;
  state.pinBuffer = state.pinBuffer.slice(0, -1);
  renderPinDots(state.pinBuffer.length);
}

function renderPinDots(count, mode) {
  var dots = document.querySelectorAll('.pin-dot');
  dots.forEach(function(d, i) {
    d.classList.remove('filled', 'error');
    if (mode === 'error') { d.classList.add('error'); }
    else if (i < count) { d.classList.add('filled'); }
  });
}

async function processPin() {
  var pin = state.pinBuffer;
  state.pinBuffer = '';
  var tgId = (state.tgUser && state.tgUser.id) || 0;

  if (state.pinMode === 'setup') {
    state.pinFirst = pin;
    state.pinMode = 'confirm';
    document.getElementById('pin-title').textContent = t('pin_confirm');
    document.getElementById('pin-subtitle').textContent = t('pin_confirm_sub');
    renderPinDots(0);
    showPinError('');
  } else if (state.pinMode === 'confirm') {
    if (pin === state.pinFirst) {
      // 1. LocalStorage ga saqlash
      localStorage.setItem(LS_PIN, btoa(pin));
      // 2. Telegram CloudStorage ga saqlash
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage) {
        try { window.Telegram.WebApp.CloudStorage.setItem(LS_PIN, btoa(pin)); } catch(e) {}
      }
      if (tgId) {
        try {
          fetch('/api/app/set-pin', {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ tg_id: tgId, pin: pin, init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '' })
          });
        } catch(e) {}
      }
      showPinError('');
      launchApp();
    } else {
      showPinError(t('pin_mismatch'));
      renderPinDots(4, 'error');
      state.pinMode = 'setup';
      state.pinFirst = '';
      setTimeout(function() {
        renderPinDots(0);
        document.getElementById('pin-title').textContent = t('pin_create');
        document.getElementById('pin-subtitle').textContent = t('pin_create_sub');
        showPinError('');
      }, 1000);
    }
  } else {
    var stored = '';
    try { stored = atob(localStorage.getItem(LS_PIN) || ''); } catch(e) {}
    
    var isValid = (stored && pin === stored);

    if (!isValid && tgId) {
      try {
        var res = await fetch('/api/app/verify-pin', {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ tg_id: tgId, pin: pin, init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '' })
        });
        var data = await res.json();
        if (data.valid) {
          isValid = true;
          localStorage.setItem(LS_PIN, btoa(pin));
        }
      } catch(e) {}
    }

    if (isValid) {
      showPinError('');
      launchApp();
    } else {
      showPinError(t('pin_wrong'));
      renderPinDots(4, 'error');
      setTimeout(function() { renderPinDots(0); showPinError(''); }, 900);
    }
  }
}

function showPinError(msg) {
  var el = document.getElementById('pin-error');
  if (el) el.textContent = msg;
}

// ── LAUNCH APP ──────────────────────────────────
async function launchApp() {
  var pinScreen = document.getElementById('pin-screen');
  if (pinScreen) {
    pinScreen.style.display = 'none';
  }

  var app = document.getElementById('app');
  if (app) {
    app.style.display = 'flex';
    app.style.flexDirection = 'column';
    app.classList.add('visible');
  }

  applyI18n();
  updateHeaderUser();

  // Profil va faol testlarni parallel (bir vaqtda) yuklash
  Promise.all([
    loadUserProfile().catch(function(e) { console.warn('Profile:', e); }),
    loadActiveTests().catch(function(e) { console.warn('ActiveTests:', e); })
  ]).then(function() {
    updateHeaderUser();
    try {
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'admin' && state.isAdmin) {
        switchTab('admin');
      }
    } catch (e) {}
  });

  // Yangi foydalanuvchilar uchun tugmalar va dizayn qo'llanmasi
  var splashScreen = document.getElementById('splash-screen');
  if (!splashScreen && !localStorage.getItem('onboarding_nav_tour_seen')) {
    setTimeout(function() {
      openOnboardingModal();
    }, 600);
  }

  // Real vaqt rejimida Bot & Server faolligini tekshirish
  checkBotServerStatus();
  setInterval(checkBotServerStatus, 25000);
}

// ── SERVER & BOT STATUS MONITOR ─────────────────
async function checkBotServerStatus() {
  var pill = document.getElementById('bot-status-pill');
  var txt = document.getElementById('bot-status-text');
  if (!pill || !txt) return;

  try {
    var controller = new AbortController();
    var timeoutId = setTimeout(function() { controller.abort(); }, 4000);
    var res = await fetch(API_BASE + '/api/app/status', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      var data = await res.json();
      if (data.bot_active || data.status === 'online') {
        pill.className = 'server-status-pill online';
        txt.textContent = 'Faol';
        pill.setAttribute('title', '🟢 Bot va Server 24/7 faol ishlamoqda');
        return;
      }
    }
    throw new Error('Offline');
  } catch (e) {
    pill.className = 'server-status-pill offline';
    txt.textContent = 'O\'chiq';
    pill.setAttribute('title', '🔴 Server yoki Macbook o\'chiq holatda');
  }
}

// ── API & AUTENTIFIKATSIYA ─────────────────────────
function getAuthHeaders(customHeaders) {
  var headers = Object.assign({}, customHeaders || {});
  var initData = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  }
  return headers;
}

async function apiGet(path) {
  var initData = (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
  var fullUrl = API_BASE + path;
  if (initData && fullUrl.indexOf('init_data=') === -1) {
    var sep = fullUrl.indexOf('?') === -1 ? '?' : '&';
    fullUrl += sep + 'init_data=' + encodeURIComponent(initData);
  }
  var res = await fetch(fullUrl, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('API ' + res.status);
  return res.json();
}

async function loadUserProfile() {
  var urlParams = new URLSearchParams(window.location.search);
  var tgId = (state.tgUser && state.tgUser.id) || parseInt(urlParams.get('tg_id')) || 0;
  if (!tgId) {
    var tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      tgId = tg.initDataUnsafe.user.id;
      state.tgUser = tg.initDataUnsafe.user;
    }
  }
  if (!tgId) return;
  try {
    var data = await apiGet('/api/app/profile?tg_id=' + tgId);
    if (data.success) {
      state.userInfo = data.user;
      state.isAdmin = data.is_admin;
      localStorage.setItem(LS_USER, JSON.stringify(data.user));
      var adminTab = document.getElementById('nav-admin');
      if (adminTab) adminTab.style.display = state.isAdmin ? 'flex' : 'none';
      if (state.isAdmin && data.pending_users > 0) {
        var badge = document.getElementById('admin-badge');
        if (badge) { badge.textContent = data.pending_users; badge.style.display = 'block'; }
      }
      if (urlParams.get('tab') === 'admin' && state.isAdmin) {
        switchTab('admin');
      }
    }
  } catch (e) { console.warn('loadUserProfile err:', e); }
}

async function loadActiveTests() {
  var tab = document.getElementById('tab-home');
  if (!tab) return;
  tab.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data = await apiGet('/api/app/active-tests?tg_id=' + tgId);
    if (data.success) {
      window.availableActiveTests = data.tests || [];
      renderHomeTab(data.tests);
    }
    else throw new Error('no success');
  } catch (e) {
    tab.innerHTML = '<div class="empty-state"><div class="empty-icon">\u26A0\uFE0F</div><p>' + t('empty_active') + '</p></div>';
  }
}

async function loadMyResults() {
  var tab = document.getElementById('tab-tests');
  tab.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
  try {
    var tgId = (state.tgUser && state.tgUser.id) || 0;
    var data = await apiGet('/api/app/my-results?tg_id=' + tgId);
    if (data.success) renderTestsTab(data.results);
    else throw new Error('no success');
  } catch (e) {
    tab.innerHTML = '<div class="empty-state"><div class="empty-icon">\u26A0\uFE0F</div><p>' + t('empty_tests') + '</p></div>';
  }
}

async function loadAllUsers() {
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var tgId = (state.tgUser && state.tgUser.id) || parseInt(urlParams.get('tg_id')) || 0;
    
    // Agar testlar ro'yxati yuklanmagan bo'lsa, shablonlar uchun fon rejimida yuklab olamiz
    if (!window.availableActiveTests) {
      apiGet('/api/app/active-tests?tg_id=' + tgId).then(function(d) {
        if (d && d.success) window.availableActiveTests = d.tests || [];
      }).catch(function() {});
    }

    var data = await apiGet('/api/app/users?tg_id=' + tgId);
    if (data.success) {
      renderUsersSection(data.users, data.stats);
    } else {
      var listEl = document.getElementById('users-list');
      if (listEl) {
        listEl.innerHTML = '<div class="empty-state" style="padding:24px 10px;"><div class="empty-icon">⚠️</div><p>' + (data.message || 'Foydalanuvchilarni yuklab bo\'lmadi') + '</p></div>';
      }
    }
  } catch (e) {
    console.warn('users err:', e);
    var listEl = document.getElementById('users-list');
    if (listEl) {
      listEl.innerHTML = '<div class="empty-state" style="padding:24px 10px;"><div class="empty-icon">⚠️</div><p>Server bilan bog\'lanishda xatolik</p></div>';
    }
  }
}

// ── TAB NAVIGATION ──────────────────────────────
function switchTab(tabId) {
  state.activeTab = tabId;

  // Telegram Haptic feedback
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    } catch(e) {}
  }

  // Animate clicked nav button with spring pop
  var activeBtn = document.getElementById('nav-' + tabId);
  if (activeBtn) {
    activeBtn.classList.remove('nav-tap-pop');
    void activeBtn.offsetWidth; // trigger reflow
    activeBtn.classList.add('nav-tap-pop');
    setTimeout(function() {
      activeBtn.classList.remove('nav-tap-pop');
    }, 450);
  }

  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.toggle('active', el.id === 'tab-' + tabId);
  });
  if (tabId === 'home') loadActiveTests();
  else if (tabId === 'tests') loadMyResults();
  else if (tabId === 'profile') renderProfileTab();
  else if (tabId === 'admin') { renderAdminTab(); loadAllUsers(); }
}

function switchHomeSubtab(subtab) {
  if (state.homeSubtab === subtab) return;
  state.homeSubtab = subtab;

  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } catch(e) {}
  }

  if (window.availableActiveTests) {
    renderHomeTab(window.availableActiveTests);
  } else {
    loadActiveTests();
  }
}

function openTestSolving(testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  window.location.href = '/index.html?test_id=' + testId + '&tg_id=' + tgId;
}

function returnToTelegramChat() {
  if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.close === 'function') {
    window.Telegram.WebApp.close();
  } else {
    showToast('Telegram bot chatiga qaytildi');
  }
}

function startTestInBot(testCode, testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  if (!tgId && window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
    tgId = window.Telegram.WebApp.initDataUnsafe.user.id;
  }

  if (tgId) {
    var url = '/api/app/trigger-solve?tg_id=' + encodeURIComponent(tgId) + 
              '&test_code=' + encodeURIComponent(testCode || '') + 
              '&test_id=' + encodeURIComponent(testId || '');
    try {
      fetch(url, { keepalive: true }).catch(function(e) { console.error(e); });
    } catch(e) {
      console.error("Trigger solve error:", e);
    }
  }

  if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.close === 'function' && window.Telegram.WebApp.initData) {
    if (window.Telegram.WebApp.HapticFeedback && window.Telegram.WebApp.HapticFeedback.notificationOccurred) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(function() {
      window.Telegram.WebApp.close();
    }, 120);
  } else {
    // Brauzerda test rejimida ochilganda bevosita yechish oynasiga o'tish
    openTestSolving(testId);
  }
}

function renderTestDetailCard(test, type) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  var isUpcoming = (type === 'upcoming');
  var isActive = (type === 'active');
  var isInactive = (type === 'inactive');
  var done = Boolean(test.already_submitted);

  var cardClass = isUpcoming ? 'test-card-upcoming' : (isActive ? 'test-card-active' : 'test-card-closed');
  var badgeHtml = '';
  if (isUpcoming) {
    badgeHtml = '<span class="badge" style="background:rgba(245,158,11,0.15);color:#D97706;border:1px solid rgba(245,158,11,0.3);font-weight:800;">' + t('badge_upcoming') + '</span>';
  } else if (isActive) {
    if (done) {
      badgeHtml = '<span class="badge" style="background:rgba(16,185,129,0.15);color:#059669;border:1px solid rgba(16,185,129,0.3);font-weight:800;">' + t('badge_submitted') + '</span>';
    } else {
      badgeHtml = '<span class="badge" style="background:rgba(16,185,129,0.15);color:#10B981;border:1px solid rgba(16,185,129,0.3);font-weight:800;">' + t('badge_active_now') + '</span>';
    }
  } else {
    badgeHtml = '<span class="badge badge-inactive">' + t('badge_stopped') + '</span>';
  }

  var codeDisplay = test.test_code ? (String(test.test_code).startsWith('#') ? test.test_code : ('#' + test.test_code)) : '—';
  var dateStr = test.scheduled_date ? escHtml(test.scheduled_date) : (isUpcoming ? t('val_scheduled_soon') : t('val_today'));
  var startStr = test.scheduled_start ? (escHtml(test.scheduled_start) + ' (UZB)') : (isActive ? t('val_started') : '—');
  var endStr = test.scheduled_end ? (escHtml(test.scheduled_end) + ' (UZB)') : t('val_unlimited');
  var totalQuestions = (test.total_questions || 45) + ' ' + t('val_questions_format');
  var timeLimit = test.time_limit_min ? (test.time_limit_min + ' ' + t('val_minutes')) : t('val_infinite');
  var ytUrl = (test.youtube_url || '').trim();
  var ytStatus = ytUrl ? ('<span style="color:#DC2626;font-weight:700;">' + t('val_yt_available') + '</span>') : ('<span style="color:var(--text-muted);">' + t('val_yt_planning') + '</span>');

  var html = '<div class="test-rich-card ' + cardClass + ' animate-in">' +
    '<div class="test-rich-header">' +
      '<div class="test-rich-icon ' + (isUpcoming ? 'amber' : (isActive ? 'green' : 'gray')) + '">' +
        (isUpcoming ? '⏳' : (isActive ? '📝' : '🔒')) +
      '</div>' +
      '<div class="test-rich-title-box">' +
        '<div class="test-rich-title">' + escHtml(test.title || t('default_test_title')) + '</div>' +
        '<div class="test-rich-subject">' + escHtml(test.subject || t('default_subject')) + '</div>' +
      '</div>' +
      '<div>' + badgeHtml + '</div>' +
    '</div>' +

    // Qatorma-qator to'liq ma'lumotlar ro'yxati
    '<div class="test-rich-info-grid">' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">' + t('lbl_test_code') + '</span>' +
        '<span class="test-rich-val test-rich-code">' + escHtml(codeDisplay) + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">' + t('lbl_scheduled_date') + '</span>' +
        '<span class="test-rich-val">' + dateStr + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">' + t('lbl_start_time') + '</span>' +
        '<span class="test-rich-val">' + startStr + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">' + t('lbl_end_time') + '</span>' +
        '<span class="test-rich-val">' + endStr + '</span>' +
      '</div>' +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">' + t('lbl_questions_count') + '</span>' +
        '<span class="test-rich-val">' + totalQuestions + '</span>' +
      '</div>' +
      (test.time_limit_min ? (
        '<div class="test-rich-info-row">' +
          '<span class="test-rich-label">' + t('lbl_time_limit') + '</span>' +
          '<span class="test-rich-val">' + timeLimit + '</span>' +
        '</div>'
      ) : '') +
      '<div class="test-rich-info-row">' +
        '<span class="test-rich-label">' + t('lbl_video_analysis') + '</span>' +
        '<span class="test-rich-val">' + ytStatus + '</span>' +
      '</div>' +
    '</div>';

  // Tugmalar
  html += '<div class="test-rich-actions">';
  if (isUpcoming) {
    html += '<button type="button" class="btn-rich-action btn-rich-secondary" style="width:100%" onclick="returnToTelegramChat()">' +
      '<span>💬</span> ' + t('btn_return_bot') +
    '</button>';
  } else if (isActive) {
    if (done) {
      html += '<button type="button" class="btn-rich-action btn-rich-success" style="width:100%" onclick="switchTab(\'tests\')">' +
        '<span>✅</span> ' + t('btn_view_result') +
      '</button>';
    } else {
      html += '<button type="button" class="btn-rich-action btn-rich-primary" style="width:100%" onclick="startTestInBot(\'' + (test.test_code || '') + '\', ' + test.id + ')">' +
        '<span>✍️</span> ' + t('btn_solve_test') +
      '</button>';
    }
  } else {
    if (done) {
      html += '<button type="button" class="btn-rich-action btn-rich-success" style="width:100%" onclick="switchTab(\'tests\')">' +
        '<span>✅</span> ' + t('btn_view_result') +
      '</button>';
    } else {
      html += '<button type="button" class="btn-rich-action btn-rich-secondary" style="width:100%" onclick="returnToTelegramChat()">' +
        '<span>🔒</span> ' + t('btn_test_ended') +
      '</button>';
    }
  }
  html += '</div>';

  html += '</div>';
  return html;
}

// ── HOME TAB (Faol va Oldingi testlar - 2 ta bo'lim) ─
function renderHomeTab(tests) {
  var tab = document.getElementById('tab-home');
  if (!tab) return;
  window.availableActiveTests = tests || [];
  var currentSubtab = state.homeSubtab || 'active';

  var upcoming = tests.filter(function(t) { return t.is_upcoming; });
  var active = tests.filter(function(t) { return t.is_active && !t.is_upcoming; });
  var inactive = tests.filter(function(t) { return !t.is_active && !t.is_upcoming; });

  var activeTotalCount = active.length + upcoming.length;
  var pastTotalCount = inactive.length;

  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">' + t('home_title') + '</div>' +
    '<div class="section-sub">' + t('home_sub') + '</div></div>';

  // ── SUBTABS (2 ta bo'lim: Faol va Oldingi) ──
  var boltIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/></svg>';
  var archiveIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  html += '<div class="home-subtabs animate-in">' +
    '<button type="button" class="home-subtab ' + (currentSubtab === 'active' ? 'active' : '') + '" onclick="switchHomeSubtab(\'active\')">' +
      '<span class="home-subtab-icon">' + boltIcon + '</span>' +
      '<span class="home-subtab-text">' + t('subtab_active') + '</span>' +
      '<span class="home-subtab-badge">' + activeTotalCount + '</span>' +
    '</button>' +
    '<button type="button" class="home-subtab ' + (currentSubtab === 'past' ? 'active' : '') + '" onclick="switchHomeSubtab(\'past\')">' +
      '<span class="home-subtab-icon">' + archiveIcon + '</span>' +
      '<span class="home-subtab-text">' + t('subtab_past') + '</span>' +
      '<span class="home-subtab-badge">' + pastTotalCount + '</span>' +
    '</button>' +
  '</div>';

  // ── SUBTAB MAZMUNI ──
  html += '<div class="home-subtab-content animate-in">';

  if (currentSubtab === 'active') {
    // 1. Kutilayotgan testlar (Upcoming)
    if (upcoming.length > 0) {
      html += '<div class="section-sub" style="margin-bottom:12px;font-weight:800;color:#D97706;font-size:13px;display:flex;align-items:center;gap:6px;">' +
        '<span>⏳</span> ' + t('upcoming_tests') + ' (' + upcoming.length + ' ' + t('unit_count') + '):' +
      '</div>';
      upcoming.forEach(function(test) {
        html += renderTestDetailCard(test, 'upcoming');
      });
    }

    // 2. Faol testlar (Active)
    if (active.length > 0) {
      if (upcoming.length > 0) {
        html += '<div class="section-sub" style="margin:16px 0 12px;font-weight:800;color:var(--success);font-size:13px;display:flex;align-items:center;gap:6px;">' +
          '<span>🟢</span> ' + t('active_tests_now') + ' (' + active.length + ' ' + t('unit_count') + '):' +
        '</div>';
      }
      active.forEach(function(test) {
        html += renderTestDetailCard(test, 'active');
      });
    }

    // Bo'sh holat
    if (activeTotalCount === 0) {
      html += '<div class="empty-state animate-in" style="padding:44px 16px;">' +
        '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">📫</div>' +
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:var(--text)">' + t('empty_active') + '</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin:0;max-width:280px;line-height:1.5;">' + t('empty_active_sub') + '</p>' +
      '</div>';
    }
  } else {
    // 3. Oldingi / Muddati tugagan testlar (Closed)
    if (inactive.length > 0) {
      inactive.forEach(function(test) {
        html += renderTestDetailCard(test, 'inactive');
      });
    } else {
      html += '<div class="empty-state animate-in" style="padding:44px 16px;">' +
        '<div class="empty-icon" style="font-size:42px;margin-bottom:12px;">📁</div>' +
        '<div style="font-weight:800;font-size:16px;margin-bottom:6px;color:var(--text)">' + t('empty_past') + '</div>' +
        '<p style="font-size:13px;color:var(--text-muted);margin:0;max-width:280px;line-height:1.5;">' + t('empty_past_sub') + '</p>' +
      '</div>';
    }
  }

  html += '</div>';

  tab.innerHTML = html;
}

// ── TESTS TAB (faqat topshirilgan, bosilsa natija) ─
function renderTestsTab(results) {
  var tab = document.getElementById('tab-tests');
  var html = '<div class="section-header animate-in">' +
    '<div class="section-title">' + t('my_tests_title') + '</div>' +
    '<div class="section-sub">' + results.length + ' ' + t('tests_count') + '</div></div>';

  if (results.length === 0) {
    html += '<div class="empty-state animate-in"><div class="empty-icon">\uD83D\uDCED</div><p>' + t('empty_tests') + '</p></div>';
  } else {
    window._myResults = results;
    results.forEach(function(r, i) {
      var isPub = Boolean(r.results_published);
      var maxScore = r.max_score || 100;
      var date = formatDate(r.submitted_at);

      if (isPub) {
        var score = (r.score != null) ? r.score : 0;
        var grade = r.grade || getGradeFromScore(score, maxScore);
        var gradeClass = gradeToClass(grade);
        html += '<div class="history-card animate-in" style="animation-delay:' + (i * 0.05) + 's;cursor:pointer" onclick="showResultModal(window._myResults[' + i + '])">' +
          '<div class="history-info" style="padding-left:12px">' +
          '<div class="history-title">' + escHtml(r.test_title || r.title || 'Test') + '</div>' +
          '<div class="history-meta"><span class="badge ' + gradeClass + '" style="margin-right:6px;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11px;">' + grade + '</span> 📅 ' + date + ' • ✅ ' + r.correct_count + '/' + (r.total_count || 55) + '</div>' +
          '</div>' +
          '<div class="history-score"><div class="history-score-val" style="color:var(--primary);font-weight:800;">' + score + '</div><div class="history-score-sub">' + t('test_score_unit') + '</div></div>' +
          '</div>';
      } else {
        html += '<div class="history-card animate-in" style="animation-delay:' + (i * 0.05) + 's;cursor:pointer" onclick="showResultModal(window._myResults[' + i + '])">' +
          '<div class="history-info" style="padding-left:12px">' +
          '<div class="history-title">' + escHtml(r.test_title || r.title || 'Test') + '</div>' +
          '<div class="history-meta"><span class="badge" style="margin-right:6px;font-weight:800;padding:2px 8px;border-radius:6px;font-size:11px;background:rgba(245,158,11,0.15);color:#F59E0B;">' + t('test_in_progress') + '</span> 📅 ' + date + '</div>' +
          '</div>' +
          '<div class="history-score"><div class="history-score-val" style="color:#F59E0B;font-weight:800;font-size:13px;">' + t('test_waiting_result') + '</div><div class="history-score-sub">' + t('test_result_sub') + '</div></div>' +
          '</div>';
      }
    });
  }
  tab.innerHTML = html;
}

// ── PROFILE TAB ─────────────────────────────────
// ── PROFILE TAB (Real Mobile App Design) ────────
function renderProfileTab() {
  var tab = document.getElementById('tab-profile');
  if (!tab) return;
  var u = state.userInfo;
  var tgU = state.tgUser;

  // Ismni to'g'ri proporsiya va bosh harflar bilan formatlash
  var rawFullname = (u && u.fullname) || ((tgU && ((tgU.first_name || '') + ' ' + (tgU.last_name || '')).trim())) || t('default_user');
  var fullname = rawFullname.split(' ').map(function(w) {
    if (!w) return '';
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');

  // Telefon raqamini chiroyli ajratib ko'rsatish (+998 97 027 87 70)
  var rawPhone = (u && u.phone) || '';
  var formattedPhone = rawPhone;
  var digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    formattedPhone = '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 10) + ' ' + digits.slice(10, 12);
  } else if (!rawPhone) {
    formattedPhone = t('val_not_linked');
  }

  var username = (tgU && tgU.username) ? ('@' + tgU.username) : ((u && u.username) ? ('@' + u.username) : t('val_none'));
  var tgId = (tgU && tgU.id) || (u && u.tg_id) || 0;
  var testsCount = (u && u.tests_count) || 0;
  var avgScore = (u && u.avg_score) ? (Number(u.avg_score).toFixed(1)) : '0.0';
  var maxScore = (u && u.max_score) ? (Number(u.max_score).toFixed(1)) : '0.0';
  var avatarLetter = fullname.charAt(0).toUpperCase() || 'U';

  var regDateStr = (u && u.registered_at) ? formatDate(u.registered_at) : t('val_recent');

  var st = (u && u.status || 'pending').toLowerCase();
  var isAdmin = Boolean(state.isAdmin);

  var statusChipHtml = '';
  var avatarBadgeClass = 'approved';

  if (st === 'approved') {
    statusChipHtml = '<span class="profile-chip chip-approved"><span class="chip-dot dot-approved"></span> ' + t('profile_status_approved') + '</span>';
    avatarBadgeClass = 'approved';
  } else if (st === 'pending') {
    statusChipHtml = '<span class="profile-chip chip-pending"><span class="chip-dot dot-pending"></span> ' + t('profile_status_pending') + '</span>';
    avatarBadgeClass = 'pending';
  } else {
    statusChipHtml = '<span class="profile-chip chip-rejected"><span class="chip-dot dot-rejected"></span> ' + t('profile_status_blocked') + '</span>';
    avatarBadgeClass = 'blocked';
  }

  var adminChipHtml = isAdmin ? ('<span class="profile-chip chip-admin">' + t('profile_status_admin') + '</span>') : '';

  var avatarInnerHtml = '';
  if (tgU && tgU.photo_url) {
    avatarInnerHtml = '<img src="' + escHtml(tgU.photo_url) + '" class="profile-avatar-img" alt="Avatar" onerror="this.onerror=null;this.parentElement.innerHTML=\'' + avatarLetter + '\';">';
  } else {
    avatarInnerHtml = avatarLetter;
  }

  var curTheme = document.documentElement.getAttribute('data-theme') || 'light';
  var themeLabel = curTheme === 'dark' ? t('theme_dark_lbl') : t('theme_light_lbl');

  tab.innerHTML =
    // ── 1. HERO PROFILE CARD (Ixcham, toza va to'g'ri o'lchamdagi ism) ──
    '<div class="profile-hero-card animate-in">' +
      '<div class="profile-avatar-box">' +
        '<div class="profile-avatar-circle">' + avatarInnerHtml + '</div>' +
        '<span class="profile-avatar-badge ' + avatarBadgeClass + '"></span>' +
      '</div>' +
      '<div class="profile-name-title">' + escHtml(fullname) + '</div>' +
      '<div class="profile-phone-subtitle">' + escHtml(formattedPhone) + '</div>' +
      '<div class="profile-tag-row">' +
        adminChipHtml +
        statusChipHtml +
      '</div>' +
      '<div style="display:flex;justify-content:center;margin-top:10px;">' +
        '<button type="button" class="btn-hero-profile-action btn-edit-profile-hero" onclick="openEditProfileModal()" style="max-width:170px;">' +
          '<span class="hero-btn-icon">✏️</span><span>' + t('profile_edit_btn') + '</span>' +
        '</button>' +
      '</div>' +
    '</div>' +

    // ── 2. METRIKALAR PANELCHASI (3 ta ustunli qulay va ixcham lenta) ──
    '<div class="profile-stats-ribbon animate-in">' +
      '<div class="stat-ribbon-item">' +
        '<div class="stat-ribbon-val">' + testsCount + ' <span style="font-size:11px;font-weight:600;opacity:0.8;">' + t('unit_count') + '</span></div>' +
        '<div class="stat-ribbon-lbl">' + t('stat_tests') + '</div>' +
      '</div>' +
      '<div class="stat-ribbon-divider"></div>' +
      '<div class="stat-ribbon-item">' +
        '<div class="stat-ribbon-val">' + avgScore + '</div>' +
        '<div class="stat-ribbon-lbl">' + t('stat_avg') + '</div>' +
      '</div>' +
      '<div class="stat-ribbon-divider"></div>' +
      '<div class="stat-ribbon-item">' +
        '<div class="stat-ribbon-val">' + maxScore + '</div>' +
        '<div class="stat-ribbon-lbl">' + t('stat_max') + '</div>' +
      '</div>' +
    '</div>' +

    // ── 3. SHAXSIY MA'LUMOTLAR BO'LIMI (Ko'rsatish / Yashirish) ──
    '<div class="profile-section-card animate-in" id="profile-info-section" style="margin-top:12px;">' +
      '<div class="profile-info-toggle-header" onclick="toggleProfileDetails()" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;cursor:pointer;user-select:none;">' +
        '<div style="display:flex;align-items:center;gap:11px;">' +
          '<div class="profile-item-icon" style="background:rgba(37,99,235,0.12);color:#2563EB;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>' +
              '<circle cx="12" cy="7" r="4"></circle>' +
            '</svg>' +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="profile-section-title" style="margin:0;font-size:14.5px;font-weight:800;color:var(--text);white-space:nowrap;">' + t('profile_personal_info') + '</div>' +
          '</div>' +
        '</div>' +
        '<span class="profile-info-toggle-badge" id="profile-info-toggle-badge" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:800;background:rgba(59,130,246,0.12);color:var(--accent,#3b82f6);transition:all 0.2s ease;">' + (window._profileDetailsOpen ? t('toggle_hide') : t('toggle_show')) + '</span>' +
      '</div>' +
      '<div id="profile-details-content" style="display:' + (window._profileDetailsOpen ? 'block' : 'none') + ';margin-top:10px;border-top:1px solid var(--border);padding-top:4px;">' +
        '<div class="profile-item-row clickable" onclick="copyTextToClipboard(\'' + tgId + '\', \'' + t('toast_copied') + '\')">' +
          '<div class="profile-item-icon">🆔</div>' +
          '<div class="profile-item-body">' +
            '<div class="profile-item-label">' + t('lbl_tg_id') + '</div>' +
            '<div class="profile-item-value"><code>' + tgId + '</code></div>' +
          '</div>' +
          '<span class="profile-item-action-chip">📋 ' + t('btn_copy') + '</span>' +
        '</div>' +
        '<div class="profile-item-row clickable" onclick="copyTextToClipboard(\'' + escHtml(username) + '\', \'' + t('toast_copied') + '\')">' +
          '<div class="profile-item-icon">🔗</div>' +
          '<div class="profile-item-body">' +
            '<div class="profile-item-label">' + t('lbl_username') + '</div>' +
            '<div class="profile-item-value">' + escHtml(username) + '</div>' +
          '</div>' +
          '<span class="profile-item-action-chip">📋 ' + t('btn_copy') + '</span>' +
        '</div>' +
        '<div class="profile-item-row clickable" onclick="openEditProfileModal()">' +
          '<div class="profile-item-icon">📱</div>' +
          '<div class="profile-item-body">' +
            '<div class="profile-item-label">' + t('lbl_phone_edit') + '</div>' +
            '<div class="profile-item-value">' + escHtml(formattedPhone) + '</div>' +
          '</div>' +
          '<span class="profile-item-action-chip">✏️ ' + t('profile_edit_btn') + '</span>' +
        '</div>' +
        '<div class="profile-item-row" style="border-bottom:none;">' +
          '<div class="profile-item-icon">📅</div>' +
          '<div class="profile-item-body">' +
            '<div class="profile-item-label">' + t('lbl_reg_date') + '</div>' +
            '<div class="profile-item-value">' + regDateStr + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // ── 4. SOZLAMALAR VA QO'LLANMA ──
    '<div class="profile-section-card animate-in" style="margin-top:10px;">' +
      '<div class="profile-section-title">' + t('sec_settings_guide') + '</div>' +
      '<div class="profile-item-row clickable" onclick="toggleTheme()">' +
        '<div class="profile-item-icon">🌓</div>' +
        '<div class="profile-item-body">' +
          '<div class="profile-item-label">' + t('lbl_app_theme') + '</div>' +
          '<div class="profile-item-value" id="profile-theme-label">' + themeLabel + '</div>' +
        '</div>' +
        '<span class="profile-item-arrow">›</span>' +
      '</div>' +
      '<div class="profile-item-row clickable" onclick="openOnboardingModal()" style="border-bottom:none;">' +
        '<div class="profile-item-icon" style="background:rgba(59,130,246,0.12);color:#2563eb;">📖</div>' +
        '<div class="profile-item-body">' +
          '<div class="profile-item-label">' + t('lbl_how_it_works') + '</div>' +
          '<div class="profile-item-value" style="font-size:12px;color:var(--text-muted);font-weight:600;">' + t('sub_how_it_works') + '</div>' +
        '</div>' +
        '<span class="profile-item-arrow">›</span>' +
      '</div>' +
    '</div>' +

    // ── 5. XAVFLI HUDUD (Akkauntni butunlay o'chirish) ──
    '<div class="profile-danger-card animate-in">' +
      '<div class="danger-card-title">' + t('sec_danger_zone') + '</div>' +
      '<div class="danger-card-desc">' + t('desc_danger_zone') + '</div>' +
      '<button type="button" class="btn-delete-account" onclick="deleteMyAccount()">' +
        '<span>' + t('btn_delete_account') + '</span>' +
      '</button>' +
    '</div>';
}

function toggleProfileDetails() {
  window._profileDetailsOpen = !window._profileDetailsOpen;
  var content = document.getElementById('profile-details-content');
  var badge = document.getElementById('profile-info-toggle-badge');
  if (content) {
    content.style.display = window._profileDetailsOpen ? 'block' : 'none';
    if (window._profileDetailsOpen) {
      setTimeout(function() {
        var sec = document.getElementById('profile-info-section');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }
  if (badge) {
    badge.textContent = window._profileDetailsOpen ? t('toggle_hide') : t('toggle_show');
  }
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try { window.Telegram.WebApp.HapticFeedback.selectionChanged(); } catch(e) {}
  }
}

function openEditProfileModal() {
  var u = state.userInfo;
  var tgU = state.tgUser;
  var fullname = (u && u.fullname) || ((tgU && ((tgU.first_name || '') + ' ' + (tgU.last_name || '')).trim())) || '';
  var phone = (u && u.phone) || '';

  var modal = document.getElementById('edit-profile-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-profile-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:16px;';
    modal.onclick = function(e) { if (e.target === modal || e.target.classList.contains('modal-close')) closeEditProfileModal(); };
    modal.innerHTML =
      '<div class="modal-box" style="max-width:380px;width:100%;padding:22px 18px;border-radius:24px;background:var(--bg-card,#1e293b);border:1px solid var(--border);box-shadow:0 24px 60px rgba(0,0,0,0.5);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
          '<div style="font-size:16px;font-weight:800;color:var(--text);">' + t('modal_edit_title') + '</div>' +
          '<button class="modal-close" onclick="closeEditProfileModal()" style="background:none;border:none;font-size:22px;color:var(--text-muted);cursor:pointer;line-height:1;">✕</button>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.4px;">' + t('lbl_fullname') + '</label>' +
          '<input type="text" id="edit-profile-name" class="modal-input" placeholder="' + t('placeholder_fullname') + '" style="width:100%;padding:11px 14px;border-radius:12px;background:var(--bg-glass-2);border:1px solid var(--border);color:var(--text);font-family:var(--font);font-size:14px;outline:none;">' +
        '</div>' +
        '<div style="margin-bottom:18px;">' +
          '<label style="display:block;font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.4px;">' + t('lbl_phone') + '</label>' +
          '<input type="tel" id="edit-profile-phone" class="modal-input" placeholder="' + t('placeholder_phone') + '" style="width:100%;padding:11px 14px;border-radius:12px;background:var(--bg-glass-2);border:1px solid var(--border);color:var(--text);font-family:var(--font);font-size:14px;outline:none;">' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" onclick="closeEditProfileModal()" style="flex:1;padding:12px;border-radius:12px;background:transparent;border:1px solid var(--border);color:var(--text-muted);font-weight:700;cursor:pointer;">' + t('btn_cancel') + '</button>' +
          '<button type="button" id="btn-save-profile" onclick="saveEditedProfile()" style="flex:1.5;padding:12px;border-radius:12px;background:linear-gradient(135deg,#2563EB,#1D4ED8);border:none;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,0.35);">' + t('btn_save') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  var nameInput = document.getElementById('edit-profile-name');
  var phoneInput = document.getElementById('edit-profile-phone');
  if (nameInput) nameInput.value = fullname;
  if (phoneInput) phoneInput.value = phone;

  modal.style.display = 'flex';
}

function closeEditProfileModal() {
  var modal = document.getElementById('edit-profile-modal');
  if (modal) modal.style.display = 'none';
}

async function saveEditedProfile() {
  var nameInput = document.getElementById('edit-profile-name');
  var phoneInput = document.getElementById('edit-profile-phone');
  if (!nameInput || !phoneInput) return;

  var newName = (nameInput.value || '').trim();
  var newPhone = (phoneInput.value || '').trim();

  if (!newName) {
    alert(t('alert_enter_name'));
    nameInput.focus();
    return;
  }
  if (!newPhone) {
    alert(t('alert_enter_phone'));
    phoneInput.focus();
    return;
  }

  var btn = document.getElementById('btn-save-profile');
  if (btn) {
    btn.disabled = true;
    btn.textContent = t('btn_saving');
  }

  var tgId = (state.tgUser && state.tgUser.id) || (state.userInfo && state.userInfo.tg_id) || 0;

  try {
    var res = await fetch('/api/app/update-profile', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        tg_id: tgId,
        fullname: newName,
        phone: newPhone,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      if (!state.userInfo) state.userInfo = {};
      state.userInfo.fullname = newName;
      state.userInfo.phone = newPhone;
      localStorage.setItem(LS_USER, JSON.stringify(state.userInfo));
      closeEditProfileModal();
      renderProfileTab();
      showToast(t('toast_profile_saved'));
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch(e) {}
      }
    } else {
      alert((t('error_occurred') + ': ') + (data.message || ''));
    }
  } catch(e) {
    alert(t('err_network') + ' ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = t('btn_save');
    }
  }
}

async function deleteMyAccount() {
  if (!confirm(t('confirm_delete_account'))) {
    return;
  }
  var tgId = (state.tgUser && state.tgUser.id) || (state.userInfo && state.userInfo.tg_id) || 0;
  if (!tgId) return;

  try {
    var res = await fetch('/api/app/delete-my-account', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        tg_id: tgId,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      alert(t('alert_account_deleted'));
      localStorage.removeItem(LS_USER);
      localStorage.removeItem('pin_code');
      window.location.reload();
    } else {
      alert((t('error_occurred') + ': ') + (data.message || ''));
    }
  } catch(e) {
    alert(t('err_network') + ' ' + e.message);
  }
}

// ── ADMIN TAB ───────────────────────────────────
var ADMIN_QUICK_TEMPLATES_I18N = {
  uz: {
    '30m': "⏳ Diqqat! Test boshlanishiga 30 daqiqa qoldi! Internet aloqangizni tekshirib, qoralama qog'ozlarni tayyorlab oling.",
    '10m': "⚠️ Test boshlanishiga 10 daqiqa qoldi! Mini ilovaga kirib, tayyor bo'lib turing.",
    'started': "🚀 Test boshlandi! Barchaga omad tilaymiz. Belgilangan vaqt ichida javoblarni topshirishni unutmang.",
    '15m': "⏰ Diqqat, test yakunlanishiga 15 daqiqa qoldi! Qolgan javoblarni tekshirib, topshirishga shoshiling.",
    'ended': "🛑 Test yakunlandi! Javoblarni qabul qilish to'xtatildi. Ishtirok etgan barcha o'quvchilarga minnatdorchilik bildiramiz. Tez orada to'liq tahlil va rasmiy natijalar e'lon qilinadi."
  },
  ru: {
    '30m': "⏳ Внимание! До начала теста осталось 30 минут! Проверьте подключение к интернету и приготовьте черновики.",
    '10m': "⚠️ До начала теста осталось 10 минут! Войдите в приложение и будьте готовы.",
    'started': "🚀 Тест начался! Желаем всем удачи. Не забудьте отправить ответы в установленное время.",
    '15m': "⏰ Внимание, до окончания теста осталось 15 минут! Проверьте оставшиеся ответы и поторопитесь со сдачей.",
    'ended': "🛑 Тест завершен! Прием ответов остановлен. Благодарим всех участников. Скоро будут опубликованы полный разбор и официальные результаты."
  },
  en: {
    '30m': "⏳ Attention! 30 minutes left before the test starts! Check your internet connection and prepare draft papers.",
    '10m': "⚠️ 10 minutes left before the test starts! Open the mini app and be ready.",
    'started': "🚀 The test has started! Good luck to everyone. Remember to submit your answers within the allotted time.",
    '15m': "⏰ Attention, 15 minutes left before the test ends! Double-check your answers and hurry to submit.",
    'ended': "🛑 The test has ended! Answer submission is closed. Thank you to all participants. Full analysis and official results will be announced shortly."
  }
};

function getActiveOrPlannedTestCode() {
  var tests = window.availableActiveTests || [];
  var active = tests.find(function(t) { return t.is_active; });
  if (active && active.test_code) return String(active.test_code).trim();
  if (tests.length > 0 && tests[0].test_code) return String(tests[0].test_code).trim();
  return '';
}

function applyQuickTemplate(type) {
  var textarea = document.getElementById('admin-broadcast-text');
  if (!textarea) return;

  var lang = localStorage.getItem(LS_LANG) || 'uz';
  var tmpls = ADMIN_QUICK_TEMPLATES_I18N[lang] || ADMIN_QUICK_TEMPLATES_I18N.uz;
  var text = tmpls[type] || '';
  if (type === 'started' || type === 'ended') {
    var code = getActiveOrPlannedTestCode();
    var codeDisplay = code ? (code.startsWith('#') ? code : ('#' + code)) : '#TEST_KODI';
    text = text + "\n\n" + t('lbl_test_code') + " " + codeDisplay;
  }

  textarea.value = text;
  updateBroadcastCharCount();

  textarea.focus();
  try {
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  } catch (e) {}

  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  } catch (e) {}

  var btn = document.getElementById('tmpl-btn-' + type);
  if (btn) {
    btn.classList.add('tmpl-active');
    setTimeout(function() { btn.classList.remove('tmpl-active'); }, 300);
  }
}

function updateBroadcastCharCount() {
  var textarea = document.getElementById('admin-broadcast-text');
  var countEl = document.getElementById('broadcast-char-count');
  if (!textarea) return;
  window._cachedBroadcastText = textarea.value || '';
  if (countEl) {
    var len = (textarea.value || '').length;
    countEl.textContent = len + ' ' + t('bcast_chars');
  }
}

function clearBroadcastText() {
  var textarea = document.getElementById('admin-broadcast-text');
  if (textarea) {
    textarea.value = '';
    window._cachedBroadcastText = '';
    updateBroadcastCharCount();
    textarea.focus();
  }
}

async function sendAdminBroadcast() {
  var textarea = document.getElementById('admin-broadcast-text');
  if (!textarea) return;
  var msg = (textarea.value || '').trim();
  if (!msg) {
    alert(t('admin_broadcast_empty_prompt'));
    textarea.focus();
    return;
  }

  if (!confirm(t('admin_broadcast_confirm_prompt') + "\n\n\"" + (msg.length > 80 ? msg.substring(0, 80) + '...' : msg) + "\"")) {
    return;
  }

  var btn = document.getElementById('btn-send-broadcast');
  var originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ ' + t('admin_broadcast_sending') + '</span>';
  }

  var urlParams = new URLSearchParams(window.location.search);
  var adminId = (state.tgUser && state.tgUser.id) || parseInt(urlParams.get('tg_id')) || 0;

  try {
    var res = await fetch('/api/app/broadcast', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        admin_id: adminId,
        message: msg,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      alert("✅ " + t('admin_broadcast_sent_title') + "\n\n📨 " + t('admin_broadcast_delivered_lbl') + ": " + (data.sent || 0) + " " + t('unit_count') + (data.fail ? ("\n⚠️ " + t('admin_broadcast_failed_lbl') + ": " + data.fail + " " + t('unit_count')) : ""));
      textarea.value = '';
      window._cachedBroadcastText = '';
      updateBroadcastCharCount();
    } else {
      alert("⚠️ " + (t('error_occurred') + ': ') + (data.message || ''));
    }
  } catch (e) {
    console.error("Broadcast error:", e);
    alert(t('err_network') + ' ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

function switchAdminSubtab(subtab) {
  if (state.adminSubtab === subtab) return;

  var currentText = document.getElementById('admin-broadcast-text');
  if (currentText) {
    window._cachedBroadcastText = currentText.value;
  }

  state.adminSubtab = subtab;

  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } catch(e) {}
  }

  renderAdminTab();

  if (subtab === 'users') {
    if (window.currentAdminUsers) {
      renderUsersSection(window.currentAdminUsers, window.currentAdminStats);
    } else {
      loadAllUsers();
    }
  } else if (subtab === 'broadcast') {
    var ta = document.getElementById('admin-broadcast-text');
    if (ta && window._cachedBroadcastText) {
      ta.value = window._cachedBroadcastText;
      updateBroadcastCharCount();
    }
  }
}

function renderAdminTab() {
  var tab = document.getElementById('tab-admin');
  if (!tab) return;
  var currentSubtab = state.adminSubtab || 'users';
  var usersCount = window.currentAdminUsers ? window.currentAdminUsers.length : 0;

  var usersIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var broadcastIcon = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';

  var html =
    '<div class="admin-header-card animate-in">' +
      '<div class="admin-header-icon">⚙️</div>' +
      '<div>' +
        '<div style="font-size:16px;font-weight:800;color:var(--text)">' + t('admin_panel') + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:2px">' + t('admin_panel_sub') + '</div>' +
      '</div>' +
    '</div>' +

    // ── ADMIN SUBTABS SWITCHER (Bo'limlarga ajratish) ──
    '<div class="admin-subtabs animate-in" style="margin-top:12px;margin-bottom:14px;">' +
      '<button type="button" class="admin-subtab ' + (currentSubtab === 'users' ? 'active' : '') + '" onclick="switchAdminSubtab(\'users\')">' +
        '<span class="admin-subtab-icon">' + usersIcon + '</span>' +
        '<span class="admin-subtab-text">' + t('admin_tab_users') + '</span>' +
        '<span class="admin-subtab-badge" id="admin-subtab-users-count">' + usersCount + '</span>' +
      '</button>' +
      '<button type="button" class="admin-subtab ' + (currentSubtab === 'broadcast' ? 'active' : '') + '" onclick="switchAdminSubtab(\'broadcast\')">' +
        '<span class="admin-subtab-icon">' + broadcastIcon + '</span>' +
        '<span class="admin-subtab-text">' + t('admin_tab_broadcast') + '</span>' +
        '<span class="admin-subtab-badge">⚡️</span>' +
      '</button>' +
    '</div>';

  if (currentSubtab === 'users') {
    html +=
      // Statistika konteyneri (JS to'ldiradi)
      '<div id="admin-stats-container" class="animate-in"></div>' +

      // Foydalanuvchilar kartasi
      '<div class="card animate-in" style="margin-top:0">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
          '<div style="font-size:13.5px;font-weight:800;color:var(--text)">' + t('admin_users_list') + '</div>' +
          '<div id="admin-users-badge-count" style="font-size:11.5px;font-weight:700;color:var(--text-muted)">0 ' + t('unit_count') + '</div>' +
        '</div>' +

        // Qidiruv paneli
        '<div class="admin-search-box">' +
          '<span class="admin-search-icon">🔍</span>' +
          '<input type="text" id="admin-user-search-input" class="admin-search-input" placeholder="' + t('admin_search_ph') + '" oninput="handleAdminUserSearch(this.value)">' +
        '</div>' +

        // Filtr tugmalari
        '<div class="admin-filter-tabs">' +
          '<button class="admin-filter-btn active" id="btn-flt-all" onclick="setAdminUserFilter(\'all\')">' + t('flt_all') + '</button>' +
          '<button class="admin-filter-btn" id="btn-flt-approved" onclick="setAdminUserFilter(\'approved\')">' + t('flt_approved') + '</button>' +
          '<button class="admin-filter-btn" id="btn-flt-pending" onclick="setAdminUserFilter(\'pending\')">' + t('flt_pending') + '</button>' +
          '<button class="admin-filter-btn" id="btn-flt-blocked" onclick="setAdminUserFilter(\'blocked\')">' + t('flt_blocked') + '</button>' +
        '</div>' +

        // Ro'yxat
        '<div id="users-list">' +
          '<div class="skeleton skeleton-card" style="height:50px"></div>' +
          '<div class="skeleton skeleton-card" style="height:50px;margin-top:8px"></div>' +
        '</div>' +
      '</div>' +

      // Barchani cheklash tugmasi
      '<button class="admin-btn-restrict-all animate-in" style="margin-top:14px;" onclick="restrictAllUsersFromApp()">' +
        t('btn_restrict_all') +
      '</button>';
  } else {
    // 📢 O'quvchilarga xabar yuborish (Tezkor shablonlar + Textarea)
    html +=
      '<div class="admin-broadcast-card animate-in">' +
        '<div class="admin-broadcast-header">' +
          '<div class="admin-broadcast-title-wrap">' +
            '<div class="admin-broadcast-icon-box">📢</div>' +
            '<div>' +
              '<div class="admin-broadcast-title">' + t('bcast_title') + '</div>' +
              '<div class="admin-broadcast-subtitle">' + t('bcast_subtitle') + '</div>' +
            '</div>' +
          '</div>' +
          '<span class="admin-broadcast-badge">' + t('bcast_badge_fast') + '</span>' +
        '</div>' +

        // Tezkor tayyor shablonlar
        '<div class="quick-templates-section">' +
          '<div class="quick-templates-label"><span>⚡️</span> ' + t('bcast_quick_label') + '</div>' +
          '<div class="quick-templates-grid">' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-30m" onclick="applyQuickTemplate(\'30m\')">' +
              '<span class="tmpl-icon">⏳</span>' +
              '<span class="tmpl-text">' + t('tmpl_30m') + '</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-10m" onclick="applyQuickTemplate(\'10m\')">' +
              '<span class="tmpl-icon">⚠️</span>' +
              '<span class="tmpl-text">' + t('tmpl_10m') + '</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-started" onclick="applyQuickTemplate(\'started\')">' +
              '<span class="tmpl-icon">🚀</span>' +
              '<span class="tmpl-text">' + t('tmpl_started') + '</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-15m" onclick="applyQuickTemplate(\'15m\')">' +
              '<span class="tmpl-icon">⏰</span>' +
              '<span class="tmpl-text">' + t('tmpl_15m') + '</span>' +
            '</button>' +
            '<button type="button" class="quick-tmpl-btn" id="tmpl-btn-ended" onclick="applyQuickTemplate(\'ended\')">' +
              '<span class="tmpl-icon">🛑</span>' +
              '<span class="tmpl-text">' + t('tmpl_ended') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // Xabar matni maydoni (textarea)
        '<div class="broadcast-textarea-wrap">' +
          '<textarea id="admin-broadcast-text" class="admin-broadcast-textarea" rows="3" placeholder="' + t('bcast_textarea_ph') + '" oninput="updateBroadcastCharCount()">' + escHtml(window._cachedBroadcastText || '') + '</textarea>' +
          '<div class="broadcast-meta-row">' +
            '<span id="broadcast-char-count" class="broadcast-char-count">' + (window._cachedBroadcastText ? window._cachedBroadcastText.length : 0) + ' ' + t('bcast_chars') + '</span>' +
            '<button type="button" class="btn-clear-broadcast" onclick="clearBroadcastText()">' + t('bcast_clear') + '</button>' +
          '</div>' +
        '</div>' +

        // Yuborish tugmasi
        '<button type="button" class="btn-send-broadcast" id="btn-send-broadcast" onclick="sendAdminBroadcast()">' +
          '<span>' + t('bcast_send_btn') + '</span>' +
        '</button>' +
      '</div>';
  }

  tab.innerHTML = html;
}

function handleAdminUserSearch(query) {
  window.adminSearchQuery = (query || '').trim().toLowerCase();
  renderFilteredAdminUsers();
}

function setAdminUserFilter(filter) {
  window.adminCurrentFilter = filter;
  ['all', 'approved', 'pending', 'blocked'].forEach(function(f) {
    var btn = document.getElementById('btn-flt-' + f);
    if (btn) btn.classList.toggle('active', f === filter);
  });
  renderFilteredAdminUsers();
}

function renderUsersSection(users, stats) {
  window.currentAdminUsers = users || [];
  window.currentAdminStats = stats || null;
  window.adminCurrentFilter = window.adminCurrentFilter || 'all';
  window.adminSearchQuery = window.adminSearchQuery || '';

  // Admin subtabdagi foydalanuvchilar soni
  var subtabBadge = document.getElementById('admin-subtab-users-count');
  if (subtabBadge) {
    subtabBadge.textContent = window.currentAdminUsers.length;
  }

  // 1. Statistikani yangilash
  var statsContainer = document.getElementById('admin-stats-container');
  if (statsContainer && stats) {
    statsContainer.innerHTML =
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800">' + (stats.total||0) + '</div><div class="stat-label" style="font-size:10px">' + t('admin_stat_total') + '</div></div>' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800;color:#10b981">' + (stats.approved||0) + '</div><div class="stat-label" style="font-size:10px">' + t('admin_stat_active') + '</div></div>' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800;color:#f59e0b">' + (stats.pending||0) + '</div><div class="stat-label" style="font-size:10px">' + t('admin_stat_pending') + '</div></div>' +
        '<div class="stat-card" style="padding:8px 4px;text-align:center"><div class="stat-value" style="font-size:16px;font-weight:800;color:#ef4444">' + (stats.blocked||0) + '</div><div class="stat-label" style="font-size:10px">' + t('admin_stat_blocked') + '</div></div>' +
      '</div>';
  }

  // 2. Foydalanuvchilar ro'yxatini render qilish
  renderFilteredAdminUsers();
}

function renderFilteredAdminUsers() {
  var listEl = document.getElementById('users-list');
  if (!listEl) return;

  var users = window.currentAdminUsers || [];
  var filter = window.adminCurrentFilter || 'all';
  var q = window.adminSearchQuery || '';

  var filtered = users.filter(function(u) {
    // Holat bo'yicha filter
    var st = (u.status || 'pending').toLowerCase();
    if (filter === 'approved' && st !== 'approved') return false;
    if (filter === 'pending' && st !== 'pending') return false;
    if (filter === 'blocked' && st !== 'blocked') return false;

    // Qidiruv bo'yicha filter
    if (q) {
      var nameMatch = (u.fullname || '').toLowerCase().indexOf(q) !== -1;
      var phoneMatch = (u.phone || '').toLowerCase().indexOf(q) !== -1;
      var idMatch = String(u.tg_id || '').indexOf(q) !== -1;
      var userMatch = (u.username || '').toLowerCase().indexOf(q) !== -1;
      if (!nameMatch && !phoneMatch && !idMatch && !userMatch) return false;
    }
    return true;
  });

  var countBadge = document.getElementById('admin-users-badge-count');
  if (countBadge) {
    countBadge.textContent = filtered.length + ' ' + t('unit_count') + (filtered.length !== users.length ? (' (' + t('filtered_suffix') + ')') : '');
  }

  if (filtered.length === 0) {
    listEl.innerHTML =
      '<div class="empty-state" style="padding:24px 10px;">' +
        '<div class="empty-icon" style="font-size:36px;">🔍</div>' +
        '<p style="font-size:13px;color:var(--text-muted);">' + (q ? t('admin_no_match') : t('admin_no_users')) + '</p>' +
      '</div>';
    return;
  }

  var usersHtml = filtered.map(function(u) {
    var letter = (u.fullname || 'F').charAt(0).toUpperCase();
    var tc = u.tests_count || 0;
    var st = (u.status || 'pending').toLowerCase();
    var sb = '';
    if (st === 'approved') {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.15);color:#10b981;border:1px solid rgba(16,185,129,0.3);border-radius:12px;"><span class="status-dot approved" style="width:6px;height:6px"></span> ' + t('status_approved') + '</span>';
    } else if (st === 'pending') {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);border-radius:12px;"><span class="status-dot pending" style="width:6px;height:6px"></span> ' + t('status_pending') + '</span>';
    } else if (st === 'blocked') {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:12px;"><span class="status-dot rejected" style="width:6px;height:6px"></span> ' + t('status_blocked') + '</span>';
    } else {
      sb = '<span class="badge" style="padding:3px 8px;font-size:10.5px;display:inline-flex;align-items:center;gap:4px;background:rgba(100,116,139,0.15);color:#94a3b8;border:1px solid rgba(100,116,139,0.3);border-radius:12px;">' + st + '</span>';
    }

    return '<div class="user-row clickable" onclick="openAdminUserModal(' + u.tg_id + ')">' +
      '<div class="user-row-avatar">' + letter + '</div>' +
      '<div class="user-row-info">' +
        '<div class="user-row-name" style="font-size:14.5px;font-weight:700;">' + escHtml(u.fullname || t('user_unknown')) + '</div>' +
      '</div>' +
      sb +
      '<span style="color:var(--text-muted);font-size:16px;margin-left:4px">›</span>' +
    '</div>';
  }).join('');

  listEl.innerHTML = usersHtml;
}

function openAdminUserModal(targetUid) {
  var users = window.currentAdminUsers || [];
  var u = users.find(function(item) { return item.tg_id === Number(targetUid); });
  if (!u && typeof targetUid === 'object') u = targetUid;

  if (!u) {
    alert(t('user_not_found'));
    return;
  }

  var modal = document.getElementById('admin-user-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-user-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:16px;';
    modal.onclick = function(e) { closeAdminUserModal(e); };
    modal.innerHTML =
      '<div class="modal-box" id="admin-user-modal-box" style="max-width:400px;width:100%;max-height:92vh;overflow-y:auto;padding:22px 18px;border-radius:24px;background:var(--bg-card,#1e293b);border:1px solid var(--border,rgba(255,255,255,0.12));box-shadow:0 24px 60px rgba(0,0,0,0.5);position:relative;">' +
        '<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">' +
          '<div class="modal-title" style="font-size:16px;font-weight:800;color:var(--text,#fff);">' + t('modal_user_mgmt_title') + '</div>' +
          '<button class="modal-close" onclick="closeAdminUserModal()" style="background:none;border:none;font-size:22px;color:var(--text-muted,#94a3b8);cursor:pointer;padding:4px 8px;line-height:1;">✕</button>' +
        '</div>' +
        '<div class="modal-body" id="admin-user-modal-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  var body = document.getElementById('admin-user-modal-body');
  if (!body) return;

  var letter = (u.fullname || 'F').charAt(0).toUpperCase();
  var st = (u.status || 'pending').toLowerCase();

  var statusBadge = '';
  if (st === 'approved') {
    statusBadge = '<span class="stat-status-badge status-approved" style="font-size:12px;padding:4px 12px;"><span class="status-dot approved"></span> ' + t('admin_modal_approved_badge') + '</span>';
  } else if (st === 'pending') {
    statusBadge = '<span class="stat-status-badge status-pending" style="font-size:12px;padding:4px 12px;"><span class="status-dot pending"></span> ' + t('admin_modal_pending_badge') + '</span>';
  } else if (st === 'blocked') {
    statusBadge = '<span class="stat-status-badge status-rejected" style="font-size:12px;padding:4px 12px;"><span class="status-dot rejected"></span> ' + t('admin_modal_blocked_badge') + '</span>';
  } else {
    statusBadge = '<span class="stat-status-badge" style="font-size:12px;padding:4px 12px;">' + st + '</span>';
  }

  var regDateStr = u.registered_at ? formatDate(u.registered_at) : t('user_unknown');
  var lastTestStr = u.last_test_at ? formatDate(u.last_test_at) : t('admin_no_tests_yet');
  var usernameStr = u.username ? ('@' + u.username) : t('val_none');

  // Harakat tugmalari (Action buttons) - Birinchi o'rinda ko'rinadi
  var actionButtonsHtml = '<div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">';

  if (st !== 'approved') {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-approve" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'approved\')">' + t('btn_admin_approve') + '</button>';
  } else {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-pending" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'pending\')">' + t('btn_admin_suspend') + '</button>';
  }

  if (st !== 'blocked') {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-block" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'blocked\')">' + t('btn_admin_block') + '</button>';
  } else {
    actionButtonsHtml += '<button class="admin-btn-action admin-btn-approve" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'approved\')">' + t('btn_admin_unblock') + '</button>';
  }

  actionButtonsHtml += '<button class="admin-btn-action admin-btn-delete" onclick="updateUserStatusFromModal(' + u.tg_id + ', \'delete\')">' + t('btn_admin_delete_db') + '</button>';
  actionButtonsHtml += '</div>';

  // Foydalanuvchi ma'lumotlari (Akkordeon / Ko'rsatish-Yashirish)
  var infoToggleHtml =
    '<button type="button" class="admin-user-info-toggle-btn" id="btn-toggle-user-info" onclick="toggleAdminUserInfo()">' +
      '<span class="info-toggle-left">' +
        '<span style="font-size:15px;">📋</span>' +
        '<span>' + t('admin_user_info_label') + '</span>' +
      '</span>' +
      '<span class="info-toggle-arrow" id="info-toggle-arrow">' + t('toggle_show') + '</span>' +
    '</button>' +
    '<div id="admin-user-info-content" class="admin-user-info-content" style="display:none;">' +
      '<div class="card" style="margin:0;padding:10px 14px;border-radius:14px;background:var(--bg-glass-2);border:1px solid var(--border);">' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">📱</div><div><div class="info-label" style="font-size:11px;">' + t('lbl_phone_short') + '</div><div class="info-value" style="font-size:14px;font-weight:700;"><a href="tel:' + escHtml(u.phone || '') + '" style="color:var(--primary);text-decoration:none;">' + escHtml(u.phone || '—') + '</a></div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">🆔</div><div><div class="info-label" style="font-size:11px;">' + t('lbl_tg_id_short') + '</div><div class="info-value" style="font-size:14px;font-weight:700;"><code>' + u.tg_id + '</code></div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">🔗</div><div><div class="info-label" style="font-size:11px;">' + t('lbl_username_short') + '</div><div class="info-value" style="font-size:14px;font-weight:700;">' + escHtml(usernameStr) + '</div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">🕒</div><div><div class="info-label" style="font-size:11px;">' + t('lbl_reg_date') + '</div><div class="info-value" style="font-size:13.5px;font-weight:700;color:var(--primary);">' + regDateStr + '</div></div></div>' +
        '<div class="info-row" style="padding:9px 0;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">📝</div><div><div class="info-label" style="font-size:11px;">' + t('admin_lbl_tests_count') + '</div><div class="info-value" style="font-size:14px;font-weight:700;">' + (u.tests_count || 0) + ' ' + t('unit_count') + '</div></div></div>' +
        '<div class="info-row" style="padding:9px 0;border-bottom:none;"><div class="info-icon" style="width:32px;height:32px;font-size:16px;">⏱</div><div><div class="info-label" style="font-size:11px;">' + t('admin_lbl_last_test') + '</div><div class="info-value" style="font-size:13px;font-weight:600;">' + lastTestStr + '</div></div></div>' +
      '</div>' +
    '</div>';

  body.innerHTML =
    '<div style="text-align:center;padding:2px 0 10px;">' +
      '<div class="profile-avatar" style="margin:0 auto 8px;width:52px;height:52px;font-size:22px;display:flex;align-items:center;justify-content:center;">' + letter + '</div>' +
      '<div style="font-size:16.5px;font-weight:800;color:var(--text);">' + escHtml(u.fullname || t('default_user')) + '</div>' +
      '<div style="margin-top:6px;">' + statusBadge + '</div>' +
    '</div>' +
    actionButtonsHtml +
    infoToggleHtml;

  modal.style.display = 'flex';
}

function toggleAdminUserInfo() {
  var content = document.getElementById('admin-user-info-content');
  var arrow = document.getElementById('info-toggle-arrow');
  if (!content) return;
  var isHidden = content.style.display === 'none' || content.style.display === '';
  if (isHidden) {
    content.style.display = 'block';
    if (arrow) arrow.innerHTML = t('toggle_hide');
  } else {
    content.style.display = 'none';
    if (arrow) arrow.innerHTML = t('toggle_show');
  }
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    } catch(e) {}
  }
}

function closeAdminUserModal(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('modal-close')) return;
  var modal = document.getElementById('admin-user-modal');
  if (modal) modal.style.display = 'none';
}

async function updateUserStatusFromModal(targetUid, newStatus) {
  if (newStatus === 'delete') {
    if (!confirm(t('admin_confirm_delete_user'))) {
      return;
    }
  } else if (newStatus === 'blocked') {
    if (!confirm(t('admin_confirm_block_user'))) {
      return;
    }
  } else if (newStatus === 'pending') {
    if (!confirm(t('admin_confirm_pending_user'))) {
      return;
    }
  }

  var adminId = (state.tgUser && state.tgUser.id) || 0;
  var btn = (typeof event !== 'undefined' && event && event.target) ? event.target : null;
  var originalText = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = t('action_in_progress');
  }

  try {
    var res = await fetch('/api/app/update-user-status', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        admin_id: adminId,
        target_uid: targetUid,
        status: newStatus,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      closeAdminUserModal();
      if (newStatus === 'delete') {
        alert(t('admin_alert_deleted'));
      } else if (newStatus === 'approved') {
        alert(t('admin_alert_approved'));
      } else if (newStatus === 'blocked') {
        alert(t('admin_alert_blocked'));
      } else if (newStatus === 'pending') {
        alert(t('admin_alert_pending'));
      }
      loadAllUsers();
    } else {
      alert((t('error_occurred') + ': ') + (data.message || ''));
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
  } catch (err) {
    alert(t('err_network') + ' ' + err.message);
    if (btn) { btn.disabled = false; btn.textContent = originalText; }
  }
}

async function restrictAllUsersFromApp() {
  if (!confirm(t('admin_confirm_restrict_all'))) {
    return;
  }

  var adminId = (state.tgUser && state.tgUser.id) || 0;
  try {
    var res = await fetch('/api/app/restrict-all-users', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        admin_id: adminId,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    var data = await res.json();
    if (data.success) {
      alert('🔒 Jami ' + (data.count || 0) + ' ta foydalanuvchi muvaffaqiyatli cheklandi!');
      loadAllUsers();
    } else {
      alert(data.message || 'Xatolik yuz berdi');
    }
  } catch (err) {
    alert('Server bilan bogʻlanishda xatolik: ' + err.message);
  }
}

// Webapp redirection functions removed (users will use bot inline buttons directly)

// ── PIN CHANGE ───────────────────────────────────
function changePinPrompt() {
  localStorage.removeItem(LS_PIN);
  state.pinBuffer = '';
  state.pinFirst = '';
  state.pinMode = 'setup';
  var pinScreen = document.getElementById('pin-screen');
  var app = document.getElementById('app');
  document.getElementById('pin-title').textContent = t('pin_create');
  document.getElementById('pin-subtitle').textContent = t('pin_create_sub');
  renderPinDots(0);
  showPinError('');
  app.style.display = 'none';
  app.classList.remove('visible');
  pinScreen.style.transition = '';
  pinScreen.style.opacity = '1';
  pinScreen.style.transform = 'scale(1)';
  pinScreen.style.display = 'flex';
}

// ── THEME ────────────────────────────────────────
function syncTelegramTheme(theme) {
  var t = theme || document.documentElement.getAttribute('data-theme') || 'light';
  var bg = t === 'dark' ? '#0a0b14' : '#f0f4ff';
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', bg);
  if (window.Telegram && window.Telegram.WebApp) {
    var tg = window.Telegram.WebApp;
    try {
      if (tg.setHeaderColor) tg.setHeaderColor(bg);
      if (tg.setBackgroundColor) tg.setBackgroundColor(bg);
      if (tg.setBottomBarColor) tg.setBottomBarColor(bg);
      if (typeof tg.expand === 'function') tg.expand();
    } catch(e) {}
  }
}

function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme') || 'dark';
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(LS_THEME, next);
  updateThemeIcon(next);
  syncTelegramTheme(next);
  var pTheme = document.getElementById('profile-theme-label');
  if (pTheme) {
    pTheme.textContent = next === 'dark' ? t('theme_dark_lbl') : t('theme_light_lbl');
  }
}

function updateThemeIcon(theme) {
  var el = document.getElementById('theme-icon');
  if (el) el.innerHTML = theme === 'dark' ? '&#9790;' : '&#9728;';
}

// ── LANGUAGE ─────────────────────────────────────
var LANGS = ['uz', 'ru', 'en'];
var LANG_LABELS = { uz: 'UZ', ru: 'RU', en: 'EN' };

function refreshActiveTab() {
  var tabId = state.activeTab || 'home';
  if (tabId === 'home') {
    if (window.availableActiveTests) renderHomeTab(window.availableActiveTests);
    else loadActiveTests();
  } else if (tabId === 'tests') {
    if (window._myResults) renderTestsTab(window._myResults);
    else loadMyResults();
  } else if (tabId === 'profile') {
    renderProfileTab();
  } else if (tabId === 'admin') {
    renderAdminTab();
    if (window.currentAdminUsers) renderUsersSection(window.currentAdminUsers, window.currentAdminStats);
    else loadAllUsers();
  }
}

function cycleLang() {
  var cur = localStorage.getItem(LS_LANG) || 'uz';
  var idx = LANGS.indexOf(cur);
  var next = LANGS[(idx + 1) % LANGS.length];
  localStorage.setItem(LS_LANG, next);
  updateLangLabel();
  applyI18n();
  renderOnboardingSlides();
  refreshActiveTab();
}

function updateLangLabel() {
  var cur = localStorage.getItem(LS_LANG) || 'uz';
  var el = document.getElementById('lang-label');
  if (el) el.textContent = LANG_LABELS[cur] || 'UZ';
}

function applyI18n() {
  // data-i18n atributli barcha elementlar
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  // Header title atributlari
  var langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.setAttribute('title', t('header_lang_title'));
  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) themeBtn.setAttribute('title', t('header_theme_title'));

  // PIN ekrani matnlari
  var pinTitle = document.getElementById('pin-title');
  var pinSub = document.getElementById('pin-subtitle');
  if (pinTitle && pinSub) {
    var hasPin = !!localStorage.getItem(LS_PIN);
    if (!hasPin || state.pinMode === 'setup') {
      pinTitle.textContent = t('pin_create');
      pinSub.textContent = t('pin_create_sub');
    } else {
      pinTitle.textContent = t('pin_enter_title');
      pinSub.textContent = t('pin_enter_sub');
    }
  }
}

// ── RESULT MODAL ─────────────────────────────────
function showResultModal(result) {
  var modal = document.getElementById('result-modal');
  var title = document.getElementById('result-modal-title');
  var body = document.getElementById('result-modal-body');
  if (!modal || !body) return;

  var score = (result.score != null) ? result.score : 0;
  var maxScore = result.max_score || 100;
  var grade = result.grade || getGradeFromScore(score, maxScore);
  var gradeClass = gradeToClass(grade);
  var date = formatDate(result.submitted_at);
  var correct = result.correct_count || 0;
  var total = result.total_count || 45;
  var wrong = result.incorrect_count || (total - correct);
  var blank = result.unanswered_count || 0;

  var gradeBg = { 'grade-5':'rgba(16,185,129,0.15)', 'grade-4':'rgba(59,130,246,0.15)', 'grade-3':'rgba(245,158,11,0.15)', 'grade-2':'rgba(239,68,68,0.15)' };
  var gradeColor = { 'grade-5':'#10B981', 'grade-4':'#3B82F6', 'grade-3':'#F59E0B', 'grade-2':'#EF4444' };
  var gradeBorder = { 'grade-5':'#10B981', 'grade-4':'#3B82F6', 'grade-3':'#F59E0B', 'grade-2':'#EF4444' };

  var isPub = Boolean(result.results_published);
  title.textContent = (result.test_title || result.title || t('result_title'));

  if (!isPub) {
    body.innerHTML = 
      '<div style="text-align:center;margin:16px 0 20px;">' +
        '<div style="width:70px;height:70px;border-radius:24px;background:rgba(245,158,11,0.15);color:#F59E0B;font-size:32px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">⏳</div>' +
        '<h3 style="font-size:18px;font-weight:900;color:var(--text);margin-bottom:6px;">' + t('result_checking_title') + '</h3>' +
        '<p style="font-size:13.5px;color:var(--text-muted);line-height:1.5;max-width:300px;margin:0 auto 16px;">' + t('result_checking_desc') + '</p>' +
        '<div style="background:var(--bg-body);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:13px;color:var(--text-muted);font-weight:600;">' + t('lbl_submitted_time') + date + '</div>' +
      '</div>';
    modal.style.display = 'flex';
    return;
  }

  body.innerHTML =
    '<div style="text-align:center;margin:10px 0 16px;">' +
      '<div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 28px;border-radius:18px;background:' + (gradeBg[gradeClass]||'rgba(99,102,241,0.15)') + ';border:2px solid ' + (gradeBorder[gradeClass]||'#6366F1') + ';min-width:140px;">' +
        '<span style="font-size:32px;font-weight:900;line-height:1.1;color:' + (gradeColor[gradeClass]||'#6366F1') + ';">' + grade + '</span>' +
        '<span style="font-size:14px;font-weight:800;color:var(--text-main);margin-top:4px;">' + score + ' ' + t('score_pts') + '</span>' +
      '</div>' +
    '</div>' +
    '<div id="compare-keys-section" style="text-align:center; margin: 12px 0;">' +
      '<button id="btn-compare-keys" onclick="promptCompareKeys(' + result.test_id + ')" style="background:linear-gradient(135deg, #3B82F6, #6366F1);color:white;border:none;padding:12px;border-radius:12px;font-weight:800;font-size:14.5px;cursor:pointer;width:100%;box-shadow:0 4px 14px rgba(59, 130, 246, 0.4);">' + t('btn_see_keys') + '</button>' +
      '<div id="compare-keys-auth" style="display:none;margin-top:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:12px;">' +
        '<p style="font-size:12px;color:var(--text-muted);margin-bottom:8px;font-weight:600;">' + t('desc_key_code') + '</p>' +
        '<input type="password" id="input-key-code" placeholder="' + t('placeholder_key_code') + '" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-body);color:var(--text-main);font-size:14px;margin-bottom:8px;">' +
        '<button onclick="submitCompareKeys(' + result.test_id + ')" style="background:#10B981;color:white;border:none;padding:10px;border-radius:8px;font-weight:700;cursor:pointer;width:100%;">' + t('btn_confirm') + '</button>' +
        '<div id="compare-keys-error" style="color:var(--error);font-size:12px;margin-top:6px;display:none;"></div>' +
      '</div>' +
    '</div>' +
    '<div id="compare-keys-result" style="display:none;margin-bottom:16px;max-height:250px;overflow-y:auto;border:1px solid var(--border);border-radius:12px;padding:8px;"></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('lbl_total_score') + '</span><span class="result-row-val" style="color:var(--primary);font-weight:800;font-size:16px;">' + score + ' ' + t('score_pts') + '</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_grade') + '</span><span class="result-row-val" style="color:' + (gradeColor[gradeClass]||'var(--accent)') + ';font-weight:800;">' + grade + '</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_correct') + '</span><span class="result-row-val green">' + correct + ' / ' + total + ' ' + t('unit_count') + '</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_wrong') + '</span><span class="result-row-val red">' + wrong + ' ' + t('unit_count') + '</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_blank') + '</span><span class="result-row-val orange">' + blank + ' ' + t('unit_count') + '</span></div>' +
    '<div class="result-row"><span class="result-row-label">' + t('result_date') + '</span><span class="result-row-val">' + date + '</span></div>';

  modal.style.display = 'flex';
}

function promptCompareKeys(testId) {
  document.getElementById('btn-compare-keys').style.display = 'none';
  document.getElementById('compare-keys-auth').style.display = 'block';
}

async function submitCompareKeys(testId) {
  var tgId = (state.tgUser && state.tgUser.id) || 0;
  var code = document.getElementById('input-key-code').value.trim();
  var errEl = document.getElementById('compare-keys-error');
  var resEl = document.getElementById('compare-keys-result');
  
  if (!code) {
    errEl.textContent = t('err_enter_code');
    errEl.style.display = 'block';
    return;
  }
  
  try {
    const res = await fetch('/api/app/compare-keys', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        tg_id: tgId,
        test_id: testId,
        code: code,
        init_data: (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || ''
      })
    });
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('compare-keys-auth').style.display = 'none';
      renderKeyComparison(data.correct_answers, data.user_answers, resEl);
    } else {
      errEl.textContent = data.message || t('error_occurred');
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = t('err_network');
    errEl.style.display = 'block';
  }
}

function renderKeyComparison(correct, user, container) {
  if (!container) return;
  container.style.display = 'block';

  function getAnswerVal(val) {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'object') {
      if (val.ans !== undefined && val.ans !== null) return String(val.ans).trim() || '-';
      if (val.answer !== undefined && val.answer !== null) return String(val.answer).trim() || '-';
      return '-';
    }
    var s = String(val).trim();
    return s.length > 0 ? s : '-';
  }

  function normalizeAnswer(ans) {
    if (ans === undefined || ans === null || ans === '-') return '';
    var s = String(ans).trim().toLowerCase();

    // Bo'shliqlar va dollar belgilarini olib tashlash
    s = s.replace(/[\s\$]/g, '');

    // 1. Vergul va nuqta: "2,5" -> "2.5"
    s = s.replace(/,/g, '.');

    // 2. Ko'paytirish belgilari: "×", "·" -> "*"
    s = s.replace(/×/g, '*').replace(/·/g, '*');
    s = s.replace(/\\+(?:cdot|times)\b/g, '*');

    // 3. Pi soni: \pi, pi, π
    s = s.replace(/(^|[^a-zA-Z])\\*pi(?![a-zA-Z])/g, '$1π');

    // 4. LaTeX residuallari: \frac, \sqrt, \sqrt[n]
    while (/\\+sqrt\[([^\]]+)\]\{([^}]+)\}/.test(s)) {
      s = s.replace(/\\+sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√$2');
    }
    while (/\\+d?frac\{([^}]+)\}\{([^}]+)\}/.test(s)) {
      s = s.replace(/\\+d?frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
    }
    while (s.includes('sqrt{')) {
      s = s.replace(/\\+sqrt\{([^}]+)\}/g, '√$1');
    }
    s = s.replace(/\\+sqrt([0-9a-zA-Z]+)/g, '√$1');
    s = s.replace(/sqrt/g, '√');

    // Ildizlar va darajalar:
    s = s.replace(/∛/g, '3√').replace(/cbrt/g, '3√').replace(/³√/g, '3√');
    s = s.replace(/∜/g, '4√').replace(/⁴√/g, '4√');
    s = s.replace(/⁰√/g, '0√').replace(/¹√/g, '1√').replace(/²√/g, '2√');
    s = s.replace(/⁵√/g, '5√').replace(/⁶√/g, '6√').replace(/⁷√/g, '7√');
    s = s.replace(/⁸√/g, '8√').replace(/⁹√/g, '9√').replace(/ⁿ√/g, 'n√');

    // 5. Ildiz qavslari: "√(29)" -> "√29", "5√(32)" -> "5√32", "3√(8)" -> "3√8"
    while (/([0-9a-zA-Z]*√)\(([^()]+)\)/.test(s)) {
      s = s.replace(/([0-9a-zA-Z]*√)\(([^()]+)\)/g, '$1$2');
    }

    // Agar ildiz butunligicha qavs ichida bo'lsa: "(√29)" -> "√29"
    while (/\(([0-9a-zA-Z]*√[^()]+)\)/.test(s)) {
      s = s.replace(/\(([0-9a-zA-Z]*√[^()]+)\)/g, '$1');
    }

    // 6. Ko'paytirish belgisi ko'rinishi: "8*√58" -> "8√58", "36*π" -> "36π"
    s = s.replace(/(\d|\))\*(√|[0-9a-zA-Z]+√|π|[a-zA-Z])/g, '$1$2');
    s = s.replace(/(\d)\((√|[0-9a-zA-Z]+√|π)/g, '$1$2');
    s = s.replace(/\*(π)/g, '$1');
    s = s.replace(/(π)\*/g, '$1');

    // Darajalarni standart ^ shakliga keltirish:
    s = s.replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/²/g, '^2').replace(/³/g, '^3');
    s = s.replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9');

    // Ortiqcha figurali qavslar va sleshlar
    s = s.replace(/\{([^}]+)\}/g, '$1');
    s = s.replace(/\\/g, '');

    return s;
  }

  function parseNumericOrFraction(val) {
    if (!val) return null;
    val = String(val).trim();
    try {
      // Sof kasr holati: "a/b"
      if (/^-?\d+(?:\.\d+)?\/-?\d+(?:\.\d+)?$/.test(val)) {
        var parts = val.split('/');
        var num = parseFloat(parts[0]);
        var den = parseFloat(parts[1]);
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          return num / den;
        }
        return null;
      }
      // Sof butun yoki o'nlik kasr: "123", "-123.45"
      if (/^-?\d+(?:\.\d+)?$/.test(val)) {
        var f = parseFloat(val);
        return !isNaN(f) ? f : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function isAnswerMatching(cVal, uVal) {
    var nC = normalizeAnswer(cVal);
    var nU = normalizeAnswer(uVal);
    if (!nC || !nU) return false;
    if (nC === nU) return true;
    var numC = parseNumericOrFraction(nC);
    var numU = parseNumericOrFraction(nU);
    if (numC !== null && numU !== null) {
      return Math.abs(numC - numU) < 1e-5;
    }
    return false;
  }

  var closedItems = [];
  var totalCorrectClosed = 0;

  // 1-bosqich: 1 dan 35 gacha bo'lgan yopiq savollar
  // (1–32: 4 ta variant A, B, C, D; 33–35: 6 ta variant A, B, C, D, E, F)
  for (var i = 1; i <= 35; i++) {
    var key = String(i);
    var cVal = getAnswerVal(correct ? (correct[key] !== undefined ? correct[key] : correct[i]) : null);
    var uVal = getAnswerVal(user ? (user[key] !== undefined ? user[key] : user[i]) : null);
    var nC = normalizeAnswer(cVal);
    var nU = normalizeAnswer(uVal);
    var isOk = (nC !== '' && nU !== '' && nC === nU);
    if (isOk) totalCorrectClosed++;
    closedItems.push({
      key: key,
      cVal: cVal,
      uVal: uVal,
      isOk: isOk,
      typeNote: i <= 32 ? '4-talik' : '6-talik'
    });
  }

  // 2-bosqich: 36 dan 45 gacha bo'lgan ochiq savollar (36a–45b, jami 20 ta ochiq band)
  var openItems = [];
  var totalCorrectOpen = 0;
  for (var q = 36; q <= 45; q++) {
    ['a', 'b'].forEach(function(sub) {
      var key = q + sub;
      var cVal = getAnswerVal(correct ? correct[key] : null);
      var uVal = getAnswerVal(user ? user[key] : null);
      var isOk = isAnswerMatching(cVal, uVal);
      if (isOk) totalCorrectOpen++;
      openItems.push({
        key: key,
        cVal: cVal,
        uVal: uVal,
        isOk: isOk
      });
    });
  }

  var totalCorrect = totalCorrectClosed + totalCorrectOpen;

  var html = '<div class="key-comparison-box" style="margin-top:14px;background:var(--bg-card, #1A1D2D);border:1px solid var(--border, rgba(255,255,255,0.08));border-radius:14px;padding:16px;">';

  // Sarlavha va umumiy ko'rsatkich
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border, rgba(255,255,255,0.08));flex-wrap:wrap;gap:8px;">';
  html += '<div><h4 style="margin:0;font-size:15px;font-weight:700;color:var(--text, #FFF);">' + t('compare_keys_title') + '</h4><span style="font-size:12px;color:var(--text-muted, #94A3B8);">' + t('compare_keys_sub') + '</span></div>';
  html += '<div style="font-size:13px;font-weight:700;padding:4px 12px;border-radius:999px;background:' + (totalCorrect >= 28 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') + ';color:' + (totalCorrect >= 28 ? '#10B981' : '#EF4444') + ';border:1px solid ' + (totalCorrect >= 28 ? '#10B981' : '#EF4444') + ';">' + totalCorrect + ' / 55 ' + t('compare_keys_correct_suffix') + '</div>';
  html += '</div>';

  // 1-bosqich: Yopiq testlar (1–35)
  html += '<div style="margin-bottom:16px;">';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
  html += '<span style="font-size:13px;font-weight:600;color:var(--primary, #6366F1);">' + t('compare_keys_stage1') + '</span>';
  html += '<span style="font-size:11px;font-weight:600;color:var(--text-muted, #94A3B8);">' + totalCorrectClosed + ' / 35 ' + t('compare_keys_correct_suffix') + '</span>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(64px, 1fr));gap:6px;">';
  closedItems.forEach(function(item) {
    var bg = item.isOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    var col = item.isOk ? '#10B981' : '#EF4444';
    var icon = item.isOk ? '✓' : '✗';
    html += '<div style="background:' + bg + ';color:' + col + ';border:1px solid ' + col + ';border-radius:8px;padding:6px 2px;text-align:center;font-size:11px;line-height:1.2;">';
    html += '<div style="font-weight:700;font-size:11px;margin-bottom:2px;">#' + item.key + ' ' + icon + '</div>';
    html += '<div style="font-size:10px;opacity:0.9;">' + t('compare_keys_you') + ' <b>' + item.uVal + '</b></div>';
    html += '<div style="font-size:10px;opacity:0.9;">' + t('compare_keys_orig') + ' <b>' + item.cVal + '</b></div>';
    html += '</div>';
  });
  html += '</div></div>';

  // 2-bosqich: Ochiq yozma savollar (36a–45b, jami 20 ta ochiq band)
  html += '<div>';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">';
  html += '<span style="font-size:13px;font-weight:600;color:var(--primary, #6366F1);">' + t('compare_keys_stage2') + '</span>';
  html += '<span style="font-size:11px;font-weight:600;color:var(--text-muted, #94A3B8);">' + totalCorrectOpen + ' / 20 ' + t('compare_keys_correct_suffix') + '</span>';
  html += '</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(78px, 1fr));gap:6px;">';
  openItems.forEach(function(item) {
    var bg = item.isOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    var col = item.isOk ? '#10B981' : '#EF4444';
    var icon = item.isOk ? '✓' : '✗';
    html += '<div style="background:' + bg + ';color:' + col + ';border:1px solid ' + col + ';border-radius:8px;padding:6px 2px;text-align:center;font-size:11px;line-height:1.2;overflow:hidden;">';
    html += '<div style="font-weight:700;font-size:11px;margin-bottom:2px;">#' + item.key + ' ' + icon + '</div>';
    html += '<div style="font-size:10px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="' + item.uVal + '">' + t('compare_keys_you') + ' <b>' + item.uVal + '</b></div>';
    html += '<div style="font-size:10px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;" title="' + item.cVal + '">' + t('compare_keys_orig') + ' <b>' + item.cVal + '</b></div>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '</div>';
  container.innerHTML = html;
}

function closeResultModal(e) {
  if (e && e.target && e.target.id !== 'result-modal') return;
  var modal = document.getElementById('result-modal');
  if (modal) modal.style.display = 'none';
}

// ── HEADER UPDATE ────────────────────────────────
function updateHeaderUser() {
  var u = state.userInfo;
  var tgU = state.tgUser;
  var name = (u && u.fullname) || (tgU && tgU.first_name) || 'F';
  var el = document.getElementById('header-avatar');
  if (el) el.textContent = name.charAt(0).toUpperCase();
}

// ── HELPERS ─────────────────────────────────────
function computeStatus(testsCount, avgScore) {
  if (testsCount === 0) return { label: t('status_new'), icon: '\uD83C\uDF31', cls: 'status-beginner' };
  if (avgScore >= 40) return { label: t('status_gold'), icon: '\uD83E\uDD47', cls: 'status-gold' };
  if (avgScore >= 30) return { label: t('status_silver'), icon: '\uD83E\uDD48', cls: 'status-silver' };
  if (avgScore >= 20) return { label: t('status_bronze'), icon: '\uD83E\uDD49', cls: 'status-bronze' };
  return { label: t('status_learner'), icon: '\uD83D\uDCDA', cls: 'status-beginner' };
}

function getGradeFromScore(score, maxScore) {
  var s = parseFloat(score) || 0;
  var max = parseFloat(maxScore) || 100;

  // Agar ball 0 yoki undan kam bo'lsa, darhol daraja berilmasin
  if (s <= 0) return 'Yetarli emas';

  var pct = (max > 0) ? (s / max * 100) : s;
  
  if (pct >= 86 && s >= 70) return 'A+';
  if (pct >= 75 && s >= 65) return 'A';
  if (pct >= 65 && s >= 60) return 'B+';
  if (pct >= 60 && s >= 55) return 'B';
  if (pct >= 55 && s >= 50) return 'C+';
  if (pct >= 46 && s >= 46) return 'C';
  
  return 'Yetarli emas';
}

function gradeToClass(grade) {
  if (!grade) return 'grade-2';
  var g = String(grade).toUpperCase();
  if (g.startsWith('A')) return 'grade-5';
  if (g.startsWith('B')) return 'grade-4';
  if (g.startsWith('C')) return 'grade-3';
  return 'grade-2';
}

function formatDate(ts) {
  if (!ts) return '\u2014';
  var lang = localStorage.getItem(LS_LANG) || 'uz';
  var locale = lang === 'ru' ? 'ru-RU' : (lang === 'en' ? 'en-US' : 'uz-UZ');
  var d = new Date(ts * 1000);
  return d.toLocaleDateString(locale, { timeZone: 'Asia/Tashkent', day:'2-digit', month:'2-digit', year:'numeric' }) +
    ' ' + d.toLocaleTimeString(locale, { timeZone: 'Asia/Tashkent', hour:'2-digit', minute:'2-digit', hour12: false });
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  var displayMsg = msg || '';
  if (!displayMsg.startsWith('✅') && !displayMsg.startsWith('⚠️') && !displayMsg.startsWith('❌')) {
    displayMsg = '✅ ' + displayMsg;
  }
  toast.textContent = displayMsg;
  toast.classList.add('show');
  clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(function() { toast.classList.remove('show'); }, 2200);
}

function copyTextToClipboard(text, successMsg) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(String(text)).then(function() {
      showToast(successMsg || 'Nusxa olindi!');
    }).catch(function() {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    try {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    } catch(e) {}
  }
}

function fallbackCopy(text, successMsg) {
  var ta = document.createElement('textarea');
  ta.value = String(text);
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(successMsg || 'Nusxa olindi!');
  } catch(e) {}
  document.body.removeChild(ta);
}

// ── ONBOARDING / BOT QO'LLANMA OYNASI ───────────
var currentOnboardingSlide = 0;
var totalOnboardingSlides = 4;

function renderOnboardingSlides() {
  var container = document.getElementById('onboarding-slides-container');
  if (!container) return;
  container.innerHTML =
    '<!-- Slide 0: Asosiy -->' +
    '<div class="onboarding-slide" id="onboarding-slide-0">' +
      '<div style="width:72px;height:72px;border-radius:24px;background:rgba(59,130,246,0.12);color:#3B82F6;font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 8px 22px rgba(59,130,246,0.2);">🏠</div>' +
      '<div style="display:inline-block;padding:3px 12px;border-radius:20px;background:rgba(59,130,246,0.12);color:#3B82F6;font-size:11.5px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px;">' + t('ob_slide0_badge') + '</div>' +
      '<h3 style="font-size:19px;font-weight:900;color:var(--text);margin-bottom:8px;">' + t('ob_slide0_title') + '</h3>' +
      '<p style="font-size:13.5px;color:var(--text-muted);line-height:1.55;margin:0 auto 12px;max-width:310px;">' + t('ob_slide0_desc') + '</p>' +
      '<div style="background:var(--bg-body);border:1px solid var(--border);border-radius:14px;padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:12.5px;color:var(--text);font-weight:600;">' +
        '<span style="font-size:16px;">⚡️</span> ' + t('ob_slide0_feat') +
      '</div>' +
    '</div>' +

    '<!-- Slide 1: Testlar -->' +
    '<div class="onboarding-slide" id="onboarding-slide-1" style="display:none;">' +
      '<div style="width:72px;height:72px;border-radius:24px;background:rgba(16,185,129,0.12);color:#10B981;font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 8px 22px rgba(16,185,129,0.2);">📝</div>' +
      '<div style="display:inline-block;padding:3px 12px;border-radius:20px;background:rgba(16,185,129,0.12);color:#10B981;font-size:11.5px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px;">' + t('ob_slide1_badge') + '</div>' +
      '<h3 style="font-size:19px;font-weight:900;color:var(--text);margin-bottom:8px;">' + t('ob_slide1_title') + '</h3>' +
      '<p style="font-size:13.5px;color:var(--text-muted);line-height:1.55;margin:0 auto 12px;max-width:310px;">' + t('ob_slide1_desc') + '</p>' +
      '<div style="background:var(--bg-body);border:1px solid var(--border);border-radius:14px;padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:12.5px;color:var(--text);font-weight:600;">' +
        '<span style="font-size:16px;">🔍</span> ' + t('ob_slide1_feat') +
      '</div>' +
    '</div>' +

    '<!-- Slide 2: Profil -->' +
    '<div class="onboarding-slide" id="onboarding-slide-2" style="display:none;">' +
      '<div style="width:72px;height:72px;border-radius:24px;background:rgba(245,158,11,0.12);color:#F59E0B;font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 8px 22px rgba(245,158,11,0.2);">👤</div>' +
      '<div style="display:inline-block;padding:3px 12px;border-radius:20px;background:rgba(245,158,11,0.12);color:#F59E0B;font-size:11.5px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px;">' + t('ob_slide2_badge') + '</div>' +
      '<h3 style="font-size:19px;font-weight:900;color:var(--text);margin-bottom:8px;">' + t('ob_slide2_title') + '</h3>' +
      '<p style="font-size:13.5px;color:var(--text-muted);line-height:1.55;margin:0 auto 12px;max-width:310px;">' + t('ob_slide2_desc') + '</p>' +
      '<div style="background:var(--bg-body);border:1px solid var(--border);border-radius:14px;padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:12.5px;color:var(--text);font-weight:600;">' +
        '<span style="font-size:16px;">🎖</span> ' + t('ob_slide2_feat') +
      '</div>' +
    '</div>' +

    '<!-- Slide 3: Mavzu -->' +
    '<div class="onboarding-slide" id="onboarding-slide-3" style="display:none;">' +
      '<div style="width:72px;height:72px;border-radius:24px;background:rgba(139,92,246,0.12);color:#8B5CF6;font-size:34px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;box-shadow:0 8px 22px rgba(139,92,246,0.2);">☀️ 🌙</div>' +
      '<div style="display:inline-block;padding:3px 12px;border-radius:20px;background:rgba(139,92,246,0.12);color:#8B5CF6;font-size:11.5px;font-weight:800;letter-spacing:0.5px;margin-bottom:8px;">' + t('ob_slide3_badge') + '</div>' +
      '<h3 style="font-size:19px;font-weight:900;color:var(--text);margin-bottom:8px;">' + t('ob_slide3_title') + '</h3>' +
      '<p style="font-size:13.5px;color:var(--text-muted);line-height:1.55;margin:0 auto 12px;max-width:310px;">' + t('ob_slide3_desc') + '</p>' +
      '<div style="background:var(--bg-body);border:1px solid var(--border);border-radius:14px;padding:10px 14px;display:flex;align-items:center;justify-content:center;gap:12px;font-size:12.5px;color:var(--text);font-weight:700;">' +
        '<span>' + t('ob_slide3_light') + '</span> <span style="color:var(--text-muted);">⇄</span> <span>' + t('ob_slide3_dark') + '</span>' +
      '</div>' +
    '</div>';

  goOnboardingSlide(currentOnboardingSlide || 0);
}

function openOnboardingModal() {
  currentOnboardingSlide = 0;
  renderOnboardingSlides();
  var modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(function() {
      modal.classList.add('open');
    }, 20);
  }
}

function closeOnboardingModal() {
  var modal = document.getElementById('onboarding-modal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(function() {
      modal.style.display = 'none';
    }, 280);
  }
}

function goOnboardingSlide(idx) {
  currentOnboardingSlide = idx;
  for (var i = 0; i < totalOnboardingSlides; i++) {
    var slide = document.getElementById('onboarding-slide-' + i);
    var dot = document.getElementById('ob-dot-' + i);
    if (slide) {
      if (i === idx) {
        slide.style.display = 'block';
        slide.classList.add('active');
      } else {
        slide.style.display = 'none';
        slide.classList.remove('active');
      }
    }
    if (dot) {
      if (i === idx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    }
  }

  var btnNext = document.getElementById('btn-onboarding-next') || document.getElementById('onboarding-next-btn');
  if (btnNext) {
    if (idx === totalOnboardingSlides - 1) {
      btnNext.innerHTML = t('btn_finish');
    } else {
      btnNext.innerHTML = t('btn_next');
    }
  }
}

function nextOnboardingSlide() {
  if (currentOnboardingSlide < totalOnboardingSlides - 1) {
    goOnboardingSlide(currentOnboardingSlide + 1);
  } else {
    finishOnboarding();
  }
}

function finishOnboarding() {
  localStorage.setItem('onboarding_nav_tour_seen', 'true');
  closeOnboardingModal();
  showToast(t('toast_tour_done'));
}
