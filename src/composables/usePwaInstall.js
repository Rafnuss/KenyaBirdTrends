import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";

/** Wraps the `beforeinstallprompt` handshake behind an install button. */
export function usePwaInstall() {
  const canInstall = ref(false);
  const deferred = shallowRef(null);

  function onBeforeInstallPrompt(event) {
    // Suppress the mini-infobar so the app can offer install on its own terms.
    event.preventDefault();
    deferred.value = event;
    canInstall.value = true;
  }

  onMounted(() => window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt));
  onBeforeUnmount(() => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt));

  async function promptInstall() {
    if (!deferred.value) return;
    deferred.value.prompt();
    await deferred.value.userChoice;
    // The event can only be used once.
    deferred.value = null;
    canInstall.value = false;
  }

  return { canInstall, promptInstall };
}
