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
      "3d fluffy llama, closeup cute and adorable, cute big circular reflective eyes, long fuzzy fur, Pixar render, unreal engine cinematic smooth, intricate detail, cinematic",
      "Closeup face portrait of a black girl wearing crown of flowers, smooth soft skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting,detailed face, by makoto shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
      "(masterpiece:1.2), best quality,PIXIV,cozy animation scenes,scenery, building, sky, (low angle view:1.5)",
      "On a summer evening breeze, a lovely girl lies peacefully on the autumn lawn, feeling the gentle wind blowing, with autumn maple leaves falling in the distance.",
      "hologram of a wolf floating in space, a vibrant digital illustration, dribbble, quantum wavetracing, black background, behance hd",
      "gold dia de los muertos pendant, intricate 2d vector geometric, cutout shape pendant, blueprint frame lines sharp edges, svg vector style, product studio shoot",
      "Tiny cute isometric living room in a cutaway box, soft smooth lighting, soft colors, purple and blue color scheme, soft colors, 100mm lens, 3d blender render",
      "100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered",
      "A goddess of time with long golden hair, dressed in a flowing turquoise-to-blue gradient magical gown. She has delicate features, holding a magical weapon in each hand, each adorned with a clock pendant. Behind her, a radiant halo representing time glows, surrounded by swirling energies that symbolize time and space magic. The scene is enchanting and mystical, capturing the essence of both time and space. ",
      "Furry:: 1.3 monster, cub, 4 claws, cute, (snow+snow), super high resolution, perfection, masterpiece, atmosphere",
      "皮卡丘在沙滩上晒日光浴，卡通，3d风格",
      "地球爆炸，3d风格，世界末日"
    ];
  /
 * 生成min到max之间的随机整数
 */
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
      <div className="relative bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center drop-shadow-lg">
            AI绘画(Flux|SD)
        </h1>
        <Form method="post" className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="prompt" className="block text-white text-lg font-semibold mb-3">
              提示词(支持中文)：
              <button
              type="button"
              onClick={handleResetprompt}
              className="flex-1 px-5 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 transition duration-300 ease-in-out hover:bg-opacity-30" 
              rows="5"
              placeholder="请输入您的提示词..."
              required
            ></textarea>
            
          </div>
          <div>
            <label htmlFor="model" className="block text-white text-lg font-semibold mb-3">
              选择模型(推荐Flux)：
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
            <label htmlFor="size" className="block text-white text-lg font-semibold mb-3">
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
            <label htmlFor="numSteps" className="block text-white text-lg font-semibold mb-3">
              生成步数(数值范围4-8)：
            </label>
            <input
              type="number"
              id="numSteps"
              name="numSteps"
              value={numSteps}
              onChange={(e) => setNumSteps(parseInt(e.target.value, 10))}
              min="4"
              max="8"
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
            <button
              type="button"
              onClick={handleEnhanceToggle}
              className={`flex-1 px-5 py-3 rounded-xl text-lg font-semibold text-white transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400
                          ${enhance ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-gray-400 to-gray-600"}`}
              disabled={isSubmitting}
            >
              {enhance ? "已强化提示词" : "强化提示词"}
            </button>
            
            <div className="w-2"></div>
            <button
              type="submit"
              className={`flex-1 px-5 py-3 rounded-xl text-lg font-semibold text-white transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400
                          ${isSubmitting ? "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 cursor-not-allowed" : "bg-gradient-to-r from-purple-700 via-green-500 to-blue-700"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "生成中..." : "启动生成"}
            </button>
            
            <div className="w-2"></div>
            <input type="hidden" name="enhance" value={enhance.toString()} />
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-5 py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-yellow-400 to-yellow-600 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isSubmitting}
            >
              重置提示词
            </button>
          </div>
        </Form>
        {actionData && actionData.image && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">生成的图片：</h2>
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
