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
 const [promptxmap, setPromptxmap] = useState(""); 
  const [enhance, setEnhance] = useState(false);
  const [model, setModel] = useState(config.CUSTOMER_MODEL_MAP["FLUX.1-Schnell-CF"]);
  const [size, setSize] = useState("1024x1024");
  const [numSteps, setNumSteps] = useState(config.FLUX_NUM_STEPS);
 // const [actionData, setactionData] = useState(useActionData<typeof action>());
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
    setPromptxmap("");
  };

  const promptx = [
    "毛茸茸 怪物，幼崽，4 爪，可爱，（雪+雪），超高分辨率，完美，杰作，氛围",
     "随机一个迪士尼角色，产品工作室拍摄，完美，杰作，3d",
      "猫和老鼠追逐，经典动画情节，3d渲染，电影特效",
      "(masterpiece:1.2), best quality,PIXIV,cozy animation scenes,scenery, building, sky, (low angle view:1.5)",
      "人工智能女孩的情感肖像全文，充满活力，超真实，详细，民族穿着，平静，白发，白皙的皮肤，宇宙大眼睛，https://s.mj.run/6EOJlsWCpyo https://s.mj.run/OKHH6Y8khD8 --chaos 60 --ar 9:16 --style raw --sref https://s.mj.run/7C6AG2__q_k --personalize anycl7a --stylize 1000 --v 6.1",
      "随机一个商业级设计图标",
    "gold dia de los muertos pendant, intricate 2d vector geometric, cutout shape pendant, blueprint frame lines sharp edges, svg vector style, product studio shoot",
      "浅紫A5封面，白色芙蓉浮雕，上面浮雕标题“艳”，头版右侧白色标签，正面视图，木刻印花风格，白底，彩色铅笔画小笔，极简主义。 --ar 34:47",
      "随机一张cosplay",
    "随机一张海景图",
     "随机一张二次元图片",
     "3d fluffy llama, closeup cute and adorable, cute big circular reflective eyes, long fuzzy fur, Pixar render, unreal engine cinematic smooth, intricate detail, cinematic",
      "3d毛茸茸的美洲驼，可爱的特写，可爱的圆形反光大眼睛，长长的绒毛，皮克斯渲染，虚幻引擎电影流畅，复杂的细节，电影",
"田园风光，欧洲郊野，欧洲风光",
"中式古典建筑，宫殿，园林，庭院",
    "Closeup face portrait of a black girl wearing crown of flowers, smooth soft skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting,detailed face, by makoto shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
      "现代微型风格的等距房屋内部，1英尺，照片逼真渲染 --ar 16:9 --style raw --stylize 400 --v 6.1",
      "夜晚是一个漆黑、白雪皑皑的阿尔卑斯山村庄，乡村窗户上闪烁着淡淡的金光，周围是高耸而阴暗的山脉; 3D，不切实际。 --ar 9:16",
      "On a summer evening breeze, a lovely girl lies peacefully on the autumn lawn, feeling the gentle wind blowing, with autumn maple leaves falling in the distance.",
      "100mm 等距浮岛照片，超现实火山，错综复杂，细节丰富，behance，微观世界平滑，微距锐利聚焦，居中",
    "随机一个动漫人物",
    "随机一个皮克斯角色形象，3d，电影级效果",
      "hologram of a wolf floating in space, a vibrant digital illustration, dribbble, quantum wavetracing, black background, behance hd",
      "一位美丽的白发仙女，长着翅膀，晚上坐在魔法森林中长满青苔的地面上，周围环绕着发光的萤火虫，举起魔杖施展魔法。艺术家詹姆斯·C·风格的丰富多彩的奇幻插图。克里斯滕森，插图的黄金时代，发光的，年长的领主，约翰·鲍尔凯·尼尔森埃德蒙·杜拉克，蒂姆·沃克，宾得克k1000，色彩鲜艳，深红色和紫色，以及绿色。 --ar 3:4 --personalize ioa83pi --v 6.1",
       "维多利亚风格的房间采用空灵、柔和的绿色和蓝色调色板，捕捉到一种褪色的宏伟感。一位头发飘逸的女子背对着观众站着，穿着一件与房间精致纹理融为一体的复古礼服。巨大的、超现实的花朵--玫瑰和百合花--充满了她周围的空间，它们的花瓣擦着墙壁和天花板。一只帝王般的白孔雀优雅地栖息在华丽的椅子上，为场景增添了梦幻般的神奇气质。柔和的漫光透过透明窗帘过滤，投射出柔和的阴影。 --ar 4:3 --s 50 --v 6.1 --style raw",
        "100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered",
       "小巧可爱的等距客厅，在一个剖开的盒子里，光线柔和流畅，色彩柔和，紫蓝配色，色彩柔和，100mm 镜头，3d blender 渲染",
     "随机一张动漫图",
    "春风得意马蹄疾，一日看尽长安花",
"1 girl,Clothes in the shape of snowflake,render,technology, (best quality) (masterpiece), (highly in detailed), 4K,Official art, unit 8 k wallpaper, ultra detailed, masterpiece, best quality, extremely detailed,CG,low saturation, as style, line art",
"迷人的城市夜景，灯火灿烂，明亮巨大的月亮",
"bestquality, masterpiece, super details, fine fabrics, high detailed eyes and detailed face, comic, extremely fine and detailed, perfect details, 1girl, solo, long hair, bangs, rose pink eyes, long sleeves, frilly pastel dress, lace accessory, sweet smile, holding a pink macaron, cotton candy pink hair, hair ribbons, soft pink and white dress, fairy tale garden, pink flowers, balloons",
"百舸争流，鹰击长空，鱼翔浅底，万类霜天竞自由",
"comic,bestquality, masterpiece, super details, fine fabrics, highly detailed eyes and face, extremely fine and detailed, perfect details, 1 girl, solo, long hair, bangs, rosy cheeks, pearl hair clips, strawberry blonde tresses, strawberry-shaped stud earrings, sweet lolita-style dress with berry prints, holding a basket of fresh strawberries, whimsical garden setting, sunny and bright",
     "随机一张风景图",
    "毛茸茸 怪物，幼崽，萌宠，4爪，可爱，超高分辨率，完美，杰作，氛围，svg矢量风格，产品工作室拍摄",
    "金色亡灵节吊坠，复杂的2D矢量几何图形，剪切形状吊坠，蓝图框架线条锐利边缘，svg矢量风格，产品工作室拍摄", 
     "kawaii low poly panda character, 3d isometric render, white background, ambient occlusion, unity engine",
    "龙珠，悟空，完美，杰作，氛围，svg矢量风格，3d风格，随机场景，随机龙珠人物",
"随机一个明星图，真实，不要合成，非AI生成",
"随机一辆汽车图片",
    "baalbek temple of jupiter, in microworld render style",
    "木星的巴尔贝克神庙，微世界渲染风格",
     "随机宫崎骏风格漫画图片，风景，人物，建筑",
   "随机一张建筑图，真实",
    "tiny cute ninja toy, standing character, soft smooth lighting, soft pastel colors, skottie young, 3d blender render, polycount, modular constructivism, pop surrealism, physically based rendering, square image",
   "微小可爱的等距瓷杯咖啡，柔光，色彩柔和，100 毫米镜头，3D Blender 渲染，polycount 趋势，模块化建构主义，蓝色背景，物理渲染，居中",
"100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered",
"小巧可爱的忍者玩具、站立的角色、柔和平滑的光线、柔和的粉彩、Skottie Young、3D Blender 渲染、多边形、模块化建构主义、流行超现实主义、基于物理的渲染、正方形图像",
"Multiple layers of silhouette mountains, with silhouette of big rocket in sky, sharp edges, at sunset, with heavy fog in air, vector style, horizon silhouette Landscape wallpaper by Alena Aenami, firewatch game style, vector style background",
"温馨动画场景,风景,建筑,天空,(低角度视图:1.5)",
"多层剪影山脉，天空中大火箭的剪影，边缘锐利，日落时分，空气中弥漫着浓雾，矢量风格，地平线剪影 景观壁纸，由 Alena Aenami 制作，看火游戏风格，矢量风格背景",
"Tiny cute isometric temple, soft smooth lighting, soft colors, soft colors, 100mm lens, 3d blender render, trending on polycount, modular constructivism, blue blackground, physically based rendering, centered",
"天空中等距浮岛的 100 毫米照片，超现实火山，复杂，高细节，behance，微观世界平滑，微距锐利焦点，居中",
"随机一张名胜古迹图片，真实，高级摄影",
"随机一部电影海报",
"随机一种动物，真实动物，不要合成",
    "头戴花冠的黑人女孩面部特写，光滑柔嫩的皮肤，梦幻般的大眼睛，美丽精致的彩色头发，对称的动漫大眼睛，柔和的光线，细致的面部，由新海诚、stanley artgerm lau、wlop、rossdraws 制作，概念艺术，数字绘画，正对镜头",
"2d ferocious lion head, vector illustration, angry eyes, football team emblem logo, 2d flat, centered",
"卡哇伊低多边形熊猫角色，3D 等距渲染，白色背景，环境闭塞，unity 引擎",
 "金色长发的时间女神，身着飘逸的绿松石至蓝色渐变魔法长袍。她五官精致，双手各持一件魔法武器，每件武器上都有一个时钟吊坠。在她身后，代表时间的光环熠熠生辉，周围环绕着象征时间和空间魔法的漩涡能量。这个场景迷人而神秘，捕捉到了时间和空间的本质",
   "天空，繁星，宇宙，深邃",
   "随机宇宙图",
    "Tiny cute isometric porcelain cup of coffee, soft smooth lighting, with soft colors, 100mm lens, 3d blender render, trending on polycount, modular constructivism, blue background, physically based rendering, centered",
    "二维凶猛狮头，矢量插画，愤怒的眼神，足球队徽标志，二维平面，居中",
    "在夏日的晚风中，一个可爱的女孩安详地躺在秋天的草坪上，感受着轻柔的风，远处的枫叶飘落",
     "漂浮在太空中的狼的全息图，生动的数字插图，dribbble，量子波追踪，黑色背景，behance 高清",
     "Hypnotic illustration of a Halloween pumpkin, hypnotic psychedelic art by Dan Mumford, pop surrealism, dark glow neon paint, mystical, Behance",
      "万圣节南瓜的催眠插图，Dan Mumford 的催眠迷幻艺术，流行超现实主义，深色荧光霓虹灯涂料，神秘，Behance",
     "微小可爱的等距寺庙, 柔和平滑的灯光, 柔和的色彩, 柔和的色彩, 100mm 镜头, 3d blender 渲染, 聚数趋势, 模块化建构主义, 蓝色黑色背景, 基于物理的渲染, 居中",
     "A goddess of time with long golden hair, dressed in a flowing turquoise-to-blue gradient magical gown. She has delicate features, holding a magical weapon in each hand, each adorned with a clock pendant. Behind her, a radiant halo representing time glows, surrounded by swirling energies that symbolize time and space magic. The scene is enchanting and mystical, capturing the essence of both time and space. ",
       "复古风格油画，巴黎景观，1930年 --ar 3:2 --v 6.1 --s 50",
      "詹姆斯·C·克里斯滕森（James C Christensen）的油画是一幅大约1750年的著名科学家，穿着那个时代的上流社会服装，坐在古典建筑的休息室里，摆着他们的行业工具，爱德华·兰西尔（Edward Landseer）风格的戏剧性灯光 --s 200 --ar 5:8 --v 6.1",
      "充满活力的场景捕捉了金·琼斯（Kim Jones）设想的迪奥2029年春季系列的精髓，展现了传统与颠覆之间的平衡，一位20岁的时尚达人散发着迪奥模特的优雅，同时展示了2029年的未来派服装，她快乐的表情为时尚的办公室增添了光彩，一只大鹿和异想天开的动物增强了视觉叙事，使用尼康Z9无反光镜数码相机拍摄，85毫米镜头，f/1.8,16 K分辨率， --ar 9：16 --stylize 500 --v 6.1",
       "随机一个logo设计，现代感强，商业品质",
      "Tiny cute isometric living room in a cutaway box, soft smooth lighting, soft colors, purple and blue color scheme, soft colors, 100mm lens, 3d blender render",
       "地球爆炸，3d风格，世界末日",
       "C4D 3D渲染，Q版卡通风格，全身，拟人化感，一个可爱的美国小男孩，身上穿着红紫色运动衫，里面穿着黑紫色运动裤，和一群外星小怪物玩恐怖游戏，怪物头在空中弹跳，设计特点：Pop Mart盲盒玩具、鲜艳的色彩、明亮的图像、迪士尼皮克斯趋势、电影灯光、精湛的细节、高分辨率、最佳的细节 --ar 9：16",
     "充满活力的三层维多利亚式房屋 --ar 16:9",
      "火影忍者，鸣人，佐助，产品工作室拍摄，完美，杰作，氛围，svg矢量风格，3d风格，随机背景，其他随机火影人物",
      "随机一张头像",
    "Furry:: 1.3 monster, cub, 4 claws, cute, (snow+snow), super high resolution, perfection, masterpiece, atmosphere",
       "皮卡丘在沙滩上晒日光浴，卡通，3d风格",
         "江上孤舟，远处青山，中国水墨画，飞鸟高飞"
     ];
  
  const promptxmaps = Object.entries(promptx).map(([id, text]) => ({ id, text }));

  /*生成min到max之间的随机整数*/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
  }
  /*随机一个提示词*/
  const handleResetprompt = () => {
    setPrompt(promptx[getRandomInt(0, promptx.length-1)]);
   };

  /*清空提示词*/
  const handleResetpromptclear = () => {
    setPrompt("");
   };


const postRequest = async function(model, jsonBody){
    const account = config.CF_ACCOUNT_LIST[Math.floor(Math.random() * config.CF_ACCOUNT_LIST.length)];
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
      setPrompt("成功了");
      return response;
    } catch (error) {
      console.error("Error in postRequest:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to connect to Cloudflare API', 500);
    }
  }

const testCfAiConnection = async function(){
    const testModel = config.CF_TRANSLATE_MODEL;
    const testPrompt = "Hello, world!";
    await postRequest(testModel, { messages: [{ role: "user", content: testPrompt }] });
    return testPrompt;
  }
  
  /*AI优化并翻译提示词*/
  const handlepromptfanyi = async function(){
    //const result = await testCfAiConnection();
    const prompt1 = document.getElementById("prompt").value;
    setPrompt("抱歉，该功能暂时未上线……");
    setPrompt(size);
     
   };

  /*选择一个提示词*/
const handlepromptxmapChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPrompt(e.target.value);
  setPromptxmap(e.target.value);
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
            <label htmlFor="prompt" className="block py-2 mb-2 text-white text-lg font-semibold text-shadow">
              提示词(支持中文)：
            </label>
            
            {/* 提示词框改用文本框，观感好点 */}
            {/*
            <input
              type="text"
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={handlePromptChange}
              className="w-full text-lg px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 transition duration-300 ease-in-out hover:bg-opacity-30"
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
              className="w-full text-3xl h-[180px] text-pretty px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20  font-bold text-white placeholder-white placeholder-opacity-70 transition duration-300 ease-in-out hover:bg-opacity-30" 
              rows="5"
              placeholder="😤受不了了😤╮(︶﹏︶)╭来一个富有创意的提示词吧..."
              required
            ></textarea>

        <div className="relative justify-center">

          <button
              type="button"
              onClick={handleResetprompt}
              className="px-4 py-2 mx-2 my-3 border-dashed  border-[3px] border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-450 via-yellow-600 to-yellow-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
              随机一个提示词
            </button>
          
            <button
              type="button"
              onClick={handleResetpromptclear}
              className="absolute right-4 px-4 py-2 mx-2 my-3 border-dashed  border-[3px] border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-400 via-pink-600 to-red-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
              清空提示词
            </button>
          
          <button
              type="button"
              onClick={handlepromptfanyi}
              className="px-4 py-2 mx-2  my-3 border-dashed  border-[3px] border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-700 via-purple-500 to-green-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
              AI优化和翻译提示词
            </button>
         </div>   
            
          </div>


         <div>
            <label htmlFor="promptxmap" className="block text-white text-lg font-semibold mb-3 text-shadow">
              选择一个喜欢的提示词：
            </label>
            <select
              id="promptxmap"
              name="promptxmap"
              value={promptxmap}
              onChange={handlepromptxmapChange}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              {promptxmaps.map((promptxmap) => (
                <option key={promptxmap.id} value={promptxmap.text}>
                  {promptxmap.text}
                </option>
              ))}
            </select>
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
              disabled={isSubmitting}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            />
          </div>
          <div className="flex sm:flex-row justify-between space-y-4 sm:space-y-0">
            <button
              type="button"
              onClick={handleEnhanceToggle}
              className={`flex-1 px-5 py-3 mx-2 shadow-xl border-dashed border-[5px] border-white-800 rounded-xl text-lg font-semibold text-white transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400
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
              className="flex-1 px-5 py-3 mx-2 rounded-xl border-dashed border-[5px] border-white-800 text-lg font-semibold text-white bg-gradient-to-r from-red-450 via-pink-600 to-red-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-xl"
              disabled={isSubmitting}
            >
              重置选项
            </button>
          </div>
        </Form>
        
        {actionData && actionData.image && (
          <div className="mt-8">
            {/*
          <h2 className="text-2xl font-bold text-white mb-4 text-shadow">有关生成参数：</h2>
              <div className="mt-1 p-3 rounded-xl text-xl bg-white font-bold text-blue mb-4 text-shadow">
                绘画模型：{model}
              </div>
            */}
            <h2 className="text-2xl font-bold text-white mb-4 text-shadow">AI优化和翻译后的提示词：</h2>
              <div className="mt-1 p-3 rounded-xl text-xl bg-white font-bold text-blue mb-4 text-shadow">
                 {`${actionData.translatedPrompt}`}
              </div>
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
