import { Config } from "@remotion/cli/config";

// WebGL en headless Chrome (Mac) necesita ANGLE
Config.setChromiumOpenGlRenderer("angle");
// png y no jpeg: los frames van sin perdida al encoder. Las escenas son lineas
// finas teal sobre navy casi negro, y el ringing de jpeg se come justo esos bordes.
Config.setVideoImageFormat("png");
// 23 es indistinguible de 20 en este contenido y pesa ~27% menos
Config.setCrf(23);
Config.setOverwriteOutput(true);
