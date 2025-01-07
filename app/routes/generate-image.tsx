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
              placeholder="╮(︶﹏︶)╭ 受不了了 😤 来一个富有创意的提示词吧~~~"
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
            <label htmlFor="rules" className="block text-white text-lg font-semibold mb-3 text-shadow">
              提示词优化策略：
            </label>
            <select
              id="rules"
              name="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white bg-opacity-20 text-white transition duration-300 ease-in-out hover:bg-opacity-30"
            >
              <option value="a">普通常规(不做优化，只提供必要翻译)</option>
              <option value="b">专业优化(基本优化策略)</option>
            {/*  <option value="c">特殊优化(解锁一些特殊功能，如版权限制问题……)</option> */}
              <option value="d">不使用AI翻译和优化(需提供纯英文提示词)</option>
              
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
