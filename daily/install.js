let deferredPrompt;

const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the browser from showing the default prompt
  e.preventDefault();
  deferredPrompt = e;

  // Show the custom install button
  installBtn.style.display = 'inline-block';
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);

  // Hide the button after use
  installBtn.style.display = 'none';
  deferredPrompt = null;
});