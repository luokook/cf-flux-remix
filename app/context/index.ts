import type { AppLoadContext } from "@remix-run/cloudflare";
import { ImageGenerationService } from "../services/imageGeneration";
import { AiTranslationService } from "../services/aiTranslation";
import { getConfig } from "../config";

export function createAppContext(context: AppLoadContext) {
  const config = getConfig(context.cloudflare.env);
  return {
    imageGenerationService: new ImageGenerationService(config),
    aiTranslationService: new AiTranslationService(config),
    config,
    // 其他服务...
  };
}

export type AppContext = ReturnType<typeof createAppContext>;
