import type { FC, ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { json } from "@remix-run/cloudflare";
import { useActionData, Form, useNavigation, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { createAppContext } from "../context";

export const loader: LoaderFunction = async ({ context }) => {
  const appContext = createAppContext(context);
  const { config } = appContext;
  const models = Object.entries(config.CF_TRANSLATE_MODEL_MAP).map(([id, path]) => ({ id, path }));
  return json({ models, config });
  
};

export const action: ActionFunction = async ({ request, context }: { request: Request; context: any }) => {
  const appContext = createAppContext(context);
  const { aiTranslationService, config } = appContext;

  console.log("Translation action started");
  console.log("Config:", JSON.stringify(config, null, 2));

  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const modelId = formData.get("model") as string;
  const lang1 = formData.get("lang1") as string;
  const lang2 = formData.get("lang2") as string;
  
  
  console.log("Form data:", { prompt, modelId, lang1, lang2});

  if (!prompt) {
    return json({ error: "没有句子" }, { status: 400 });
  }

 const model = config.CF_TRANSLATE_MODEL_MAP[modelId];
  if (!model) {
    return json({ error: "无效的模型" }, { status: 400 });
  }

  try {
    const result = await aiTranslationService.aiTranslation(
      prompt,
      lang1,
      lang2,
      model
    );
    console.log("Translation successful");
    return json(result);
  } catch (error) {
    console.error("翻译时出错:", error);
    if (error instanceof AppError) {
      return json({ error: `翻译失败: ${error.message}` }, { status: error.status || 500 });
    }
    return json({ error: "翻译失败: 未知错误" }, { status: 500 });
  }
};

const TranslationAi: FC = () => {
  const { models, config } = useLoaderData<typeof loader>();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(config.CF_TRANSLATE_MODEL);
  const [lang1, setLang1] = useState("zh");
  const [lang2, setLang2] = useState("en");
  const [text, setText] = useState("");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const handleReset = () => {
    setPrompt("");
    setEnhance(false);
    setModel(config.CF_TRANSLATE_MODEL);
    setLang1("zh");
    setLang2("en");  
  };

  const promptx = [
          "夜晚是一个漆黑、白雪皑皑的阿尔卑斯山村庄，乡村窗户上闪烁着淡淡的金光",
     "一位美丽的白发仙女，长着翅膀，晚上坐在魔法森林中长满青苔的地面上，周围环绕着发光的萤火虫，举起魔杖施展魔法",
       "头戴花冠的黑人女孩面部特写，光滑柔嫩的皮肤，梦幻般的大眼睛，美丽精致的彩色头发，对称的动漫大眼睛，柔和的光线，细致的面部",
"金色长发的时间女神，身着飘逸的绿松石至蓝色渐变魔法长袍。她五官精致，双手各持一件魔法武器，每件武器上都有一个时钟吊坠。在她身后，代表时间的光环熠熠生辉，周围环绕着象征时间和空间魔法的漩涡能量。这个场景迷人而神秘，捕捉到了时间和空间的本质",
"3d毛茸茸的美洲驼，可爱的特写，可爱的圆形反光大眼睛，长长的绒毛，皮克斯渲染，虚幻引擎电影流畅，复杂的细节，电影",
 "在夏日的晚风中，一个可爱的女孩安详地躺在秋天的草坪上，感受着轻柔的风，远处的枫叶飘落",
"春风得意马蹄疾，一日看尽长安花",
    "大江东去浪淘尽",
    "你好，朋友",
    "月朗星稀，乌鹊南飞，皎皎明月，何时可掇",
    "早上好，今天要做什么",
    "春风得意马蹄疾，一日看尽长安花",
"江上孤舟，远处青山，中国水墨画，飞鸟高飞"
    ];
  
  /*生成min到max之间的随机整数*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
  }
  const handleResetprompt = () => {
    
    setPrompt(promptx[getRandomInt(0, promptx.length-1)]);
    
  };

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (isSubmitting) {
      e.preventDefault();
    }
  };

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-800 via-green-500 to-blue-800 px-4">
      <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-3xl w-full">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg text-shadow">
            AI翻译
        </h1>
        <Form method="post" className="relative space-y-8" onSubmit={handleSubmit}>
          <div className="">
            <label htmlFor="prompt" className="relative block py-2 mb-2 text-white text-lg font-semibold text-shadow">
              原始句子(中文)：
              
            </label>
            <textarea
              type="text"
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={handlePromptChange}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-pretty font-bold text-white text-2xl placeholder-white placeholder-opacity-70 transition duration-300 ease-in-out hover:bg-opacity-30" 
              rows="5"
              placeholder="请输入您的句子..."
              required
             ></textarea>  
            <button
                type="button"
                onClick={handleResetprompt}
                className="absolute right-4 px-4 py-2 mx-1 border-dashed  border-2 border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-450 via-yellow-600 to-yellow-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
                >
                随机句子
              </button>
          </div>


          <div>
            <label htmlFor="model" className="block text-white text-lg font-semibold mb-3 text-shadow">
              选择翻译模型：
            </label>
            <select
              id="model"
              name="model"
              value={model}
              onChange={handleModelChange}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="size" className="block text-white text-lg font-semibold mb-3 text-shadow">
              原始语言：
            </label>
            <select
              id="lang1"
              name="lang1"
              value={lang1}
              onChange={(e) => setLang1(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              <option value="zh">中文</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="size" className="block text-white text-lg font-semibold mb-3 text-shadow">
              目标语言：
            </label>
            <select
              id="lang2"
              name="lang2"
              value={lang2}
              onChange={(e) => setLang2(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              <option value="en">英文</option>
            </select>
          </div>
          
          <div className="flex sm:flex-row justify-between space-y-4 sm:space-y-0">
          <button
              type="submit"
              className={`flex-1 px-5 py-3 mx-2 shadow-xl text-lg font-bold text-white transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400
                          ${isSubmitting ? "rounded-full bg-gradient-to-r from-purple-700 via-pink-400 to-red-700 cursor-not-allowed" : "rounded-xl bg-gradient-to-r from-purple-700 via-green-500 to-blue-700"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "翻译中..." : "翻译"}
            </button>
            
            
            <input type="hidden" name="enhance" value={enhance.toString()} />
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-5 py-3 mx-2 rounded-xl border-dashed border-2 border-white-800 text-lg font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xl"
              disabled={isSubmitting}
            >
              重置输入
            </button>
          </div>
          
        </Form>
        
            
             <div id="text" 
             className="w-full px-5 py-3 rounded-xl border-dashed border-[3px] border-white-800 text-lg font-semibold text-white" 
            >
             等待翻译结果...
           </div>  
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-1000 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000 -z-10"></div>
       
      </div>
    </div>
  );
};

export default TranslationAi;
