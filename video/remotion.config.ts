import { Config } from "@remotion/cli/config";

// WebGL en headless Chrome (Mac) necesita ANGLE
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
