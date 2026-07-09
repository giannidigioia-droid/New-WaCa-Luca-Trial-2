// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_udnxwt2';
const EMAILJS_TEMPLATE_ID = 'template_72hewse';
const EMAILJS_PUBLIC_KEY = '8lE8ILbaH1QxsXjFJ';
const GOOGLE_ADS_SEND_TO = 'AW-17975995747/pl2CCPyc1f4bEOPaz_tC';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

function gtag_report_conversion() {
  try {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: GOOGLE_ADS_SEND_TO,
        value: 1.0,
        currency: 'EUR',
      });
    }
  } catch {
    // never block UX
  }
  return false;
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function submitForm(event) {
  event.preventDefault();
  
  const formStatus = document.getElementById('formStatus');
  formStatus.className = '';
  formStatus.textContent = '';

  // Get form values
  const apt = document.getElementById('f-apt').value.trim();
  const fullName = document.getElementById('f-name').value.trim();
  const checkIn = document.getElementById('f-checkin').value;
  const checkOut = document.getElementById('f-checkout').value;
  const adults = document.getElementById('f-adults').value;
  const children = document.getElementById('f-children').value;
  const email = document.getElementById('f-email').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const notes = document.getElementById('f-notes').value.trim();

  // Validation
  if (!apt || !fullName || !checkIn || !checkOut || !adults) {
    formStatus.className = 'error';
    formStatus.textContent = 'Per favore compila tutti i campi obbligatori.';
    return;
  }

  if (checkOut <= checkIn) {
    formStatus.className = 'error';
    formStatus.textContent = 'Il check-out deve essere dopo il check-in.';
    return;
  }

  if (!email && !phone) {
    formStatus.className = 'error';
    formStatus.textContent = 'Inserisci almeno un contatto (email o telefono).';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    formStatus.className = 'error';
    formStatus.textContent = 'Email non valida.';
    return;
  }

  if (phone && phone.replace(/\s+/g, '').length < 6) {
    formStatus.className = 'error';
    formStatus.textContent = 'Numero di telefono non valido.';
    return;
  }

  // Calculate nights
  const nights = calculateNights(checkIn, checkOut);

  // Prepare template parameters matching the React component
  const templateParams = {
    title: 'Richiesta disponibilità WaCa',
    name: fullName || 'Ospite WaCa',
    apartment: apt,
    checkin: checkIn,
    checkout: checkOut,
    nights: String(nights),
    adults: String(adults),
    children: String(children),
    email: email || '-',
    phone: phone || '-',
    notes: notes || '-',
  };

  // Show loading state
  const submitBtn = event.target.querySelector('.form-submit');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Invio in corso...';

  // Send email
  emailjs
    .send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )
    .then(() => {
      gtag_report_conversion();
      formStatus.className = 'success';
      formStatus.textContent =
        '✅ Richiesta inviata correttamente. Ti rispondiamo a breve.';
      event.target.reset();
      document.getElementById('f-adults').value = '2';
      document.getElementById('f-children').value = '0';
    })
    .catch((error) => {
      console.error('EmailJS Error:', error);
      formStatus.className = 'error';
      formStatus.textContent =
        'Si è verificato un problema nell\'invio della richiesta. Ti consigliamo di contattarci via WhatsApp.';
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
}

function calculateFormNights() {
  const checkIn = document.getElementById('f-checkin').value;
  const checkOut = document.getElementById('f-checkout').value;
  const nightsInput = document.getElementById('f-nights');

  if (!checkIn || !checkOut) {
    nightsInput.value = '—';
    return;
  }

  const nights = calculateNights(checkIn, checkOut);
  nightsInput.value = nights > 0 ? nights : '—';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-checkin')?.addEventListener('change', calculateFormNights);
  document.getElementById('f-checkout')?.addEventListener('change', calculateFormNights);
});
