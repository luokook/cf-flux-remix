
import { AppError } from '../utils/error';
import { Config } from '../config';

export class AiTranslationService {
  constructor(private config: Config) {}

  async aiTranslation(prompt: string, lang1: string, lang2: string, model: string ): Promise<{ prompt: string, translatedPrompt: string, lang1: string, lang2: string }> {
    let translatedPrompt= "sorry, world!";
    //prompt = prompt ? prompt :"你好!";
    //model = model ? model :this.config.CF_IS_TRANSLATE;
   // lang1 = lang1 ? lang1 :"zh";
   // lang2 = lang2 ? lang2 :"en";
    
    const isModel = model === this.config.CF_TRANSLATE_MODEL_MAP["qwen1.5-14b-chat-awq"];
    
    try {
      translatedPrompt = isModel ? 
        await this.translatePrompt(prompt, lang1, lang2, model) :
        await this.translatePrompt(prompt, lang1, lang2, model);
      } catch (error) {
      console.error("Error in Translation:", error);
      throw error;
    }
     console.log("Translated prompt:", translatedPrompt);
    return {
      prompt,
      translatedPrompt,
      lang1,// 原语言
      lang2,// 目标语言
      model
    };
  }

  private async translatePrompt(prompt: string, lang1: string, lang2: string, model: string): Promise<string> {
    if (!model) {
      console.error("翻译模型未设置");
      return prompt;// 如果失败,返回原始提示词
    }

    try {
      const response = await this.postRequest(model, {
        messages: [
          {
            role: "system",
            content: `作为 Stable Diffusion Prompt 提示词专家，您将从关键词中创建提示，通常来自 Danbooru 等数据库。
请遵循以下规则：
1. 保持原始关键词的顺序。
2. 将中文关键词翻译成英文。
3. 添加相关的标签以增强图像质量和细节。
4. 使用逗号分隔关键词。
5. 保持简洁，避免重复。
6. 不要使用 "和" 或 "与" 等连接词。
7. 保留原始提示中的特殊字符，如 ()[]{}。
8. 不要添加 NSFW 内容。
9. 输出格式应为单行文本，不包含换行符。`
          },
          {
            role: "user",
            content: `请优化并翻译以下提示词：${prompt}`
          }
        ]
      });

      const jsonResponse = await response.json();
      return jsonResponse.result.response.trim();
    } catch (error) {
      console.error("翻译出错:", error);
      return prompt; // 如果翻译失败,返回原始提示词
    }
  }

  

  private async postRequest(model: string, jsonBody: any): Promise<Response> {
    const account = this.config.CF_ACCOUNT_LIST[Math.floor(Math.random() * this.config.CF_ACCOUNT_LIST.length)];
    const url = `https://api.cloudflare.com/client/v4/accounts/${account.account_id}/ai/run/${model}`;
    const headers = {
      'Authorization': `Bearer ${account.token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jsonBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Cloudflare API request failed: ${response.status}`, errorText);
        throw new AppError(`Cloudflare API request failed: ${response.status} - ${errorText}`, response.status);
      }

      return response;
    } catch (error) {
      console.error("Error in postRequest:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to connect to Cloudflare API', 500);
    }
  }


}
