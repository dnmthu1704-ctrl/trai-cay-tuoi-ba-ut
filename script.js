// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('is-open');
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('is-open'));
});

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
    if (!isOpen) item.classList.add('is-open');
  });
});

// Khuyến mãi "Khách đầu tiên": 1 hộp giá 9.000đ cho khách đặt hàng đầu tiên trong ngày
// Đổi PROMO_DAY (0=CN, 1=T2, ... 6=T7) nếu muốn áp dụng ngày khác, hoặc đặt -1 để áp dụng mọi ngày
const PROMO_DAY = -1; // -1 = áp dụng mọi ngày
const PROMO_TEXT = 'ÁP DỤNG ƯU ĐÃI KHÁCH ĐẦU TIÊN: 1 hộp giá 9.000đ';
let promoClaimed = false;

const isPromoDayToday = PROMO_DAY === -1 || new Date().getDay() === PROMO_DAY;
const promoBanner = document.getElementById('promoBanner');
const promoOverlay = document.getElementById('promoOverlay');
const promoClose = document.getElementById('promoClose');
const promoSkip = document.getElementById('promoSkip');
const promoClaimBtn = document.getElementById('promoClaimBtn');
const promoBannerCta = document.getElementById('promoBannerCta');

function closePromoPopup() {
  promoOverlay.hidden = true;
  sessionStorage.setItem('promoPopupSeen', '1');
}

function claimPromo() {
  promoClaimed = true;
  closePromoPopup();
  const loaiHopSelect = document.querySelector('select[name="loaihop"]');
  const ghiChuField = document.querySelector('textarea[name="ghichu"]');
  if (loaiHopSelect) loaiHopSelect.value = 'Hộp tiêu chuẩn 45K';
  if (ghiChuField && !ghiChuField.value.includes(PROMO_TEXT)) {
    ghiChuField.value = (PROMO_TEXT + (ghiChuField.value ? ' | ' + ghiChuField.value : ''));
  }
  document.getElementById('dat-hang').scrollIntoView({ behavior: 'smooth' });
}

if (isPromoDayToday && promoBanner && promoOverlay) {
  promoBanner.hidden = false;

  if (!sessionStorage.getItem('promoPopupSeen')) {
    setTimeout(() => { promoOverlay.hidden = false; }, 2500);
  }

  promoClose.addEventListener('click', closePromoPopup);
  promoSkip.addEventListener('click', closePromoPopup);
  promoOverlay.addEventListener('click', (e) => {
    if (e.target === promoOverlay) closePromoPopup();
  });
  promoClaimBtn.addEventListener('click', claimPromo);
  promoBannerCta.addEventListener('click', (e) => {
    e.preventDefault();
    claimPromo();
  });
}

// Order form submit -> lưu đơn hàng vào Supabase (database thật)
const SUPABASE_URL = 'https://lpohquwgcptxaeydxoqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_whhH7BmhCJaqdyJ6lZxFtA_60OOGDBd';

const orderForm = document.getElementById('orderForm');
const orderSuccess = document.getElementById('orderSuccess');
const orderError = document.getElementById('orderError');
const promoUsedError = document.getElementById('promoUsedError');

async function checkPhoneUsedPromo(phone) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_used_promo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) return false; // nếu lỗi kiểm tra, không chặn khách đặt hàng
  return res.json();
}

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = orderForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang gửi...';
  if (orderError) orderError.hidden = true;
  if (promoUsedError) promoUsedError.hidden = true;

  const formData = new FormData(orderForm);
  const traiCayChon = formData.getAll('traicay').join(', ');
  const phone = formData.get('sdt');
  let ghiChu = formData.get('ghichu') || null;

  if (promoClaimed) {
    const alreadyUsed = await checkPhoneUsedPromo(phone);
    if (alreadyUsed) {
      promoUsedError.hidden = false;
      promoUsedError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gửi đơn đặt hàng';
      return;
    }
  }

  const payload = {
    ho_ten: formData.get('hoten'),
    so_dien_thoai: phone,
    loai_hop: formData.get('loaihop'),
    so_luong: Number(formData.get('soluong')),
    dia_chi: formData.get('diachi'),
    ghi_chu: ghiChu,
    trai_cay_chon: traiCayChon || null,
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Supabase error: ${res.status}`);

    orderForm.hidden = true;
    orderSuccess.hidden = false;
    orderSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    console.error(err);
    if (orderError) orderError.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Gửi đơn đặt hàng';
  }
});
