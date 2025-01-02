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
      "随机一个商业级设计图标",
"随机一张cosplay",
"随机一张二次元图片",
    "3d fluffy llama, closeup cute and adorable, cute big circular reflective eyes, long fuzzy fur, Pixar render, unreal engine cinematic smooth, intricate detail, cinematic",
      "Closeup face portrait of a black girl wearing crown of flowers, smooth soft skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting,detailed face, by makoto shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera",
      "现代微型风格的等距房屋内部，1英尺，照片逼真渲染 --ar 16:9 --style raw --stylize 400 --v 6.1",
      "夜晚是一个漆黑、白雪皑皑的阿尔卑斯山村庄，乡村窗户上闪烁着淡淡的金光，周围是高耸而阴暗的山脉; 3D，不切实际。 --ar 9:16",
      "On a summer evening breeze, a lovely girl lies peacefully on the autumn lawn, feeling the gentle wind blowing, with autumn maple leaves falling in the distance.",
      "hologram of a wolf floating in space, a vibrant digital illustration, dribbble, quantum wavetracing, black background, behance hd",
      "一位美丽的白发仙女，长着翅膀，晚上坐在魔法森林中长满青苔的地面上，周围环绕着发光的萤火虫，举起魔杖施展魔法。艺术家詹姆斯·C·风格的丰富多彩的奇幻插图。克里斯滕森，插图的黄金时代，发光的，年长的领主，约翰·鲍尔凯·尼尔森埃德蒙·杜拉克，蒂姆·沃克，宾得克k1000，色彩鲜艳，深红色和紫色，以及绿色。 --ar 3:4 --personalize ioa83pi --v 6.1",
       "维多利亚风格的房间采用空灵、柔和的绿色和蓝色调色板，捕捉到一种褪色的宏伟感。一位头发飘逸的女子背对着观众站着，穿着一件与房间精致纹理融为一体的复古礼服。巨大的、超现实的花朵--玫瑰和百合花--充满了她周围的空间，它们的花瓣擦着墙壁和天花板。一只帝王般的白孔雀优雅地栖息在华丽的椅子上，为场景增添了梦幻般的神奇气质。柔和的漫光透过透明窗帘过滤，投射出柔和的阴影。 --ar 4:3 --s 50 --v 6.1 --style raw",
        "100mm photo of isometric floating island in the sky, surreal volcano, 
