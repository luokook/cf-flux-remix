import type { FC, ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { json } from "@remix-run/cloudflare";
import { useActionData, Form, useNavigation, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { createAppContext } from "../context";

export const loader: LoaderFunction = async ({ context }) => {
  const appContext = createAppContext(context);
  const { config } = appContext;
  //const models = Object.entries(config.CUSTOMER_MODEL_MAP).map(([id, path]) => ({ id, path }));
  const models = config.CF_TRANSLATE_MODEL;
  return json({ models, config });
  
};

export const action: ActionFunction = async ({ request, context }: { request: Request; context: any }) => {
  const appContext = createAppContext(context);
  const { aiTranslationService, config } = appContext;

  console.log("Translation action started");
  console.log("Config:", JSON.stringify(config, null, 2));

  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const enhance = formData.get("enhance") === "true";
  const modelId = formData.get("model") as string;
  const lang1 = formData.get("lang1") as string;
  const lang2 = formData.get("lang2") as string;
  
  console.log("Form data:", { prompt, enhance, modelId, lang1, lang2});

  if (!prompt) {
    return json({ error: "没有句子" }, { status: 400 });
  }

 //const model = config.CUSTOMER_MODEL_MAP[modelId];
  const model = modelId;
  if (!model) {
    return json({ error: "无效的模型" }, { status: 400 });
  }

  try {
    const result = await aiTranslationService.aiTranslation(
      enhance ? `---tl ${prompt}` : prompt,
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
  const [enhance, setEnhance] = useState(false);
  const [model, setModel] = useState(config.CF_TRANSLATE_MODEL);
  const [lang1, setLang1] = useState("zh");
  const [lang2, setLang2] = useState("en");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const handleEnhanceToggle = () => {
    setEnhance(!enhance);
  };

  const handleReset = () => {
    setPrompt("");
    setEnhance(false);
    setModel(config.CF_TRANSLATE_MODEL);
    setLang1("zh");
    setLang2("en");  
  };

  const promptx = [
      "人工智能女孩的情感肖像全文，充满活力，超真实，详细，民族穿着，平静，白发，白皙的皮肤，宇宙大眼睛，https://s.mj.run/6EOJlsWCpyo https://s.mj.run/OKHH6Y8khD8 --chaos 60 --ar 9:16 --style raw --sref https://s.mj.run/7C6AG2__q_k --personalize anycl7a --stylize 1000 --v 6.1",
 "现代微型风格的等距房屋内部，1英尺，照片逼真渲染 --ar 16:9 --style raw --stylize 400 --v 6.1",
      "夜晚是一个漆黑、白雪皑皑的阿尔卑斯山村庄，乡村窗户上闪烁着淡淡的金光，周围是高耸而阴暗的山脉; 3D，不切实际。 --ar 9:16",
     "一位美丽的白发仙女，长着翅膀，晚上坐在魔法森林中长满青苔的地面上，周围环绕着发光的萤火虫，举起魔杖施展魔法。艺术家詹姆斯·C·风格的丰富多彩的奇幻插图。克里斯滕森，插图的黄金时代，发光的，年长的领主，约翰·鲍尔凯·尼尔森埃德蒙·杜拉克，蒂姆·沃克，宾得克k1000，色彩鲜艳，深红色和紫色，以及绿色。 --ar 3:4 --personalize ioa83pi --v 6.1",
       "维多利亚风格的房间采用空灵、柔和的绿色和蓝色调色板，捕捉到一种褪色的宏伟感。一位头发飘逸的女子背对着观众站着，穿着一件与房间精致纹理融为一体的复古礼服。巨大的、超现实的花朵--玫瑰和百合花--充满了她周围的空间，它们的花瓣擦着墙壁和天花板。一只帝王般的白孔雀优雅地栖息在华丽的椅子上，为场景增添了梦幻般的神奇气质。柔和的漫光透过透明窗帘过滤，投射出柔和的阴影。 --ar 4:3 --s 50 --v 6.1 --style raw",
"金色亡灵节吊坠，复杂的2D矢量几何图形，剪切形状吊坠，蓝图框架线条锐利边缘，svg矢量风格，产品工作室拍摄", 
"100mm 等距浮岛照片，超现实火山，错综复杂，细节丰富，behance，微观世界平滑，微距锐利聚焦，居中",
"微小可爱的等距瓷杯咖啡，柔光，色彩柔和，100 毫米镜头，3D Blender 渲染，polycount 趋势，模块化建构主义，蓝色背景，物理渲染，居中",
"100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered",
"小巧可爱的忍者玩具、站立的角色、柔和平滑的光线、柔和的粉彩、Skottie Young、3D Blender 渲染、多边形、模块化建构主义、流行超现实主义、基于物理的渲染、正方形图像",
"多层剪影山脉，天空中大火箭的剪影，边缘锐利，日落时分，空气中弥漫着浓雾，矢量风格，地平线剪影 景观壁纸，由 Alena Aenami 制作，看火游戏风格，矢量风格背景",
"Tiny cute isometric temple, soft smooth lighting, soft colors, soft colors, 100mm lens, 3d blender render, trending on polycount, modular constructivism, blue blackground, physically based rendering, centered",
"天空中等距浮岛的 100 毫米照片，超现实火山，复杂，高细节，behance，微观世界平滑，微距锐利焦点，居中",
"头戴花冠的黑人女孩面部特写，光滑柔嫩的皮肤，梦幻般的大眼睛，美丽精致的彩色头发，对称的动漫大眼睛，柔和的光线，细致的面部，由新海诚、stanley artgerm lau、wlop、rossdraws 制作，概念艺术，数字绘画，正对镜头",
"2d ferocious lion head, vector illustration, angry eyes, football team emblem logo, 2d flat, centered",
"卡哇伊低多边形熊猫角色，3D 等距渲染，白色背景，环境闭塞，unity 引擎",
 "金色长发的时间女神，身着飘逸的绿松石至蓝色渐变魔法长袍。她五官精致，双手各持一件魔法武器，每件武器上都有一个时钟吊坠。在她身后，代表时间的光环熠熠生辉，周围环绕着象征时间和空间魔法的漩涡能量。这个场景迷人而神秘，捕捉到了时间和空间的本质",
"3d毛茸茸的美洲驼，可爱的特写，可爱的圆形反光大眼睛，长长的绒毛，皮克斯渲染，虚幻引擎电影流畅，复杂的细节，电影",
 "在夏日的晚风中，一个可爱的女孩安详地躺在秋天的草坪上，感受着轻柔的风，远处的枫叶飘落",
"万圣节南瓜的催眠插图，Dan Mumford 的催眠迷幻艺术，流行超现实主义，深色荧光霓虹灯涂料，神秘，Behance",
"微小可爱的等距寺庙, 柔和平滑的灯光, 柔和的色彩, 柔和的色彩, 100mm 镜头, 3d blender 渲染, 聚数趋势, 模块化建构主义, 蓝色黑色背景, 基于物理的渲染, 居中",
    "C4D 3D渲染，Q版卡通风格，全身，拟人化感，一个可爱的美国小男孩，身上穿着红紫色运动衫，里面穿着黑紫色运动裤，和一群外星小怪物玩恐怖游戏，怪物头在空中弹跳，设计特点：Pop Mart盲盒玩具、鲜艳的色彩、明亮的图像、迪士尼皮克斯趋势、电影灯光、精湛的细节、高分辨率、最佳的细节 --ar 9：16",
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
              <button
                type="button"
                onClick={handleResetprompt}
                className="absolute right-4 px-4 py-2 mx-1 border-dashed  border-2 border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-450 via-yellow-600 to-yellow-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
                >
                随机句子
              </button>
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
              id="size"
              name="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
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
              onChange={(e) => setSize(e.target.value)}
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
        
        {actionData && actionData.translatedPrompt && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-shadow">译文：</h2>
            <div alt="译文" className="w-full rounded-xl shadow-lg" >
              {`译文大意：${actionData.translatedPrompt}`}
            </div>
        )}
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-1000 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000 -z-10"></div>
       
      </div>
    </div>
  );
};

export default TranslationAi;
