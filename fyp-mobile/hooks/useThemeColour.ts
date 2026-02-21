import { themes } from "@/constants/themes";
import { useTheme } from "@/contexts/ThemeContext";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof themes.light & keyof typeof themes.dark,
) {
  const { isDark } = useTheme();
  const theme = isDark ? "dark" : "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return themes[theme][colorName];
  }
}
