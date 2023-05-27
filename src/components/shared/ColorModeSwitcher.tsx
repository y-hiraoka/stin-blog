"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import styles from "./ColorModeSwitcher.module.scss";
import { MdDarkMode, MdDevices, MdLightMode } from "react-icons/md";
import { isColorModeValue, useColorMode } from "../../lib/colorMode";

export const ColorModeSwitcher: React.FC = () => {
  const { colorMode, setColorMode } = useColorMode();

  return (
    <ToggleGroup.Root
      className={styles.switcher}
      type="single"
      value={colorMode}
      onValueChange={value => isColorModeValue(value) && setColorMode(value)}
      aria-label="カラーモード設定"
      data-value={colorMode}>
      <ToggleGroup.Item
        className={styles.switcherButton}
        value="light"
        aria-label="ライトモードにする">
        <MdLightMode />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={styles.switcherButton}
        value="system"
        aria-label="OSに従う">
        <MdDevices />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        className={styles.switcherButton}
        value="dark"
        aria-label="ダークモードにする">
        <MdDarkMode />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};
