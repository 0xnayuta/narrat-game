import "narrat/dist/narrat.css";
import "./css/main.css";
import { createApp } from "vue";
import { registerPlugin, startApp } from "narrat";
import DemoApp from "./app/DemoApp.vue";
import scripts from "./scripts";
import config from "./config";
import { strings } from "./strings/strings";
import { DEBUG, USE_DEMO_UI, USE_STEAM } from "./constants";
import { SteamPlugin } from "./steam-plugin";

window.addEventListener("load", () => {
  if (USE_DEMO_UI) {
    createApp(DemoApp).mount("#game-holder");
    return;
  }

  let steam: SteamPlugin | undefined;
  if (USE_STEAM) {
    steam = new SteamPlugin();
    registerPlugin(steam);
  }
  startApp({
    debug: DEBUG,
    logging: false,
    scripts,
    config,
    localization: {
      debug: DEBUG,
      lng: "en",
      resources: {
        // Puts all the string translation files we have in there
        ...strings,
      },
    },
  });
});
