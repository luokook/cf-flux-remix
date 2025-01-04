
import { AppError } from '../utils/error';
import { Config } from '../config';

export class AiTranslationService {
  constructor(private config: Config) {}

  async aiTranslation(prompt: string, lang1: string, lang2: string, model: string ): Promise<{ prompt: string, translatedPrompt: string }> {
    const translatedPrompt1 = "";
    //prompt = prompt ? prompt :"你好!";
    //model = model ? model :this.config.CF_IS_TRANSLATE;
   // lang1 = lang1 ? lang1 :"zh";
   // lang2 = lang2 ? lang2 :"en";
    
    const isModel = model === this.config.CF_TRANSLATE_MODEL_MAP["qwen1.5-14b-chat-awq"];
    
      translatedPrompt1 = isModel ? 
        await this.translatePrompt(prompt, lang1, lang2, model) :
        await this.translatePrompt(prompt, lang1, lang2, model);
      
     console.log("Translated prompt:", translatedPrompt);
    return {
      prompt,
      translatedPrompt : translatedPrompt1
      
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
            content: `作为 Google 或者 百度 翻译专家，您将进行从给出的文本中创建译文。
请遵循以下规则：
1. 将中文翻译成英文，其它语言也翻译成英文。
2. 不要翻译链接地址。
3. 不要翻译数字和特殊字符，如 ()[]{}。
4. 输出格式应为单行文本，不包含换行符。`
          },
          {
            role: "user",
            content: `请翻译以下文本：${prompt}`
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
