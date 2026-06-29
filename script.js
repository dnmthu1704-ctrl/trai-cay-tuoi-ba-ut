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

// Order form submit -> lưu đơn hàng vào Supabase (database thật)
const SUPABASE_URL = 'https://lpohquwgcptxaeydxoqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_whhH7BmhCJaqdyJ6lZxFtA_60OOGDBd';

const orderForm = document.getElementById('orderForm');
const orderSuccess = document.getElementById('orderSuccess');
const orderError = document.getElementById('orderError');

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = orderForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang gửi...';
  if (orderError) orderError.hidden = true;

  const formData = new FormData(orderForm);
  const payload = {
    ho_ten: formData.get('hoten'),
    so_dien_thoai: formData.get('sdt'),
    loai_hop: formData.get('loaihop'),
    so_luong: Number(formData.get('soluong')),
    dia_chi: formData.get('diachi'),
    ghi_chu: formData.get('ghichu') || null,
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
