import type { FC, ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { json } from "@remix-run/cloudflare";
import { useActionData, Form, useNavigation, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { createAppContext } from "../context";

export const loader: LoaderFunction = async ({ context }) => {
  const appContext = createAppContext(context);
  const { config } = appContext;
  const models = Object.entries(config.CUSTOMER_MODEL_MAP).map(([id, path]) => ({ id, path }));
  return json({ models, config });
};

export const action: ActionFunction = async ({ request, context }: { request: Request; context: any }) => {
  const appContext = createAppContext(context);
  const { imageGenerationService, config } = appContext;

  console.log("Generate image action started");
  console.log("Config:", JSON.stringify(config, null, 2));

  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const enhance = formData.get("enhance") === "true";
  const modelId = formData.get("model") as string;
  const size = formData.get("size") as string;
  const numSteps = parseInt(formData.get("numSteps") as string, 10);

  console.log("Form data:", { prompt, enhance, modelId, size, numSteps });

  if (!prompt) {
    return json({ error: "未找到提示词" }, { status: 400 });
  }

  const model = config.CUSTOMER_MODEL_MAP[modelId];
  if (!model) {
    return json({ error: "无效的模型" }, { status: 400 });
  }

  try {
    const result = await imageGenerationService.generateImage(
      enhance ? `---tl ${prompt}` : prompt,
      model,
      size,
      numSteps
    );
    console.log("Image generation successful");
    return json(result);
  } catch (error) {
    console.error("生成图片时出错:", error);
    if (error instanceof AppError) {
      return json({ error: `生成图片失败: ${error.message}` }, { status: error.status || 500 });
    }
    return json({ error: "生成图片失败: 未知错误" }, { status: 500 });
  }
};

const GenerateImage: FC = () => {
  const { models, config } = useLoaderData<typeof loader>();
  const [prompt, setPrompt] = useState("");
  const [enhance, setEnhance] = useState(false);
  const [model, setModel] = useState(config.CUSTOMER_MODEL_MAP["FLUX.1-Schnell-CF"]);
  const [size, setSize] = useState("1024x1024");
  const [numSteps, setNumSteps] = useState(config.FLUX_NUM_STEPS);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const handleEnhanceToggle = () => {
    setEnhance(!enhance);
  };

  const handleReset = () => {
    setPrompt("");
    setEnhance(false);
    setModel(config.CUSTOMER_MODEL_MAP["FLUX.1-Schnell-CF"]);
    setSize("1024x1024");
    setNumSteps(config.FLUX_NUM_STEPS);
  };

  const promptx = [
      "猫和老鼠追逐，经典动画情节",
      "(masterpiece:1.2), best quality,PIXIV,cozy animation scenes,scenery, building, sky, (low angle view:1.5)",
      "gold dia de los muertos pendant, intricate 2d vector geometric, cutout shape pendant, blueprint frame lines sharp edges, svg vector style, product studio shoot",
      "浅紫A5封面，白色芙蓉浮雕，上面浮雕标题“艳”，头版右侧白色标签，正面视图，木刻印花风格，白底，彩色铅笔画小笔，极简主义。 --ar 34:47",
      "人工智能女孩的情感肖像全文，充满活力，超真实，详细，民族穿着，平静，白发，白皙的皮肤，宇宙大眼睛，https://s.mj.run/6EOJlsWCpyo https://s.mj.run/OKHH6Y8khD8 --chaos 60 --ar 9:16 --style raw --sref https://s.mj.run/7C6AG2__q_k --personalize anycl7a --stylize 1000 --v 6.1",
      "3d fluffy llama, closeup cute and adorable, cute big circular reflective eyes, long fuzzy fur, Pixar render, unreal engine cinematic smooth, intricate detail, cinematic",
      "Closeup face portrait of a black girl wearing crown of flowers, smooth soft skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting,detailed face, by makoto shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
      "现代微型风格的等距房屋内部，1英尺，照片逼真渲染 --ar 16:9 --style raw --stylize 400 --v 6.1",
      "夜晚是一个漆黑、白雪皑皑的阿尔卑斯山村庄，乡村窗户上闪烁着淡淡的金光，周围是高耸而阴暗的山脉; 3D，不切实际。 --ar 9:16",
      "On a summer evening breeze, a lovely girl lies peacefully on the autumn lawn, feeling the gentle wind blowing, with autumn maple leaves falling in the distance.",
      "hologram of a wolf floating in space, a vibrant digital illustration, dribbble, quantum wavetracing, black background, behance hd",
      "一位美丽的白发仙女，长着翅膀，晚上坐在魔法森林中长满青苔的地面上，周围环绕着发光的萤火虫，举起魔杖施展魔法。艺术家詹姆斯·C·风格的丰富多彩的奇幻插图。克里斯滕森，插图的黄金时代，发光的，年长的领主，约翰·鲍尔凯·尼尔森埃德蒙·杜拉克，蒂姆·沃克，宾得克k1000，色彩鲜艳，深红色和紫色，以及绿色。 --ar 3:4 --personalize ioa83pi --v 6.1",
       "维多利亚风格的房间采用空灵、柔和的绿色和蓝色调色板，捕捉到一种褪色的宏伟感。一位头发飘逸的女子背对着观众站着，穿着一件与房间精致纹理融为一体的复古礼服。巨大的、超现实的花朵--玫瑰和百合花--充满了她周围的空间，它们的花瓣擦着墙壁和天花板。一只帝王般的白孔雀优雅地栖息在华丽的椅子上，为场景增添了梦幻般的神奇气质。柔和的漫光透过透明窗帘过滤，投射出柔和的阴影。 --ar 4:3 --s 50 --v 6.1 --style raw",
        "100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered",
       "A goddess of time with long golden hair, dressed in a flowing turquoise-to-blue gradient magical gown. She has delicate features, holding a magical weapon in each hand, each adorned with a clock pendant. Behind her, a radiant halo representing time glows, surrounded by swirling energies that symbolize time and space magic. The scene is enchanting and mystical, capturing the essence of both time and space. ",
       "复古风格油画，巴黎景观，1930年 --ar 3:2 --v 6.1 --s 50",
      "詹姆斯·C·克里斯滕森（James C Christensen）的油画是一幅大约1750年的著名科学家，穿着那个时代的上流社会服装，坐在古典建筑的休息室里，摆着他们的行业工具，爱德华·兰西尔（Edward Landseer）风格的戏剧性灯光 --s 200 --ar 5:8 --v 6.1",
      "充满活力的场景捕捉了金·琼斯（Kim Jones）设想的迪奥2029年春季系列的精髓，展现了传统与颠覆之间的平衡，一位20岁的时尚达人散发着迪奥模特的优雅，同时展示了2029年的未来派服装，她快乐的表情为时尚的办公室增添了光彩，一只大鹿和异想天开的动物增强了视觉叙事，使用尼康Z9无反光镜数码相机拍摄，85毫米镜头，f/1.8,16 K分辨率， --ar 9：16 --stylize 500 --v 6.1",
       "充满活力的三层维多利亚式房屋 --ar 16:9",
       "Tiny cute isometric living room in a cutaway box, soft smooth lighting, soft colors, purple and blue color scheme, soft colors, 100mm lens, 3d blender render",
       "Furry:: 1.3 monster, cub, 4 claws, cute, (snow+snow), super high resolution, perfection, masterpiece, atmosphere",
      "皮卡丘在沙滩上晒日光浴，卡通，3d风格",
      "地球爆炸，3d风格，世界末日",
      "C4D 3D渲染，Q版卡通风格，全身，拟人化感，一个可爱的美国小男孩，身上穿着红紫色运动衫，里面穿着黑紫色运动裤，和一群外星小怪物玩恐怖游戏，怪物头在空中弹跳，设计特点：Pop Mart盲盒玩具、鲜艳的色彩、明亮的图像、迪士尼皮克斯趋势、电影灯光、精湛的细节、高分辨率、最佳的细节 --ar 9：16",
       "太极八卦，中国水墨画"
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
            AI绘画 (Flux|SD)
        </h1>
        <Form method="post" className="relative space-y-8" onSubmit={handleSubmit}>
          <div className="">
            <label htmlFor="prompt" className="relative block py-2 mb-2 text-white text-lg font-semibold text-shadow">
              提示词(支持中文)：
              <button
              type="button"
              onClick={handleResetprompt}
              className="absolute right-4 px-4 py-2 mx-1 border-dashed  border-2 border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-450 via-yellow-600 to-yellow-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
              随机一个提示词
            </button>
            </label>
            {/* 提示词框改用文本框，观感好点 */}
            {/*
            <input
              type="text"
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={handlePromptChange}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 transition duration-300 ease-in-out hover:bg-opacity-30"
              placeholder="请输入您的提示词..."
              required
            />
            */}
            
          <textarea
              type="text"
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={handlePromptChange}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-pretty font-bold text-white text-2xl placeholder-white placeholder-opacity-70 transition duration-300 ease-in-out hover:bg-opacity-30" 
              rows="5"
              placeholder="请输入您的提示词..."
              required
            ></textarea>
            
          </div>
          <div>
            <label htmlFor="model" className="block text-white text-lg font-semibold mb-3 text-shadow">
              选择模型 (推荐Flux)：
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
              图片尺寸：
            </label>
            <select
              id="size"
              name="size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              <option value="512x512">512x512</option>
              <option value="768x768">768x768</option>
              <option value="1024x1024">1024x1024</option>
              <option value="1024x768">1024x768</option>
              <option value="2048x1024">2048x1024</option>
              <option value="2048x2048">2048x2048</option>
            </select>
          </div>
          <div>
            <label htmlFor="numSteps" className="block text-white text-lg font-semibold mb-3 text-shadow">
              生成步数 (数值范围4-8)：
            </label>
            <input
              type="number"
              id="numSteps"
              name="numSteps"
              value={numSteps}
              onChange={(e) => setNumSteps(parseInt(e.target.value, 10))}
              min="4"
              max="20"
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            <button
              type="button"
              onClick={handleEnhanceToggle}
              className={`flex-1 px-5 py-3 mx-2 shadow-xl border-dashed border-2 border-white-800 rounded-xl text-lg font-semibold text-white transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400
                          ${enhance ? "bg-gradient-to-r from-green-400 to-green-800" : "bg-gradient-to-r from-gray-400 to-gray-800"}`}
              disabled={isSubmitting}
            >
              {enhance ? "已强化提示词" : "强化提示词"}
            </button>
            
            
            <button
              type="submit"
              className={`flex-1 px-5 py-3 mx-2 shadow-xl text-lg font-bold text-white transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400
                          ${isSubmitting ? "rounded-full bg-gradient-to-r from-purple-700 via-pink-400 to-red-700 cursor-not-allowed" : "rounded-xl bg-gradient-to-r from-purple-700 via-green-500 to-blue-700"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "生成中..." : "启动生成"}
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
        
        {actionData && actionData.image && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-shadow">生成的图片：</h2>
            <img src={`data:image/jpeg;base64,${actionData.image}`} alt="Generated Image" className="w-full rounded-xl shadow-lg" />
            </div>
        )}
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-1000 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000 -z-10"></div>
      </div>
    </div>
  );
};

export default GenerateImage;
