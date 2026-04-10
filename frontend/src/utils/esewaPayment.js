// src/utils/esewaPayment.js
// Submits a hidden form to eSewa sandbox gateway

export const redirectToEsewa = ({ url, formData }) => {
  // Remove any existing form to avoid duplicates
  const existing = document.getElementById('esewa-payment-form');
  if (existing) existing.remove();

  const form = document.createElement('form');
  form.id     = 'esewa-payment-form';
  form.method = 'POST';
  form.action = url;

  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};