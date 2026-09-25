"""
STREET TEST — Test Tekshirish Telegram Boti va Mini App Serveri
Aiogram 3.x + aiohttp WebApp Server
============================================================
Barcha muhim sozlamalar environment variable orqali o'rnatiladi.
Tokenlar va ID lar bu yerda saqlanmaydi — faqat os.getenv() ishlatiladi.
"""

import asyncio
import json
import logging
import os
import sys
import time
import re
import urllib.parse
from typing import Optional, Dict, Any

from aiogram import Bot, Dispatcher, F, Router, BaseMiddleware
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup,
    KeyboardButton, Message, ReplyKeyboardMarkup, ReplyKeyboardRemove,
    WebAppInfo, FSInputFile, MenuButtonWebApp, BotCommand
)
from aiohttp import web
import test_db
from datetime import datetime, timezone, timedelta

UZB_TZ = timezone(timedelta(hours=5))

def format_uzb_time(timestamp: Optional[float] = None, fmt: str = "%d.%m.%Y %H:%M") -> str:
    """O'zbekiston (Toshkent, UTC+5) vaqti bo'yicha formatlash"""
    if timestamp is None:
        dt = datetime.now(UZB_TZ)
    else:
        dt = datetime.fromtimestamp(timestamp, tz=UZB_TZ)
    return dt.strftime(fmt)

# ── TUN REJIMI: 23:00 – 07:00 ────────────────────────────
WORK_START_HOUR = 7   # 07:00 Toshkent
WORK_END_HOUR   = 23  # 23:00 Toshkent

def is_working_hours() -> bool:
    """Hozir ish vaqti (07:00–23:00 Toshkent)mi?"""
    now_hour = datetime.now(UZB_TZ).hour
    return WORK_START_HOUR <= now_hour < WORK_END_HOUR

def get_night_message() -> str:
    """Tun rejimi xabari."""
    now = datetime.now(UZB_TZ)
    if now.hour < WORK_START_HOUR:
        wait_h = WORK_START_HOUR - now.hour
        wait_text = f"{wait_h} soatdan so'ng (07:00 da)"
    else:
        wait_text = "ertaga ertalab 07:00 da"
    return (
        f"🌙 <b>Tun rejimi — Bot hozir dam olmoqda</b>\n\n"
        f"⏰ <b>Ish vaqti:</b> har kuni 07:00 – 23:00 (Toshkent)\n"
        f"🕐 <b>Hozir:</b> {now.strftime('%H:%M')}\n\n"
        f"✅ Bot <b>{wait_text}</b> yana faol bo'ladi.\n\n"
        f"<i>Iltimos, ish vaqtida qayta murojaat qiling!</i> 🙏\n\n"
        f"⛔️ <b>Iltimos, qayta /start yoki boshqa tugmalarni bosmang</b> — "
        f"har bir xabar serverni keraksiz uyg'otadi va bot tezroq o'chib qolishi mumkin."
    )

# ── TEXNIK PROFILAKTIKA REJIMI XABARI VA MIDDLEWARE ──────
def get_maintenance_message() -> str:
    """Texnik profilaktika rejimi xabari."""
    now = datetime.now(UZB_TZ)
    return (
        "🛠 <b>Hozirda botda texnik profilaktika ishlari olib borilmoqda!</b>\n\n"
        "Hurmatli foydalanuvchi, tizim barqarorligini oshirish, yangi imkoniyatlarni sozlash "
        "va ma'lumotlar xavfsizligini ta'minlash maqsadida bot vaqtincha to'xtatildi.\n\n"
        f"🕐 <b>Vaqt:</b> {now.strftime('%H:%M')} (Toshkent)\n"
        "⏱ <b>Holat:</b> Rejali texnik tanaffus\n"
        "👨‍💻 <b>Bajarilmoqda:</b> Tizim yangilanishi va optimallashtirish\n\n"
        "✅ <i>Tez orada barcha xizmatlar to'liq va odatdagidek qayta tiklanadi.</i>\n\n"
        "🙏 <b>Keltirilgan vaqtinchalik noqulayliklar uchun uzr so'raymiz!</b>"
    )

# ── SOZLAMALAR ────────────────────────────────────────
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("BOT_TOKEN muhit o'zgaruvchisi o'rnatilmagan! .env faylini yoki Render env varsni tekshiring.")
ADMIN_ID = int(os.getenv("ADMIN_ID", "8039427064"))
PORT = int(os.getenv("PORT", "8080"))
_raw_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("WEBAPP_URL", "")
if _raw_url:
    if not _raw_url.startswith("http"):
        _raw_url = f"https://{_raw_url}"
    WEBAPP_URL = _raw_url.rstrip("/")
else:
    WEBAPP_URL = "https://rash-vmrm.onrender.com"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
log = logging.getLogger(__name__)

class MaintenanceMiddleware(BaseMiddleware):
    """Texnik profilaktika vaqtida FAQAT Bosh Admin (ADMIN_ID) o'ta oladi. Boshqalar to'xtatiladi."""
    async def __call__(self, handler, event, data):
        user = data.get("event_from_user")
        if user and test_db.is_maintenance_mode():
            if user.id != ADMIN_ID:
                if isinstance(event, Message):
                    await event.answer(get_maintenance_message())
                    return
                elif isinstance(event, CallbackQuery):
                    await event.answer("⚠️ Botda texnik profilaktika ketmoqda!", show_alert=True)
                    try:
                        await event.message.answer(get_maintenance_message())
                    except Exception:
                        pass
                    return
        return await handler(event, data)

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())
dp.message.outer_middleware(MaintenanceMiddleware())
dp.callback_query.outer_middleware(MaintenanceMiddleware())

router = Router()
dp.include_router(router)

# ── FSM HOLATLARI ─────────────────────────────────────
class RegistrationState(StatesGroup):
    fullname = State()
    phone = State()

class SolveTestState(StatesGroup):
    test_code = State()

class UploadPostPdfState(StatesGroup):
    pdf_file = State()

class AddAdminState(StatesGroup):
    tg_id_or_user = State()

class SetTimeLimitState(StatesGroup):
    test_id = State()
    time_limit = State()

class BroadcastState(StatesGroup):
    waiting_for_message = State()
    confirm_send = State()

class ScheduleState(StatesGroup):
    waiting_date = State()
    waiting_start = State()
    waiting_end = State()

# ── KEYBOARDS (TUGMALAR) ──────────────────────────────
def main_menu_kb(user_tg_id: int) -> ReplyKeyboardMarkup:
    is_adm = test_db.is_admin(user_tg_id, ADMIN_ID)
    
    app_url = f"{WEBAPP_URL}/app.html"
    admin_webapp_url = f"{WEBAPP_URL}/admin.html"

    # Agar HTTPS bo'lsa to'g'ridan-to'g'ri Telegram WebApp ochadi
    if app_url.startswith("https://"):
        results_btn = KeyboardButton(text="📊 Mening natijalarim", web_app=WebAppInfo(url=app_url))
    else:
        results_btn = KeyboardButton(text="📊 Mening natijalarim")

    if admin_webapp_url.startswith("https://"):
        create_test_btn = KeyboardButton(text="➕ Yangi test yaratish", web_app=WebAppInfo(url=admin_webapp_url))
    else:
        create_test_btn = KeyboardButton(text="➕ Yangi test yaratish")

    if is_adm:
        # Adminlar uchun faqat admin funksiyalari:
        # 1-qator: Test kodini kiritish + Yangi test yaratish (Mini App)
        # 2-qator: Test natijalari va reyting + Testlarni boshqarish
        # 3-qator: Admin Panel
        buttons = [
            [KeyboardButton(text="🔢 Test kodini kiritish"), create_test_btn],
            [KeyboardButton(text="📊 Test natijalari va reyting"), KeyboardButton(text="📋 Testlarni boshqarish")],
            [KeyboardButton(text="⚙️ Admin Panel")]
        ]
    else:
        # Oddiy foydalanuvchilar uchun menyu tartibi:
        # 1-qator: Test kodini kiritish + Mening natijalarim (Asosiy App)
        # 2-qator: Profilim + Yordam (adminga murojaat)
        buttons = [
            [KeyboardButton(text="🔢 Test kodini kiritish"), results_btn],
            [KeyboardButton(text="👤 Profilim"), KeyboardButton(text="ℹ️ Yordam")]
        ]

    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True)

def profile_webapp_kb(user_tg_id: int) -> InlineKeyboardMarkup:
    """Shaxsiy profil mini ilovasini ochish tugmasi."""
    app_url = f"{WEBAPP_URL}/app.html"
    buttons = [
        [make_webapp_button("📱 Shaxsiy profilni ochish", app_url, fallback_cb="open_app_info")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def results_webapp_kb() -> InlineKeyboardMarkup:
    """Natijalarni ko'rish mini ilovasi tugmasi."""
    app_url = f"{WEBAPP_URL}/app.html"
    buttons = [
        [make_webapp_button("📊 Asosiy ilovani ochish", app_url, fallback_cb="open_app_info")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def contact_share_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )

def admin_menu_kb() -> InlineKeyboardMarkup:
    """
    Admin Panel inline menyusi — xabarlar, texnik rejim, test vaqti va adminlar boshqaruvi.
    Foydalanuvchilar boshqaruvi to'liq Asosiy Web Ilovaga (Main App) ko'chirilgan.
    """
    maint_on = test_db.is_maintenance_mode()
    maint_icon = "🔴" if maint_on else "🟢"
    maint_status = "YOQILGAN" if maint_on else "O'CHIQ"
    maint_btn_text = f"🛠 Texnik rejim: {maint_status} {maint_icon}"

    buttons = [
        [InlineKeyboardButton(text="📢 O'quvchilarga xabar yuborish", callback_data="admin_broadcast_menu")],
        [InlineKeyboardButton(text=maint_btn_text, callback_data="admin_toggle_maint_prompt")],
        [InlineKeyboardButton(text="👑 Adminlar boshqaruvi", callback_data="admin_manage_admins")],
        [make_webapp_button("👥 Foydalanuvchilar boshqaruvi (Web App)", f"{WEBAPP_URL}/app.html?tab=admin&tg_id={ADMIN_ID}", "admin_webapp_redirect_info")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def make_webapp_button(text: str, url: str, fallback_cb: str = "open_webapp_info") -> InlineKeyboardButton:
    """Telegram WebApp faqat HTTPS talab qiladi. Agar HTTP (localhost) bo'lsa callback ishlatiladi."""
    if url.startswith("https://"):
        return InlineKeyboardButton(text=text, web_app=WebAppInfo(url=url))
    elif url.startswith("http://") and not ("localhost" in url or "127.0.0.1" in url):
        return InlineKeyboardButton(text=text, url=url)
    else:
        return InlineKeyboardButton(text=text, callback_data=fallback_cb)

# ── TEST KARTASINI FOYDALANUVCHIGA YUBORISH (BIR MARTALIK TEKSHIRUV BILAN) ──
async def send_test_card(target_message: Message, test: Dict[str, Any], user_tg_id: int):
    """Test ma'lumotlari, PDF va WebApp tugmasini yuboradi. Agar foydalanuvchi allaqachon topshirgan bo'lsa qayta topshirish taqiqlanadi."""
    existing_sub = test_db.get_user_submission_for_test(test["id"], user_tg_id)
    is_admin = test_db.is_admin(user_tg_id, ADMIN_ID)
    
    if existing_sub and not is_admin:
        dt = format_uzb_time(existing_sub["submitted_at"])
        is_published = test_db.is_test_results_published(test["id"])
        if is_published:
            grade = test_db.calculate_grade(existing_sub.get("score", 0))
            score_val = existing_sub.get("score", 0)
            corr_val = existing_sub.get("correct_count", 0)
            text = (
                f"⛔️ <b>Siz ushbu testni topshirgansiz!</b>\n\n"
                f"📖 <b>Test:</b> {test['title']}\n"
                f"🎖 <b>Milliy Sertifikat darajangiz:</b> <b>{grade}</b> ({score_val} ball)\n"
                f"✅ <b>To'g'ri javoblar:</b> {corr_val} ta\n"
                f"🕒 <b>Topshirilgan vaqt:</b> {dt}\n\n"
                f"💡 <i>To'liq savollar tahlili va natijalaringizni asosiy ilovadan ko'rishingiz mumkin.</i>"
            )
        else:
            text = (
                f"⏳ <b>Siz ushbu testni topshirgansiz!</b>\n\n"
                f"📖 <b>Test:</b> {test['title']}\n"
                f"📌 <b>Holat:</b> ⏳ <b>Javoblaringiz tekshirilmoqda...</b>\n"
                f"🕒 <b>Topshirilgan vaqt:</b> {dt}\n\n"
                f"ℹ️ <i>Test hozirda davom etmoqda. Admin testni to'xtatib, Rasch tahlilini e'lon qilgandan so'ng, "
                f"to'g'ri javoblar soni, yakuniy ball va Milliy sertifikat darajangiz bot orqali shaxsiy xabar qilib yuboriladi!</i>"
            )
        await target_message.answer(text)
        return

    if test.get("is_active", 1) == 0:
        await target_message.answer(
            f"⛔️ <b>«{test['title']}» testi to'xtatilgan!</b>\nAdmin tomonidan javoblar qabul qilish yopilgan."
        )
        return

    params = {
        "test_id": test["id"],
        "test_code": test["test_code"],
        "title": test["title"],
        "subject": test.get("subject", "Matematika")
    }
    encoded_url = f"{WEBAPP_URL}?{urllib.parse.urlencode(params)}"

    inline_kb = InlineKeyboardMarkup(inline_keyboard=[
        [make_webapp_button("📝 Javoblarni topshirish (Mini App)", encoded_url, fallback_cb=f"solve_test_{test['id']}")]
    ])

    time_info = f"⏱ <b>Vaqt chegarasi:</b> {test['time_limit_min']} daqiqa\n" if test.get("time_limit_min", 0) > 0 else ""

    caption = (
        f"📖 <b>{test['title']}</b>\n"
        f"📌 <b>Fan:</b> {test.get('subject', 'Matematika')}\n"
        f"❓ <b>Savollar:</b> 55 ta (1-32 ABCD, 33-35 ABCDEF, 36a-45b Yozma)\n"
        f"{time_info}\n"
        f"⚠️ <i>Eslatma: Testni faqat 1 marta topshirish mumkin! Javoblaringizni belgilab bo'lgach, «Testni yakunlash» tugmasini bosing.</i>"
    )

    sent = False
    if test.get("pdf_file_id"):
        try:
            await target_message.answer_document(
                document=test["pdf_file_id"],
                caption=caption,
                reply_markup=inline_kb
            )
            sent = True
        except Exception as e:
            log.warning(f"PDF yuborishda xatolik: {e}")

    if not sent:
        try:
            await target_message.answer(caption, reply_markup=inline_kb)
        except Exception as e:
            log.error(f"Xabar yuborishda xatolik: {e}")
            await target_message.answer(caption)

# ── BOT HANDLERLARI (FOYDALANUVCHI QISMI) ──────────────

def get_all_admin_ids() -> list:
    """Bosh admin va bazadagi barcha tayinlangan yordamchi adminlar ID ro'yxati"""
    admin_ids = {ADMIN_ID}
    try:
        for a in test_db.get_all_admins():
            if a.get("tg_id"):
                admin_ids.add(int(a["tg_id"]))
    except Exception as e:
        log.warning(f"Adminlar ro'yxatini olishda xatolik: {e}")
    return list(admin_ids)

async def check_access(message: Message) -> bool:
    """Foydalanuvchi admin tomonidan tasdiqlanganligini tekshiradi."""
    uid = message.from_user.id
    if test_db.is_admin(uid, ADMIN_ID):
        return True
    # Tun rejimi tekshiruvi (23:00 – 07:00)
    if not is_working_hours():
        await message.answer(get_night_message())
        return False
    u = test_db.get_user(uid)
    if not u:
        await message.answer("⚠️ Iltimos, avval /start buyrug'i orqali ro'yxatdan o'ting.")
        return False
    st = u.get("status", "pending")
    if st == "pending":
        req_kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔔 Admindan ruxsat so'rash", callback_data=f"user_req_access_{uid}")]
        ])
        await message.answer(
            "⏳ <b>Arizangiz ko'rib chiqilmoqda!</b>\n\n"
            "Admin hali botdan foydalanish huquqini bermagan. Iltimos, admin tasdiqlashini kuting yoki pastdagi tugma orqali so'rov yuboring.",
            reply_markup=req_kb
        )
        return False
    elif st in ["blocked", "rejected"]:
        await message.answer(
            "⛔️ <b>Sizning botdan foydalanish huquqingiz to'xtatilgan yoki chiqarib yuborilgansiz!</b>\n\n"
            "Murojaat uchun: @eshmbetov"
        )
        return False
    return True

@router.message(CommandStart())
async def start_handler(message: Message, state: FSMContext):
    user_tg_id = message.from_user.id

    # Admin uchun tun rejimi qo'llanilmaydi
    if not test_db.is_admin(user_tg_id, ADMIN_ID) and not is_working_hours():
        await message.answer(get_night_message())
        return

    user = test_db.get_user(user_tg_id)

    if not user:
        await state.set_state(RegistrationState.fullname)
        await message.answer(
            "👋 <b>Assalomu alaykum! Test Tekshirish Tizimiga xush kelibsiz!</b>\n\n"
            "Tizimdan to'liq foydalanish va ruxsat olish uchun ro'yxatdan o'ting.\n\n"
            "✍️ <b>Iltimos, Ism va Familiyangizni kiriting:</b>\n"
            "<i>(Misol: Shaxriyor Eshimbetov)</i>",
            reply_markup=ReplyKeyboardRemove()
        )
    else:
        is_adm = test_db.is_admin(user_tg_id, ADMIN_ID)
        st = user.get("status", "approved")
        if not is_adm:
            if st == "pending":
                req_kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🔔 Admindan ruxsat so'rash", callback_data=f"user_req_access_{user_tg_id}")]
                ])
                await message.answer(
                    f"⏳ <b>Hurmatli {user['fullname']}, arizangiz ko'rib chiqilmoqda!</b>\n\n"
                    f"Admin hali botdan foydalanishga ruxsat bermagan. Iltimos, tasdiqlanishini kuting.",
                    reply_markup=req_kb
                )
                return
            elif st in ["blocked", "rejected"]:
                await message.answer(
                    "⛔️ <b>Sizning botdan foydalanish huquqingiz to'xtatilgan!</b>\n\n"
                    "Murojaat uchun: @eshmbetov"
                )
                return

        await state.clear()
        await message.answer(
            f"👋 <b>Xush kelibsiz, {user['fullname']}!</b>\n\n"
            "Kerakli bo'limni tanlang yoki to'g'ridan-to'g'ri test kodini yuboring 👇",
            reply_markup=main_menu_kb(user_tg_id)
        )

# Ro'yxatdan o'tish: Ism kiritildi
@router.message(RegistrationState.fullname)
async def reg_fullname(message: Message, state: FSMContext):
    fullname = (message.text or "").strip()
    if len(fullname) < 3:
        await message.answer("⚠️ Iltimos, to'liq ism va familiyangizni kiriting:")
        return

    await state.update_data(fullname=fullname)
    await state.set_state(RegistrationState.phone)
    await message.answer(
        "📱 <b>Endi telefon raqamingizni yuboring:</b>\n\n"
        "Quyidagi <b>«📱 Telefon raqamni yuborish»</b> tugmasini bosing yoki raqamingizni yozing (+998901234567):",
        reply_markup=contact_share_kb()
    )

# Ro'yxatdan o'tish: Kontakt yoki Raqam yuborildi
@router.message(RegistrationState.phone)
async def reg_phone(message: Message, state: FSMContext):
    phone = ""
    if message.contact:
        phone = message.contact.phone_number
    elif message.text:
        phone = message.text.strip()

    if not phone or len(phone) < 7:
        await message.answer("⚠️ Iltimos, to'g'ri telefon raqam kiriting:")
        return

    data = await state.get_data()
    fullname = data.get("fullname", "Foydalanuvchi")
    user_tg_id = message.from_user.id
    username = message.from_user.username

    # 1. Yangi foydalanuvchi statusi 'pending' bo'ladi
    status = "pending"
    test_db.add_or_update_user(user_tg_id, fullname, phone, username, status=status)
    await state.clear()

    # 2. O'quvchiga kutish xabari
    await message.answer(
        f"⏳ <b>Arizangiz qabul qilindi, {fullname}!</b>\n\n"
        f"Test tizimidan foydalanish uchun <b>admin ruxsati so'ralmoqda</b>.\n"
        f"Admin (yoki tayinlangan yordamchi adminlar) ruxsat berishi bilanoq sizga xabar keladi va bot to'liq ochiladi.",
        reply_markup=ReplyKeyboardRemove()
    )

    # 3. Barcha adminlarga (Bosh admin + Tayinlangan adminlar) darhol so'rov yuborish
    approve_kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Ruxsat berish", callback_data=f"user_quick_approve_{user_tg_id}"),
            InlineKeyboardButton(text="❌ Rad etish", callback_data=f"user_quick_reject_{user_tg_id}")
        ]
    ])
    username_str = f"@{username}" if username else "Mavjud emas"
    admin_notify_text = (
        f"🔔 <b>Yangi foydalanuvchi kirishga ruxsat so'ramoqda!</b>\n\n"
        f"👤 <b>Ism-familiya:</b> {fullname}\n"
        f"📱 <b>Telefon:</b> <code>{phone}</code>\n"
        f"🆔 <b>Telegram ID:</b> <code>{user_tg_id}</code>\n"
        f"🔗 <b>Username:</b> {username_str}\n"
        f"🕒 <b>So'rov vaqti:</b> {format_uzb_time()}\n\n"
        f"<i>Ushbu foydalanuvchiga tizimdan foydalanishga ruxsat berasizmi?</i>"
    )

    for adm_id in get_all_admin_ids():
        try:
            await bot.send_message(
                chat_id=adm_id,
                text=admin_notify_text,
                reply_markup=approve_kb
            )
        except Exception as ex:
            log.warning(f"Adminga ({adm_id}) a'zolik so'rovini yuborishda xatolik: {ex}")

# 1. 🔢 Test kodini kiritish (Prompt)
@router.message(F.text == "🔢 Test kodini kiritish")
@router.message(Command("solve"))
async def enter_test_code_prompt(message: Message, state: FSMContext):
    if not await check_access(message):
        return
    await state.set_state(SolveTestState.test_code)
    await message.answer(
        "🔢 <b>Test kodini kiriting:</b>\n\n"
        "<i>(Masalan: <code>MAT-01</code> yoki <code>101</code>)</i>\n\n"
        "Bekor qilish uchun pastdagi menyudan foydalaning."
    )

# Test kodi kiritildi (FSM)
@router.message(SolveTestState.test_code)
async def process_solve_test_code(message: Message, state: FSMContext):
    if not await check_access(message):
        await state.clear()
        return
    text = (message.text or "").strip()
    if not text:
        return
    menu_cmds = [
        "🔢 Test kodini kiritish", "📊 Mening natijalarim", "👤 Profilim",
        "ℹ️ Yordam", "ℹ️ Bot haqida", "⚙️ Admin Panel",
        "➕ Yangi test yaratish", "📊 Test natijalari va reyting", "📋 Testlarni boshqarish"
    ]
    if text in menu_cmds:
        await state.clear()
        if text == "📊 Mening natijalarim":
            await show_my_results(message)
        elif text == "👤 Profilim":
            await show_profile(message)
        elif text in ["ℹ️ Yordam", "ℹ️ Bot haqida"]:
            await show_help(message)
        elif text == "⚙️ Admin Panel":
            await admin_panel_handler(message)
        elif text == "➕ Yangi test yaratish":
            await admin_create_test_text_handler(message)
        elif text == "📊 Test natijalari va reyting":
            await admin_leaderboard_text_handler(message)
        elif text == "📋 Testlarni boshqarish":
            await admin_manage_tests_text_handler(message)
        elif text == "🔢 Test kodini kiritish":
            await enter_test_code_prompt(message, state)
        return

    code = text.upper().replace("#", "")
    test = test_db.get_test_by_code(code)
    await state.clear()

    if not test:
        await message.answer(
            f"❌ <b>«{text}» kodi bo'yicha test topilmadi!</b>\n\n"
            f"Iltimos, kodni to'g'ri kiritganingizni tekshiring.",
            reply_markup=main_menu_kb(message.from_user.id)
        )
        return

    await send_test_card(message, test, message.from_user.id)


@router.callback_query(F.data.startswith("solve_test_"))
async def solve_test_cb(call: CallbackQuery):
    test_id = int(call.data.split("_")[2])
    t = test_db.get_test_by_id(test_id)
    if not t:
        await call.answer("Test topilmadi!", show_alert=True)
        return
    
    existing_sub = test_db.get_user_submission_for_test(test_id, call.from_user.id)
    if existing_sub:
        is_published = test_db.is_test_results_published(test_id)
        if is_published:
            grade = test_db.calculate_grade(existing_sub.get("score", 0))
            score_val = existing_sub.get("score", 0)
            await call.answer(f"⛔️ Siz bu testni topshirgansiz! Daraja: {grade} ({score_val} ball)", show_alert=True)
        else:
            await call.answer("⏳ Siz bu testni topshirgansiz! Javoblar tekshirilmoqda. Admin natijalarni e'lon qilgach, shaxsiy xabar yuboriladi.", show_alert=True)
        return

    params = {
        "test_id": t["id"],
        "test_code": t["test_code"],
        "title": t["title"],
        "subject": t.get("subject", "Matematika")
    }
    encoded_url = f"{WEBAPP_URL}?{urllib.parse.urlencode(params)}"
    reply_kb = InlineKeyboardMarkup(inline_keyboard=[
        [make_webapp_button("📝 Testni boshlash (Mini App)", encoded_url)]
    ])
    await call.message.answer(
        f"📝 <b>{t['title']}</b> testini yechish uchun quyidagi tugmani bosing 👇",
        reply_markup=reply_kb
    )
    await call.answer()

@router.callback_query(F.data == "admin_webapp_info")
async def admin_webapp_info_cb(call: CallbackQuery):
    admin_webapp_url = f"{WEBAPP_URL}/admin.html"
    reply_kb = InlineKeyboardMarkup(inline_keyboard=[
        [make_webapp_button("📱 Admin Panelni ochish (Mini App)", admin_webapp_url)],
        [InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")]
    ])
    text = (
        f"📱 <b>Admin Mini App (Kalit va ballar kiritish):</b>\n\n"
        f"Ushbu paneldan 45 ta savolning kalitlari va har biriga alohida ballarni qulay belgilashingiz mumkin!\n\n"
        f"Ochish uchun quyidagi tugmani bosing 👇"
    )
    try:
        await call.message.edit_text(text, reply_markup=reply_kb)
    except Exception:
        await call.message.answer(text, reply_markup=reply_kb)
    await call.answer()

# 2. 📊 Mening natijalarim
@router.message(F.text == "📊 Mening natijalarim")
@router.message(Command("results"))
async def show_my_results(message: Message):
    await message.answer(
        "📊 <b>Barcha test natijalaringiz, to'liq tahlil va to'g'ri kalitlarni asosiy ilovadan ko'rishingiz mumkin.</b>\n\n"
        "Ilovani ochish uchun quyidagi tugmani bosing 👇",
        reply_markup=results_webapp_kb()
    )

# 3. 👤 Profil
@router.message(F.text == "👤 Profilim")
@router.message(Command("profile"))
async def show_profile(message: Message):
    user = test_db.get_user(message.from_user.id)
    if not user:
        await message.answer("Profil topilmadi. /start buyrug'ini bosing.")
        return

    submissions = test_db.get_user_submissions(message.from_user.id)
    tests_count = len(submissions)
    dt = format_uzb_time(user["registered_at"], "%d.%m.%Y")

    await message.answer(
        f"👤 <b>{user['fullname']}</b>\n"
        f"📱 {user['phone']}\n"
        f"📋 Ishlangan testlar: <b>{tests_count} ta</b>\n"
        f"📅 Ro'yxatdan: {dt}\n\n"
        f"📲 <i>Batafsil ma'lumot uchun shaxsiy profilni oching:</i>",
        reply_markup=profile_webapp_kb(message.from_user.id)
    )

# 4. ℹ️ Yordam va murojaat
@router.message(F.text == "ℹ️ Yordam")
@router.message(F.text == "ℹ️ Bot haqida")
@router.message(Command("help"))
async def show_help(message: Message):
    contact_kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✍️ Adminga murojaat (@eshmbetov)", url="https://t.me/eshmbetov")],
        [make_webapp_button("📱 BM Test Mini App", f"{WEBAPP_URL}/app.html")]
    ])
    await message.answer(
        "ℹ️ <b>YORDAM VA QO'LLAB-QUVVATLASH</b>\n\n"
        "🎓 <b>BUXORIYLAR MAKTABI — BM RASH TEST</b>\n\n"
        "Ushbu tizim orqali siz:\n"
        "• Milliy sertifikat formatidagi 55 talik testlarni yechishingiz;\n"
        "• Virtual matematik klaviaturadan foydalanib yozma javoblarni kiritishingiz;\n"
        "• Rasch modeli bo'yicha darajangiz (A+, A, B+, B, ...) va to'liq tahlilni ko'rishingiz mumkin.\n\n"
        "💬 <b>Savol, taklif yoki yordam uchun to'g'ridan-to'g'ri bog'lanishingiz mumkin:</b>\n"
        "👤 <b>Aloqa:</b> @eshmbetov\n\n"
        "<i>Pastdagi tugma orqali murojaat yuborishingiz mumkin 👇</i>",
        reply_markup=contact_kb
    )

show_about = show_help

# ➕ Yangi test yaratish (Admin Mini App ochish)
@router.message(F.text == "➕ Yangi test yaratish")
async def admin_create_test_text_handler(message: Message):
    if not test_db.is_admin(message.from_user.id, ADMIN_ID):
        return
    admin_webapp_url = f"{WEBAPP_URL}/admin.html"
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [make_webapp_button("➕ Yangi test yaratish (Mini App)", admin_webapp_url)]
    ])
    await message.answer(
        "➕ <b>YANGI TEST YARATISH BO'LIMI</b>\n\n"
        "Quyidagi tugma orqali Admin Mini Appni ochib, test kodi, fani, vaqti va 55 ta savol kalitlarini kiritishingiz mumkin 👇",
        reply_markup=kb
    )

# 📋 Testlarni boshqarish (O'chirish, to'xtatish, vaqt)
@router.message(F.text == "📋 Testlarni boshqarish")
async def admin_manage_tests_text_handler(message: Message):
    if not test_db.is_admin(message.from_user.id, ADMIN_ID):
        return
    tests = test_db.get_all_tests()
    if not tests:
        await message.answer("ℹ️ Hozircha bazada birorta ham test yo'q.")
        return

    text = (
        "📋 <b>Barcha testlar ro'yxati va boshqaruvi:</b>\n\n"
        "<i>Boshqarish (to'xtatish / vaqt / o'chirish) uchun kerakli testni tanlang 👇</i>\n\n"
    )
    buttons = []
    for idx, t in enumerate(tests, 1):
        status_icon = "🟢" if t["is_active"] == 1 else "🔴"
        time_str = f"{t['time_limit_min']} daqiqa" if t.get("time_limit_min", 0) > 0 else "Cheksiz"
        text += f"<b>{idx}. #{t['test_code']}</b> — {t['title']} ({status_icon}, ⏱ {time_str})\n"
        buttons.append([InlineKeyboardButton(text=f"{status_icon} #{t['test_code']} — {t['title'][:25]}", callback_data=f"adm_mng_test_{t['id']}")])

    buttons.append([InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")])
    await message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))

# 📊 Test natijalari va reyting
@router.message(F.text == "📊 Test natijalari va reyting")
async def admin_leaderboard_text_handler(message: Message):
    if not test_db.is_admin(message.from_user.id, ADMIN_ID):
        return
    tests = test_db.get_tests_with_stats()
    if not tests:
        await message.answer("⚠️ Hozirda tizimda mavjud testlar yo'q.")
        return
    buttons = []
    msg_list = ""
    for idx, t in enumerate(tests, 1):
        sub_cnt = t.get("submissions_count", 0)
        btn_text = f"📊 #{t['test_code']} — 👥 {sub_cnt} kishi"
        buttons.append([InlineKeyboardButton(text=btn_text, callback_data=f"adm_tstat_{t['id']}")])
        msg_list += f"<b>{idx}. #{t['test_code']}</b> — {t['title']}: <b>{sub_cnt} kishi</b>\n"

    buttons.append([InlineKeyboardButton(text="⬅️ Admin Panelga qaytish", callback_data="admin_panel_back")])
    msg_text = (
        "📊 <b>Mavjud Testlar va Ishtirokchilar Soni:</b>\n\n"
        f"{msg_list}\n"
        "<i>Batafsil natijalarni (Matn yoki PDF shaklida) olish uchun kerakli test kodini tanlang 👇</i>"
    )
    await message.answer(msg_text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))

# 5. 📱 Mini App buyrug'i
@router.message(Command("app"))
async def open_app_command(message: Message):
    await message.answer(
        "📱 <b>RASH TEST Mini App tizimiga kirish:</b>\n\n"
        "Quyidagi tugmani bosing 👇",
        reply_markup=results_webapp_kb()
    )

# ── ADMIN PANEL HANDLERLARI ───────────────────────────

@router.message(F.text == "⚙️ Admin Panel")
async def admin_panel_handler(message: Message):
    if not test_db.is_admin(message.from_user.id, ADMIN_ID):
        await message.answer("⛔️ Bu bo'lim faqat bot administratori uchun!")
        return

    await message.answer(
        "⚙️ <b>ADMIN BOSHQARUV PANELI</b>\n\n"
        "Quyidagi bo'limlardan birini tanlang 👇",
        reply_markup=admin_menu_kb()
    )

# 1. Yangi test yaratish (Faqat Admin Mini App orqali)
@router.callback_query(F.data == "admin_add_test")
async def admin_start_add_test(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    await state.clear()
    await admin_webapp_info_cb(call)


# 2. Testlarni boshqarish (O'chirish, To'xtatish/Yoqish, Vaqt)
@router.callback_query(F.data == "admin_manage_tests")
async def admin_manage_tests(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    tests = test_db.get_all_tests()
    if not tests:
        text = "ℹ️ Hozircha bazada birorta ham test yo'q."
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")]
        ])
        try:
            await call.message.edit_text(text, reply_markup=kb)
        except Exception:
            await call.message.answer(text, reply_markup=kb)
        await call.answer()
        return

    text = (
        "📋 <b>Barcha testlar ro'yxati va boshqaruvi:</b>\n\n"
        "<i>Boshqarish (to'xtatish / vaqt / o'chirish) uchun kerakli testni tanlang 👇</i>\n\n"
    )
    buttons = []
    for idx, t in enumerate(tests, 1):
        status_icon = "🟢" if t["is_active"] == 1 else "🔴"
        time_str = f"{t['time_limit_min']} daqiqa" if t.get("time_limit_min", 0) > 0 else "Cheksiz"
        text += f"<b>{idx}. #{t['test_code']}</b> — {t['title']} ({status_icon}, ⏱ {time_str})\n"
        buttons.append([InlineKeyboardButton(text=f"{status_icon} #{t['test_code']} — {t['title'][:25]}", callback_data=f"adm_mng_test_{t['id']}")])

    buttons.append([InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")])
    kb = InlineKeyboardMarkup(inline_keyboard=buttons)
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data.startswith("adm_mng_test_"))
async def admin_manage_test_card(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    t = test_db.get_test_by_id(test_id)
    if not t:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    status_str = "🟢 Faol (O'quvchilarga ko'rinadi)" if t["is_active"] == 1 else "🔴 To'xtatilgan (Yashiringan)"
    time_str = f"{t['time_limit_min']} daqiqa" if t.get("time_limit_min", 0) > 0 else "Cheksiz"
    toggle_btn_text = "🔴 To'xtatish" if t["is_active"] == 1 else "🟢 Faollashtirish"

    card_text = (
        f"📖 <b>{t['title']}</b> (<code>#{t['test_code']}</code>)\n"
        f"📌 <b>Fan:</b> {t.get('subject', 'Matematika')}\n"
        f"📊 <b>Holati:</b> {status_str}\n"
        f"⏱ <b>Vaqt chegarasi:</b> {time_str}\n\n"
        f"<i>Boshqarish uchun quyidagi amallardan birini tanlang:</i>"
    )

    kb_rows = [
        [InlineKeyboardButton(text=toggle_btn_text, callback_data=f"toggle_test_{t['id']}")],
        [InlineKeyboardButton(text="🗑 O'chirish", callback_data=f"del_test_confirm_{t['id']}")],
        [InlineKeyboardButton(text="⬅️ Testlar ro'yxatiga qaytish", callback_data="admin_manage_tests")]
    ]

    kb = InlineKeyboardMarkup(inline_keyboard=kb_rows)

    try:
        await call.message.edit_text(card_text, reply_markup=kb)
    except Exception:
        await call.message.answer(card_text, reply_markup=kb)
    await call.answer()

# Test holatini o'zgartirish (Toggle Active)
@router.callback_query(F.data.startswith("toggle_test_"))
async def admin_toggle_test_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[2])
    new_status = test_db.toggle_test_status(test_id)
    if new_status is not None:
        status_text = "🟢 Faol" if new_status == 1 else "🔴 To'xtatildi"
        await call.answer(f"Test holati: {status_text}", show_alert=True)
        call.data = f"adm_mng_test_{test_id}"
        await admin_manage_test_card(call)
    else:
        await call.answer("Xatolik yuz berdi!", show_alert=True)

# Test vaqtini belgilash prompt
@router.callback_query(F.data.startswith("set_time_prompt_"))
async def admin_set_time_prompt(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    await state.update_data(target_test_id=test_id)
    await state.set_state(SetTimeLimitState.time_limit)
    cancel_kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data=f"adm_mng_test_{test_id}")]
    ])
    text = (
        "⏱ <b>Test uchun vaqt chegarasini daqiqalarda kiriting:</b>\n\n"
        "<i>(Masalan: 120, 180 yoki cheksiz bo'lishi uchun 0 deb yozing)</i>"
    )
    try:
        await call.message.edit_text(text, reply_markup=cancel_kb)
    except Exception:
        await call.message.answer(text, reply_markup=cancel_kb)
    await call.answer()

@router.message(SetTimeLimitState.time_limit)
async def admin_save_time_limit(message: Message, state: FSMContext):
    data = await state.get_data()
    test_id = data.get("target_test_id")
    try:
        minutes = int(message.text.strip())
        test_db.update_test_time_limit(test_id, minutes)
        await state.clear()
        time_text = f"{minutes} daqiqa" if minutes > 0 else "Cheksiz"
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Testga qaytish", callback_data=f"adm_mng_test_{test_id}")],
            [InlineKeyboardButton(text="🔙 Admin Menyuga", callback_data="admin_back_to_menu")]
        ])
        await message.answer(f"✅ Test vaqt chegarasi <b>{time_text}</b> qilib belgilandi!", reply_markup=kb)
    except ValueError:
        await message.answer("⚠️ Iltimos, faqat butun son kiriting (masalan: 120 yoki 0):")

# Testni o'chirish
@router.callback_query(F.data.startswith("del_test_confirm_"))
async def admin_delete_test_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    test_db.delete_test(test_id)
    await call.answer("🗑 Test muvaffaqiyatli o'chirildi!", show_alert=True)
    await admin_manage_tests(call)

# ── TEZKOR FOYDALANUVCHI TASDIQLASH / RAD ETISH HANDLERLARI ──
@router.callback_query(F.data.startswith("user_quick_approve_"))
async def user_quick_approve_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        await call.answer("Siz admin emassiz!", show_alert=True)
        return
    uid = int(call.data.split("_")[3])
    u = test_db.get_user(uid)

    # Agar allaqachon hal qilingan bo'lsa — xabar chiqar, qayta ishlamasin
    if u and u.get("status") in ["approved", "rejected", "blocked"]:
        status_map = {
            "approved": "✅ Bu foydalanuvchi allaqachon boshqa admin tomonidan RUXSAT BERILGAN!",
            "rejected": "❌ Bu foydalanuvchi allaqachon RAD ETILGAN!",
            "blocked": "⛔️ Bu foydalanuvchi BLOKLANGAN!"
        }
        await call.answer(status_map.get(u["status"], "Allaqachon hal qilingan!"), show_alert=True)
        # Ushbu admindagi tugmalarni ham o'chirib qo'y
        try:
            await call.message.edit_reply_markup(reply_markup=None)
        except Exception:
            pass
        return

    uname = u["fullname"] if u else f"ID: {uid}"
    admin_name = call.from_user.full_name or "Admin"

    test_db.approve_user(uid)

    # Ushbu admindagi xabarni yangilash
    try:
        await call.message.edit_text(
            f"{call.message.text}\n\n✅ <b>RUXSAT BERILDI!</b>\nTasdiqladi: <b>{admin_name}</b>",
            reply_markup=None
        )
    except Exception:
        pass

    # Boshqa BARCHA adminlarga xabar yuborish (tugmalarsiz)
    done_text = (
        f"✅ <b>ARIZA HAL QILINDI</b>\n\n"
        f"👤 <b>{uname}</b> foydalanuvchisiga\n"
        f"<b>{admin_name}</b> tomonidan ruxsat berildi.\n\n"
        f"<i>Siz hech narsa qilishingiz shart emas.</i>"
    )
    for adm_id in get_all_admin_ids():
        if adm_id == call.from_user.id:
            continue  # O'ziga yubormasin
        try:
            await bot.send_message(chat_id=adm_id, text=done_text)
        except Exception:
            pass

    # Foydalanuvchiga xabar
    try:
        await bot.send_message(
            chat_id=uid,
            text=(
                f"🎉 <b>Xushxabar, hurmatli {uname}!</b>\n\n"
                f"Admin sizga test tizimidan to'liq foydalanishga ruxsat berdi! ✅\n"
                f"Endi bemalol barcha testlarni yechishingiz, natijalarni ko'rishingiz va mini ilovadan foydalanishingiz mumkin 👇"
            ),
            reply_markup=main_menu_kb(uid)
        )
    except Exception as e:
        log.warning(f"Foydalanuvchiga ruxsat xabarini yuborishda xatolik: {e}")
    await call.answer("✅ Foydalanuvchiga ruxsat berildi!", show_alert=True)

@router.callback_query(F.data.startswith("user_quick_reject_"))
async def user_quick_reject_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        await call.answer("Siz admin emassiz!", show_alert=True)
        return
    uid = int(call.data.split("_")[3])
    u = test_db.get_user(uid)

    # Agar allaqachon hal qilingan bo'lsa
    if u and u.get("status") in ["approved", "rejected", "blocked"]:
        status_map = {
            "approved": "✅ Bu foydalanuvchi allaqachon RUXSAT BERILGAN!",
            "rejected": "❌ Bu foydalanuvchi allaqachon RAD ETILGAN!",
            "blocked": "⛔️ Bu foydalanuvchi BLOKLANGAN!"
        }
        await call.answer(status_map.get(u["status"], "Allaqachon hal qilingan!"), show_alert=True)
        try:
            await call.message.edit_reply_markup(reply_markup=None)
        except Exception:
            pass
        return

    uname = u["fullname"] if u else f"ID: {uid}"
    admin_name = call.from_user.full_name or "Admin"

    test_db.reject_user(uid)

    # Ushbu admindagi xabarni yangilash
    try:
        await call.message.edit_text(
            f"{call.message.text}\n\n❌ <b>RAD ETILDI!</b>\nRad etdi: <b>{admin_name}</b>",
            reply_markup=None
        )
    except Exception:
        pass

    # Boshqa BARCHA adminlarga xabar yuborish (tugmalarsiz)
    done_text = (
        f"❌ <b>ARIZA HAL QILINDI</b>\n\n"
        f"👤 <b>{uname}</b> foydalanuvchisining arizasi\n"
        f"<b>{admin_name}</b> tomonidan rad etildi.\n\n"
        f"<i>Siz hech narsa qilishingiz shart emas.</i>"
    )
    for adm_id in get_all_admin_ids():
        if adm_id == call.from_user.id:
            continue
        try:
            await bot.send_message(chat_id=adm_id, text=done_text)
        except Exception:
            pass

    # Foydalanuvchiga xabar
    try:
        await bot.send_message(
            chat_id=uid,
            text="❌ <b>Kechirasiz, sizning botdan foydalanish arizangiz rad etildi.</b>\n\nMurojaat uchun: @eshmbetov"
        )
    except Exception:
        pass
    await call.answer("❌ Ariza rad etildi!", show_alert=True)


@router.callback_query(F.data.startswith("user_req_access_"))
async def user_req_access_cb(call: CallbackQuery):
    """O'quvchi tomonidan qayta ruxsat so'rash tugmasi bosilganda"""
    uid = int(call.data.split("_")[3])
    u = test_db.get_user(uid)
    if not u:
        await call.answer("Avval /start orqali ro'yxatdan o'ting!", show_alert=True)
        return

    approve_kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Ruxsat berish", callback_data=f"user_quick_approve_{uid}"),
            InlineKeyboardButton(text="❌ Rad etish", callback_data=f"user_quick_reject_{uid}")
        ]
    ])
    username_str = f"@{u['username']}" if u.get('username') else "Mavjud emas"
    admin_notify_text = (
        f"🔔 <b>Kirish uchun qayta ruxsat so'ralmoqda!</b>\n\n"
        f"👤 <b>Foydalanuvchi:</b> {u['fullname']}\n"
        f"📱 <b>Telefon:</b> <code>{u['phone']}</code>\n"
        f"🆔 <b>Telegram ID:</b> <code>{uid}</code>\n"
        f"🔗 <b>Username:</b> {username_str}\n"
        f"🕒 <b>So'rov vaqti:</b> {format_uzb_time()}\n\n"
        f"<i>Ushbu foydalanuvchiga tizimdan foydalanishga ruxsat berasizmi?</i>"
    )

    for adm_id in get_all_admin_ids():
        try:
            await bot.send_message(
                chat_id=adm_id,
                text=admin_notify_text,
                reply_markup=approve_kb
            )
        except Exception:
            pass
    await call.answer("🔔 Adminga so'rovingiz yuborildi! Iltimos, kuting.", show_alert=True)

@router.callback_query(F.data.startswith("ask_pdf_"))
async def ask_pdf_cb(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[2])
    await state.update_data(test_id=test_id)
    await state.set_state(UploadPostPdfState.pdf_file)
    await call.message.edit_text(
        f"{call.message.text}\n\n✅ <i>Siz PDF yuklashni tanladingiz.</i>\n\n"
        f"📥 <b>Iltimos, test uchun PDF faylni yuboring:</b>",
        reply_markup=None
    )

@router.callback_query(F.data.startswith("no_pdf_"))
async def no_pdf_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    await call.message.edit_text(
        f"{call.message.text}\n\n❌ <i>PDF fayl yuklanmadi. Test asosiysiz qabul qilindi.</i>",
        reply_markup=None
    )

@router.message(UploadPostPdfState.pdf_file, F.document)
async def process_post_create_pdf(message: Message, state: FSMContext):
    data = await state.get_data()
    test_id = data.get("test_id")
    if not test_id:
        await message.answer("Xatolik! Test topilmadi.")
        await state.clear()
        return

    pdf_file_id = message.document.file_id
    pdf_file_name = message.document.file_name

    test_db.update_test_pdf(test_id, pdf_file_id, pdf_file_name)
    await message.answer(f"✅ <b>PDF fayl muvaffaqiyatli biriktirildi!</b>\n📄 Fayl: {pdf_file_name}")
    await state.clear()

# 3. Foydalanuvchilar boshqaruvi to'liq Asosiy Web Ilovaga (Main App) ko'chirildi
@router.callback_query(F.data.in_(["admin_view_users", "admin_webapp_redirect_info"]))
async def admin_view_users_redirect_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    text = (
        "🌐 <b>Foydalanuvchilar boshqaruvi Asosiy Web Ilovaga (Main App) ko'chirildi!</b>\n\n"
        "Foydalanuvchilar bilan bog'liq barcha amallar (ko'rish, qidirish, ruxsat berish, cheklash, bloklash, o'chirish va barchani cheklash) "
        "endi <b>Asosiy ilovaning «Admin»</b> bo'limida amalga oshiriladi.\n\n"
        "Quyidagi tugma orqali ilovani ochishingiz mumkin 👇"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [make_webapp_button("🚀 Foydalanuvchilarni boshqarish (Web App)", f"{WEBAPP_URL}/app.html?tab=admin&tg_id={ADMIN_ID}")],
        [InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")]
    ])
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data.startswith("adm_user_card_") | F.data.startswith("adm_act_") | F.data.startswith("admin_restrict_all_"))
async def adm_legacy_users_redirect_cb(call: CallbackQuery):
    await call.answer("Foydalanuvchilar boshqaruvi Web Appga ko'chirilgan!", show_alert=True)

# 4. Adminlar boshqaruvi
@router.callback_query(F.data == "admin_manage_admins")
async def admin_manage_admins_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    admins = test_db.get_all_admins()
    text = "👑 <b>Adminlar ro'yxati:</b>\n\n"
    for idx, a in enumerate(admins, 1):
        is_super = " (Bosh Admin)" if a["tg_id"] == ADMIN_ID else ""
        text += f"<b>{idx}. {a.get('fullname', 'Admin')}</b> — <code>{a['tg_id']}</code>{is_super}\n"

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="➕ Yangi admin qo'shish", callback_data="admin_add_new_prompt")],
        [InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")]
    ])

    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data.in_(["admin_back_to_menu", "admin_panel_back"]))
async def admin_back_to_menu_cb(call: CallbackQuery, state: FSMContext = None):
    if state:
        await state.clear()
    text = (
        "⚙️ <b>ADMIN BOSHQARUV PANELI</b>\n\n"
        "Quyidagi bo'limlardan birini tanlang 👇"
    )
    try:
        await call.message.edit_text(text, reply_markup=admin_menu_kb())
    except Exception:
        await call.message.answer(text, reply_markup=admin_menu_kb())
    await call.answer()

@router.callback_query(F.data == "admin_add_new_prompt")
async def admin_add_new_prompt_cb(call: CallbackQuery, state: FSMContext):
    if call.from_user.id != ADMIN_ID:
        await call.answer("Faqat Bosh Admin yangi admin tayinlashi mumkin!", show_alert=True)
        return

    await state.set_state(AddAdminState.tg_id_or_user)
    cancel_kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔙 Bekor qilish", callback_data="admin_manage_admins")]
    ])
    text = (
        "👑 <b>Yangi admin qo'shish:</b>\n\n"
        "Admin qilmoqchi bo'lgan foydalanuvchining <b>Telegram ID</b> raqamini kiriting:\n"
        "<i>(Masalan: 123456789)</i>"
    )
    try:
        await call.message.edit_text(text, reply_markup=cancel_kb)
    except Exception:
        await call.message.answer(text, reply_markup=cancel_kb)
    await call.answer()

@router.message(AddAdminState.tg_id_or_user)
async def admin_save_new_admin(message: Message, state: FSMContext):
    try:
        new_tg_id = int(message.text.strip())
        user_info = test_db.get_user(new_tg_id)
        fullname = user_info["fullname"] if user_info else "Admin"
        username = user_info["username"] if user_info else ""

        test_db.add_admin(new_tg_id, fullname, username, added_by=message.from_user.id)
        await state.clear()
        await message.answer(
            f"✅ <b>Yangi admin tayinlandi!</b>\n\n"
            f"👤 <b>Ism:</b> {fullname}\n"
            f"🆔 <b>Telegram ID:</b> <code>{new_tg_id}</code>\n\n"
            f"Endi ushbu foydalanuvchi ham Admin Panelga kira oladi.",
            reply_markup=admin_menu_kb()
        )
    except ValueError:
        await message.answer("⚠️ Iltimos, to'g'ri Telegram ID (raqam) kiriting:")

# ── TEXNIK PROFILAKTIKA VA BROADCAST (XABAR YUBORISH) BOSHQARUVI ──

MAINT_START_TEXT = (
    "⚠️ <b>DIQQAT: REJALI TEXNIK PROFILAKTIKA BOSHLANDI!</b>\n\n"
    "Hurmatli o'quvchilar va foydalanuvchilar!\n"
    "Hozirda bot tizimida rejali texnik profilaktika, yangilash va optimallashtirish ishlari olib borilmoqda.\n\n"
    "⏱ <b>Holat:</b> Bot vaqtincha to'xtatildi\n"
    "👨‍💻 <b>Maqsad:</b> Tizim barqarorligi va yangi imkoniyatlarni ishga tushirish\n\n"
    "✅ <i>Texnik jarayon yakunlangach, bot yana avtomatik tarzda to'liq ishga tushadi va bu haqda qo'shimcha xabar beriladi.</i>\n\n"
    "🙏 <b>Keltirilgan vaqtinchalik noqulayliklar uchun uzr so'raymiz!</b>"
)

MAINT_END_TEXT = (
    "✅ <b>XUSHXABAR: TEXNIK ISHLAR YAKUNLANDI!</b>\n\n"
    "Hurmatli o'quvchilar va foydalanuvchilar!\n"
    "Botdagi barcha texnik profilaktika va yangilash ishlari muvaffaqiyatli yakunlandi.\n\n"
    "🎉 <b>Tizim to'liq ishchi holatda!</b>\n"
    "Endi bemalol test topshirishingiz, natijalaringizni ko'rishingiz va botdan foydalanishingiz mumkin.\n\n"
    "🌟 <i>Barchangizga bilim olishda va testlarda ulkan zafarlar tilaymiz!</i>"
)

async def send_broadcast_to_users(message_text: str = "", photo_id: str = "", caption: str = "") -> tuple[int, int]:
    """Barcha faol (bloklanmagan) o'quvchilarga xabar tarqatish."""
    users = test_db.get_broadcast_users()
    sent_count = 0
    fail_count = 0
    blocked_users = []  # Botni bloklagan foydalanuvchilar
    for u in users:
        uid = u.get("tg_id")
        if not uid:
            continue
        try:
            if photo_id:
                await bot.send_photo(chat_id=uid, photo=photo_id, caption=caption or message_text)
            else:
                await bot.send_message(chat_id=uid, text=message_text)
            sent_count += 1
            await asyncio.sleep(0.04)
        except Exception as e:
            fail_count += 1
            err_str = str(e).lower()
            if "blocked" in err_str or "forbidden" in err_str or "deactivated" in err_str:
                blocked_users.append(u)
            log.warning(f"Broadcast xatosi user {uid}: {e}")

    # Admin ga bloklagan userlar haqida xabar
    if blocked_users:
        blocked_text = "🚫 <b>Botni bloklagan foydalanuvchilar:</b>\n\n"
        for bu in blocked_users:
            bname = bu.get('fullname', 'Noma\'lum')
            btid = bu.get('tg_id', '-')
            blocked_text += f"• <b>{bname}</b> (ID: <code>{btid}</code>)\n"
        blocked_text += "\n<i>Ular broadcast xabarini olmadi.</i>"
        try:
            await bot.send_message(chat_id=ADMIN_ID, text=blocked_text)
        except Exception:
            pass

    return sent_count, fail_count

# 1. Texnik rejimni yoqish / o'chirish so'rovi
@router.callback_query(F.data == "admin_toggle_maint_prompt")
async def admin_toggle_maint_prompt_cb(call: CallbackQuery):
    if call.from_user.id != ADMIN_ID:
        await call.answer("⛔️ Faqat Bosh Admin texnik profilaktika rejimini boshqarishi mumkin!", show_alert=True)
        return

    is_maint = test_db.is_maintenance_mode()
    if not is_maint:
        text = (
            "🛠 <b>TEXNIK PROFILAKTIKA REJIMINI YOQISH</b>\n\n"
            "⚠️ <b>Eslatma:</b>\n"
            "• Ushbu rejim yoqilganda sizdan (Bosh Admin) tashqari <b>hech kim</b> — "
            "na oddiy o'quvchilar va na tayinlangan adminlar botdan foydalana olmaydi.\n"
            "• Botga yozgan har qanday foydalanuvchiga: <i>«Hozirda botda texnik profilaktika ketmoqda...»</i> xabari chiqadi.\n\n"
            "Quyidagi amallardan birini tanlang 👇"
        )
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📢 Yoqish va o'quvchilarga ogohlantirish yuborish", callback_data="adm_maint_set_on_notify")],
            [InlineKeyboardButton(text="🤫 Faqat Yoqish (xabarsiz)", callback_data="adm_maint_set_on_silent")],
            [InlineKeyboardButton(text="⬅️ Bekor qilish / Orqaga", callback_data="admin_back_to_menu")]
        ])
    else:
        text = (
            "✅ <b>TEXNIK PROFILAKTIKA REJIMINI O'CHIRISH</b>\n\n"
            "Tizim yana barcha o'quvchilar va adminlar uchun to'liq ochiladi va odatdagidek ishlay boshlaydi.\n\n"
            "Quyidagi amallardan birini tanlang 👇"
        )
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📢 O'chirish va barchaga xushxabar berish", callback_data="adm_maint_set_off_notify")],
            [InlineKeyboardButton(text="🤫 Faqat O'chirish (xabarsiz)", callback_data="adm_maint_set_off_silent")],
            [InlineKeyboardButton(text="⬅️ Bekor qilish / Orqaga", callback_data="admin_back_to_menu")]
        ])

    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data.in_(["adm_maint_set_on_silent", "adm_maint_set_on_notify"]))
async def adm_maint_set_on_cb(call: CallbackQuery):
    if call.from_user.id != ADMIN_ID:
        await call.answer("Faqat Bosh Admin!", show_alert=True)
        return
    test_db.set_maintenance_mode(True)
    if call.data == "adm_maint_set_on_notify":
        await call.answer("⏳ Xabar tarqatilmoqda...")
        status_msg = await call.message.answer("⏳ O'quvchilarga texnik profilaktika boshlanganligi haqida xabar yuborilmoqda...")
        sent, fail = await send_broadcast_to_users(message_text=MAINT_START_TEXT)
        await status_msg.edit_text(
            f"🛠 <b>Texnik rejim YOQILDI va xabar tarqatildi!</b>\n\n"
            f"📨 <b>Yetkazildi:</b> {sent} ta\n"
            f"⚠️ <b>Yetkazilmadi:</b> {fail} ta\n\n"
            f"<i>Endi botdan faqat siz (Bosh Admin) foydalana olasiz.</i>",
            reply_markup=admin_menu_kb()
        )
    else:
        await call.answer("🛠 Texnik rejim yoqildi (xabarsiz)!", show_alert=True)
        await call.message.edit_text(
            "⚙️ <b>ADMIN BOSHQARUV PANELI</b>\n\n"
            "🔴 <b>Texnik profilaktika rejimi YOQILGAN.</b> Faqat siz (Bosh Admin) foydalana olasiz.\n\n"
            "Quyidagi bo'limlardan birini tanlang 👇",
            reply_markup=admin_menu_kb()
        )

@router.callback_query(F.data.in_(["adm_maint_set_off_silent", "adm_maint_set_off_notify"]))
async def adm_maint_set_off_cb(call: CallbackQuery):
    if call.from_user.id != ADMIN_ID:
        await call.answer("Faqat Bosh Admin!", show_alert=True)
        return
    test_db.set_maintenance_mode(False)
    if call.data == "adm_maint_set_off_notify":
        await call.answer("⏳ Xabar tarqatilmoqda...")
        status_msg = await call.message.answer("⏳ O'quvchilarga texnik ishlar yakunlanganligi haqida xabar yuborilmoqda...")
        sent, fail = await send_broadcast_to_users(message_text=MAINT_END_TEXT)
        await status_msg.edit_text(
            f"✅ <b>Texnik rejim O'CHIRILDI va xushxabar tarqatildi!</b>\n\n"
            f"📨 <b>Yetkazildi:</b> {sent} ta\n"
            f"⚠️ <b>Yetkazilmadi:</b> {fail} ta\n\n"
            f"<i>Bot barcha o'quvchilar va adminlar uchun yana to'liq faol.</i>",
            reply_markup=admin_menu_kb()
        )
    else:
        await call.answer("✅ Texnik rejim o'chirildi (xabarsiz)!", show_alert=True)
        await call.message.edit_text(
            "⚙️ <b>ADMIN BOSHQARUV PANELI</b>\n\n"
            "🟢 <b>Texnik profilaktika rejimi O'CHIRILGAN.</b> Bot barcha uchun ochiq.\n\n"
            "Quyidagi bo'limlardan birini tanlang 👇",
            reply_markup=admin_menu_kb()
        )

# 2. O'quvchilarga xabar yuborish menyusi
@router.callback_query(F.data == "admin_broadcast_menu")
async def admin_broadcast_menu_cb(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        await call.answer("Siz admin emassiz!", show_alert=True)
        return
    await state.clear()
    users_count = len(test_db.get_broadcast_users())
    text = (
        f"📢 <b>O'QUVCHILARGA XABAR YUBORISH BO'LIMI</b>\n\n"
        f"👥 <b>Qabul qiluvchilar:</b> {users_count} nafar faol foydalanuvchi\n\n"
        f"Quyidagi tezkor tayyor xabarlardan birini tanlashingiz yoki o'zingiz erkin xabar yozishingiz mumkin:\n\n"
        f"1️⃣ <b>🛠 Texnik profilaktika xabari:</b>\n"
        f"<i>«Botda texnik ishlar ketayotgani va vaqtincha to'xtatilgani haqida ogohlantirish»</i>\n\n"
        f"2️⃣ <b>✅ Texnik ishlar yakunlandi:</b>\n"
        f"<i>«Bot yana o'z faoliyatini boshlagani haqida xushxabar e'loni»</i>\n\n"
        f"3️⃣ <b>✍️ Erkin xabar yozish:</b>\n"
        f"<i>«Admin o'zi xohlagan matn, e'lon yoki rasmli postni barchaga yuborishi mumkin»</i>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛠 1. Texnik ishlar boshlandi (Tezkor)", callback_data="adm_bc_preview_start")],
        [InlineKeyboardButton(text="✅ 2. Texnik ishlar yakunlandi (Tezkor)", callback_data="adm_bc_preview_end")],
        [InlineKeyboardButton(text="✍️ 3. O'zingiz erkin xabar yozish", callback_data="adm_bc_custom_input")],
        [InlineKeyboardButton(text="⬅️ Admin panelga qaytish", callback_data="admin_back_to_menu")]
    ])
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data == "adm_bc_preview_start")
async def adm_bc_preview_start_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    text = (
        f"📋 <b>XABAR KO'RINISHI (PREVIEW):</b>\n\n"
        f"────────────────────\n"
        f"{MAINT_START_TEXT}\n"
        f"────────────────────\n\n"
        f"<b>Ushbu xabarni barcha o'quvchilarga yuborishni tasdiqlaysizmi?</b>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Barchaga yuborish", callback_data="adm_bc_send_start")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_broadcast_menu")]
    ])
    await call.message.edit_text(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data == "adm_bc_preview_end")
async def adm_bc_preview_end_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    text = (
        f"📋 <b>XABAR KO'RINISHI (PREVIEW):</b>\n\n"
        f"────────────────────\n"
        f"{MAINT_END_TEXT}\n"
        f"────────────────────\n\n"
        f"<b>Ushbu xabarni barcha o'quvchilarga yuborishni tasdiqlaysizmi?</b>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Barchaga yuborish", callback_data="adm_bc_send_end")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data="admin_broadcast_menu")]
    ])
    await call.message.edit_text(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data == "adm_bc_send_start")
async def adm_bc_send_start_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    await call.answer("⏳ Xabar tarqatilmoqda...")
    status_msg = await call.message.answer("⏳ Barcha o'quvchilarga xabar yuborilmoqda...")
    sent, fail = await send_broadcast_to_users(message_text=MAINT_START_TEXT)
    await status_msg.edit_text(
        f"✅ <b>Xabar muvaffaqiyatli tarqatildi!</b>\n\n"
        f"📨 <b>Yetkazildi:</b> {sent} nafar o'quvchiga\n"
        f"⚠️ <b>Yetkazilmadi (bloklangan):</b> {fail} ta",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Xabar yuborish bo'limiga", callback_data="admin_broadcast_menu")],
            [InlineKeyboardButton(text="🔙 Admin panelga", callback_data="admin_back_to_menu")]
        ])
    )

@router.callback_query(F.data == "adm_bc_send_end")
async def adm_bc_send_end_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    await call.answer("⏳ Xabar tarqatilmoqda...")
    status_msg = await call.message.answer("⏳ Barcha o'quvchilarga xabar yuborilmoqda...")
    sent, fail = await send_broadcast_to_users(message_text=MAINT_END_TEXT)
    await status_msg.edit_text(
        f"✅ <b>Xabar muvaffaqiyatli tarqatildi!</b>\n\n"
        f"📨 <b>Yetkazildi:</b> {sent} nafar o'quvchiga\n"
        f"⚠️ <b>Yetkazilmadi (bloklangan):</b> {fail} ta",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Xabar yuborish bo'limiga", callback_data="admin_broadcast_menu")],
            [InlineKeyboardButton(text="🔙 Admin panelga", callback_data="admin_back_to_menu")]
        ])
    )

@router.callback_query(F.data == "adm_bc_custom_input")
async def adm_bc_custom_input_cb(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    await state.set_state(BroadcastState.waiting_for_message)
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="admin_broadcast_menu")]
    ])
    text = (
        "✍️ <b>O'quvchilarga yubormoqchi bo'lgan xabaringizni kiriting:</b>\n\n"
        "Oddiy matn yoki rasmli post yuborishingiz mumkin. Barcha HTML formatlar (qalin, kursiv, ssilka) qo'llab-quvvatlanadi.\n\n"
        "<i>Bekor qilish uchun pastdagi tugmani bosing yoki /cancel deb yozing.</i>"
    )
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.message(BroadcastState.waiting_for_message)
async def adm_bc_receive_custom_msg(message: Message, state: FSMContext):
    if message.text and message.text.strip() == "/cancel":
        await state.clear()
        await message.answer("❌ Xabar yuborish bekor qilindi.", reply_markup=admin_menu_kb())
        return

    photo_id = ""
    caption = ""
    msg_text = ""

    if message.photo:
        photo_id = message.photo[-1].file_id
        caption = message.caption or ""
    elif message.text:
        msg_text = message.text
    else:
        await message.answer("⚠️ Iltimos, matn yoki rasm yuboring (yoki bekor qilish uchun /cancel yozing):")
        return

    await state.update_data(photo_id=photo_id, caption=caption, msg_text=msg_text)
    await state.set_state(BroadcastState.confirm_send)

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Tasdiqlash va Yuborish", callback_data="adm_bc_custom_confirm")],
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data="admin_broadcast_menu")]
    ])

    if photo_id:
        cap_preview = f"{caption}\n\n" if caption else ""
        await message.answer_photo(
            photo=photo_id,
            caption=f"📢 <b>Yuboriladigan rasm va matn ko'rinishi:</b>\n\n{cap_preview}<b>Ushbu xabarni barcha o'quvchilarga yuborishni tasdiqlaysizmi?</b>",
            reply_markup=kb
        )
    else:
        await message.answer(
            f"📢 <b>Yuboriladigan xabar ko'rinishi:</b>\n\n"
            f"────────────────────\n"
            f"{msg_text}\n"
            f"────────────────────\n\n"
            f"<b>Ushbu xabarni barcha o'quvchilarga yuborishni tasdiqlaysizmi?</b>",
            reply_markup=kb
        )

@router.callback_query(F.data == "adm_bc_custom_confirm", BroadcastState.confirm_send)
async def adm_bc_custom_confirm_cb(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    data = await state.get_data()
    await state.clear()

    photo_id = data.get("photo_id", "")
    caption = data.get("caption", "")
    msg_text = data.get("msg_text", "")

    await call.answer("⏳ Xabar tarqatilmoqda...")
    status_msg = await call.message.answer("⏳ Barcha o'quvchilarga xabar yuborilmoqda...")
    sent, fail = await send_broadcast_to_users(message_text=msg_text, photo_id=photo_id, caption=caption)

    await status_msg.edit_text(
        f"✅ <b>Xabar muvaffaqiyatli tarqatildi!</b>\n\n"
        f"📨 <b>Yetkazildi:</b> {sent} nafar o'quvchiga\n"
        f"⚠️ <b>Yetkazilmadi (bloklangan):</b> {fail} ta",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Xabar yuborish bo'limiga", callback_data="admin_broadcast_menu")],
            [InlineKeyboardButton(text="🔙 Admin panelga", callback_data="admin_back_to_menu")]
        ])
    )

# 5. Natijalar va hisobotlar boshqaruvi
@router.callback_query(F.data == "admin_leaderboard")
async def admin_leaderboard(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    tests = test_db.get_tests_with_stats()
    if not tests:
        text = "⚠️ Hozirda tizimda mavjud testlar yo'q."
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Admin Panelga qaytish", callback_data="admin_panel_back")]
        ])
        try:
            await call.message.edit_text(text, reply_markup=kb)
        except Exception:
            await call.message.answer(text, reply_markup=kb)
        await call.answer()
        return

    buttons = []
    msg_list = ""
    for idx, t in enumerate(tests, 1):
        sub_cnt = t.get("submissions_count", 0)
        btn_text = f"📊 #{t['test_code']} — 👥 {sub_cnt} kishi"
        buttons.append([InlineKeyboardButton(text=btn_text, callback_data=f"adm_tstat_{t['id']}")])
        msg_list += f"<b>{idx}. #{t['test_code']}</b> — {t['title']}: <b>{sub_cnt} kishi</b>\n"

    buttons.append([InlineKeyboardButton(text="⬅️ Admin Panelga qaytish", callback_data="admin_panel_back")])

    msg_text = (
        "📊 <b>Mavjud Testlar va Ishtirokchilar Soni:</b>\n\n"
        f"{msg_list}\n"
        "<i>Batafsil natijalarni (Matn yoki PDF shaklida) olish uchun kerakli test kodini tanlang 👇</i>"
    )

    try:
        await call.message.edit_text(msg_text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    except Exception:
        await call.message.answer(msg_text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    await call.answer()

@router.callback_query(F.data.startswith("adm_tstat_"))
async def admin_test_stats_detail(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[2])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    results = test_db.get_test_results_leaderboard(test_id)
    count = len(results)
    avg_score = 0
    if count > 0:
        avg_score = round(sum(r['score'] for r in results) / count, 1)

    is_active = (test.get("is_active", 1) == 1)
    is_pub = test_db.is_test_results_published(test_id)

    status_badge = "🟢 Javoblar qabul qilinmoqda" if is_active else "🔴 Javoblar qabul qilish to'xtatilgan"
    pub_badge = "📢 Natijalar e'lon qilingan" if is_pub else "🔒 Yashirin (O'quvchilarga «Javoblar tekshirilmoqda» ko'rinadi)"

    # Jadval vaqt ma'lumoti
    sched_date = test.get('scheduled_date') or ''
    sched_start = test.get('scheduled_start') or ''
    sched_end = test.get('scheduled_end') or ''
    if sched_date and sched_start and sched_end:
        sched_badge = f"⏰ {sched_date} | {sched_start}–{sched_end} (UZB)"
    elif sched_start and sched_end:
        sched_badge = f"⏰ {sched_start}–{sched_end} (UZB, sana belgilanmagan)"
    else:
        sched_badge = "➖ Belgilanmagan"

    text = (
        f"📊 <b>Test natijalari va tahlil bo'limi:</b>\n\n"
        f"📖 <b>Nomi:</b> {test['title']}\n"
        f"🔑 <b>Kodi:</b> <code>#{test['test_code']}</code>\n"
        f"📌 <b>Fani:</b> {test.get('subject', 'Matematika')}\n"
        f"🚦 <b>Holati:</b> {status_badge}\n"
        f"📢 <b>Natijalar:</b> {pub_badge}\n\n"
        f"👥 <b>Topshirganlar soni:</b> <b>{count} nafar</b>\n"
        f"📈 <b>O'rtacha ball:</b> <b>{avg_score} ball</b>\n\n"
        f"<i>Hisoblash, tahlil qilish va natijalarni e'lon qilish usulini tanlang 👇</i>"
    )

    buttons = [
        [InlineKeyboardButton(text="🧮 Rasch modeli (JMLE) bo'yicha hisoblash", callback_data=f"adm_broadcast_rasch_{test_id}")],
        [InlineKeyboardButton(text="✅ Standart hisoblash (To'g'ri javoblar)", callback_data=f"adm_broadcast_std_{test_id}")],
    ]

    if not is_pub:
        buttons.append([InlineKeyboardButton(text="📢 Natijalarni e'lon qilish va yuborish", callback_data=f"adm_eval_prompt_{test_id}")])
    else:
        buttons.append([
            InlineKeyboardButton(text="🔄 Natijalarni qayta yuborish", callback_data=f"adm_eval_prompt_{test_id}"),
            InlineKeyboardButton(text="🔒 Natijalarni yashirish", callback_data=f"adm_hide_results_{test_id}")
        ])

    buttons.append([
        InlineKeyboardButton(text="📄 Matn shaklida reyting", callback_data=f"adm_restxt_{test_id}"),
        InlineKeyboardButton(text="📑 PDF hisobot", callback_data=f"adm_respdf_{test_id}")
    ])
    buttons.append([InlineKeyboardButton(text="🧮 Rasch modeli tahlil jadvali", callback_data=f"adm_rasch_{test_id}")])
    buttons.append([InlineKeyboardButton(text="⬅️ Testlar ro'yxatiga qaytish", callback_data="admin_leaderboard")])

    try:
        await call.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    except Exception:
        await call.message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    try:
        await call.answer()
    except Exception:
        pass

# Testni o'chirishni tasdiqlash
@router.callback_query(F.data.startswith("adm_del_test_prompt_"))
async def adm_del_test_prompt_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[4])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return
    
    text = (
        f"⚠️ <b>DIQQAT! TESTNI O'CHIRISH</b>\n\n"
        f"📖 Nomi: <b>{test['title']}</b> (#{test['test_code']})\n\n"
        f"Ushbu testni va uning barcha o'quvchilar topshirgan natijalarini <b>butunlay o'chirib tashlamoqchimisiz?</b>\n"
        f"<i>Ushbu amalni ortga qaytarib bo'lmaydi!</i>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🗑 Ha, butunlay o'chirilsin!", callback_data=f"adm_del_test_exec_{test_id}")],
        [InlineKeyboardButton(text="🔙 Bekor qilish", callback_data=f"adm_tstat_{test_id}")]
    ])
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data.startswith("adm_del_test_exec_"))
async def adm_del_test_exec_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[4])
    ok = test_db.delete_test(test_id)
    if ok:
        await call.answer("🗑 Test muvaffaqiyatli o'chirildi!", show_alert=True)
        call.data = "admin_leaderboard"
        await admin_leaderboard_cb(call)
    else:
        await call.answer("O'chirishda xatolik yuz berdi!", show_alert=True)

# Javob qabul qilishni boshlash / to'xtatish
@router.callback_query(F.data.startswith("toggle_test_tstat_"))
async def admin_toggle_test_tstat_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    new_status = test_db.toggle_test_status(test_id)
    if new_status is not None:
        status_text = "🟢 Javoblar qabul qilinmoqda" if new_status == 1 else "🔴 Javoblar to'xtatildi"
        try:
            await call.answer(f"Test holati: {status_text}", show_alert=True)
        except Exception:
            pass
        call.data = f"adm_tstat_{test_id}"
        await admin_test_stats_detail(call)
    else:
        try:
            await call.answer("Xatolik yuz berdi!", show_alert=True)
        except Exception:
            pass

# Natijalarni qayta yashirish (o'quvchilarga yana "tekshirilmoqda" qilish)
@router.callback_query(F.data.startswith("adm_hide_results_"))
async def admin_hide_results_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    test_db.set_test_results_published(test_id, False)
    test_db.set_test_active_status(test_id, 1)
    await call.answer("🔒 Natijalar yashirildi va test faollashtirildi! Endi o'quvchilarga «Javoblar tekshirilmoqda» ko'rinadi.", show_alert=True)
    call.data = f"adm_tstat_{test_id}"
    await admin_test_stats_detail(call)

# Natijalarni e'lon qilishdan oldin SO'ROV: Rasch modeli bo'yicha yoki Standart
@router.callback_query(F.data.startswith("adm_eval_prompt_"))
@router.callback_query(F.data.startswith("adm_broadcast_results_"))
async def admin_eval_prompt_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    parts = call.data.split("_")
    test_id = int(parts[-1])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    text = (
        f"📋 <b>«{test['title']}»</b> (<code>#{test['test_code']}</code>)\n\n"
        f"🤔 <b>Natijalarni qaysi usulda tekshirib, o'quvchilarga e'lon qilmoqchisiz?</b>\n\n"
        f"1️⃣ <b>🧮 Rasch modeli (JMLE) bo'yicha:</b>\n"
        f"• Savollarning qiyinlik darajasi (b) va o'quvchilar qobiliyati (θ) hisoblanadi.\n"
        f"• Rasmiy Milliy Sertifikat darajalari (A+, A, B+, B, C+, C) beriladi.\n\n"
        f"2️⃣ <b>✅ Standart baholash (To'g'ri javoblar soni bo'yicha):</b>\n"
        f"• Har bir to'g'ri ishlangan savol soni va standart ball hisoblanadi.\n"
        f"• Oddiy va shaffof: nechta to'g'ri, noto'g'ri va to'plangan ball ko'rsatiladi.\n\n"
        f"<i>Quyidagi usullardan birini tanlang 👇</i>"
    )

    buttons = [
        [InlineKeyboardButton(text="🧮 1. Rasch modeli (JMLE) bo'yicha e'lon qilish", callback_data=f"adm_broadcast_rasch_{test_id}")],
        [InlineKeyboardButton(text="✅ 2. Standart (To'g'ri javoblar soni) bo'yicha", callback_data=f"adm_broadcast_std_{test_id}")],
        [InlineKeyboardButton(text="⬅️ Bekor qilish / Orqaga", callback_data=f"adm_tstat_{test_id}")]
    ]

    try:
        await call.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    except Exception:
        await call.message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    await call.answer()

# 1. Rasch modeli bo'yicha e'lon qilish
@router.callback_query(F.data.startswith("adm_broadcast_rasch_"))
async def admin_broadcast_rasch_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[3])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    await call.answer("⏳ Rasch modeli hisoblanmoqda va e'lon qilinmoqda...")
    status_msg = await call.message.answer(
        f"⏳ <b>«{test['title']}»</b> testi to'xtatilmoqda, Rasch modeli (JMLE) bo'yicha yakuniy ballar kalibrlanmoqda va o'quvchilarga shaxsiy natijalar yuborilmoqda..."
    )

    try:
        # 1. Testni to'xtatish (is_active = 0)
        test_db.set_test_active_status(test_id, 0)

        # 2. Rasch modeli orqali yakuniy kalibrlash va bazani yangilash
        test_db.evaluate_test_rasch(test_id, auto_update_db=True)

        # 3. Test natijalarini e'lon qilingan holatga o'tkazish
        test_db.set_test_results_published(test_id, True)

        # 4. Topshirgan barcha o'quvchilarga shaxsiy Telegram xabarini yuborish
        submissions = test_db.get_test_submissions_with_users(test_id)
        sent_count = 0
        fail_count = 0

        for sub in submissions:
            uid = sub.get("user_tg_id")
            if not uid:
                continue
            user_info = test_db.get_user(uid)
            name = user_info['fullname'] if user_info else "Foydalanuvchi"
            score = sub.get("score", 0.0)
            grade = sub.get("grade") or test_db.calculate_grade(score)
            corr = sub.get("correct_count", 0)
            total = sub.get("total_count", 55) or 55
            incorr = max(0, total - corr)
            code = sub.get("test_code", test["test_code"])

            msg_text = (
                f"📢 <b>DIQQAT! TEST NATIJALARI E'LON QILINDI!</b>\n\n"
                f"Hurmatli <b>{name}</b>, sizning <b>«{test['title']}»</b> (<code>#{code}</code>) testi bo'yicha rasmiy natijangiz:\n\n"
                f"🧮 <b>Baholash tizimi:</b> Rasch Modeli (JMLE)\n"
                f"🎖 <b>Milliy Sertifikat darajangiz:</b> <b>{grade}</b> ({score} ball)\n"
                f"✅ <b>To'g'ri ishlangan:</b> {corr} ta band\n"
                f"❌ <b>Noto'g'ri / belgilanmagan:</b> {incorr} ta\n"
                f"📊 <b>Jami savollar:</b> {total} ta\n"
                f"🕒 <b>E'lon vaqti:</b> {format_uzb_time()}\n\n"
                f"💡 <i>Endi Mini ilovaga kirib, har bir savol bo'yicha to'liq tahlil va to'g'ri kalitlarni ko'rishingiz mumkin!</i>\n\n"
                f"🏆 <i>Ishtirokingiz uchun tashakkur!</i>"
            )
            try:
                await bot.send_message(chat_id=uid, text=msg_text)
                sent_count += 1
                await asyncio.sleep(0.05)
            except Exception as ex:
                log.warning(f"O'quvchi {uid} ga natija yuborishda xatolik: {ex}")
                fail_count += 1

        fail_text = f"⚠️ Yetkazilmadi (bot bloklangan): {fail_count} ta\n" if fail_count > 0 else ""
        back_kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Test boshqaruviga qaytish", callback_data=f"adm_tstat_{test_id}")]
        ])
        await status_msg.edit_text(
            f"✅ <b>Rasch modeli bo'yicha natijalar e'lon qilindi!</b>\n\n"
            f"📨 <b>Yuborildi:</b> {sent_count} nafar o'quvchiga\n"
            f"{fail_text}"
            f"📌 <i>O'quvchilar botda va mini ilovada o'z ballari va to'liq tahlilni ko'ra oladilar.</i>",
            reply_markup=back_kb
        )
    except Exception as e:
        log.error(f"Xatolik broadcastda: {e}", exc_info=True)
        await status_msg.edit_text(f"❌ <b>Natijalarni e'lon qilishda xatolik yuz berdi:</b>\n<code>{e}</code>")

# 2. Standart baholash (To'g'ri javoblar soni) bo'yicha e'lon qilish
@router.callback_query(F.data.startswith("adm_broadcast_std_"))
async def admin_broadcast_std_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[3])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    await call.answer("⏳ Standart natijalar e'lon qilinmoqda...")
    status_msg = await call.message.answer(
        f"⏳ <b>«{test['title']}»</b> testi to'xtatilmoqda va standart to'g'ri javoblar soni bo'yicha natijalar yuborilmoqda..."
    )

    try:
        # 1. Testni to'xtatish (is_active = 0)
        test_db.set_test_active_status(test_id, 0)

        # 2. Test natijalarini e'lon qilingan holatga o'tkazish
        test_db.set_test_results_published(test_id, True)

        # 3. Topshirgan barcha o'quvchilarga shaxsiy Telegram xabarini yuborish
        submissions = test_db.get_test_submissions_with_users(test_id)
        sent_count = 0
        fail_count = 0

        for sub in submissions:
            uid = sub.get("user_tg_id")
            if not uid:
                continue
            user_info = test_db.get_user(uid)
            name = user_info['fullname'] if user_info else "Foydalanuvchi"
            score = sub.get("score", 0.0)
            corr = sub.get("correct_count", 0)
            total = sub.get("total_count", 55) or 55
            incorr = max(0, total - corr)
            code = sub.get("test_code", test["test_code"])

            msg_text = (
                f"📢 <b>DIQQAT! TEST NATIJALARI E'LON QILINDI!</b>\n\n"
                f"Hurmatli <b>{name}</b>, sizning <b>«{test['title']}»</b> (<code>#{code}</code>) testi bo'yicha rasmiy natijangiz:\n\n"
                f"📋 <b>Baholash turi:</b> Standart (To'g'ri javoblar soni)\n"
                f"✅ <b>To'g'ri javoblar:</b> {corr} / {total} ta\n"
                f"❌ <b>Noto'g'ri javoblar:</b> {incorr} ta\n"
                f"🎯 <b>To'plangan ball:</b> {score} ball\n"
                f"🕒 <b>E'lon vaqti:</b> {format_uzb_time()}\n\n"
                f"💡 <i>Endi Mini ilovaga kirib, har bir savol bo'yicha to'liq tahlil va to'g'ri kalitlarni ko'rishingiz mumkin!</i>\n\n"
                f"🏆 <i>Ishtirokingiz uchun tashakkur!</i>"
            )
            try:
                await bot.send_message(chat_id=uid, text=msg_text)
                sent_count += 1
                await asyncio.sleep(0.05)
            except Exception as ex:
                log.warning(f"O'quvchi {uid} ga natija yuborishda xatolik: {ex}")
                fail_count += 1

        fail_text = f"⚠️ Yetkazilmadi (bot bloklangan): {fail_count} ta\n" if fail_count > 0 else ""
        back_kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Test boshqaruviga qaytish", callback_data=f"adm_tstat_{test_id}")]
        ])
        await status_msg.edit_text(
            f"✅ <b>Standart natijalar muvaffaqiyatli e'lon qilindi!</b>\n\n"
            f"📨 <b>Yuborildi:</b> {sent_count} nafar o'quvchiga\n"
            f"{fail_text}"
            f"📌 <i>Endi barcha o'quvchilar botda va mini ilovada o'z ballari va to'liq tahlilni ko'ra oladilar.</i>",
            reply_markup=back_kb
        )
    except Exception as e:
        log.error(f"Xatolik broadcastda: {e}", exc_info=True)
        await status_msg.edit_text(f"❌ <b>Natijalarni e'lon qilishda xatolik yuz berdi:</b>\n<code>{e}</code>")

@router.callback_query(F.data.startswith("adm_rasch_"))
async def admin_test_rasch_eval(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[2])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    await call.answer("⏳ Rasch modeli hisoblanmoqda...")
    status_msg = await call.message.answer("⏳ <i>Rasch JMLE modeli bo'yicha savollar qiyinligi va o'quvchilar qobiliyati hisoblanmoqda...</i>")

    res = test_db.evaluate_test_rasch(test_id, auto_update_db=True)
    if not res or not res.get("students"):
        await status_msg.edit_text(
            f"⚠️ <b>«{test['title']}»</b> testi uchun Rasch modelini hisoblashning imkoni bo'lmadi.\n\n"
            f"📌 <i>Talab: Rasch modeli ishlashi uchun testni kamida 2 nafar o'quvchi topshirgan bo'lishi kerak.</i>"
        )
        return

    meta = res.get("meta", {})
    students = res.get("students", [])
    items = res.get("items", [])

    is_active = (test.get("is_active", 1) == 1)
    is_pub = test_db.is_test_results_published(test_id)

    status_note = ""
    if is_active or not is_pub:
        status_note = (
            f"⚠️ <b>Eslatma:</b> Test hozirda to'xtatilmagan yoki natijalar o'quvchilarga hali e'lon qilinmagan. "
            f"O'quvchilarga natijalar ko'rinmaydi (ularga <i>«Javoblaringiz tekshirilmoqda»</i> ko'rinadi).\n"
            f"Testni to'xtatib, barchaga natijalarni e'lon qilish uchun quyidagi tugmani bosing 👇\n\n"
        )

    text = (
        f"🧮 <b>Rasch Modeli (JMLE) Baholash Natijalari</b>\n\n"
        f"📖 <b>Test:</b> {test['title']} (<code>#{test['test_code']}</code>)\n"
        f"👥 <b>Talabalar:</b> {meta.get('n_students', meta.get('num_students', len(students)))} nafar\n"
        f"❓ <b>Elementlar:</b> {meta.get('n_items', meta.get('num_items', len(items)))} ta (55 ta band)\n"
        f"🔄 <b>Iteratsiyalar:</b> {meta.get('iterations', 0)} (Konvergensiya: {meta.get('converged', True)})\n\n"
        f"{status_note}"
        f"🏆 <b>O'quvchilar darajalari va yakuniy ballari (0-100):</b>\n"
    )

    for idx, s in enumerate(students[:25], 1):
        sid = s.get('student_id')
        u = test_db.get_user(sid) if sid else None
        name = u['fullname'] if u else f"ID: {sid}"
        theta_val = s.get('theta', 0.0)
        text += f"<b>{idx}. {name}</b>: <b>{s['final_score']} ball</b> [🎖 <b>{s['grade']}</b>] (θ={theta_val:+.2f})\n"

    if len(students) > 25:
        text += f"\n<i>...va yana {len(students) - 25} nafar talaba.</i>"

    buttons = [
        [InlineKeyboardButton(text="📢 Testni to'xtatish va Natijalarni e'lon qilish", callback_data=f"adm_broadcast_results_{test_id}")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"adm_tstat_{test_id}")]
    ]
    await status_msg.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))

@router.callback_query(F.data.startswith("adm_restxt_"))
async def admin_test_res_text(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[2])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    results = test_db.get_test_results_leaderboard(test_id)
    if not results:
        await call.answer("Bu testni hali hech kim topshirmagan!", show_alert=True)
        return

    text = f"🏆 <b>«{test['title']}» Natijalari (Matn ko'rinishida):</b>\n"
    text += f"👥 <b>Jami ishtirokchilar:</b> {len(results)} nafar | 🕒 {format_uzb_time()}\n\n"

    for idx, row in enumerate(results[:30], 1):
        grade = test_db.calculate_grade(row["score"])
        text += f"<b>{idx}. {row['fullname']}</b> — <b>{row['score']} ball</b> [🎖 {grade}] ({row['correct_count']} ta to'g'ri)\n"

    if len(results) > 30:
        text += f"\n<i>...va yana {len(results) - 30} nafar ishtirokchi (barchasini ko'rish uchun PDF yuklab oling).</i>"

    buttons = [
        [InlineKeyboardButton(text="📑 PDF hisobotni yuklab olish", callback_data=f"adm_respdf_{test_id}")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"adm_tstat_{test_id}")]
    ]

    try:
        await call.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    except Exception:
        await call.message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    await call.answer()

@router.callback_query(F.data.startswith("adm_respdf_"))
async def admin_test_res_pdf(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[2])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    results = test_db.get_test_results_leaderboard(test_id)
    if not results:
        await call.answer("Ushbu testni hali hech kim topshirmagan, PDF chiqarib bo'lmaydi.", show_alert=True)
        return

    await call.answer("⏳ PDF hisobot yaratilmoqda...")
    status_msg = await call.message.answer("⏳ <i>PDF reyting jadvali shakllantirilmoqda, iltimos kuting...</i>")

    pdf_path = test_db.generate_test_results_pdf(test_id)
    if pdf_path and os.path.exists(pdf_path):
        try:
            caption = (
                f"📑 <b>«{test['title']}»</b> bo'yicha rasmiy test natijalari va reyting hisoboti.\n\n"
                f"👥 <b>Ishtirokchilar:</b> {len(results)} nafar\n"
                f"🕒 <b>Sana:</b> {format_uzb_time()}"
            )
            await bot.send_document(
                chat_id=call.from_user.id,
                document=FSInputFile(pdf_path),
                caption=caption
            )
            await status_msg.delete()
        except Exception as e:
            log.error(f"PDF yuborishda xatolik: {e}")
            await status_msg.edit_text(f"⚠️ PDF yuborishda xatolik yuz berdi: {e}")
        finally:
            try:
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            except Exception:
                pass
    else:
        await status_msg.edit_text("⚠️ PDF hisobotini shakllantirishda xatolik yuz berdi.")

# Foydalanuvchi to'g'ridan-to'g'ri test kodini yuborganida
@router.message(F.text)
async def handle_direct_text(message: Message, state: FSMContext):
    cur_state = await state.get_state()
    if cur_state is not None:
        return

    raw_text = (message.text or "").strip()
    if not raw_text:
        return

    if not await check_access(message):
        return

    menu_cmds = [
        "🔢 Test kodini kiritish", "📊 Mening natijalarim", "👤 Profilim",
        "ℹ️ Yordam", "ℹ️ Bot haqida", "⚙️ Admin Panel",
        "➕ Yangi test yaratish", "📊 Test natijalari va reyting", "📋 Testlarni boshqarish"
    ]
    if raw_text in menu_cmds:
        return

    code = raw_text.upper().replace("#", "")
    test = test_db.get_test_by_code(code)
    if test:
        await send_test_card(message, test, message.from_user.id)
    else:
        user_info = test_db.get_user(message.from_user.id)
        name = user_info['fullname'] if user_info else (message.from_user.first_name or "Foydalanuvchi")
        await message.answer(
            f"👋 Salom, <b>{name}</b>!\n\n"
            f"Test topshirish uchun «🔢 Test kodini kiritish» tugmasini bosing yoki menyudan foydalaning 👇",
            reply_markup=main_menu_kb(message.from_user.id)
        )

# ── AIOHTTP MINI APP VEB SERVERI ──────────────────────

async def handle_submit_test_api(request):
    """Mini App dan kelgan javoblarni tekshirish va bot orqali faqat foydalanuvchiga natijani xabar qilish"""
    try:
        data = await request.json()
        test_id = data.get("test_id", 1)
        user_tg_id = data.get("user_tg_id")
        user_answers = data.get("answers", {})

        # Bazada tekshirish va saqlash
        result = test_db.check_and_save_submission(test_id, user_tg_id, user_answers)

        # Natijalar e'lon qilingan yoki yo'qligini tekshirish
        is_published = test_db.is_test_results_published(test_id)

        # Foydalanuvchiga Telegram bot orqali shaxsiy xabar yuborish
        if user_tg_id:
            if is_published:
                grade = result.get('grade') or "C"
                score_val = result.get('score', 0)
                theta_val = result.get('rasch_theta', 0.0)
                msg_user = (
                    f"🎉 <b>Hurmatli {result['fullname']}, sizning natijangiz:</b>\n\n"
                    f"📚 <b>Test:</b> {result['test_title']} (<code>#{result['test_code']}</code>)\n"
                    f"🧮 <b>Rasch Modeli (JMLE) bo'yicha baholash:</b>\n"
                    f"🎖 <b>Milliy Sertifikat darajasi:</b> <b>{grade}</b> ({score_val} ball)\n"
                    f"📈 <b>Rasch qobiliyat parametri (θ):</b> <code>{theta_val:+.2f}</code> logit\n\n"
                    f"✅ <b>To'g'ri javoblar:</b> {result['correct_count']} / 55 ta band\n"
                    f"❌ <b>Noto'g'ri javoblar:</b> {result['incorrect_count']} ta\n"
                    f"⚪ <b>Belgilanmagan:</b> {result['unanswered_count']} ta\n"
                    f"🕒 <b>Vaqt:</b> {format_uzb_time()}\n\n"
                    f"💡 <i>Eslatma: Savollar qiyinligi va yakuniy 100 ballik natija Rasch modeli tomonidan avtomatik hisoblandi.</i>\n\n"
                    f"🏆 <i>Natijangiz tizimda muvaffaqiyatli qayd etildi!</i>"
                )
            else:
                msg_user = (
                    f"✅ <b>Hurmatli {result['fullname']}, javoblaringiz qabul qilindi!</b>\n\n"
                    f"📚 <b>Test:</b> {result['test_title']} (<code>#{result['test_code']}</code>)\n"
                    f"📌 <b>Holat:</b> ⏳ <b>Javoblaringiz tekshirilmoqda...</b>\n"
                    f"🕒 <b>Topshirilgan vaqt:</b> {format_uzb_time()}\n\n"
                    f"ℹ️ <b>Eslatma:</b> Test hozirda barcha o'quvchilar uchun davom etmoqda. "
                    f"Admin testni to'xtatib, Rasch tahlili o'tkazilgach, "
                    f"to'g'ri ishlangan savollar soni, yakuniy ballingiz va Milliy sertifikat darajangiz botingizga shaxsiy xabar qilib yuboriladi!\n\n"
                    f"🏆 <i>Javoblaringiz tizimda muvaffaqiyatli saqlandi.</i>"
                )
            try:
                await bot.send_message(chat_id=user_tg_id, text=msg_user)
            except Exception as ex:
                log.warning(f"Foydalanuvchiga xabar yuborishda xatolik: {ex}")

        # WebApp uchun mijoz ma'lumotlari
        client_data = dict(result)
        client_data["is_published"] = is_published
        if not is_published:
            client_data["score"] = None
            client_data["grade"] = "Kutilmoqda"
            client_data["correct_count"] = None
            client_data["incorrect_count"] = None
            client_data["unanswered_count"] = None
            client_data["rasch_theta"] = None
            client_data["details"] = None

        return web.json_response({"success": True, "data": client_data})

    except Exception as e:
        log.error(f"Submit API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_create_test_api(request):
    """Admin Mini App dan yuborilgan yangi test, kalitlar va ballarni saqlash"""
    try:
        data = await request.json()
        title = data.get("title", "").strip() or "Matematika Milliy Sertifikat Testi"
        test_code = data.get("test_code", "").strip().upper()
        if not test_code:
            test_code = f"MAT-{int(time.time()) % 10000:04d}"
        
        subject = data.get("subject", "Matematika").strip() or "Matematika"
        answers = data.get("answers", {})
        time_limit_min = int(data.get("time_limit_min", 0))
        key_access_code = data.get("key_access_code", "").strip()

        success = test_db.create_test(
            test_code=test_code,
            title=title,
            subject=subject,
            answers=answers,
            time_limit_min=time_limit_min,
            key_access_code=key_access_code
        )

        sched_date = data.get("scheduled_date", "").strip()
        sched_start = data.get("scheduled_start", "").strip()
        sched_end = data.get("scheduled_end", "").strip()

        if success:
            try:
                t_obj = test_db.get_test_by_code(test_code)
                test_id = t_obj['id'] if t_obj else 0
                
                # Jadval vaqtini sozlash
                if sched_start and sched_end and test_id:
                    test_db.set_test_schedule(test_id, sched_date, sched_start, sched_end)

                time_info = f"⏱ <b>Vaqt chegarasi:</b> {time_limit_min} daqiqa\n" if time_limit_min > 0 else ""
                sched_info = f"⏰ <b>O'tkazilish vaqti:</b> {sched_date} {sched_start}–{sched_end} (UZB)\n" if (sched_start and sched_end) else ""
                
                kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="📥 Ha, PDF yuklayman", callback_data=f"ask_pdf_{test_id}")],
                    [InlineKeyboardButton(text="❌ Yo'q, kerak emas", callback_data=f"no_pdf_{test_id}")]
                ])

                await bot.send_message(
                    chat_id=ADMIN_ID,
                    text=(
                        f"✅ <b>Yangi test yaratildi va saqlandi!</b>\n\n"
                        f"📖 <b>Nomi:</b> {title}\n"
                        f"📌 <b>Fani:</b> {subject}\n"
                        f"{sched_info}"
                        f"{time_info}"
                        f"🎯 <i>Barcha savol kalitlari muvaffaqiyatli saqlandi!</i>\n\n"
                        f"Ushbu test uchun PDF fayl yuklaysizmi?"
                    ),
                    reply_markup=kb
                )
            except Exception as ex:
                log.warning(f"Adminga xabar yuborishda xatolik: {ex}")

            return web.json_response({"success": True, "message": "Test muvaffaqiyatli saqlandi!"})
        else:
            return web.json_response({"success": False, "message": "Ma'lumotlar bazasiga yozishda xatolik yuz berdi"}, status=400)

    except Exception as e:
        log.error(f"Create Test API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

def sanitize_math_expression(val: str) -> str:
    """LaTeX formatidagi matematik ifodalarni toza Unicode formatiga o'tkazish."""
    if not isinstance(val, str):
        val = str(val)
    s = val.strip()

    # Dollar belgilarini olib tashlash ($...$ yoki $$...$$)
    s = s.replace("$", "").strip()

    # Standart LaTeX almashtirishlari
    s = re.sub(r"\\+(?:cdot|times)\b", "*", s)
    s = re.sub(r"\\+pm\b", "±", s)
    s = re.sub(r"\\+pi\b", "π", s)
    s = re.sub(r"\\+(?:degree|\^\s*\\+circ)\b", "°", s)
    s = re.sub(r"\\+(?:left|right)", "", s)
    s = re.sub(r"\\+(?:text|mathrm|mathbf)\{([^}]+)\}", r"\1", s)

    # Ildizlar: \sqrt[3]{...} -> ∛...
    s = re.sub(r"\\+sqrt\[3\]\{([^{}]+)\}", r"∛\1", s)
    s = re.sub(r"\\+sqrt\[3\]([0-9a-zA-Z]+)", r"∛\1", s)

    # Ildizlar: \sqrt{...} -> √...
    while "sqrt{" in s:
        s = re.sub(r"\\+sqrt\{([^{}]+)\}", r"√\1", s)
    s = re.sub(r"\\+sqrt([0-9a-zA-Z]+)", r"√\1", s)

    # Kasrlar: \frac{a}{b} yoki \dfrac{a}{b} -> a/b
    while re.search(r"\\+d?frac\{([^{}]+)\}\{([^{}]+)\}", s):
        s = re.sub(r"\\+d?frac\{([^{}]+)\}\{([^{}]+)\}", r"\1/\2", s)

    # Qavslar va figurali qavslarni tozalash
    s = re.sub(r"\{([^{}]+)\}", r"\1", s)

    # Ortiqcha teskari slesh (\) larni tozalash
    s = s.replace("\\", "")

    # Belgilar atrofidagi bo'shliqlarni me'yorga keltirish
    s = re.sub(r"\s*\+\s*", " + ", s)
    s = re.sub(r"\s*\-\s*", " - ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def _sync_extract_keys_gemini(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    import base64
    import re
    import requests

    gemini_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or test_db.get_setting("gemini_api_key", "").strip()
    )
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY o'rnatilmagan")

    prompt = (
        "Ushbu rasmda test javoblari/kalitlari varaqasi yoki jadvali berilgan.\n"
        "Iltimos, rasmdagi har bir savol javobini diqqat bilan o'qib, faqat to'g'ri JSON formatida qaytar.\n\n"
        "Test strukturasi (55 ta element):\n"
        "- 1 dan 32 gacha: 4 variantli yopiq savollar (A, B, C, D)\n"
        "- 33, 34, 35: 6 variantli yopiq savollar (A, B, C, D, E, F)\n"
        "- 36a dan 45b gacha: ochiq matematik javoblar (masalan: 25, -4, 25/6, √29, 8√58, ∛8, π/4, 120 + 36π va h.k.)\n\n"
        "MUHIM VA QAT'IY TALAB:\n"
        "Matematik ifodalarda HECH QACHON LaTeX (\\frac, \\sqrt, \\pi, \\cdot) ishlatma! Faqat oddiy Unicode belgilaridan foydalan:\n"
        "- Kasrlar uchun: a/b (masalan, 25/6, 3π/2)\n"
        "- Ildizlar uchun: √x (masalan, √29, 8√58, ∛8)\n"
        "- Pi soni uchun: π (masalan, π/4, 120 + 36π)\n"
        "- Bo'shliqlar va ishoralarni (+, -, *, /) aniq saqla.\n\n"
        "Qaytadigan javob aynan toza JSON obyekti bo'lsin:\n"
        "{\n"
        '  "1": "A",\n'
        '  "2": "B",\n'
        '  "33": "C",\n'
        '  "36a": "25/6",\n'
        '  "36b": "√29",\n'
        '  "37a": "8√58",\n'
        '  "37b": "π/4",\n'
        '  ...\n'
        '  "45b": "5"\n'
        "}\n\n"
        "DIQQAT: Faqat toza JSON matnini qaytar, hech qanday qo'shimcha so'z, sharh yoki izoh yozma!"
    )

    models_to_try = [
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3.8-flash",
    ]

    b64_data = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "contents": [{
            "parts": [
                {"inlineData": {"mimeType": mime_type, "data": b64_data}},
                {"text": prompt}
            ]
        }]
    }

    last_err = None
    for model_name in models_to_try:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
            resp = requests.post(url, json=payload, timeout=60)
            if resp.status_code != 200:
                raise ValueError(f"HTTP {resp.status_code}: {resp.text[:200]}")

            res_json = resp.json()
            candidates = res_json.get("candidates", [])
            if not candidates:
                raise ValueError("Bo'sh javob qaytdi (candidates yo'q)")

            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
            if match:
                raw_text = match.group(1).strip()
            parsed = json.loads(raw_text)
            if isinstance(parsed, dict):
                cleaned = {}
                for k, v in parsed.items():
                    k_clean = str(k).strip().lower().replace("q", "").replace("-savol", "").replace("savol", "").strip()
                    v_str = str(v).strip()
                    if k_clean.isdigit() and int(k_clean) <= 35:
                        v_str = v_str.upper()
                    else:
                        v_str = sanitize_math_expression(v_str)
                    cleaned[k_clean] = v_str
                if cleaned:
                    return cleaned
        except Exception as ex:
            log.warning(f"Gemini {model_name} xatosi: {ex}")
            last_err = ex
            continue

    return {}

async def handle_scan_keys_api(request):
    """Admin panel uchun javoblar varaqasi rasmidan kalitlarni OCR qilish."""
    try:
        image_bytes = None
        mime_type = "image/jpeg"

        if request.content_type.startswith("multipart/"):
            reader = await request.multipart()
            while True:
                part = await reader.next()
                if part is None:
                    break
                if part.name in ["image", "file", "photo"]:
                    image_bytes = await part.read()
                    mime_type = part.headers.get("Content-Type", "image/jpeg")
                    break
        else:
            data = await request.json()
            raw_b64 = data.get("image", "")
            if "," in raw_b64:
                header, raw_b64 = raw_b64.split(",", 1)
                if "image/png" in header:
                    mime_type = "image/png"
                elif "image/webp" in header:
                    mime_type = "image/webp"
            import base64
            image_bytes = base64.b64decode(raw_b64)

        if not image_bytes:
            return web.json_response({"success": False, "message": "Rasm topilmadi yoki yuklanmadi"}, status=400)

        loop = asyncio.get_running_loop()
        keys_dict = await loop.run_in_executor(None, _sync_extract_keys_gemini, image_bytes, mime_type)

        if not keys_dict:
            return web.json_response({
                "success": False,
                "message": "Rasmdan kalitlarni ajratib bo'lmadi. Iltimos, aniqroq yoki sifatliroq rasm yuklang."
            }, status=200)

        return web.json_response({
            "success": True,
            "data": keys_dict,
            "count": len(keys_dict),
            "message": f"Muvaffaqiyatli! {len(keys_dict)} ta kalit aniqlandi."
        })

    except Exception as e:
        log.error(f"Scan keys API Error: {e}", exc_info=True)
        is_key_err = "GEMINI_API_KEY" in str(e) or "API_KEY" in str(e) or "API key not valid" in str(e)
        return web.json_response({
            "success": False,
            "need_api_key": is_key_err,
            "message": f"OCR tahlilida xatolik: {str(e)}"
        }, status=500)

async def handle_set_gemini_key_api(request):
    """Admin uchun Gemini API kalitini bazaga saqlash."""
    try:
        data = await request.json()
        key = (data.get("key") or "").strip()
        if not key:
            return web.json_response({"success": False, "message": "API kalit kiritilmadi"}, status=400)
        test_db.set_setting("gemini_api_key", key)
        return web.json_response({"success": True, "message": "Gemini API kaliti saqlandi!"})
    except Exception as e:
        log.error(f"Set Gemini key API error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=500)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, 'test_webapp')

# Agar test_webapp eskidan qolgan bo'lsa, joriy git fayllari xalaqitsiz ishlashi uchun tozalash
try:
    if os.path.exists(WEB_DIR):
        import shutil
        shutil.rmtree(WEB_DIR, ignore_errors=True)
except Exception:
    pass

async def find_web_file(filename: str) -> str:
    filename_clean = filename.lstrip('/')
    candidates = [
        os.path.join(BASE_DIR, filename_clean),
        os.path.join(BASE_DIR, 'css', filename_clean),
        os.path.join(BASE_DIR, 'js', filename_clean),
        os.path.join(BASE_DIR, 'img', filename_clean),
        os.path.join(os.getcwd(), filename_clean),
        os.path.join(os.getcwd(), 'css', filename_clean),
        os.path.join(os.getcwd(), 'js', filename_clean),
        os.path.join(os.getcwd(), 'img', filename_clean),
        os.path.join(WEB_DIR, filename_clean),
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isfile(c):
            return c
    # Fallback: Papkalar bo'ylab qidirish
    target = os.path.basename(filename_clean)
    for root_dir in [BASE_DIR, os.getcwd()]:
        if os.path.exists(root_dir):
            for root, dirs, files in os.walk(root_dir):
                if target in files:
                    found = os.path.join(root, target)
                    log.info(f"🔍 Topildi (recursive search): {found}")
                    return found
    return os.path.join(BASE_DIR, filename_clean)

def set_no_cache_headers(resp):
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp

async def handle_index(request):
    fpath = await find_web_file('index.html')
    if os.path.exists(fpath) and os.path.isfile(fpath):
        return set_no_cache_headers(web.FileResponse(fpath))
    try:
        import web_assets_fallback
        data, mime = web_assets_fallback.get_asset_bytes('index.html')
        if data:
            return set_no_cache_headers(web.Response(body=data, content_type=mime or 'text/html', charset='utf-8'))
    except Exception as e:
        log.error(f"index.html yuklashda xatolik: {e}")
    return web.Response(status=404, text="index.html topilmadi")

async def handle_admin(request):
    fpath = await find_web_file('admin.html')
    if os.path.exists(fpath) and os.path.isfile(fpath):
        return set_no_cache_headers(web.FileResponse(fpath))
    try:
        import web_assets_fallback
        data, mime = web_assets_fallback.get_asset_bytes('admin.html')
        if data:
            return set_no_cache_headers(web.Response(body=data, content_type=mime or 'text/html', charset='utf-8'))
    except Exception as e:
        log.error(f"admin.html yuklashda xatolik: {e}")
    return web.Response(status=404, text="admin.html topilmadi")

async def handle_app(request):
    fpath = await find_web_file('app.html')
    if os.path.exists(fpath) and os.path.isfile(fpath):
        resp = web.FileResponse(fpath)
    else:
        try:
            import web_assets_fallback
            data, mime = web_assets_fallback.get_asset_bytes('app.html')
            if data:
                resp = web.Response(body=data, content_type=mime or 'text/html', charset='utf-8')
            else:
                resp = web.Response(status=404, text="app.html topilmadi")
        except Exception as e:
            log.error(f"app.html yuklashda xatolik: {e}")
            resp = web.Response(status=404, text="app.html topilmadi")
    return set_no_cache_headers(resp)

async def handle_static_file(request):
    path_name = request.match_info.get('path', '')
    if '..' in path_name:
        return web.Response(status=403, text="Ruxsat berilmagan yo'l")
    fpath = await find_web_file(path_name)
    if os.path.exists(fpath) and os.path.isfile(fpath):
        resp = web.FileResponse(fpath)
        if any(path_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.ico']):
            resp.headers['Cache-Control'] = 'public, max-age=86400'
        else:
            set_no_cache_headers(resp)
        return resp

    # Fallback to embedded in-memory asset
    try:
        import web_assets_fallback
        data, mime = web_assets_fallback.get_asset_bytes(path_name)
        if data:
            resp = web.Response(body=data, content_type=mime or 'application/octet-stream')
            if any(path_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.ico']):
                resp.headers['Cache-Control'] = 'public, max-age=86400'
            else:
                set_no_cache_headers(resp)
            return resp
    except Exception as e:
        log.error(f"Statik faylni xotiradan yuklashda xatolik ({path_name}): {e}")

    return web.Response(status=404, text="Fayl topilmadi")



# ── ASOSIY MINI APP API ENDPOINTLARI ────────────────────────────────────────

async def handle_app_profile(request):
    """Foydalanuvchi profili va statistikasi (Asosiy Mini App uchun)."""
    try:
        tg_id = int(request.rel_url.query.get('tg_id', 0))
        if not tg_id or tg_id == 0:
            return web.json_response({
                "success": True,
                "user": {
                    "tg_id": 0,
                    "fullname": "Mehmon",
                    "phone": "—",
                    "status": "guest",
                    "registered_at": int(time.time()),
                    "tests_count": 0,
                    "avg_score": 0,
                    "max_score": 0,
                    "has_pin": False
                },
                "is_admin": False,
                "pending_users": 0
            })

        user = test_db.get_user(tg_id)
        is_admin = test_db.is_admin(tg_id, ADMIN_ID)

        # Foydalanuvchi statistikasi
        submissions = test_db.get_user_submissions(tg_id)
        avg_score = 0.0
        max_score_val = 0
        if submissions:
            scores = [float(s.get('score', s.get('correct_count', 0))) for s in submissions]
            avg_score = sum(scores) / len(scores) if scores else 0
            max_score_val = max(scores) if scores else 0

        # Pending users count for admins
        pending_users = 0
        if is_admin:
            try:
                counts = test_db.get_users_count()
                pending_users = counts.get('pending', 0)
            except Exception:
                pass

        user_data = dict(user) if user else {
            'tg_id': tg_id, 'fullname': 'Foydalanuvchi', 'phone': '—',
            'status': 'pending', 'registered_at': int(time.time())
        }
        user_data['tests_count'] = len(submissions)
        user_data['avg_score'] = round(avg_score, 1)
        user_data['max_score'] = max_score_val
        user_data['has_pin'] = bool(user and user.get('pin_code'))

        return web.json_response({
            "success": True,
            "user": user_data,
            "is_admin": is_admin,
            "pending_users": pending_users
        })
    except Exception as e:
        log.error(f"App Profile API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_set_pin(request):
    """Foydalanuvchi PIN kodini bazada saqlash."""
    try:
        data = await request.json()
        tg_id = int(data.get('tg_id', 0))
        pin = str(data.get('pin', '')).strip()
        if not tg_id or len(pin) != 4:
            return web.json_response({"success": False, "message": "4 xonali PIN kerak"}, status=400)
        test_db.set_user_pin(tg_id, pin)
        return web.json_response({"success": True})
    except Exception as e:
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_status(request):
    """Bot va server holatini (online/active) tekshirish."""
    import time
    return web.json_response({
        "success": True,
        "status": "online",
        "bot_active": True,
        "server_time": int(time.time()),
        "uptime": int(time.time())
    }, headers={"Access-Control-Allow-Origin": "*"})

async def handle_app_verify_pin(request):
    """Foydalanuvchi PIN kodini bazadan tekshirish."""
    try:
        data = await request.json()
        tg_id = int(data.get('tg_id', 0))
        pin = str(data.get('pin', '')).strip()
        stored = test_db.get_user_pin(tg_id)
        if stored and stored == pin:
            return web.json_response({"success": True, "valid": True})
        return web.json_response({"success": True, "valid": False})
    except Exception as e:
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_compare_keys(request):
    """Parol orqali test kalitlarini va o'quvchi javoblarini solishtirish."""
    try:
        data = await request.json()
        tg_id = int(data.get('tg_id', 0))
        test_id = int(data.get('test_id', 0))
        code = str(data.get('code', '')).strip()

        if not tg_id or not test_id:
            return web.json_response({"success": False, "message": "Noto'g'ri so'rov"}, status=400)

        test = test_db.get_test_by_id(test_id)
        if not test:
            return web.json_response({"success": False, "message": "Test topilmadi"}, status=404)

        if not test_db.is_test_results_published(test_id):
            return web.json_response({
                "success": False, 
                "message": "Natijalar va kalitlar admin tomonidan test yakunlanib, rasmiy e'lon qilingach ochiladi."
            }, status=403)

        expected_code = str(test.get('key_access_code', '')).strip()
        if expected_code and expected_code != code:
            return web.json_response({"success": False, "message": "Parol noto'g'ri!"}, status=403)

        sub = test_db.get_user_submission_for_test(test_id, tg_id)
        if not sub:
            return web.json_response({"success": False, "message": "Siz ushbu testni topshirmagansiz"}, status=400)

        correct_answers = test_db.parse_answers_json(test.get('answers_json', '{}'))
        user_answers = test_db.parse_answers_json(sub.get('answers_json', '{}'))

        return web.json_response({
            "success": True,
            "correct_answers": correct_answers,
            "user_answers": user_answers
        })
    except Exception as e:
        log.error(f"App Compare Keys API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_active_tests(request):
    """Faol testlar ro'yxati (user uchun topshirilgan-topshirilmaganligini ham qaytaradi)."""
    try:
        tg_id = int(request.rel_url.query.get('tg_id', 0))
        all_tests = test_db.get_all_tests()
        result = []
        for t in all_tests:
            td = dict(t)
            td.pop('answers_json', None)  # Javoblarni yashirish
            # Foydalanuvchi allaqachon topshirganmi?
            if tg_id:
                existing = test_db.get_user_submission_for_test(t['id'], tg_id)
                td['already_submitted'] = bool(existing)
            else:
                td['already_submitted'] = False
            td['is_planned'] = False  # To'xtatilgan testlar 'planned' emas, ular alohida ko'rsatiladi
            result.append(td)
        return web.json_response({"success": True, "tests": result})
    except Exception as e:
        log.error(f"App Active Tests API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_my_results(request):
    """Foydalanuvchining o'z test natijalari tarixi."""
    try:
        tg_id = int(request.rel_url.query.get('tg_id', 0))
        if not tg_id:
            return web.json_response({"success": True, "results": []})
        submissions = test_db.get_user_submissions(tg_id)
        return web.json_response({"success": True, "results": submissions})
    except Exception as e:
        log.error(f"App My Results API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_users(request):
    """Admin uchun barcha foydalanuvchilar ro'yxati va statistika."""
    try:
        tg_id = int(request.rel_url.query.get('tg_id', 0))
        if not tg_id or not test_db.is_admin(tg_id, ADMIN_ID):
            init_data = request.rel_url.query.get('init_data', '') or request.headers.get('X-Telegram-Init-Data', '')
            import urllib.parse, json
            try:
                parsed = dict(urllib.parse.parse_qsl(init_data))
                if 'user' in parsed:
                    u_dict = json.loads(parsed['user'])
                    if u_dict and u_dict.get('id'):
                        tg_id = int(u_dict['id'])
            except Exception:
                pass

        if not test_db.is_admin(tg_id, ADMIN_ID):
            return web.json_response({"success": False, "message": "Ruxsat yo'q"}, status=403)

        users = test_db.get_all_users()
        counts = test_db.get_users_count()
        return web.json_response({
            "success": True,
            "users": users,
            "stats": counts
        })
    except Exception as e:
        log.error(f"App Users API Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_update_user_status(request):
    """Admin tomonidan foydalanuvchi holatini (approved / pending / blocked / delete) o'zgartirish."""
    try:
        data = await request.json()
        admin_id = int(data.get('admin_id', 0))
        target_uid = int(data.get('target_uid', 0))
        action = str(data.get('status', '')).strip().lower()

        if not admin_id or not test_db.is_admin(admin_id, ADMIN_ID):
            init_data = data.get('init_data', '') or request.headers.get('X-Telegram-Init-Data', '')
            import urllib.parse, json
            try:
                parsed = dict(urllib.parse.parse_qsl(init_data))
                if 'user' in parsed:
                    u_dict = json.loads(parsed['user'])
                    if u_dict and u_dict.get('id'):
                        admin_id = int(u_dict['id'])
            except Exception:
                pass

        if not test_db.is_admin(admin_id, ADMIN_ID):
            return web.json_response({"success": False, "message": "Ruxsat yo'q"}, status=403)

        if not target_uid:
            return web.json_response({"success": False, "message": "Foydalanuvchi ID ko'rsatilmadi"}, status=400)

        if action == 'delete':
            # Foydalanuvchini bazadan butunlay o'chirish
            ok = test_db.delete_user(target_uid)
            return web.json_response({"success": ok, "status": "deleted"})

        if action not in ['approved', 'rejected', 'blocked', 'pending']:
            return web.json_response({"success": False, "message": "Noto'g'ri amal"}, status=400)

        if action == 'approved':
            test_db.approve_user(target_uid)
            try:
                await bot.send_message(
                    chat_id=target_uid,
                    text=(
                        "🎉 <b>Xushxabar! Sizga test tizimidan to'liq foydalanishga ruxsat berildi!</b>\n\n"
                        "Endi botdagi barcha imkoniyatlar va Mini ilovadan to'siqsiz foydalanishingiz mumkin.\n"
                        "Test topshirish uchun bot menyusidan foydalaning!"
                    ),
                    reply_markup=main_menu_kb(target_uid)
                )
            except Exception:
                pass
        elif action in ['rejected', 'pending']:
            test_db.set_user_pending(target_uid)
            try:
                req_kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🔔 Admindan ruxsat so'rash", callback_data=f"user_req_access_{target_uid}")]
                ])
                await bot.send_message(
                    chat_id=target_uid,
                    text=(
                        "⏳ <b>Sizning botdan foydalanish huquqingiz admin tomonidan to'xtatildi!</b>\n\n"
                        "Qayta foydalanish uchun quyidagi tugma orqali adminga so'rov yuborishingiz mumkin."
                    ),
                    reply_markup=req_kb
                )
            except Exception:
                pass
        elif action == 'blocked':
            test_db.block_user(target_uid)
            try:
                await bot.send_message(
                    chat_id=target_uid,
                    text="⛔️ <b>Sizning botdan foydalanish huquqingiz admin tomonidan bekor qilindi va bloklandingiz!</b>",
                    reply_markup=ReplyKeyboardRemove()
                )
            except Exception:
                pass

        return web.json_response({"success": True, "status": action})
    except Exception as e:
        log.error(f"App Update User Status Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_app_restrict_all_users(request):
    """Admin tomonidan barcha oddiy foydalanuvchilarni kutilmoqda (pending) holatiga o'tkazish."""
    try:
        data = await request.json()
        admin_id = int(data.get('admin_id', 0))
        if not test_db.is_admin(admin_id, ADMIN_ID):
            return web.json_response({"success": False, "message": "Ruxsat yo'q"}, status=403)

        count = test_db.restrict_all_users(ADMIN_ID)
        return web.json_response({"success": True, "count": count})
    except Exception as e:
        log.error(f"App Restrict All Users Error: {e}", exc_info=True)
        return web.json_response({"success": False, "message": str(e)}, status=400)

async def handle_rasch_evaluate_api(request):
    try:
        test_id = int(request.match_info.get('test_id', 0))
        tg_id = int(request.rel_url.query.get('tg_id', 0))
        is_adm = test_db.is_admin(tg_id, ADMIN_ID) if tg_id else False
        is_pub = test_db.is_test_results_published(test_id)

        if not is_adm and not is_pub:
            return web.json_response({
                "success": False,
                "message": "Ushbu test natijalari hali e'lon qilinmagan yoki ruxsat yo'q"
            }, status=403)

        res = test_db.evaluate_test_rasch(test_id)
        if not res:
            return web.json_response({"success": False, "message": "Kamida 2 ta talaba topshirgan bo'lishi kerak yoki test topilmadi"}, status=400)
        return web.json_response({"success": True, "data": res})
    except Exception as e:
        return web.json_response({"success": False, "message": str(e)}, status=500)

async def create_web_app():
    app = web.Application()
    app.router.add_get('/', handle_index)
    app.router.add_get('/index.html', handle_index)
    app.router.add_get('/admin.html', handle_admin)
    app.router.add_get('/app.html', handle_app)
    app.router.add_get('/api/rasch/{test_id}', handle_rasch_evaluate_api)
    app.router.add_post('/api/submit-test', handle_submit_test_api)
    app.router.add_post('/api/create-test', handle_create_test_api)
    app.router.add_post('/api/scan-keys', handle_scan_keys_api)
    app.router.add_post('/api/set-gemini-key', handle_set_gemini_key_api)
    # Asosiy Mini App API
    app.router.add_get('/api/app/profile', handle_app_profile)
    app.router.add_get('/api/app/active-tests', handle_app_active_tests)
    app.router.add_get('/api/app/my-results', handle_app_my_results)
    app.router.add_get('/api/app/users', handle_app_users)
    app.router.add_post('/api/app/update-user-status', handle_app_update_user_status)
    app.router.add_post('/api/app/restrict-all-users', handle_app_restrict_all_users)
    app.router.add_get('/api/app/status', handle_app_status)
    app.router.add_get('/healthz', handle_app_status)
    app.router.add_get('/ping', handle_app_status)
    app.router.add_post('/api/app/compare-keys', handle_app_compare_keys)
    app.router.add_post('/api/app/set-pin', handle_app_set_pin)
    app.router.add_post('/api/app/verify-pin', handle_app_verify_pin)
    # Universal Static Route
    app.router.add_get('/css/{path:.*}', handle_static_file)
    app.router.add_get('/js/{path:.*}', handle_static_file)
    app.router.add_get('/img/{path:.*}', handle_static_file)
    app.router.add_get('/{path:[^/]+\\.(?:css|js|png|jpg|jpeg|svg|ico|json)}', handle_static_file)

    return app

# keep_alive_pinger o'chirildi — Render.com bepul 750 soatlik limitni tejash uchun.
# Tashqi Cron-job (UptimeRobot, cron-job.org) orqali /healthz yoki /ping endpointiga
# ertalab 07:00 dan 23:00 gacha so'rov yuboring. Bu bot o'z-o'zini ping qilmaydi.

# ── AVTOMATIK HTTPS TUNNEL (OGOHLANTIRISHLARSIZ / TO'G'RIDAN-TO'G'RI OCHILUVCHI) ──
async def maintain_tunnel(local_port: int):
    """Telegram Mini App uchun tunnel yoki Railway doimiy HTTPS manzilini sozlaydi."""
    global WEBAPP_URL
    import re

    # Agar Render.com yoki Railway yoki boshqa doimiy domenda ishlayotgan bo'lsa
    render_domain = os.getenv("RENDER_EXTERNAL_URL")
    is_render = os.getenv("RENDER") == "true" or bool(os.getenv("RENDER_SERVICE_ID")) or bool(os.getenv("RENDER_INSTANCE_ID"))
    if render_domain or is_render:
        if not render_domain:
            render_domain = os.getenv("WEBAPP_URL") or "https://rash-vmrm.onrender.com"
        WEBAPP_URL = (render_domain if render_domain.startswith("http") else f"https://{render_domain}").rstrip("/")
        log.info(f"🚀 Render.com Production muhiti aniqlandi: {WEBAPP_URL}")
        try:
            with open("tunnel_url.txt", "w") as f:
                f.write(WEBAPP_URL)
            menu_btn = MenuButtonWebApp(text="Profil 👤", web_app=WebAppInfo(url=f"{WEBAPP_URL}/app.html"))
            await bot.set_chat_menu_button(menu_button=menu_btn)
            log.info("✅ Bot menyu tugmasi Render.com doimiy URL ga ulandi!")
        except Exception as e:
            log.error(f"Menu tugmasini yangilashda xatolik: {e}")
        return

    railway_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN") or os.getenv("RAILWAY_STATIC_URL")
    if railway_domain:
        WEBAPP_URL = f"https://{railway_domain}"
        log.info(f"🚂 Railway Production muhiti aniqlandi: {WEBAPP_URL}")
        try:
            with open("tunnel_url.txt", "w") as f:
                f.write(WEBAPP_URL)
            menu_btn = MenuButtonWebApp(text="Profil 👤", web_app=WebAppInfo(url=f"{WEBAPP_URL}/app.html"))
            await bot.set_chat_menu_button(menu_button=menu_btn)
            log.info("✅ Bot menyu tugmasi Railway doimiy URL ga ulandi!")
        except Exception as e:
            log.error(f"Menu tugmasini yangilashda xatolik: {e}")
        return

    env_url = os.getenv("WEBAPP_URL", "")
    if env_url and not any(k in env_url for k in [".lhr.life", ".trycloudflare.com", ".serveo.net", "serveousercontent.com", "localhost", "127.0.0.1"]):
        WEBAPP_URL = env_url.rstrip("/")
        log.info(f"🌐 Doimiy WEBAPP_URL sozlamasi aniqlandi: {WEBAPP_URL}")
        try:
            with open("tunnel_url.txt", "w") as f:
                f.write(WEBAPP_URL)
            menu_btn = MenuButtonWebApp(text="Profil 👤", web_app=WebAppInfo(url=f"{WEBAPP_URL}/app.html"))
            await bot.set_chat_menu_button(menu_button=menu_btn)
            log.info("✅ Bot menyu tugmasi doimiy URL ga ulandi!")
        except Exception as e:
            log.error(f"Menu tugmasini yangilashda xatolik: {e}")
        return

    providers = [
        ("Cloudflare", ["cloudflared", "tunnel", "--url", f"http://localhost:{local_port}"], r'https://[a-zA-Z0-9\-\.]+\.trycloudflare\.com'),
        ("LocalhostRun", ["ssh", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=30", "-R", f"80:localhost:{local_port}", "nokey@localhost.run"], r'https://[a-zA-Z0-9\-\.]+\.lhr\.life')
    ]

    while True:
        for name, cmd, pattern in providers:
            try:
                log.info(f"🔌 HTTPS Tunnelga ulanmoqda ({name})...")
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.STDOUT
                )
                while True:
                    line = await proc.stdout.readline()
                    if not line:
                        break
                    decoded = line.decode('utf-8', errors='ignore')
                    match = re.search(pattern, decoded)
                    if match:
                        new_url = match.group(0)
                        WEBAPP_URL = new_url
                        log.info(f"✨ JONLI HTTPS MINI APP URL ({name}): {WEBAPP_URL}")
                        try:
                            with open("tunnel_url.txt", "w") as f:
                                f.write(WEBAPP_URL)
                            # Update Bot Menu Button automatically
                            menu_btn = MenuButtonWebApp(text="Profil 👤", web_app=WebAppInfo(url=f"{WEBAPP_URL}/app.html"))
                            await bot.set_chat_menu_button(menu_button=menu_btn)
                            log.info("✅ Bot menyu tugmasi Mini App URL ga ulandi!")
                        except Exception as e:
                            log.error(f"Menu tugmasini yangilashda xatolik: {e}")
                await proc.wait()
                log.warning(f"⚠️ {name} aloqasi uzildi. Qayta ulanmoqda...")
            except Exception as e:
                log.error(f"Tunnel xatoligi ({name}): {e}")
            await asyncio.sleep(2)
        await asyncio.sleep(3)

# ── TEST JADVAL VAQT HANDLERLARI ───────────────────────────

@router.callback_query(F.data.startswith("adm_schedule_"))
async def adm_schedule_start(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[2])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    sched_date = test.get('scheduled_date') or ''
    sched_start = test.get('scheduled_start') or ''
    sched_end = test.get('scheduled_end') or ''

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⏰ Yangi vaqt belgilash", callback_data=f"adm_sched_set_{test_id}")],
        [InlineKeyboardButton(text="🗑 Jadval vaqtini bekor qilish", callback_data=f"adm_sched_clear_{test_id}")],
        [InlineKeyboardButton(text="⬅️ Orqaga", callback_data=f"adm_tstat_{test_id}")],
    ])

    cur_sched = f"⏰ {sched_date} | {sched_start}–{sched_end}" if (sched_start and sched_end) else "➖ Belgilanmagan"
    text = (
        f"⏰ <b>Avtomatik vaqt boshqaruvi</b>\n\n"
        f"📖 <b>Test:</b> {test['title']}\n"
        f"🕐 <b>Hozirgi jadval:</b> {cur_sched}\n\n"
        f"<i>Test belgilangan vaqtda avtomatik <b>faollashadi</b> (boshlanish vaqti kelganda)\n"
        f"va belgilangan vaqtda avtomatik <b>to'xtatiladi</b> (tugash vaqti kelganda).\n"
        f"Siz hech narsa qilmasangiz ham bot o'zi boshqaradi.</i>"
    )
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()


@router.callback_query(F.data.startswith("adm_sched_clear_"))
async def adm_sched_clear(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    test_db.clear_test_schedule(test_id)
    await call.answer("✅ Jadval vaqti bekor qilindi!", show_alert=True)
    # test boshqaruv sahifasiga qaytish
    call.data = f"adm_tstat_{test_id}"
    await admin_test_detail_cb(call)


@router.callback_query(F.data.startswith("adm_sched_set_"))
async def adm_sched_set_start(call: CallbackQuery, state: FSMContext):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    test_id = int(call.data.split("_")[3])
    await state.update_data(schedule_test_id=test_id)
    await state.set_state(ScheduleState.waiting_date)

    now_uzb = datetime.now(UZB_TZ)
    today = now_uzb.strftime("%d.%m.%Y")
    tomorrow = (now_uzb + timedelta(days=1)).strftime("%d.%m.%Y")

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=f"📅 Bugun ({today})", callback_data=f"sched_date_{today}_{test_id}")],
        [InlineKeyboardButton(text=f"📅 Ertaga ({tomorrow})", callback_data=f"sched_date_{tomorrow}_{test_id}")],
        [InlineKeyboardButton(text="❌ Bekor qilish", callback_data=f"adm_schedule_{test_id}")],
    ])
    try:
        await call.message.edit_text(
            "📅 <b>Test o'tkaziladigan sanani tanlang yoki kiriting:</b>\n\n"
            "<i>Format: <code>26.09.2026</code></i>",
            reply_markup=kb
        )
    except Exception:
        await call.message.answer(
            "📅 <b>Sanani tanlang yoki kiriting (26.09.2026 formatida):</b>",
            reply_markup=kb
        )
    await call.answer()


@router.callback_query(F.data.startswith("sched_date_"))
async def adm_sched_date_chosen(call: CallbackQuery, state: FSMContext):
    parts = call.data.split("_")
    # sched_date_DD.MM.YYYY_testid
    chosen_date = parts[2]
    test_id = int(parts[3])
    await state.update_data(schedule_date=chosen_date, schedule_test_id=test_id)
    await state.set_state(ScheduleState.waiting_start)
    await call.message.edit_text(
        f"✅ Sana: <b>{chosen_date}</b>\n\n"
        f"🕐 <b>Test boshlanish vaqtini kiriting</b> (UZB vaqti):\n"
        f"<i>Format: <code>19:30</code></i>"
    )
    await call.answer()


@router.message(ScheduleState.waiting_date)
async def adm_sched_date_text(message: Message, state: FSMContext):
    import re
    text = message.text.strip()
    if not re.match(r'^\d{2}\.\d{2}\.\d{4}$', text):
        await message.answer("❌ Noto'g'ri format. Iltimos: <code>26.09.2026</code>")
        return
    data = await state.get_data()
    test_id = data.get('schedule_test_id')
    await state.update_data(schedule_date=text)
    await state.set_state(ScheduleState.waiting_start)
    await message.answer(
        f"✅ Sana: <b>{text}</b>\n\n"
        f"🕐 <b>Boshlanish vaqtini kiriting</b> (UZB):\n"
        f"<i>Format: <code>19:30</code></i>"
    )


@router.message(ScheduleState.waiting_start)
async def adm_sched_start_time(message: Message, state: FSMContext):
    import re
    text = message.text.strip()
    if not re.match(r'^\d{1,2}:\d{2}$', text):
        await message.answer("❌ Noto'g'ri format. Iltimos: <code>19:30</code>")
        return
    # HH:MM formatga keltirish
    h, m = text.split(":")
    text = f"{int(h):02d}:{m}"
    await state.update_data(schedule_start=text)
    await state.set_state(ScheduleState.waiting_end)
    await message.answer(
        f"✅ Boshlanish: <b>{text}</b>\n\n"
        f"🕕 <b>Tugash vaqtini kiriting</b> (UZB):\n"
        f"<i>Format: <code>22:00</code></i>"
    )


@router.message(ScheduleState.waiting_end)
async def adm_sched_end_time(message: Message, state: FSMContext):
    import re
    text = message.text.strip()
    if not re.match(r'^\d{1,2}:\d{2}$', text):
        await message.answer("❌ Noto'g'ri format. Iltimos: <code>22:00</code>")
        return
    h, m = text.split(":")
    text = f"{int(h):02d}:{m}"

    data = await state.get_data()
    test_id = data.get('schedule_test_id')
    schedule_date = data.get('schedule_date', '')
    schedule_start = data.get('schedule_start', '')

    await state.clear()

    # Saqlash
    test_db.set_test_schedule(test_id, schedule_date, schedule_start, text)

    test = test_db.get_test_by_id(test_id)
    test_name = test['title'] if test else f"Test #{test_id}"

    await message.answer(
        f"✅ <b>Avtomatik jadval saqlandi!</b>\n\n"
        f"📖 <b>Test:</b> {test_name}\n"
        f"📅 <b>Sana:</b> {schedule_date}\n"
        f"🕐 <b>Boshlanadi:</b> {schedule_start} (UZB)\n"
        f"🕕 <b>Tugaydi:</b> {text} (UZB)\n\n"
        f"<i>Bot belgilangan vaqtda testni avtomatik faollashtiradi va to'xtatadi.</i>"
    )


# ── BACKGROUND SCHEDULER (har 60 soniyada tekshiradi) ──────

async def schedule_checker():
    """Har 60 soniyada testlarning avtomatik vaqtini tekshiradi va faollashtiradi/to'xtatadi."""
    log.info("⏰ Schedule Checker ishga tushdi")
    while True:
        try:
            now_uzb = datetime.now(UZB_TZ)
            today_str = now_uzb.strftime("%d.%m.%Y")
            now_time = now_uzb.strftime("%H:%M")

            tests = test_db.get_scheduled_tests()
            for t in tests:
                sdate = t.get('scheduled_date') or ''
                sstart = t.get('scheduled_start') or ''
                send = t.get('scheduled_end') or ''
                test_id = t['id']
                is_active = (t.get('is_active', 1) == 1)

                if not sdate or not sstart or not send:
                    continue
                if sdate != today_str:
                    continue

                # Boshlanish vaqti keldi va test hali faol emas
                if now_time >= sstart and now_time < send and not is_active:
                    test_db.set_test_active_status(test_id, 1)
                    log.info(f"⏰ Test #{test_id} avtomatik faollashtirildi ({sstart})")
                    try:
                        await bot.send_message(
                            chat_id=ADMIN_ID,
                            text=(
                                f"⏰ <b>Avtomatik: Test boshlandi!</b>\n\n"
                                f"📖 <b>{t['title']}</b>\n"
                                f"🕐 Boshlanish vaqti: <b>{sstart}</b>\n"
                                f"🕕 Tugash vaqti: <b>{send}</b>\n\n"
                                f"✅ Test endi faol — o'quvchilar javob bera oladi."
                            )
                        )
                    except Exception:
                        pass

                # Tugash vaqti keldi va test hali faol
                elif now_time >= send and is_active:
                    test_db.set_test_active_status(test_id, 0)
                    test_db.clear_test_schedule(test_id)
                    log.info(f"⏰ Test #{test_id} avtomatik to'xtatildi ({send})")
                    try:
                        await bot.send_message(
                            chat_id=ADMIN_ID,
                            text=(
                                f"⏰ <b>Avtomatik: Test tugadi!</b>\n\n"
                                f"📖 <b>{t['title']}</b>\n"
                                f"🕕 Tugash vaqti: <b>{send}</b>\n\n"
                                f"🔴 Test to'xtatildi. O'quvchilar endi javob bera olmaydi.\n"
                                f"📊 Natijalarni ko'rish uchun: /admin → Testlar"
                            )
                        )
                    except Exception:
                        pass

        except Exception as e:
            log.error(f"Schedule checker xatosi: {e}")

        await asyncio.sleep(60)


# ── ASOSIY ISHGA TUSHIRISH (MAIN) ─────────────────────
async def main():
    global WEBAPP_URL
    test_db.init_db()

    # 1. aiohttp serverini ishga tushirish (bo'sh portni avtomatik topish)
    app = await create_web_app()
    runner = web.AppRunner(app)
    await runner.setup()
    
    current_port = PORT
    site = None
    for attempt in range(10):
        try:
            site = web.TCPSite(runner, '0.0.0.0', current_port)
            await site.start()
            log.info(f"🌐 Mini App Server ishga tushdi: http://localhost:{current_port}")
            break
        except OSError as e:
            if e.errno == 48: # Address already in use
                current_port += 1
            else:
                raise e

    # 2. Fon rejimida HTTPS Tunnelni boshlash
    asyncio.create_task(maintain_tunnel(current_port))

    # 2b. Avtomatik jadval tekshiruvchisini ishga tushirish
    asyncio.create_task(schedule_checker())

    # 3. Telegram Botni ishga tushirish
    log.info("🤖 Telegram Bot Polling rejimida ishga tushmoqda...")
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        # Telegram rasmiy menyu buyruqlarini ro'yxatdan o'tkazish
        try:
            await bot.set_my_commands([
                BotCommand(command="start", description="🚀 Botni ishga tushirish"),
                BotCommand(command="app", description="📱 Test topshirish (Mini App)"),
                BotCommand(command="results", description="📊 Mening natijalarim"),
                BotCommand(command="profile", description="👤 Shaxsiy profilim"),
                BotCommand(command="help", description="ℹ️ Qo'llanma va yordam"),
            ])
            log.info("✅ Telegram Bot rasmiy buyruqlar menyusi o'rnatildi (/start, /app, ...)")

            # Telegram pastki chat menyu tugmasini doimiy ravishda "Profil 👤" qilib o'rnatish
            try:
                menu_btn = MenuButtonWebApp(text="Profil 👤", web_app=WebAppInfo(url=f"{WEBAPP_URL}/app.html"))
                await bot.set_chat_menu_button(menu_button=menu_btn)
                log.info("✅ Telegram Bot pastki menyu tugmasi 'Profil 👤' qilib sozlandi!")
            except Exception as me:
                log.warning(f"Bot chat menyu tugmasini o'rnatishda ogohlantirish: {me}")
        except Exception as ce:
            log.warning(f"Bot buyruqlarini o'rnatishda ogohlantirish: {ce}")

        await dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types())
    finally:
        await bot.session.close()
        if runner:
            await runner.cleanup()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        log.info("Bot to'xtatildi.")
