import envPaths from "env-paths";
import { AppConst } from "../const.js";
import path from "path";
const config_dir = envPaths(AppConst.appName);

export function getStoragePath(subDir?: string) {
  if (subDir == null) return config_dir.data;
  return path.join(config_dir.data, subDir);
}
