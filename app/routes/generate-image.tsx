import type { FC, ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { json } from "@remix-run/cloudflare";
import { useActionData, Form, useNavigation, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { createAppContext } from "../context";


export const loader: LoaderFunction = async ({ context }) => {
  const appContext = createAppContext(context);
  const { imageGenerationService, config } = appContext;
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
  const rules = formData.get("rules") as string;
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
      rules,
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
  const { models, imageGenerationService, config } = useLoaderData<typeof loader>();
  const [prompt, setPrompt] = useState("");
 const [promptxmap, setPromptxmap] = useState(""); 
  const [enhance, setEnhance] = useState(false);
  const [model, setModel] = useState(config.CUSTOMER_MODEL_MAP["FLUX.1-Schnell-CF"]);
  const [size, setSize] = useState("1024x1024");
  const [rules, setRules] = useState("b");
  
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
    setPromptxmap("");
  };

  const promptx = [
    "1024x1024,undefined",
    `photograph, productive view, cylinder podium with perfume, Sony A7R IV with a FE 50mm f/1.2 GM lens, solid dark cyan background, realism light setting, natural lighting, contrast --ar 9:16 --style raw --stylize 200 --v 6`,
    `毛茸茸 怪物，幼崽，4 爪，可爱，（雪+雪），超高分辨率，完美，杰作，氛围`,
    `Totoro at Giza --personalize nwnd4j3 --stylize 600`,
    `La divina commedia, 32K, RTX raytracing, quantum processing --personalize nwnd4j3 --stylize 600`,
     `Heavenly architecture with Divine inspiration in its design, harmonious balancing of light and shadow, blooming delicate and fragrant flowers, aqua coloured leaves, plants of various design to fit architectural design, large leaf plants, 32K, highly detailed, quantum processing --no water --ar 1:1 --personalize nwnd4j3 --stylize 600`,
    `随机,迪士尼角色，产品工作室拍摄，完美，杰作，3d`,
      `在熙熙攘攘的赛博朋克大都市中，霓虹灯照亮的街道上闪烁着电蓝色、亮粉色和酸绿色的鲜艳色调，在被雨水打滑的人行道上投下超现实的光芒。阴影翩翩起舞，他们穿着装饰有发光电路的时尚反光夹克，聚集在一条隐蔽的小巷里，他们的脸被闪烁的全息显示器照亮。一个企业霸主的高耸全息图不祥地耸现在上方，它冰冷、精于算计的目光审视着这一场景。空气中弥漫着紧张的气氛，反抗者们涂着控制论的增强和错综复杂的纹身，低声低语，计划着反抗压迫性政权。涂鸦艺术色彩缤纷，覆盖着摇摇欲坠的墙壁，描绘了抵抗符号和反乌托邦的愿景。头顶上，天空是一幅由无人机和飞艇组成的混乱挂毯，它们的灯光在雾中交织，而远处机器的嗡嗡声则强调了城市中心正在酝酿的叛乱。`,
      `(masterpiece:1.2), best quality,PIXIV,cozy animation scenes,scenery, building, sky, (low angle view:1.5)`,
      `人工智能女孩的情感肖像全文，充满活力，超真实，详细，民族穿着，平静，白发，白皙的皮肤，宇宙大眼睛--chaos 60 --ar 9:16 --style raw --sref https://s.mj.run/7C6AG2__q_k --personalize anycl7a --stylize 1000 --v 6.1`,
      `随机一个商业级设计图标`,
    `gold dia de los muertos pendant, intricate 2d vector geometric, cutout shape pendant, blueprint frame lines sharp edges, svg vector style, product studio shoot`,
      `浅紫A5封面，白色芙蓉浮雕，上面浮雕标题“艳”，头版右侧白色标签，正面视图，木刻印花风格，白底，彩色铅笔画小笔，极简主义。 --ar 34:47`,
      `随机,cosplay`,
    `Magnificent view of the Atlantean main city bustling with activity --personalize nwnd4j3 --stylize 600`,
    `Magnificent view of the Atlantean main city bustling with activity --personalize nwnd4j3 --stylize 600`,
    `A mansion in the Internal worlds of the higher Dimensions with flowers and plants merging with the architecture of the place, pillars of white and gold, dark balanced with light, clean and tidy, neat, bright, colourful and elegant reflecting beauty in its structure, 32K, quantum processing, highly detailed and articulate --no water --personalize nwnd4j3 --stylize 600`,
    `The bernard star --personalize nwnd4j3 --stylize 600`,
    `随机,海景图`,
     `随机,二次元`,
     `3d fluffy llama, closeup cute and adorable, cute big circular reflective eyes, long fuzzy fur, Pixar render, unreal engine cinematic smooth, intricate detail, cinematic`,
      `3d毛茸茸的美洲驼，可爱的特写，可爱的圆形反光大眼睛，长长的绒毛，皮克斯渲染，虚幻引擎电影流畅，复杂的细节，电影`,
`田园风光，欧洲郊野，欧洲风光`,
`The bernard star --personalize nwnd4j3 --stylize 600`,
    `alice in wonderland, mad hatter the magician in a tarot card, highly detailed, half skull face, cinematic, 8 k, style by stanley artgermm, tom bagshaw, carne griffiths, hyper detailed, full of colour`,
    `portrait close-up, max epic, streamlined Sci-fi mech, slender figure in three quarters, glossy black reflective max detailed insectoid Sci-fi mech, Sci-fi insectoid wings, insectoid style, style Tsutomu Nihei, style Akira, bright light quasar, outer space, dramatic background, three-dimensional graphics, anime art, manga drawing, cosmic starlight, galaxy, plasma rays, 8k, UHD, hyper-realistic,снята цифровой камерой Hasselblad H4D 200MS, Mitakon Speedmaster 65mm f/1 --q 5 --ar 1:2`,
    `amazing lightingbolt woman, blue color, she run on the empty street, luminous, reflective, hyper detailed, trending on artstation, intricate details, highly detailed, background big city with skyscrapers at night, super detail, ultra realistic, cinematic lighting, amazing, best color, perfect image high flying aerial top down view, photorealistic, a sprawling cityscape emerges, adorned with towering skyscrapers, photograph, advanced technology and bustling activity create a sense of awe and wonder, at night, super detail, ultra realistic, cinematic lighting, amazing, best color, perfect image perspective, by DamShelma`,
    `中式古典建筑，宫殿，园林，庭院`,
    `Closeup face portrait of a black girl wearing crown of flowers, smooth soft skin, big dreamy eyes, beautiful intricate colored hair, symmetrical, anime wide eyes, soft lighting,detailed face, by makoto shinkai, stanley artgerm lau, wlop, rossdraws, concept art, digital painting, looking into camera`,
      `现代微型风格的等距房屋内部，1英尺，照片逼真渲染 --ar 16:9 --style raw --stylize 400 --v 6.1`,
      `夜晚是一个漆黑、白雪皑皑的阿尔卑斯山村庄，乡村窗户上闪烁着淡淡的金光，周围是高耸而阴暗的山脉; 3D，不切实际。 --ar 9:16`,
      `On a summer evening breeze, a lovely girl lies peacefully on the autumn lawn, feeling the gentle wind blowing, with autumn maple leaves falling in the distance.`,
      `100mm 等距浮岛照片，超现实火山，错综复杂，细节丰富，behance，微观世界平滑，微距锐利聚焦，居中`,
    `Real photograph of a black cat playing an electric guitar, the cat looks like a rocker, it is on a rock concert stage`,
`caricature illustration, children's comic book character, hilariously exaggerated features --ar 1:2 --stylize 750`,
`white Cat and flower in a Takeshi Kitano style, in a minimalist and humorous setting, simple and straightforward style with a touch of modernity and humor. 8k --ar 3:4 --s 50 --v 6.0 --style raw`,
`离离原上草，一岁一枯荣`,
    `A cute, kawaii spiritual llama, vector, no background --s 180`,
`((chibi)), full-body`,
`amalfi coast, oil painting, impressionist style, sunny day, colorful buildings and domes overlooking the sea with sailboats in background, lush greenery on cliffs, vibrant colors, detailed brushstrokes, textured canvas effect, impressionistic technique, high resolution --ar 1:2 --stylize 750`,
`空山新雨后，天气晚来秋`,
    `impressionist painting on canvas of Tuscany, beautiful landscape with Tuscan farmhouse, in the style of impressionist masters, warm colors, delicate brushstrokes --ar 1:2 --stylize 750`,
`a girl walking through a field, in the style of ethereal trees, dark yellow and azure, majestic, sweeping seascapes, photorealistic representation, graceful balance, wimmelbilder, orange --ar 72:101 --stylize 750 --v 6`,
`photography, orange hue, korean woman model, solid orange backdrop, using a camera setup that mimics a large aperture, f/1.4 --ar 9:16 --style raw`,
`随机,二次元`,
`Baroque punk type halloween party design of the chief diety in greek mythology "zeus" with a syntwave expression in the style of risograph printed portraiture on artist’s paper --s 50`,
`A flat illustration of a cat wearing a witch's hat and sitting on the skull, minimalist, warm, utilitarianism, geometric, danish design --s 50`,
`A flat illustration of a lady doing meditating, with plants in the house, Matisse poster, calming colors --s 50`,
`停车坐爱枫林晚，枫叶红于二月花`,
    `3d rendering, artistic anatomical render, ultra quality, human body with transparent skin revealing structure instead of organs, delicate and intricate creative patterns, monochrome with back lighting, scientific yet fantastical illustration, concept art blending biology with botany, surreal and ethereal quality, 4090 RTX, ray tracing render, ultra realistic, UHD, many details --ar 9:16 --style raw --stylize 200`,
`A girl holding a huge flower, micro art, girl standing in the autumn field basking in the sun, autumn sun shining brightly, simple background, simple lines, a lot of white space, tilted picture, upward view, strong visual impact --niji 6 --seed 1896939470`,
`随风潜入夜，润物细无声`,
    `An incredible 3D illustration of depicting a gardener standing on a massive globe, watering. The globe is adorned with green leaves and butterflies, symbolizing the planet's vitality and beauty. The background is a soft, serene beige hue, while the phrase "Take care of the Planet" is prominently displayed in 3D, crafted from green leaves and shadow, serving as a poignant reminder of our responsibility towards environmental conservation and appreciation.`,
`A strikingly mystical creature, reminiscent of a large, magical female monster, takes center stage in this vintagepunk artwork. The image, possibly a captivating painting or a carefully captured photograph, showcases an awe-inspiring big white creature with an ethereal aura. Its mottled shade of white encompasses a weathered yet mesmerizing appearance, emanating an air of enigmatic beauty. Every minute detail of this creature's otherworldly form, from its intricate scales to its flowing mane, is portrayed with exquisite quality, capturing the viewer's attention. This artistry exudes a sense of vintage charm while simultaneously evoking a futuristic essence, lending the image a unique and captivating appeal.`,
`Jinx, on top of a police car, explosions behind her, fire, chaos, minigun, far view, bullet hell, <lora:more_details:0.7>, <lora:beautiful_detailed_eyes:0.7>, jinxlol, <lora:JinxLol:0.9>`,
`旧时王谢堂前燕，飞入寻常百姓家`,
    `Kyoto Animation stylized anime mixed with tradition Chinese artworks~ A dragon flying at modern cyberpunk fantasy world. Cinematic Lighting, ethereal light, intricate details, extremely detailed, incredible details, full colored, complex details, insanely detailed and intricate, hypermaximalist, extremely detailed with rich colors. masterpiece, best quality, aerial view, HDR, UHD, unreal engine. plump looking at the camera, smooth thighs, (glittery jewelry) ((acrylic illustration, by artgerm, by kawacy, by John Singer Sargenti) dark Fantasy background, glittery jewelry, Representative, fair skin, beautiful face, Rich in details High quality, gorgeous, glamorous, 8k, super detail, gorgeous light and shadow, detailed decoration, detailed lines`,
`Full body, Small highly detailed incorporeal fairy made of silvery light, Bokeh pollen specs multicolored magic particles in the air background by Moebius, perfectly lifelike beautiful face, detailed pretty eyes, glossy lips, pastels bloom lighting detail, (intricate mystical aura Detailing By Amanda Sage), beautiful rendering by FromSoftware Artwork, Elden Ring aesthetic, Boos Stage Battle, Ray Tracing Beams, Extremely Smooth Blending, highly detailed, 8k sharp focus`,
`a chinease dragon surrounded by flowers, the dragon has a long body akin to a snake, his long body curls forming a elegan image, the dragon skin is scaled, the dragon has a beautiful color, the dragon has horns, (elegant),traditional chinease image aesthetic,mytological creature`,
`Rampart female character from Apex legends,(ultra-detailed:1.6), extremely detailed face, masterpiece, (extreme shading:1.0), expressive eyes, (curvy:1.3), (fangs:1.2), (low ponytail:1.3), black hair with blue inner hair, (glowing goggles:1.4), (oversized jacket:1.5), (floating glowing welding machine:1.1), (magical flames:1.5), (baggy shorts:1.4), (floating, typing on glowing holographic welding machine:1.4), (atmospheric perspective:1.3), (cyberpunk dystopian lot:1.3), (neon signs:1.4), streets, vivid colors, atmospheric lighting, (night:1.3)`,
`extremely realistic, steampunk eye, full view of eye, blurry middle background, ornamental, macro shot, HD, Hyperrealistic, mystic, baroque, octane render, sharp center focus, sharpness on background, 8k`,
`大江东去浪淘尽，千古风流人物`,
    `Photo of a ultra realistic sailing ship, dramatic light, pale sunrise, cinematic lighting, battered, low angle, trending on artstation, 4k, hyper realistic, focused, extreme details, unreal engine 5, cinematic, masterpiece, art by studio ghibli, intricate artwork by john william turner`,
`A panoramic view of large futuristic city Sci-fi, photorealistic`,
`A poisonous Rose covered in Ice Crystals in the middle of a once vibrant garden that is now frosted, A venomous snake in the garden. The moonlight casts an eerie glow on the frozen petals, highlighting the intricate patterns of the ice crystals. The snake slithers sinuously through the icy undergrowth, its scales glistening with a frosty sheen. The garden, once teeming with life and color, now lies silent and frozen under the moonlit night,`,
`FULL BODY female, A stunning illustration of an ethereal neural network organism, female full body is robotic skeleton, stunning facial details, art, elegant, hologram, maximum details, intricate, detailed, futuristic, science fiction, HR Giger`,
`生于忧患，死于安乐`,
`A stunning illustration of an ethereal neural network women organism, female full body is robotic skeleton, stunning body and facial details, art, elegant, hologram, maximum details, intricate, detailed, futuristic, science fiction, HR Giger`,
`BODY complete female, A stunning illustration of an ethereal neural network organism, female full body is robotic skeleton, stunning facial details, art, elegant, hologram, maximum details, intricate, detailed, futuristic, science fiction, HR Giger`,
    `霓虹灯照亮的屋顶在暮色的天空下闪闪发光，在被雨水打磨的表面上投下充满活力的倒影。高耸的摩天大楼装饰着脉动的全息图和闪烁的广告，营造出万花筒般的色彩 - 电蓝色、火热的粉红色和深紫色交织在一起，跳起迷人的舞蹈。在前景中，增强的梦想家们穿着时髦的彩虹色服装，在城市丛林中穿行，他们的眼睛闪耀着数字叠加层的光芒。缕缕霓虹灯烟雾在他们周围蜿蜒曲折，低语着由梦想与科技交织而成的现实秘密。当无人机在头顶飞驰时，气氛充满了期待，它们的灯光在广阔的大都市背景下描绘出错综复杂的图案。遥远的合成器音乐嗡嗡声弥漫在空气中，与电流的柔和嗡嗡声融为一体，创造出一首未来的交响乐，想象与现实在令人叹为观止的奇观中碰撞。`,
    `随机,皮克斯角色形象，3d，电影级效果`,
      `hologram of a wolf floating in space, a vibrant digital illustration, dribbble, quantum wavetracing, black background, behance hd`,
      `一位美丽的白发仙女，长着翅膀，晚上坐在魔法森林中长满青苔的地面上，周围环绕着发光的萤火虫，举起魔杖施展魔法。艺术家詹姆斯·C·风格的丰富多彩的奇幻插图。克里斯滕森，插图的黄金时代，发光的，年长的领主，约翰·鲍尔凯·尼尔森埃德蒙·杜拉克，蒂姆·沃克，宾得克k1000，色彩鲜艳，深红色和紫色，以及绿色。 --ar 3:4 --personalize ioa83pi --v 6.1`,
      `very disgust face brown fluffy character wearing a pink bow on white background.`,
    `Girl in spacesuit, spaceship inside, Tsutomu Nihei style, Sidonia no Kishi, gigantism, laser generator, multi-story space, futuristic style, Sci-fi, hyperdetail, laser in center, laser from the sky, energy clots, acceleration, light flash, speed, anime, drawing, 8K, HD, super-resolution, manga graphics, Drawing, First-Person, 8K, HD, Super-Resolution --q 2 --ar 1:2`,
    `窈窕淑女，君子好逑`,
    `girl in light clothing, style artist oyari ashito, against the night sky, night, portrait, satisfaction, enjoyment, manga graphics, anime, drawing, dark exposure, bright colors, the highest quality, the highest detail, first-person view, dark tones, Clouds --q 2 --ar 9:16`,
    `Abstract style waterfalls, wildlife inside the silhouette of a woman head that is a double exposure photograph . Non-representational, colors and shapes, expression of feelings, imaginative, highly detailed`, 
    `维多利亚风格的房间采用空灵、柔和的绿色和蓝色调色板，捕捉到一种褪色的宏伟感。一位头发飘逸的女子背对着观众站着，穿着一件与房间精致纹理融为一体的复古礼服。巨大的、超现实的花朵--玫瑰和百合花--充满了她周围的空间，它们的花瓣擦着墙壁和天花板。一只帝王般的白孔雀优雅地栖息在华丽的椅子上，为场景增添了梦幻般的神奇气质。柔和的漫光透过透明窗帘过滤，投射出柔和的阴影。 --ar 4:3 --s 50 --v 6.1 --style raw`,
        `100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered`,
       `小巧可爱的等距客厅，在一个剖开的盒子里，光线柔和流畅，色彩柔和，紫蓝配色，色彩柔和，100mm 镜头，3d blender 渲染`,
     `smur-fette from the smurfs, beautiful charismatic woman, piercings, athletic, a woman with a white dress, gorgeous figure, interesting shapes, full body photo shot, goth style, dark eye, in the style of jessica drossin, life-size figures, 8k sharp focus, highly detailed, photorealistic`,
    `Girl in spacesuit, spaceship inside, Tsutomu Nihei style, Sidonia no Kishi, gigantism, laser generator, multi-story space, futuristic style, Sci-fi, hyperdetail, laser in center, laser from the sky, energy clots, acceleration, light flash, speed, anime, drawing, 8K, HD, super-resolution, manga graphics, Drawing, First-Person, 8K, HD, Super-Resolution --q 2 --ar 1:2`,
    `(masterpiece, digital art:1.3), highly intricate double exposure art inspired by Yuumei, (close-up of a person's eye:1.2) superimposed on a bustling city street, cyberpunk aesthetic, trending on CGSociety, multiple exposure technique, overlaying textures with glowing holographic elements, technicolor palette, bright city lights illuminating the scene, reminiscent of  The Matrix film's Pinterest color scheme, high definition rendering, colorful dream-like atmosphere, elaborate details in the digital art, futuristic and vibrant, captivating visual narrative.`,
    `随机,动漫`,
    `1 girl,Clothes in the shape of snowflake,render,technology, (best quality) (masterpiece), (highly in detailed), 4K,Official art, unit 8 k wallpaper, ultra detailed, masterpiece, best quality, extremely detailed,CG,low saturation, as style, line art`,
`迷人的城市夜景，灯火灿烂，明亮巨大的月亮`,
`bestquality, masterpiece, super details, fine fabrics, high detailed eyes and detailed face, comic, extremely fine and detailed, perfect details, 1girl, solo, long hair, bangs, rose pink eyes, long sleeves, frilly pastel dress, lace accessory, sweet smile, holding a pink macaron, cotton candy pink hair, hair ribbons, soft pink and white dress, fairy tale garden, pink flowers, balloons`,
`百舸争流，鹰击长空，鱼翔浅底，万类霜天竞自由`,
`comic,bestquality, masterpiece, super details, fine fabrics, highly detailed eyes and face, extremely fine and detailed, perfect details, 1 girl, solo, long hair, bangs, rosy cheeks, pearl hair clips, strawberry blonde tresses, strawberry-shaped stud earrings, sweet lolita-style dress with berry prints, holding a basket of fresh strawberries, whimsical garden setting, sunny and bright`,
     `随机,风景图`,
    `毛茸茸 怪物，幼崽，萌宠，4爪，可爱，超高分辨率，完美，杰作，氛围，svg矢量风格，产品工作室拍摄`,
   `Beautiful hyper-realistic image of a psychedelic 8k mermaid, with long bright red hair, has a colorful and shiny tail, in an ocean full of realistic 4k Psychedelics ((holographic)) dolphins and seahorses.`,
    `A lone liquidator in an abandoned reactor hall, covered head-to-toe in a cracked, soot-streaked green hazmat suit, stands amidst twisted metal and crumbling concrete, illuminated by an eerie, flickering blue-green light. His gas mask lenses are fogged and slightly cracked, with faint reflections of distant fires and glowing radioactive embers floating through the thick, toxic haze. In the background, collapsed pipes drip irradiated, glowing liquid that pools in small, sinister puddles on the floor. Wisps of smoke drift through the air, casting deep shadows over the scene, and tiny, ghostly particles float like radioactive dust around him, glowing faintly. The scene is shrouded in silence, save for the quiet hum of decaying machinery. A low-angle shot enhances the scale and isolation, with the crumbling reactor looming above, half-covered in darkness. The atmosphere is thick, gritty, and foreboding, capturing the sense of life-or-death duty in this abandoned, post-apocalyptic setting`,
    ` Evergarden, full body open furry costume with feet, girl with kittens and ponytail, tiger eyes, extra long black hair, Ariana, She wears (((Pink))) knee-high high heel platform boots. Stiletto heel. White-black tiger print color to show. Clothes like full body open dresses. She also has bright green eyes. The setting is an old mansion, with old paintings, northern lights, She has platinum hair.`,
    `Surreal 4k painting of a beautiful alien princess with expressive lilac eyes and cosmic features. Her skin appears to be composed of intertwined bioluminescent particles, surrounded by neon lights and floating, colorful orbs in a fantastical forest environment, with exotic animals creating a mesmerizing and otherworldly atmosphere, cinematic composition.`,
    `金色亡灵节吊坠，复杂的2D矢量几何图形，剪切形状吊坠，蓝图框架线条锐利边缘，svg矢量风格，产品工作室拍摄`, 
     `kawaii low poly panda character, 3d isometric render, white background, ambient occlusion, unity engine`,
    `龙珠，悟空，完美，杰作，氛围，svg矢量风格，3d风格，随机场景，随机龙珠人物`,
`A decadent piece of golden-brown baklava sits on a rustic wooden table, its layers of flaky phyllo pastry glistening with a honey syrup that catches the light, creating a warm amber hue. The delicate, intricate layers reveal a rich filling of finely chopped pistachios and walnuts, their vibrant green and deep brown contrasting beautifully with the golden pastry. Soft, diffused sunlight filters through a nearby window, casting gentle shadows and highlighting the baklava's glossy surface. A sprinkle of crushed nuts and a drizzle of honey adorn the top, inviting a closer look. The composition features a close-up macro shot, capturing the flaky texture and syrupy sheen, while a faint steam rises from the warm pastry, hinting at the delightful aroma of cinnamon and cardamom. The scene is completed with a backdrop of soft, blurred Middle Eastern textiles, enhancing the exotic allure of this traditional dessert.`,
`Spacious office with frontal view, Herman Miller Aeron chairs, Artemide Tolomeo desk lamps, captured with a Canon EOS R5, 50mm f/1.2 lens, balanced natural and LED lighting`,
    `baalbek temple of jupiter, in microworld render style`,
    `木星的巴尔贝克神庙，微世界渲染风格`,
     `宫崎骏风格，风景，人物，建筑`,
   `Create an enchanting scene of Neuschwanstein Castle, perched majestically atop a rugged hill in the Bavarian Alps. Capture its Romantic-era architectural style, characterized by soaring towers, ornate turrets, and intricate stonework, all rendered in soft pastel hues of cream, light gray, and hints of rose. Highlight the castle's fairy-tale appearance against a backdrop of lush green forests and the serene blue of nearby alpine lakes. The scene should be set at dawn, with the first light of day casting a golden glow on the castle's façade, accentuating its textures of smooth limestone and rough-hewn granite. Wisps of morning mist weave through the valley, adding a mystical quality. Emphasize the contrast between the castle and the rugged natural landscape, suggesting its historical significance as a symbol of romanticism. Use a soft-focus, painterly style to evoke a dreamlike atmosphere, reminiscent of classic European landscapes.`,
    `tiny cute ninja toy, standing character, soft smooth lighting, soft pastel colors, skottie young, 3d blender render, polycount, modular constructivism, pop surrealism, physically based rendering, square image`,
   `微小可爱的等距瓷杯咖啡，柔光，色彩柔和，100 毫米镜头，3D Blender 渲染，polycount 趋势，模块化建构主义，蓝色背景，物理渲染，居中`,
`100mm photo of isometric floating island in the sky, surreal volcano, intricate, high detail, behance, microworlds smooth, macro sharp focus, centered`,
`小巧可爱的忍者玩具、站立的角色、柔和平滑的光线、柔和的粉彩、Skottie Young、3D Blender 渲染、多边形、模块化建构主义、流行超现实主义、基于物理的渲染、正方形图像`,
`Multiple layers of silhouette mountains, with silhouette of big rocket in sky, sharp edges, at sunset, with heavy fog in air, vector style, horizon silhouette Landscape wallpaper by Alena Aenami, firewatch game style, vector style background`,
`温馨动画场景,风景,建筑,天空,(低角度视图:1.5)`,
`多层剪影山脉，天空中大火箭的剪影，边缘锐利，日落时分，空气中弥漫着浓雾，矢量风格，地平线剪影 景观壁纸，由 Alena Aenami 制作，看火游戏风格，矢量风格背景`,
`Tiny cute isometric temple, soft smooth lighting, soft colors, soft colors, 100mm lens, 3d blender render, trending on polycount, modular constructivism, blue blackground, physically based rendering, centered`,
`天空中等距浮岛的 100 毫米照片，超现实火山，复杂，高细节，behance，微观世界平滑，微距锐利焦点，居中`,
`illustration, women, three, yellow, outlines --ar 9:16`,
`随机,电影海报`,
`随机,动物，真实，不要合成`,
    `头戴花冠的黑人女孩面部特写，光滑柔嫩的皮肤，梦幻般的大眼睛，美丽精致的彩色头发，对称的动漫大眼睛，柔和的光线，细致的面部，由新海诚、stanley artgerm lau、wlop、rossdraws 制作，概念艺术，数字绘画，正对镜头`,
`2d ferocious lion head, vector illustration, angry eyes, football team emblem logo, 2d flat, centered`,
`卡哇伊低多边形熊猫角色，3D 等距渲染，白色背景，环境闭塞，unity 引擎`,
 `金色长发的时间女神，身着飘逸的绿松石至蓝色渐变魔法长袍。她五官精致，双手各持一件魔法武器，每件武器上都有一个时钟吊坠。在她身后，代表时间的光环熠熠生辉，周围环绕着象征时间和空间魔法的漩涡能量。这个场景迷人而神秘，捕捉到了时间和空间的本质`,
   `天空，繁星，宇宙，深邃`,
   `illustration, art, man, face, gaze, mosaic, mondrian, consisting random colors, black outline, pattern, masterpiece --ar 9:16 --style raw`,
    `随机,夜景`,
    `A fit woman stands confidently, showcasing her athletic physique. She has a heart-shaped face with high cheekbones, bright blue eyes, and a warm, sun-kissed complexion. Her wavy, shoulder-length blonde hair cascades elegantly down her back. She wears sleek, fitted athletic shorts in a vibrant teal color and a matching sleeveless top that highlights her toned arms and flat stomach. The outfit is accented with subtle reflective stripes. Her expression is determined yet approachable, with a slight smile that conveys positivity. She is mid-stride, jogging on a sunlit trail, her posture upright and strong, with one arm bent at her side and the other swinging naturally. Surrounding her are lush green trees and a clear blue sky, creating an invigorating outdoor atmosphere.`,
    `Tiny cute isometric porcelain cup of coffee, soft smooth lighting, with soft colors, 100mm lens, 3d blender render, trending on polycount, modular constructivism, blue background, physically based rendering, centered`,
    `二维凶猛狮头，矢量插画，愤怒的眼神，足球队徽标志，二维平面，居中`,
    `在夏日的晚风中，一个可爱的女孩安详地躺在秋天的草坪上，感受着轻柔的风，远处的枫叶飘落`,
     `漂浮在太空中的狼的全息图，生动的数字插图，dribbble，量子波追踪，黑色背景，behance 高清`,
     `Hypnotic illustration of a Halloween pumpkin, hypnotic psychedelic art by Dan Mumford, pop surrealism, dark glow neon paint, mystical, Behance`,
      `万圣节南瓜的催眠插图，Dan Mumford 的催眠迷幻艺术，流行超现实主义，深色荧光霓虹灯涂料，神秘，Behance`,
     `微小可爱的等距寺庙, 柔和平滑的灯光, 柔和的色彩, 柔和的色彩, 100mm 镜头, 3d blender 渲染, 聚数趋势, 模块化建构主义, 蓝色黑色背景, 基于物理的渲染, 居中`,
     `A goddess of time with long golden hair, dressed in a flowing turquoise-to-blue gradient magical gown. She has delicate features, holding a magical weapon in each hand, each adorned with a clock pendant. Behind her, a radiant halo representing time glows, surrounded by swirling energies that symbolize time and space magic. The scene is enchanting and mystical, capturing the essence of both time and space. `,
       `复古风格油画，巴黎景观，1930年 --ar 3:2 --v 6.1 --s 50`,
      `詹姆斯·C·克里斯滕森（James C Christensen）的油画是一幅大约1750年的著名科学家，穿着那个时代的上流社会服装，坐在古典建筑的休息室里，摆着他们的行业工具，爱德华·兰西尔（Edward Landseer）风格的戏剧性灯光 --s 200 --ar 5:8 --v 6.1`,
      `Tiny cute isometric living room in a cutaway box, soft smooth lighting, soft colors, purple and blue color scheme, soft colors, 100mm lens, 3d blender render`,
       `地球爆炸，3d风格，世界末日`,
       `C4D 3D渲染，Q版卡通风格，全身，拟人化感，一个可爱的美国小男孩，身上穿着红紫色运动衫，里面穿着黑紫色运动裤，和一群外星小怪物玩恐怖游戏，怪物头在空中弹跳，设计特点：Pop Mart盲盒玩具、鲜艳的色彩、明亮的图像、迪士尼皮克斯趋势、电影灯光、精湛的细节、高分辨率、最佳的细节 --ar 9：16`,
     `充满活力的三层维多利亚式房屋 --ar 16:9`,
      `A serene landscape at dawn, where a majestic mountain range looms in the background, bathed in soft golden light. In the foreground, a brave figure stands atop a rocky outcrop, arms raised triumphantly towards the sky, embodying courage and faith. The figure, clad in flowing robes that flutter in the gentle breeze, radiates strength and determination. Ethereal rays of light cascade down from the heavens, illuminating the words Let your heart be courageous, for the Lord is your strength and shield.-January 7, 2025 in elegant, golden script that appears to shimmer with divine energy. Surrounding the figure, wildflowers bloom vibrantly, symbolizing hope and resilience. The atmosphere is infused with a sense of peace and empowerment, reminiscent of classical paintings by Caspar David Friedrich, emphasizing the harmony between humanity and nature. The overall mood is uplifting and inspiring, inviting viewers to embrace their inner courage.`,
      `随机,头像`,
    `Create a serene landscape at dawn, where a majestic mountain range rises in the background, symbolizing strength. In the foreground, a diverse group of people—men, women, and children—stand together, their faces illuminated by soft, golden sunlight, embodying courage and unity. Each person holds a translucent shield, radiating a gentle glow, with the words Let your heart be filled with courage, for the Lord is your strength and shield.-December 30, 2024 elegantly inscribed in calligraphy across the sky. The mood is hopeful and uplifting, with birds soaring above, and a gentle breeze rustling through vibrant wildflowers at their feet. Use a painterly style reminiscent of Impressionism, with soft brush strokes and a warm color palette to evoke a sense of peace and resilience. The overall composition should inspire feelings of faith and bravery, inviting viewers to reflect on their inner strength.`,
    `随机,人脸`,
       `random,图标`,
       `Furry:: 1.3 monster, cub, 4 claws, cute, (snow+snow), super high resolution, perfection, masterpiece, atmosphere`,
       `皮卡丘在沙滩上晒日光浴，卡通，3d风格`,
    `3D model of Talon Vexar, full body, detailed.`,
    `3D model of Cyrus Ashvale, full body, detailed.`,
    `使用充满活力的调色板，创作一件结合了赛博朋克、霓虹灯城市景观、蒸汽朋克风格以及与未来技术互动的 AI 角色概念的艺术作品。包括控制论增强功能、复古未来主义元素和淡淡的模拟怀旧之情，所有这些都在高分辨率、详细的插图中。#CyberpunkUnity #NeonCityscape #AIInnovation #VibrantFuture #SteampunkRedux`,
    `创建令人惊叹的圣托里尼日落图像，展示标志性的粉刷建筑和栖息在伊亚悬崖上的蓝色圆顶。该建筑以光滑、圆润的形状和复杂的细节为特色，充满活力的九重葛在墙壁上层叠而下。捕捉爱琴海反射的夕阳温暖的金色色调，与深蔚蓝的海水形成宁静的对比。崎岖的火山悬崖和邻近岛屿的远处剪影构成了场景，增强了戏剧性的景观。包括一些散落的云，被太阳柔和地照亮，以增加天空的深度。使用柔焦镜头唤起梦幻般的品质，强调这个浪漫目的地的宁静氛围。整体构图应传达一种永恒的美感，邀请观众体验圣托里尼丰富的文化遗产和令人叹为观止的景色。`,
   `photo illustration from a world in the clouds, in the style of tanya shatseva, the stars art group (xing xing), meghan howland, dark indigo and light cyan, mind-bending sculptures, realistic hyper-detail, fluid simplicity --ar 63:128 --stylize 750 --v 6`,
    `greek sculpture, head of Hadrian, close up, grey background --ar 71:129 --stylize 750 --v 6`,
    `Majestic Iguazu Falls, a natural wonder spanning Argentina and Brazil. Cascading waterfalls plunge over 269 feet, creating a thunderous spectacle. Lush, emerald rainforest surrounds the falls, framing the scene with vibrant foliage. Misty spray rises, catching sunlight to form ethereal rainbows. Wooden walkways and viewing platforms blend seamlessly with the environment, offering breathtaking vantage points. The falls' horseshoe shape creates a dramatic amphitheater of water, with multiple tiers and channels. Reddish-brown rocks contrast against the white foam and turquoise pools below. Early morning light bathes the scene in a golden glow, highlighting the water's power and beauty. Exotic birds soar overhead, adding pops of color to the sky. A long-exposure photograph captures the water's silky flow while maintaining the intricate details of the landscape. The composition balances the grand scale of the falls with intimate details of flora and fauna, emphasizing the site's biodiversity and raw natural power.`,
    `(masterpiece, ultra-detailed,, a majestic owl-man warrior stands in an epic hero pose, holding a glowing purple energy sword up to his face with both hands. The heat from the sword distorts the air around it, creating a shimmering effect. hes wearing a helmet, but his glowing eyes are visible through the visor. Vapor rises from his body, adding intensity. His armor is off-white with thin purple light stripes running down the sides and through the breastplate. The wings are spread wide, kicking up dirt and autumn leaves as the setting sun casts volumetric god rays through the swirling debris. The scene is cinematic, and epic capturing every detail of his armor, the heat distortion from the sword, and the vapor rising from his body.`,
    `movie poster, male character in black, white and blue, in the style of yoh nagao, light-focused --ar 71:128 --stylize 750 --v 6`,
    `随机,夜景`,
   `two people walk the bridge under a large cherry blossom, in the style of atmospheric paintings, gray and aquamarine, airbrush art, dark white and dark gray, lovely --ar 35:64 --stylize 750 --v 6`,
    `looking at camera medieval romanticism neon glowing contoured filigree detailed marvel transparent venom character layered rough textured comic syle artistic masterpiece portrait many tiny sketches in one art cinematic magic art nouveau collage by Mucha Klimt postcard old photo young tender rococo lady black ad white venom creature , venom face dynamic intricated pose made of swirling colors on cracked liquid paper fluid markers sketch splatter watercolor close up dynamic color floral blossoming patterns abstract expressionism alcohol ink drawing double exposure book illustration swirling spiral diptych two parts in one art landscape ink cinematic portrait on cracked old antique burned paper, transparent earth panorama poster ultra detailed complex print transparent illustration detailed perfect face city lights , city panorama red sunset dynamic movement Craola Kuindzhi Dan Mumford Andy Kehoe expressive brushstrokes mixed with wash masterpiece , transparence intricated lighting, dynamic shadow play sparks , high deepness cinematic foggy`,
    `a tiny astronaut hatching from an egg on the moon`,
    `A mystique  place on a Hill with a very colourful ghostly glowing  tree,misty,fireflies, nebulas,big moon,Stars,cosmic, unicorn`,
    `magic realism  masterpiece , x ray  animal totem, translucent  owl , glowing , luminism ,bioluminescence, fire wings, night    , splash art , alcohol ink  , intricately detailed  ,sharp focus ,extremely detailed, dark  fantasy,   glowing, colorful painting, rich color, HDR, octane render, digital illustration, cinematic light `,
      `充满活力的场景捕捉了金·琼斯（Kim Jones）设想的迪奥2029年春季系列的精髓，展现了传统与颠覆之间的平衡，一位20岁的时尚达人散发着迪奥模特的优雅，同时展示了2029年的未来派服装，她快乐的表情为时尚的办公室增添了光彩，一只大鹿和异想天开的动物增强了视觉叙事，使用尼康Z9无反光镜数码相机拍摄，85毫米镜头，f/1.8,16 K分辨率， --ar 9：16 --stylize 500 --v 6.1`,
       `logo,现代感强，商业品质`,
    `关关雎鸠，在河之洲`,
    `二次元`,
`美女`,
`动物`,
`建筑`,
`cosplay`,
`漫画`,
`明星`,
`人物`,
`风景景观`,
`物品`,
`怪兽`,
`汽车`,
`城市`,
`夜景`,
`星空`,
`植物`,
`体育运动`,
`遗迹`,
`游戏画面`,
`婴儿`,
`女孩`,
`3d模型`,
`末日景观`,
`神灵`,
`文明`,
`科技`,
`战争画面`,
`武侠`,
`山水`,
`海景`,
`海洋`,
`森林`,
`海底`,
`生态`,
`巨石`,
`河流`,
`山野`,
`房屋`,
`天空`,
`星系`,
`宇宙`,
`星际`,
`外星文明`,
`异域风光`,
`人群`,
`大厦`,
`农田`,
`魔法阵`,
`魔法世界`,
`房间`,
`城堡`,
`庄园`,
`神迹`,
`商品`,
`家具`,
`生活用品`,
`石像`,
`龙珠`,
`海贼王`,
`火影忍者`,
`孙悟空`,
`红楼梦`,
`三国演义`,
`西游记`,
`哈利波特`,
`星球大战`,
`外星生物`,
`地外文明`,
`三体`,
`哥特风格`,
`时光旅行`,
`金字塔`,
`港湾沙滩`,
`灾难`,
`冰河世纪`,
`恐龙时代`,
`东方文明`,
`宫殿`,
`黄金岛`,
`魔鬼恶魔`,
`悠闲夏日`,
`花房`,
`温泉`,
`瀑布`,
`热带雨林`,
    `春风得意马蹄疾，一日看尽长安花`,
       "塞外长城，江山如画"
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
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(jsonBody),
      });
      if (!response.ok) {
        const errorText = await response.text();
      }
      return response;
    
  }

const testCfAiConnection = async function(){
    const testModel = config.CF_TRANSLATE_MODEL;
    const testPrompt = "hello!";
    const response = await postRequest(testModel, { messages: [{ role: "user", content: testPrompt }] });
    const jsonResponse = await response.json();
    return jsonResponse.result.response.trim();
    
  }

/*使用AI优化并翻译文本框内的提示词*/
  const handlepromptfanyi2 = async function(){
    //alert("抱歉，该功能暂时未上线！");
    //const prompt1 = prompt;
    //const prompt1 = document.getElementById("prompt").value;
    const result = await testCfAiConnection();
    setPrompt(result);
    
   };

  
  const handlepromptfanyi1 = async function(){
    //alert("抱歉，该功能暂时未上线！");
    let rules = document.getElementById("rules").value;
    let prompt1 = document.getElementById("prompt").value;
    let result = await imageGenerationService.generateTranslate(
      prompt1,
      rules
    );
    setPrompt(result.translatedPrompt);
       
   };
  
  /*AI优化并翻译提示词*/
  const handlepromptfanyi = async function(){
    //alert("抱歉，该功能暂时未上线！");
    setPrompt(actionData.translatedPrompt);
    //actionData.translatedPrompt = "哈哈哈";
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
            ✨AI绘画 (Flux|SD)✨
        </h1>
        <Form method="post" className="relative space-y-8" onSubmit={handleSubmit}>
          <div className="">
            <label htmlFor="prompt" className="block py-2 mb-2 text-white text-lg font-semibold text-shadow">
              ✨提示词(支持中文)：
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
              placeholder="╮(︶﹏︶)╭ 受不了了 😤 来一个富有创意的提示词吧~~~"
              required
            ></textarea>

        <div className="relative justify-center">

          <button
              type="button"
              onClick={handleResetprompt}
              className="px-4 py-2 mx-2 my-3 border-dashed  border-[3px] border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-yellow-450 via-yellow-600 to-yellow-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
              🎲随机提示词
            </button>
          
          <button
              type="button"
              onClick={handlepromptfanyi}
              className="px-4 py-2 mx-2  my-3 border-dashed  border-[3px] border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-700 via-purple-500 to-green-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
              ✨复制下方AI优化的提示词✨
            </button>
          
           <button
              type="button"
              onClick={handleResetpromptclear}
              className="absolute right-4 px-4 py-2 mx-2 my-3 border-dashed  border-[3px] border-white-600 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-400 via-pink-600 to-red-800 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white-600 shadow-xl"
              >
            ❌清空提示❌
            </button>
          
         </div>   
            
     </div>


         <div>
            <label htmlFor="promptxmap" className="block text-white text-lg font-semibold mb-3 text-shadow">
              ✨选择一个喜欢的提示词：
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
            <label htmlFor="rules" className="block text-white text-lg font-semibold mb-3 text-shadow">
              ✨提示词策略：
            </label>
            <select
              id="rules"
              name="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              <option value="a">👌常规👌 - AI只翻译,不优化</option>
              <option value="b">⭐专业⭐ - AI翻译+优化</option>
            {/*  <option value="c">💯特殊💯 - AI解锁限制，如版权等</option> */}
              <option value="d">❣️原始纯净❣️ - 不使用AI,但必须英文</option>
              
            </select>
          </div> 
          
          <div>
            <label htmlFor="model" className="block text-white text-lg font-semibold mb-3 text-shadow">
              ✨选择模型 (推荐Flux)：
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
              生成步数：( Flux模型 4-8,其他模型 4-20 )
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
              {isSubmitting ? "🙏🏼生成中🌪️..." : "✨启动生成✨"}
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
            <h2 className="text-2xl font-bold text-white mb-4 text-shadow">✨AI优化和翻译后的提示词：</h2>
              <div className="mt-1 p-3 rounded-xl text-xl bg-white font-bold text-blue mb-4 text-shadow">
                 {`${actionData.translatedPrompt}`}
              </div>
            <h2 className="text-2xl font-bold text-white mb-4 text-shadow">✨生成的图片：</h2>
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
