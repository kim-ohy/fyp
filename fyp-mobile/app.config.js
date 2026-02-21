export default {
  expo: {
    name: "ViFall",
    slug: "fyp-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "fypmobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    extra: {
      eas: {
        projectId: "2122d4aa-6317-4592-bfc3-8e749028181a",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#81CAC7",
      },
      edgeToEdgeEnabled: true,
      package: "com.kimohy.fypmobile",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#81CAC7",
          dark: {
            image: "./assets/images/splash-icon.png",
            backgroundColor: "#86CFCF",
          },
        },
      ],
      "expo-notifications",
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
