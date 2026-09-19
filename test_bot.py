"""
STREET TEST — Test Tekshirish Telegram Boti va Mini App Serveri
Aiogram 3.x + aiohttp WebApp Server
============================================================
Bot Token: 8892124781:AAGTRWY78lfHn3pQoBoIG30zH9OoDQF5N2g
Admin ID: 8039427064
"""

import asyncio
import json
import logging
import os
import sys
import time
import urllib.parse
from typing import Optional, Dict, Any

from aiogram import Bot, Dispatcher, F, Router
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

# ── SOZLAMALAR ────────────────────────────────────────
BOT_TOKEN = os.getenv("BOT_TOKEN", "8892124781:AAGTRWY78lfHn3pQoBoIG30zH9OoDQF5N2g")
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

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())
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
    Admin Panel inline menyusi — asosiy menyuda mavjud bo'lgan narsalar (test yaratish,
    reyting, testlarni boshqarish) olib tashlangan, faqat foydalanuvchilar va adminlar boshqaruvi qoldirilgan.
    """
    try:
        counts = test_db.get_users_count()
        total_u = counts.get("total", 0)
        pending_u = counts.get("pending", 0)
        btn_text = f"👥 Foydalanuvchilar ({total_u} ta)"
        if pending_u > 0:
            btn_text += f" ⏳ {pending_u} ta yangi"
    except Exception:
        btn_text = "👥 Barcha foydalanuvchilar ro'yxati"

    buttons = [
        [InlineKeyboardButton(text=btn_text, callback_data="admin_view_users")],
        [InlineKeyboardButton(text="👑 Adminlar boshqaruvi", callback_data="admin_manage_admins")]
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
    
    if existing_sub:
        dt = format_uzb_time(existing_sub["submitted_at"])
        grade = test_db.calculate_grade(existing_sub.get("score", 0))
        text = (
            f"⛔️ <b>Siz ushbu testni allaqachon topshirgansiz!</b>\n\n"
            f"📖 <b>Test:</b> {test['title']}\n"
            f"🎖 <b>Daraja:</b> <b>{grade}</b> ({existing_sub['score']} ball)\n"
            f"✅ <b>To'g'ri javoblar:</b> {existing_sub['correct_count']} ta\n"
            f"🕒 <b>Topshirilgan vaqt:</b> {dt}\n\n"
            f"⚠️ <i>Qoidalarga ko'ra, har bir testni faqat 1 marta topshirish mumkin. Qayta ishlash huquqi mavjud emas!</i>"
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
        "subject": test.get("subject", "Matematika"),
        "user_id": user_tg_id
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
        grade = test_db.calculate_grade(existing_sub.get("score", 0))
        await call.answer(f"⛔️ Siz bu testni topshirgansiz! Daraja: {grade} ({existing_sub['score']} ball)", show_alert=True)
        return

    params = {
        "test_id": t["id"],
        "test_code": t["test_code"],
        "title": t["title"],
        "subject": t.get("subject", "Matematika"),
        "user_id": call.from_user.id
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

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text=toggle_btn_text, callback_data=f"toggle_test_{t['id']}"),
            InlineKeyboardButton(text="⏱ Vaqt", callback_data=f"set_time_prompt_{t['id']}")
        ],
        [InlineKeyboardButton(text="🗑 O'chirish", callback_data=f"del_test_confirm_{t['id']}")],
        [InlineKeyboardButton(text="⬅️ Testlar ro'yxatiga qaytish", callback_data="admin_manage_tests")]
    ])

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
    test_db.approve_user(uid)
    u = test_db.get_user(uid)
    uname = u["fullname"] if u else f"ID: {uid}"
    admin_name = call.from_user.full_name or "Admin"

    await call.message.edit_text(
        f"{call.message.text}\n\n✅ <b>RUXSAT BERILDI!</b>\nTasdiqladi: <b>{admin_name}</b>",
        reply_markup=None
    )
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
    test_db.reject_user(uid)
    admin_name = call.from_user.full_name or "Admin"

    await call.message.edit_text(
        f"{call.message.text}\n\n❌ <b>RAD ETILDI!</b>\nRad etdi: <b>{admin_name}</b>",
        reply_markup=None
    )
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

# 3. Barcha foydalanuvchilar ro'yxati va boshqaruvi
@router.callback_query(F.data == "admin_view_users")
async def admin_view_users_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    users = test_db.get_all_users()
    counts = test_db.get_users_count()
    if not users:
        text = "ℹ️ Hozircha ro'yxatdan o'tgan foydalanuvchilar yo'q."
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
        f"👥 <b>FOYDALANUVCHILAR BOSHQARUVI ({counts['total']} nafar):</b>\n\n"
        f"📊 <b>Jami:</b> {counts['total']} ta | ✅ <b>Faol:</b> {counts['approved']} ta\n"
        f"⏳ <b>Kutilayotganlar:</b> {counts['pending']} ta | ⛔️ <b>Chiqarilganlar:</b> {counts['blocked']} ta\n\n"
        f"<i>Boshqarish (ruxsat berish / chiqarib yuborish / o'chirish) uchun foydalanuvchini tanlang 👇</i>"
    )

    buttons = []
    for u in users[:25]:
        st = u.get("status", "pending")
        if st == "approved":
            icon = "✅"
        elif st == "pending":
            icon = "⏳"
        elif st == "blocked":
            icon = "⛔️"
        else:
            icon = "❌"
        
        btn_label = f"{icon} {u['fullname']} ({u.get('phone', '')})"
        buttons.append([InlineKeyboardButton(text=btn_label, callback_data=f"adm_user_card_{u['tg_id']}")])

    buttons.append([InlineKeyboardButton(text="🔙 Admin Menyuga qaytish", callback_data="admin_back_to_menu")])
    kb = InlineKeyboardMarkup(inline_keyboard=buttons)
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

# Foydalanuvchi kartasi va amallar (Ruxsat berish / Chiqarib yuborish / O'chirish)
@router.callback_query(F.data.startswith("adm_user_card_"))
async def adm_user_card_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    uid = int(call.data.split("_")[3])
    u = test_db.get_user(uid)
    if not u:
        await call.answer("Foydalanuvchi topilmadi!", show_alert=True)
        return

    st = u.get("status", "pending")
    if st == "approved":
        st_text = "✅ Ruxsat berilgan (Faol)"
    elif st == "pending":
        st_text = "⏳ Kutilmoqda (Ruxsat berilmagan)"
    elif st == "blocked":
        st_text = "⛔️ Chiqarib yuborilgan (Bloklangan)"
    else:
        st_text = "❌ Rad etilgan"

    dt = format_uzb_time(u["registered_at"])
    uname = f"@{u['username']}" if u.get("username") else "mavjud emas"

    text = (
        f"👤 <b>FOYDALANUVCHI MA'LUMOTLARI:</b>\n\n"
        f"👤 <b>Ism:</b> {u['fullname']}\n"
        f"📱 <b>Telefon:</b> <code>{u['phone']}</code>\n"
        f"🆔 <b>Telegram ID:</b> <code>{u['tg_id']}</code>\n"
        f"🌐 <b>Username:</b> {uname}\n"
        f"📌 <b>Holati:</b> <b>{st_text}</b>\n"
        f"📅 <b>Ro'yxatdan o'tgan sana:</b> {dt}\n\n"
        f"<i>Quyidagi tugmalar orqali foydalanuvchini boshqarishingiz mumkin:</i>"
    )

    action_buttons = []
    if st != "approved":
        action_buttons.append([InlineKeyboardButton(text="✅ Botga ruxsat berish", callback_data=f"adm_act_approve_{uid}")])
    if st != "blocked":
        action_buttons.append([InlineKeyboardButton(text="⛔️ Botdan chiqarib yuborish", callback_data=f"adm_act_block_{uid}")])
    action_buttons.append([InlineKeyboardButton(text="🗑 Butunlay o'chirish", callback_data=f"adm_act_del_{uid}")])
    action_buttons.append([InlineKeyboardButton(text="🔙 Foydalanuvchilar ro'yxatiga", callback_data="admin_view_users")])

    kb = InlineKeyboardMarkup(inline_keyboard=action_buttons)
    try:
        await call.message.edit_text(text, reply_markup=kb)
    except Exception:
        await call.message.answer(text, reply_markup=kb)
    await call.answer()

@router.callback_query(F.data.startswith("adm_act_approve_"))
async def adm_act_approve_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    uid = int(call.data.split("_")[3])
    test_db.approve_user(uid)
    try:
        await bot.send_message(
            chat_id=uid,
            text="🎉 <b>Tabriklaymiz! Admin sizga botdan foydalanish huquqini berdi.</b>",
            reply_markup=main_menu_kb(uid)
        )
    except Exception:
        pass
    await call.answer("✅ Foydalanuvchiga ruxsat berildi!", show_alert=True)
    await admin_view_users_cb(call)

@router.callback_query(F.data.startswith("adm_act_block_"))
async def adm_act_block_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    uid = int(call.data.split("_")[3])
    test_db.block_user(uid)
    try:
        await bot.send_message(
            chat_id=uid,
            text="⛔️ <b>Sizning botdan foydalanish huquqingiz admin tomonidan bekor qilindi va chiqarib yuborildingiz!</b>",
            reply_markup=ReplyKeyboardRemove()
        )
    except Exception:
        pass
    await call.answer("⛔️ Foydalanuvchi botdan chiqarib yuborildi!", show_alert=True)
    await admin_view_users_cb(call)

@router.callback_query(F.data.startswith("adm_act_del_"))
async def adm_act_del_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return
    uid = int(call.data.split("_")[3])
    test_db.delete_user(uid)
    await call.answer("🗑 Foydalanuvchi bazadan o'chirildi!", show_alert=True)
    await admin_view_users_cb(call)

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

    status_badge = "🟢 Faol (O'quvchilar topshirmoqda)" if is_active else "🔴 To'xtatilgan"
    pub_badge = "📢 Natijalar e'lon qilingan" if is_pub else "🔒 Natijalar yashirin (Hali e'lon qilinmagan)"

    text = (
        f"📋 <b>Test boshqaruvi va hisoboti:</b>\n\n"
        f"📖 <b>Nomi:</b> {test['title']}\n"
        f"🔑 <b>Kodi:</b> <code>#{test['test_code']}</code>\n"
        f"📌 <b>Fani:</b> {test.get('subject', 'Matematika')}\n"
        f"🚦 <b>Holati:</b> {status_badge}\n"
        f"📢 <b>Natijalar:</b> {pub_badge}\n\n"
        f"👥 <b>Topshirganlar soni:</b> <b>{count} nafar</b>\n"
        f"📈 <b>O'rtacha ball:</b> <b>{avg_score} ball</b>\n\n"
        f"<i>Quyidagi tugmalar orqali testni to'xtatish, natijalarni ko'rish va o'quvchilarga yuborish mumkin 👇</i>"
    )

    toggle_btn_text = "🔴 Testni to'xtatish" if is_active else "🟢 Testni davom ettirish"
    pub_btn_text = "📢 Natijalarni o'quvchilarga yuborish" if not is_pub else "🔄 Natijalarni qayta yuborish"

    buttons = [
        [InlineKeyboardButton(text=toggle_btn_text, callback_data=f"toggle_test_{test_id}")],
        [InlineKeyboardButton(text=pub_btn_text, callback_data=f"adm_broadcast_results_{test_id}")],
        [
            InlineKeyboardButton(text="📄 Matn shaklida", callback_data=f"adm_restxt_{test_id}"),
            InlineKeyboardButton(text="📑 PDF hisobot", callback_data=f"adm_respdf_{test_id}")
        ],
        [InlineKeyboardButton(text="🧮 Rasch Modeli bo'yicha tahlil (JMLE)", callback_data=f"adm_rasch_{test_id}")],
        [InlineKeyboardButton(text="⬅️ Testlar ro'yxatiga qaytish", callback_data="admin_leaderboard")]
    ]

    try:
        await call.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    except Exception:
        await call.message.answer(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    await call.answer()

@router.callback_query(F.data.startswith("adm_broadcast_results_"))
async def admin_broadcast_results_cb(call: CallbackQuery):
    if not test_db.is_admin(call.from_user.id, ADMIN_ID):
        return

    test_id = int(call.data.split("_")[3])
    test = test_db.get_test_by_id(test_id)
    if not test:
        await call.answer("Test topilmadi!", show_alert=True)
        return

    await call.answer("⏳ Natijalar e'lon qilinmoqda...")
    status_msg = await call.message.answer(
        f"⏳ <b>«{test['title']}»</b> testi bo'yicha Rasch kalibrlanmoqda va o'quvchilarga shaxsiy natijalar yuborilmoqda..."
    )

    # 1. Rasch modeli orqali yakuniy kalibrlash va bazani yangilash
    test_db.evaluate_test_rasch(test_id, auto_update_db=True)

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
        score = sub.get("score", 0.0)
        grade = sub.get("grade", "—")
        corr = sub.get("correct_count", 0)
        name = sub.get("fullname", "Foydalanuvchi")
        code = sub.get("test_code", test["test_code"])

        msg_text = (
            f"📢 <b>DIQQAT! TEST NATIJALARI E'LON QILINDI!</b>\n\n"
            f"Hurmatli <b>{name}</b>, sizning <b>«{test['title']}»</b> (<code>#{code}</code>) testi bo'yicha rasmiy natijangiz:\n\n"
            f"🎖 <b>Milliy Sertifikat darajangiz:</b> <b>{grade}</b> ({score} ball)\n"
            f"✅ <b>To'g'ri javoblar:</b> {corr} / 55 ta band\n"
            f"🕒 <b>E'lon vaqti:</b> {format_uzb_time()}\n\n"
            f"💡 <i>Endi Mini ilovaga kirib, har bir savol bo'yicha to'liq tahlil va to'g'ri kalitlarni ko'rishingiz mumkin!</i>\n\n"
            f"🏆 <i>Ishtirokingiz uchun rahmat!</i>"
        )
        try:
            await bot.send_message(chat_id=uid, text=msg_text)
            sent_count += 1
        except Exception as ex:
            log.warning(f"O'quvchi {uid} ga natija yuborishda xatolik: {ex}")
            fail_count += 1

    fail_text = f"⚠️ Yetkazilmadi (bot bloklangan): {fail_count} ta\n" if fail_count > 0 else ""
    await status_msg.edit_text(
        f"✅ <b>Natijalar muvaffaqiyatli e'lon qilindi!</b>\n\n"
        f"📨 <b>Yuborildi:</b> {sent_count} nafar o'quvchiga\n"
        f"{fail_text}"
        f"📌 <i>Endi barcha o'quvchilar mini ilovada o'z ballari va to'liq javoblar tahlilini ko'ra oladilar.</i>\n\n"
        f"<i>Agar xohlasangiz, testni qayta davom ettirishingiz ham mumkin.</i>"
    )

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

    res = test_db.evaluate_test_rasch(test_id)
    if not res or not res.get("students"):
        await status_msg.edit_text(
            f"⚠️ <b>«{test['title']}»</b> testi uchun Rasch modelini hisoblashning imkoni bo'lmadi.\n\n"
            f"📌 <i>Talab: Rasch modeli ishlashi uchun testni kamida 2 nafar o'quvchi topshirgan bo'lishi kerak.</i>"
        )
        return

    meta = res.get("meta", {})
    students = res.get("students", [])
    items = res.get("items", [])

    text = (
        f"🧮 <b>Rasch Modeli (JMLE) Baholash Natijalari</b>\n\n"
        f"📖 <b>Test:</b> {test['title']} (<code>#{test['test_code']}</code>)\n"
        f"👥 <b>Talabalar:</b> {meta.get('num_students', len(students))} nafar\n"
        f"❓ <b>Elementlar:</b> {meta.get('num_items', len(items))} ta (55 ta band)\n"
        f"🔄 <b>Iteratsiyalar:</b> {meta.get('iterations', 0)} (Konvergensiya: {meta.get('converged', True)})\n\n"
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
                    f"📝 <b>Javob berilgan savollar:</b> {result['correct_count'] + result['incorrect_count']} / 55 ta\n"
                    f"🕒 <b>Topshirilgan vaqt:</b> {format_uzb_time()}\n\n"
                    f"⏳ <b>Eslatma:</b> Test hozirda boshqa o'quvchilar uchun davom etmoqda. "
                    f"Barcha natijalar va Milliy sertifikat darajalari admin tomonidan test to'xtatilib, "
                    f"e'lon qilingandan so'ng botingizga yuboriladi!\n\n"
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

        if success:
            try:
                time_info = f"⏱ <b>Vaqt:</b> {time_limit_min} daqiqa\n" if time_limit_min > 0 else "⏱ <b>Vaqt:</b> Cheksiz\n"
                
                # Fetch the created test from DB to get its ID for the inline keyboard
                t_obj = test_db.get_test_by_code(test_code)
                test_id = t_obj['id'] if t_obj else 0
                
                kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="📥 Ha, PDF yuklayman", callback_data=f"ask_pdf_{test_id}")],
                    [InlineKeyboardButton(text="❌ Yo'q, kerak emas", callback_data=f"no_pdf_{test_id}")]
                ])

                await bot.send_message(
                    chat_id=ADMIN_ID,
                    text=(
                        f"✅ <b>Yangi test yaratildi va e'lon qilindi!</b>\n\n"
                        f"📖 <b>Nomi:</b> {title}\n"
                        f"📌 <b>Fani:</b> {subject}\n"
                        f"{time_info}"
                        f"🎯 <i>Barcha 45 ta savol kalitlari va ballar muvaffaqiyatli saqlandi!</i>\n\n"
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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, 'test_webapp')

# Agar test_webapp yoki undagi fayllar Render diskida mavjud bo'lmasa, avtomatik tiklash
try:
    import web_assets_fallback
    web_assets_fallback.ensure_assets_on_disk(WEB_DIR)
except Exception as _we:
    log.warning(f"Web assets fallback xatoligi: {_we}")

async def find_web_file(filename: str) -> str:
    filename_clean = filename.lstrip('/')
    candidates = [
        os.path.join(WEB_DIR, filename_clean),
        os.path.join(WEB_DIR, 'css', filename_clean),
        os.path.join(WEB_DIR, 'js', filename_clean),
        os.path.join(WEB_DIR, 'img', filename_clean),
        os.path.join(BASE_DIR, filename_clean),
        os.path.join(BASE_DIR, 'css', filename_clean),
        os.path.join(BASE_DIR, 'js', filename_clean),
        os.path.join(BASE_DIR, 'img', filename_clean),
        os.path.join(os.getcwd(), 'test_webapp', filename_clean),
        os.path.join(os.getcwd(), filename_clean),
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.isfile(c):
            return c
    # Fallback: Papkalar bo'ylab qidirish
    target = os.path.basename(filename_clean)
    for root_dir in [WEB_DIR, BASE_DIR, os.getcwd()]:
        if os.path.exists(root_dir):
            for root, dirs, files in os.walk(root_dir):
                if target in files:
                    found = os.path.join(root, target)
                    log.info(f"🔍 Topildi (recursive search): {found}")
                    return found
    return os.path.join(WEB_DIR, filename_clean)

async def handle_index(request):
    fpath = await find_web_file('index.html')
    if os.path.exists(fpath) and os.path.isfile(fpath):
        return web.FileResponse(fpath)
    try:
        import web_assets_fallback
        data, mime = web_assets_fallback.get_asset_bytes('index.html')
        if data:
            return web.Response(body=data, content_type=mime or 'text/html', charset='utf-8')
    except Exception as e:
        log.error(f"index.html yuklashda xatolik: {e}")
    return web.Response(status=404, text="index.html topilmadi")

async def handle_admin(request):
    fpath = await find_web_file('admin.html')
    if os.path.exists(fpath) and os.path.isfile(fpath):
        return web.FileResponse(fpath)
    try:
        import web_assets_fallback
        data, mime = web_assets_fallback.get_asset_bytes('admin.html')
        if data:
            return web.Response(body=data, content_type=mime or 'text/html', charset='utf-8')
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
    resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp

async def handle_static_file(request):
    path_name = request.match_info.get('path', '')
    if '..' in path_name:
        return web.Response(status=403, text="Ruxsat berilmagan yo'l")
    fpath = await find_web_file(path_name)
    if os.path.exists(fpath) and os.path.isfile(fpath):
        resp = web.FileResponse(fpath)
        if any(path_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.ico']):
            resp.headers['Cache-Control'] = 'public, max-age=86400'
        elif any(path_name.endswith(ext) for ext in ['.css', '.js']):
            resp.headers['Cache-Control'] = 'public, max-age=60'
        else:
            resp.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return resp

    # Fallback to embedded in-memory asset
    try:
        import web_assets_fallback
        data, mime = web_assets_fallback.get_asset_bytes(path_name)
        if data:
            resp = web.Response(body=data, content_type=mime or 'application/octet-stream')
            if any(path_name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.ico']):
                resp.headers['Cache-Control'] = 'public, max-age=86400'
            elif any(path_name.endswith(ext) for ext in ['.css', '.js']):
                resp.headers['Cache-Control'] = 'public, max-age=60'
            return resp
    except Exception as e:
        log.error(f"Statik faylni xotiradan yuklashda xatolik ({path_name}): {e}")

    return web.Response(status=404, text="Fayl topilmadi")

# ── ASOSIY MINI APP API ENDPOINTLARI ────────────────────────────────────────

async def handle_app_profile(request):
    """Foydalanuvchi profili va statistikasi (Asosiy Mini App uchun)."""
    try:
        tg_id = int(request.rel_url.query.get('tg_id', 0))
        if not tg_id:
            return web.json_response({"success": False, "message": "tg_id required"}, status=400)

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
            td['is_planned'] = not bool(t.get('is_active', 1))
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
    """Admin tomonidan foydalanuvchi holatini (approved / rejected) o'zgartirish."""
    try:
        data = await request.json()
        admin_id = int(data.get('admin_id', 0))
        target_uid = int(data.get('target_uid', 0))
        new_status = str(data.get('status', '')).strip().lower()

        if not test_db.is_admin(admin_id, ADMIN_ID):
            return web.json_response({"success": False, "message": "Ruxsat yo'q"}, status=403)

        if not target_uid or new_status not in ['approved', 'rejected', 'blocked', 'pending']:
            return web.json_response({"success": False, "message": "Noto'g'ri parametrlar"}, status=400)

        if new_status == 'approved':
            test_db.approve_user(target_uid)
            try:
                await bot.send_message(
                    chat_id=target_uid,
                    text=(
                        "🎉 <b>Xushxabar! Sizga test tizimidan to'liq foydalanishga ruxsat berildi!</b>\n\n"
                        "Endi botdagi barcha imkoniyatlar va Mini ilovadan to'siqsiz foydalanishingiz mumkin.\n"
                        "Test topshirish uchun bot menyusidan foydalaning!"
                    )
                )
            except Exception:
                pass
        elif new_status == 'rejected':
            test_db.reject_user(target_uid)
        elif new_status == 'blocked':
            test_db.block_user(target_uid)

        return web.json_response({"success": True, "status": new_status})
    except Exception as e:
        log.error(f"App Update User Status Error: {e}", exc_info=True)
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
    # Asosiy Mini App API
    app.router.add_get('/api/app/profile', handle_app_profile)
    app.router.add_get('/api/app/active-tests', handle_app_active_tests)
    app.router.add_get('/api/app/my-results', handle_app_my_results)
    app.router.add_get('/api/app/users', handle_app_users)
    app.router.add_post('/api/app/update-user-status', handle_app_update_user_status)
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

async def keep_alive_pinger(url: str):
    """Render.com bepul tarifi uxlamasligi uchun har 5 daqiqada avtomatik so'rov yuborish (24/7 Keep-Alive)."""
    import aiohttp
    log.info(f"🔄 24/7 Keep-Alive xizmati faollashtirildi: {url}")
    await asyncio.sleep(45) # Ilk urinish 45 soniyadan so'ng
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{url}/healthz", timeout=aiohttp.ClientTimeout(total=15)) as resp:
                    if resp.status == 200:
                        log.info("💓 Keep-Alive ping muvaffaqiyatli (Render server faol).")
        except Exception as e:
            log.warning(f"Keep-Alive ping xatosi: {e}")
        await asyncio.sleep(300) # Har 5 daqiqada (300s) qaytariladi

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
        # 24/7 Keep-Alive taskini ishga tushirish (Render uxlamasligi uchun)
        asyncio.create_task(keep_alive_pinger(WEBAPP_URL))
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
